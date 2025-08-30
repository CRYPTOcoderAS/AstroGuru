const { MongoClient, ObjectId } = require('mongodb');
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

// JWT verification function
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
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
    // Get token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Access token is required'
        })
      };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Connect to database
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid token - user not found'
        })
      };
    }

    // Return user profile
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
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
    console.error('Profile error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Invalid token'
      })
    };
  }
};
