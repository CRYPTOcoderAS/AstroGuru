# AstroGuru - Horoscope API

A Node.js backend with frontend for daily horoscopes based on zodiac signs.

## Features

- User signup/login with JWT auth
- Auto zodiac detection from birthdate
- Daily horoscope generation
- 7-day horoscope history
- Rate limiting (5 calls/min)
- Responsive web interface

## Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT, bcryptjs  
**Frontend:** Vanilla JS, CSS3, HTML5  
**Deployment:** Netlify Functions

## Setup Instructions

*Note: This project was built with AI assistance for faster development.*

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Setup MongoDB:**
   - Local: Start `mongod` 
   - Cloud: Get MongoDB Atlas connection string

3. **Environment variables:**
Create `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/astroguru
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. **Run application:**
```bash
npm run dev
```

Visit `http://localhost:3000`

### Netlify Deployment

1. **Push to GitHub**
2. **Connect to Netlify**
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. **Add environment variables** in Netlify dashboard
5. **Deploy**

## API Endpoints

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/profile` - Get profile (auth required)
- `GET /api/horoscope/today` - Today's horoscope (auth required)
- `GET /api/horoscope/history` - 7-day history (auth required)

## Design Decisions

### Architecture Choices
- **RESTful API** for simplicity and standardization
- **JWT tokens** for stateless authentication  
- **MongoDB** for flexible document storage
- **Serverless functions** for easy deployment and scaling
- **Client-side zodiac calculation** to reduce server load

### Database Design
- **User collection** with embedded zodiac data
- **Horoscope collection** for tracking daily content
- **Compound indexes** on user+date for fast queries

### Frontend Approach
- **Vanilla JavaScript** to avoid framework complexity
- **Local storage** for persistent auth state
- **Progressive enhancement** for better accessibility
- **Mobile-first design** for wider device support

## Future Improvements

### With More Time
1. **AI-powered personalization** based on user history and preferences
2. **Social features** like horoscope sharing and compatibility checks  
3. **Email/SMS notifications** for daily delivery
4. **Multiple languages** support
5. **Advanced analytics** and user insights
6. **Mobile app** development

### Scaling for Personalized Horoscopes

Currently uses zodiac-based content. For true personalization:

**Technical Architecture:**
- **Microservices** for content generation and user analysis
- **Message queues** for background processing  
- **ML pipeline** for preference learning and content customization
- **CDN caching** for generated content
- **Database sharding** by user segments

**Content Strategy:**
- **User profiling** based on interactions and feedback
- **Dynamic content mixing** from multiple templates
- **A/B testing** for content effectiveness  
- **Real-time personalization** using current events and trends

**Infrastructure:**
- **Kubernetes** for container orchestration
- **Redis** for session and content caching
- **ElasticSearch** for content indexing
- **Background workers** for daily content generation

This would require significant infrastructure investment but could support millions of users with unique daily content.

## License

MIT License