const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameAr: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  descriptionAr: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['achievement', 'subject', 'streak', 'special'],
    default: 'achievement'
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
});

module.exports = mongoose.model('Badge', badgeSchema);

