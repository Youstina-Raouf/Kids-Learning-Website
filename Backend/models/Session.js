const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  contentType: {
    type: String,
    enum: ['game', 'quest', 'creative', 'explore'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentType'
  },
  subject: {
    type: String,
    enum: ['math', 'physics', 'chemistry', 'language', 'coding', 'general']
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Session', sessionSchema);

