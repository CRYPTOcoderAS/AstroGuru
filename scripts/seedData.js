const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Horoscope = require('../models/Horoscope');
const { getZodiacSign } = require('../utils/zodiacCalculator');
const { getRandomHoroscope } = require('../data/horoscopeData');
const config = require('../config/config');

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    birthdate: new Date('1990-05-15')
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Password123',
    birthdate: new Date('1985-12-03')
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'Password123',
    birthdate: new Date('1992-08-22')
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Horoscope.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const zodiacSign = getZodiacSign(userData.birthdate);
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        zodiacSign
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.zodiacSign})`);
    }

    // Create sample horoscopes for the last 7 days
    for (const user of createdUsers) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const content = getRandomHoroscope(user.zodiacSign);
        
        const horoscope = new Horoscope({
          userId: user._id,
          zodiacSign: user.zodiacSign,
          date,
          content
        });
        
        await horoscope.save();
      }
      console.log(`Created 7 days of horoscopes for ${user.name}`);
    }

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    sampleUsers.forEach(user => {
      console.log(`Email: ${user.email}, Password: ${user.password}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedDatabase();
