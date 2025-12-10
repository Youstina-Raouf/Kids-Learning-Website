const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
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
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true
    },
    instructionAr: {
      type: String,
      required: true
    },
    hint: {
      type: String
    },
    hintAr: {
      type: String
    },
    answer: {
      type: mongoose.Schema.Types.Mixed
    },
    points: {
      type: Number,
      default: 5
    }
  }],
  rewards: {
    xp: {
      type: Number,
      default: 20
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quest', questSchema);

