const mongoose = require('mongoose');

const horoscopeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  zodiacSign: {
    type: String,
    required: true,
    enum: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
           'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'love', 'career', 'health', 'finance'],
    default: 'general'
  }
}, {
  timestamps: true
});

horoscopeSchema.index({ userId: 1, date: 1 }, { unique: true });
horoscopeSchema.index({ zodiacSign: 1, date: 1 });

module.exports = mongoose.model('Horoscope', horoscopeSchema);
