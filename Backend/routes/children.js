const express = require('express');
const { body, validationResult } = require('express-validator');
const Child = require('../models/Child');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/children
// @desc    Create child profile
// @access  Private (Parent/Educator)
router.post('/', auth, requireRole('parent', 'educator', 'admin'), [
  body('name').trim().notEmpty(),
  body('age').isInt({ min: 3, max: 12 }),
  body('pin').isLength({ min: 4, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, pin, locale, avatar } = req.body;
    
    let ageBand;
    if (age >= 3 && age <= 5) ageBand = '3-5';
    else if (age >= 6 && age <= 8) ageBand = '6-8';
    else if (age >= 9 && age <= 12) ageBand = '9-12';

    const child = new Child({
      name,
      age,
      ageBand,
      pin,
      parentId: req.role === 'parent' ? req.userId : req.body.parentId || req.userId,
      locale: locale || 'ar',
      avatar: avatar || 'default-avatar.png'
    });

    await child.save();

    // Add child to parent's children array
    const parent = await User.findById(child.parentId);
    if (parent) {
      parent.children.push(child._id);
      await parent.save();
    }

    res.status(201).json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/children
// @desc    Get all children (for parent/educator)
// @access  Private
router.get('/', auth, requireRole('parent', 'educator', 'admin'), async (req, res) => {
  try {
    let children;
    if (req.role === 'parent') {
      children = await Child.find({ parentId: req.userId });
    } else if (req.role === 'educator') {
      children = await Child.find({ educatorIds: req.userId });
    } else {
      children = await Child.find();
    }
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/children/:id
// @desc    Get child by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('badges.badgeId');
    
    // Check access permissions
    if (req.role === 'child' && req.userId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.role === 'parent' && child.parentId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/children/:id
// @desc    Update child profile
// @access  Private
router.put('/:id', auth, requireRole('parent', 'educator', 'admin'), async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Check permissions
    if (req.role === 'parent' && child.parentId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(child, req.body);
    
    // Recalculate ageBand if age changed
    if (req.body.age) {
      const age = req.body.age;
      if (age >= 3 && age <= 5) child.ageBand = '3-5';
      else if (age >= 6 && age <= 8) child.ageBand = '6-8';
      else if (age >= 9 && age <= 12) child.ageBand = '9-12';
    }

    await child.save();
    res.json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

