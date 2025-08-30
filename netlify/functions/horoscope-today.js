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

// Horoscope data
const horoscopeTemplates = {
  aries: [
    "Today brings fiery energy your way! Your natural leadership qualities will shine, making it an excellent day for taking initiative in both personal and professional matters.",
    "Mars influences your adventurous spirit today. Embrace new challenges and don't be afraid to step out of your comfort zone. Success favors the bold.",
    "Your competitive nature serves you well today. Channel your passion into productive activities and watch as opportunities unfold before you.",
    "Dynamic energy surrounds you today. Trust your instincts and take decisive action. Your courage will inspire others around you.",
    "Today's cosmic alignment favors your pioneering spirit. Start that project you've been thinking about - the stars are aligned for new beginnings."
  ],
  taurus: [
    "Steady progress leads to lasting success today. Your patience and determination will pay off in ways you might not expect. Trust the process.",
    "Venus blesses your relationships today. Focus on building stronger connections with loved ones and enjoy the simple pleasures life offers.",
    "Your practical approach to problems will save the day. Others will seek your reliable counsel and steady guidance.",
    "Material comforts and security are highlighted today. It's a good time to make financial decisions or invest in your future stability.",
    "Nature calls to you today. Spend time outdoors or with plants to recharge your earthy energy and find inner peace."
  ],
  gemini: [
    "Communication is your superpower today! Your wit and charm will open doors and create meaningful connections with others.",
    "Mercury enhances your mental agility today. Multitasking comes naturally, and you'll juggle various projects with ease and grace.",
    "Curiosity leads to fascinating discoveries today. Don't hesitate to ask questions or explore new topics that capture your interest.",
    "Social interactions bring unexpected opportunities. Your adaptability and quick thinking will help you navigate any situation successfully.",
    "Today's energy supports learning and teaching. Share your knowledge with others or pick up a new skill that excites you."
  ],
  cancer: [
    "Your intuitive powers are heightened today. Trust your emotional intelligence to guide you through important decisions and relationships.",
    "The Moon illuminates your nurturing nature today. Focus on caring for yourself and your loved ones - both will bring deep satisfaction.",
    "Home and family take center stage today. Creating a harmonious domestic environment will bring peace and joy to your heart.",
    "Your empathetic nature is a gift today. Others will be drawn to your compassionate understanding and healing presence.",
    "Emotional security is within reach today. Take steps to protect what matters most to you and strengthen your inner foundation."
  ],
  leo: [
    "The spotlight finds you today! Your natural charisma and confidence will attract positive attention and new opportunities for growth.",
    "Creative expression flows freely today. Whether it's art, performance, or innovation, let your unique talents shine brightly for all to see.",
    "Your generous spirit brings joy to others today. Leadership comes naturally, and people will follow your inspiring example with enthusiasm.",
    "Romance and passion are favored today. Open your heart to love and let your warm personality draw meaningful connections into your life.",
    "Today's energy supports grand gestures and bold moves. Don't hold back - your dramatic flair will achieve the desired impact."
  ],
  virgo: [
    "Attention to detail serves you well today. Your analytical mind will solve complex problems that others find overwhelming or confusing.",
    "Organization and efficiency are your themes today. Streamlining processes and improving systems will bring significant long-term benefits.",
    "Your helpful nature is appreciated today. Offering practical assistance to others will create goodwill and strengthen important relationships.",
    "Health and wellness deserve focus today. Small improvements to your daily routine will have lasting positive effects on your overall well-being.",
    "Mercury sharpens your critical thinking today. Your ability to see flaws and suggest improvements will be highly valued by colleagues."
  ],
  libra: [
    "Balance and harmony guide your path today. Your diplomatic skills will help resolve conflicts and bring peace to challenging situations.",
    "Venus enhances your appreciation for beauty today. Surround yourself with art, music, or nature to feed your aesthetic soul.",
    "Partnerships flourish under today's influence. Collaboration and teamwork will achieve better results than working alone could provide.",
    "Your sense of justice is strong today. Stand up for fairness and equality - your voice will make a meaningful difference.",
    "Social connections bring opportunities today. Your charm and grace in social situations will open doors to exciting possibilities."
  ],
  scorpio: [
    "Transformation energy surrounds you today. Embrace change and let go of what no longer serves your highest good and growth.",
    "Your investigative nature uncovers hidden truths today. Deep research or detective work will reveal important information you've been seeking.",
    "Intensity and passion drive your actions today. Channel this powerful energy into meaningful pursuits that align with your deepest values.",
    "Pluto empowers your regenerative abilities today. Healing from past wounds and emerging stronger is possible with focused intention.",
    "Trust your psychic intuition today. Your ability to sense underlying motives and hidden agendas will protect and guide you."
  ],
  sagittarius: [
    "Adventure calls your name today! Your wanderlust and quest for knowledge will lead to exciting discoveries and new horizons.",
    "Jupiter expands your perspective today. Higher learning, philosophy, or travel planning will broaden your understanding of the world.",
    "Your optimistic outlook inspires others today. Share your enthusiasm and vision - people need your hopeful perspective right now.",
    "Freedom and independence are themes today. Break free from limiting beliefs or situations that constrain your natural adventurous spirit.",
    "Teaching and sharing wisdom bring fulfillment today. Your experiences and insights can help guide others on their own journeys."
  ],
  capricorn: [
    "Ambition and determination pave your way to success today. Your methodical approach to goals will yield impressive and lasting results.",
    "Saturn supports your long-term planning today. Building solid foundations now will ensure future security and achievement of your dreams.",
    "Leadership responsibilities may increase today. Your mature and reliable nature makes you the perfect person to guide important projects.",
    "Professional recognition is possible today. Your hard work and dedication haven't gone unnoticed by those in positions of influence.",
    "Traditional approaches prove most effective today. Sometimes the tried-and-true methods work better than innovative but untested solutions."
  ],
  aquarius: [
    "Innovation and originality set you apart today. Your unique perspective will solve problems in ways others never considered possible.",
    "Uranus sparks your humanitarian instincts today. Getting involved in causes that benefit society will bring deep personal satisfaction.",
    "Friendship and community connections flourish today. Your ability to unite diverse groups of people creates positive change.",
    "Technology and modern solutions favor you today. Embrace new tools and methods that can streamline your work and personal life.",
    "Your independent spirit guides you toward unconventional but successful paths today. Trust your instinct to do things differently."
  ],
  pisces: [
    "Your compassionate heart is your greatest strength today. Helping others in need will bring spiritual fulfillment and inner peace.",
    "Neptune enhances your creative and spiritual gifts today. Artistic pursuits or meditation will connect you with your deepest self.",
    "Intuition and dreams provide important guidance today. Pay attention to subtle messages from your subconscious and spiritual realm.",
    "Emotional healing is possible today. Allow yourself to feel deeply and process emotions in a safe, supportive environment.",
    "Water elements restore your energy today. Time near oceans, lakes, or rivers will recharge your sensitive and empathetic nature."
  ]
};

function getRandomHoroscope(zodiacSign) {
  const templates = horoscopeTemplates[zodiacSign];
  if (!templates) return "The stars have a special message for you today. Stay open to new possibilities.";
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

function getZodiacSignInfo(sign) {
  const zodiacInfo = {
    aries: { element: 'Fire', planet: 'Mars', symbol: '♈', dates: 'March 21 - April 19' },
    taurus: { element: 'Earth', planet: 'Venus', symbol: '♉', dates: 'April 20 - May 20' },
    gemini: { element: 'Air', planet: 'Mercury', symbol: '♊', dates: 'May 21 - June 20' },
    cancer: { element: 'Water', planet: 'Moon', symbol: '♋', dates: 'June 21 - July 22' },
    leo: { element: 'Fire', planet: 'Sun', symbol: '♌', dates: 'July 23 - August 22' },
    virgo: { element: 'Earth', planet: 'Mercury', symbol: '♍', dates: 'August 23 - September 22' },
    libra: { element: 'Air', planet: 'Venus', symbol: '♎', dates: 'September 23 - October 22' },
    scorpio: { element: 'Water', planet: 'Pluto', symbol: '♏', dates: 'October 23 - November 21' },
    sagittarius: { element: 'Fire', planet: 'Jupiter', symbol: '♐', dates: 'November 22 - December 21' },
    capricorn: { element: 'Earth', planet: 'Saturn', symbol: '♑', dates: 'December 22 - January 19' },
    aquarius: { element: 'Air', planet: 'Uranus', symbol: '♒', dates: 'January 20 - February 18' },
    pisces: { element: 'Water', planet: 'Neptune', symbol: '♓', dates: 'February 19 - March 20' }
  };
  
  return zodiacInfo[sign] || null;
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
    const horoscopesCollection = db.collection('horoscopes');

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

    const userId = user._id;
    const zodiacSign = user.zodiacSign;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if horoscope already exists for today
    let horoscope = await horoscopesCollection.findOne({
      userId,
      date: today
    });

    if (!horoscope) {
      const content = getRandomHoroscope(zodiacSign);
      
      horoscope = {
        userId,
        zodiacSign,
        date: today,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await horoscopesCollection.insertOne(horoscope);
    }

    const zodiacInfo = getZodiacSignInfo(zodiacSign);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          horoscope: {
            id: horoscope._id?.toString(),
            date: horoscope.date,
            content: horoscope.content,
            zodiacSign: horoscope.zodiacSign,
            zodiacInfo
          }
        }
      })
    };

  } catch (error) {
    console.error('Get today horoscope error:', error);
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
