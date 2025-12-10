const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  type: {
    type: String,
    enum: ['cyberbullying', 'inappropriate_content', 'excessive_gaming', 'time_limit', 'suspicious_activity'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  messageAr: {
    type: String,
    required: true
  },
  guidanceText: {
    type: String,
    required: true
  },
  guidanceTextAr: {
    type: String,
    required: true
  },
  source: {
    type: String, // e.g., 'chat', 'content_filter', 'time_tracker'
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'dismissed'],
    default: 'active'
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema);

