const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AstroGuru - Personalized Horoscope API',
      version: '1.0.0',
      description: 'A comprehensive API for personalized daily horoscopes based on zodiac signs',
      contact: {
        name: 'AstroGuru Team',
        email: 'support@astroguru.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'birthdate'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'Full name',
              minLength: 2,
              maxLength: 100
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (min 6 characters with uppercase, lowercase, and number)'
            },
            birthdate: {
              type: 'string',
              format: 'date',
              description: 'Date of birth (YYYY-MM-DD)'
            },
            zodiacSign: {
              type: 'string',
              enum: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
              description: 'Auto-calculated zodiac sign'
            }
          }
        },
        Horoscope: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Horoscope ID'
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Horoscope date'
            },
            content: {
              type: 'string',
              description: 'Horoscope content/prediction'
            },
            zodiacSign: {
              type: 'string',
              enum: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
              description: 'Zodiac sign'
            },
            zodiacInfo: {
              type: 'object',
              properties: {
                element: { type: 'string' },
                planet: { type: 'string' },
                symbol: { type: 'string' },
                dates: { type: 'string' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Validation errors (if applicable)'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
