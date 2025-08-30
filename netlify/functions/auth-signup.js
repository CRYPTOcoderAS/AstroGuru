const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  const db = client.db();
  cachedDb = db;
  return db;
}

// Zodiac calculation
function getZodiacSign(birthdate) {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return 'aries';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return 'taurus';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return 'gemini';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return 'cancer';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return 'leo';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return 'virgo';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return 'libra';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return 'scorpio';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return 'sagittarius';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return 'capricorn';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return 'aquarius';
  } else {
    return 'pisces';
  }
}

// Validation function
function validateSignupData(data) {
  const errors = [];
  
  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push({ msg: 'Name must be between 2 and 100 characters' });
  }
  
  if (!/^[a-zA-Z\s]+$/.test(data.name)) {
    errors.push({ msg: 'Name can only contain letters and spaces' });
  }
  
  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push({ msg: 'Please provide a valid email address' });
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters long' });
  }
  
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push({ msg: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' });
  }
  
  if (!data.birthdate) {
    errors.push({ msg: 'Please provide a valid birthdate' });
  } else {
    const birthDate = new Date(data.birthdate);
    const today = new Date();
    const minAge = new Date();
    minAge.setFullYear(today.getFullYear() - 13);
    
    if (birthDate > minAge) {
      errors.push({ msg: 'You must be at least 13 years old to register' });
    }
    
    const maxAge = new Date();
    maxAge.setFullYear(today.getFullYear() - 120);
    
    if (birthDate < maxAge) {
      errors.push({ msg: 'Please provide a valid birthdate' });
    }
  }
  
  return errors;
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Validate input data
    const validationErrors = validateSignupData(data);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        })
      };
    }

    const { name, email, password, birthdate } = data;

    // Connect to database
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'User already exists with this email'
        })
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Calculate zodiac sign
    const zodiacSign = getZodiacSign(birthdate);

    // Create user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      birthdate: new Date(birthdate),
      zodiacSign,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId;

    // Generate JWT token
    const token = jwt.sign(
      { userId: userId.toString() },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Return success response
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'User created successfully',
        data: {
          token,
          user: {
            id: userId.toString(),
            name,
            email: email.toLowerCase(),
            birthdate: new Date(birthdate),
            zodiacSign
          }
        }
      })
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};
