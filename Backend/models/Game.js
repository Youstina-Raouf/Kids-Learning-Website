const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  titleAr: {
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
  subject: {
    type: String,
    enum: ['math', 'physics', 'chemistry', 'language', 'coding', 'general'],
    required: true
  },
  ageBand: {
    type: [String],
    enum: ['3-5', '6-8', '9-12'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  thumbnail: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 10
  },
  pointsReward: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);

