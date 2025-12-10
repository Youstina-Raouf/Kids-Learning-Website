const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  type: {
    type: String,
    enum: ['story', 'code', 'drawing', 'video', 'audio'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  questId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  },
  subject: {
    type: String,
    enum: ['math', 'physics', 'chemistry', 'language', 'coding', 'general']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  feedback: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Artifact', artifactSchema);

