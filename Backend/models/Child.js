const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  childCode: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true,
    min: 3,
    max: 12
  },
  ageBand: {
    type: String,
    enum: ['3-5', '6-8', '9-12'],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  educatorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pin: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 6
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  locale: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  badges: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  currentStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date
  },
  settings: {
    timeLimit: {
      type: Number,
      default: 60 // minutes per day
    },
    contentFilter: {
      type: String,
      enum: ['strict', 'moderate', 'relaxed'],
      default: 'moderate'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
childSchema.pre('validate', async function (next) {
  if (this.childCode) return next();

  try {
    let code;
    let exists = true;

    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      exists = await this.constructor.exists({ childCode: code });
    }

    this.childCode = code;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Child', childSchema);

