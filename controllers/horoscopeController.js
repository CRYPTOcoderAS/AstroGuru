const Horoscope = require('../models/Horoscope');
const { getRandomHoroscope } = require('../data/horoscopeData');
const { getZodiacSignInfo } = require('../utils/zodiacCalculator');

const getTodayHoroscope = async (req, res) => {
  try {
    const userId = req.user._id;
    const zodiacSign = req.user.zodiacSign;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let horoscope = await Horoscope.findOne({
      userId,
      date: today
    });

    if (!horoscope) {
      const content = getRandomHoroscope(zodiacSign);
      
      horoscope = new Horoscope({
        userId,
        zodiacSign,
        date: today,
        content
      });

      await horoscope.save();
    }

    const zodiacInfo = getZodiacSignInfo(zodiacSign);

    res.json({
      success: true,
      data: {
        horoscope: {
          id: horoscope._id,
          date: horoscope.date,
          content: horoscope.content,
          zodiacSign: horoscope.zodiacSign,
          zodiacInfo
        }
      }
    });
  } catch (error) {
    console.error('Get today horoscope error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getHoroscopeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const zodiacSign = req.user.zodiacSign;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let horoscopes = await Horoscope.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    if (horoscopes.length < 7) {
      const existingDates = horoscopes.map(h => h.date.toDateString());
      const missingHoroscopes = [];

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);

        const dateString = checkDate.toDateString();
        if (!existingDates.includes(dateString)) {
          const content = getRandomHoroscope(zodiacSign);
          
          const newHoroscope = new Horoscope({
            userId,
            zodiacSign,
            date: checkDate,
            content
          });

          missingHoroscopes.push(newHoroscope);
        }
      }

      if (missingHoroscopes.length > 0) {
        await Horoscope.insertMany(missingHoroscopes);
        
        horoscopes = await Horoscope.find({
          userId,
          date: { $gte: sevenDaysAgo }
        }).sort({ date: -1 });
      }
    }

    const zodiacInfo = getZodiacSignInfo(zodiacSign);

    res.json({
      success: true,
      data: {
        horoscopes: horoscopes.map(h => ({
          id: h._id,
          date: h.date,
          content: h.content,
          zodiacSign: h.zodiacSign
        })),
        zodiacInfo,
        totalCount: horoscopes.length
      }
    });
  } catch (error) {
    console.error('Get horoscope history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getHoroscopeByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    const zodiacSign = req.user.zodiacSign;
    const { date } = req.params;

    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    let horoscope = await Horoscope.findOne({
      userId,
      date: requestedDate
    });

    if (!horoscope) {
      const content = getRandomHoroscope(zodiacSign);
      
      horoscope = new Horoscope({
        userId,
        zodiacSign,
        date: requestedDate,
        content
      });

      await horoscope.save();
    }

    const zodiacInfo = getZodiacSignInfo(zodiacSign);

    res.json({
      success: true,
      data: {
        horoscope: {
          id: horoscope._id,
          date: horoscope.date,
          content: horoscope.content,
          zodiacSign: horoscope.zodiacSign,
          zodiacInfo
        }
      }
    });
  } catch (error) {
    console.error('Get horoscope by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTodayHoroscope,
  getHoroscopeHistory,
  getHoroscopeByDate
};
