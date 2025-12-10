const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Child = require('../models/Child');
const { auth } = require('../middleware/auth');

const router = express.Router();

// JWT secret (with dev fallback to avoid secretOrPrivateKey errors)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register parent/educator
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').trim().notEmpty(),
  body('role').isIn(['parent', 'educator'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg || 'Validation failed' });
    }

    const { email, password, name, role } = req.body;

    // Normalize email for checking
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ email: normalizedEmail, password, name, role });
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login parent/educator
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/child-login
// @desc    Login child with PIN
// @access  Public
router.post('/child-login', [
  body('childId').notEmpty(),
  body('pin')
    .isLength({ min: 6, max: 6 })
    .withMessage('PIN must be exactly 6 digits')
    .isNumeric()
    .withMessage('PIN must contain only digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { childId, pin } = req.body;

    const child = await Child.findOne({ childCode: childId });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    if (child.pin !== pin) {
      return res.status(400).json({ message: 'Invalid PIN' });
    }

    // Update last active date for streak tracking
    const today = new Date().toDateString();
    const lastActive = child.lastActiveDate ? new Date(child.lastActiveDate).toDateString() : null;
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (lastActive === yesterdayStr) {
        child.currentStreak += 1;
      } else {
        child.currentStreak = 1;
      }
      child.lastActiveDate = new Date();
      await child.save();
    }

    const token = generateToken(child._id, 'child');

    res.json({
      token,
      child: {
        id: child._id,
        name: child.name,
        ageBand: child.ageBand,
        locale: child.locale,
        totalPoints: child.totalPoints,
        currentStreak: child.currentStreak
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    if (req.role === 'child') {
      const child = await Child.findById(req.userId).populate('badges.badgeId');
      res.json({ user: child, role: 'child' });
    } else {
      const user = await User.findById(req.userId).populate('children');
      res.json({ user, role: req.role });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

