# 🚀 AstroGuru API - Complete Curl Commands Guide

## Base URL
```
http://localhost:3000/api
```

## 1. Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

## 2. User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "birthdate": "1990-05-15"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "birthdate": "1990-05-15T00:00:00.000Z",
      "zodiacSign": "taurus"
    }
  }
}
```

## 3. User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

## 4. Get User Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 5. Get Today's Horoscope
```bash
curl -X GET http://localhost:3000/api/horoscope/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "horoscope": {
      "id": "...",
      "date": "2025-08-30T00:00:00.000Z",
      "content": "Today brings fiery energy your way! Your natural leadership qualities will shine...",
      "zodiacSign": "taurus",
      "zodiacInfo": {
        "element": "Earth",
        "planet": "Venus",
        "symbol": "♉",
        "dates": "April 20 - May 20"
      }
    }
  }
}
```

## 6. Get Horoscope History (Last 7 Days)
```bash
curl -X GET http://localhost:3000/api/horoscope/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 7. Get Horoscope for Specific Date
```bash
curl -X GET http://localhost:3000/api/horoscope/date/2025-08-25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔄 Complete Workflow Example

### Step 1: Create a new user
```bash
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "birthdate": "1992-12-03"
  }')

echo "Signup Response: $SIGNUP_RESPONSE"
```

### Step 2: Extract token from signup response
```bash
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"
```

### Step 3: Get today's horoscope
```bash
curl -X GET http://localhost:3000/api/horoscope/today \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Get horoscope history
```bash
curl -X GET http://localhost:3000/api/horoscope/history \
  -H "Authorization: Bearer $TOKEN"
```

## 🛡️ Authentication Headers

All protected endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📊 Sample Test Data

### Valid User Data for Testing:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123",
  "birthdate": "1990-06-15"
}
```

### Zodiac Signs by Birth Date:
- **Gemini**: 1990-06-15 (May 21 - June 20)
- **Leo**: 1990-08-01 (July 23 - August 22)
- **Scorpio**: 1990-11-01 (October 23 - November 21)
- **Capricorn**: 1990-01-01 (December 22 - January 19)

## ⚠️ Rate Limiting

API endpoints are rate-limited:
- **Auth endpoints**: 10 requests per 15 minutes
- **Horoscope endpoints**: 5 requests per minute

If you hit the rate limit, you'll get:
```json
{
  "success": false,
  "message": "Too many requests from this IP. Please try again after 60 seconds.",
  "retryAfter": 60
}
```

## 🔧 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### User Already Exists (409)
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

## 🌐 Frontend Testing

Visit: http://localhost:3000

Or test with these JavaScript snippets in browser console:

### Signup Test:
```javascript
fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Console User',
    email: 'console@test.com',
    password: 'Password123',
    birthdate: '1995-07-20'
  })
}).then(r => r.json()).then(console.log);
```

### Login Test:
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'console@test.com',
    password: 'Password123'
  })
}).then(r => r.json()).then(console.log);
```

## 📚 API Documentation

Interactive Swagger documentation available at:
```
http://localhost:3000/api-docs
```

This provides a complete interactive interface to test all endpoints!
