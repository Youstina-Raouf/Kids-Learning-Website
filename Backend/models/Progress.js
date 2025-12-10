const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  questId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  currentStep: {
    type: Number,
    default: 0
  },
  completedSteps: [{
    stepNumber: Number,
    completedAt: Date,
    pointsEarned: Number
  }],
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

progressSchema.index({ childId: 1, questId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

