const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Validation function
function validateLoginData(data) {
  const errors = [];
  
  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push({ msg: 'Please provide a valid email address' });
  }
  
  if (!data.password) {
    errors.push({ msg: 'Password is required' });
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
    const validationErrors = validateLoginData(data);
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

    const { email, password } = data;

    // Connect to database
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        })
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        })
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            birthdate: user.birthdate,
            zodiacSign: user.zodiacSign
          }
        }
      })
    };

  } catch (error) {
    console.error('Login error:', error);
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
