const express = require('express');
const Child = require('../models/Child');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type = 'points', cohort = 'all' } = req.query;
    
    let children;
    
    if (cohort === 'all') {
      children = await Child.find().select('name avatar totalPoints badges currentStreak ageBand');
    } else if (cohort === 'family' && req.role === 'parent') {
      children = await Child.find({ parentId: req.userId })
        .select('name avatar totalPoints badges currentStreak ageBand');
    } else if (cohort === 'class' && req.role === 'educator') {
      children = await Child.find({ educatorIds: req.userId })
        .select('name avatar totalPoints badges currentStreak ageBand');
    } else {
      children = await Child.find().select('name avatar totalPoints badges currentStreak ageBand');
    }

    // Sort by type
    let sortedChildren;
    if (type === 'points') {
      sortedChildren = children.sort((a, b) => b.totalPoints - a.totalPoints);
    } else if (type === 'streak') {
      sortedChildren = children.sort((a, b) => b.currentStreak - a.currentStreak);
    } else if (type === 'badges') {
      sortedChildren = children.sort((a, b) => b.badges.length - a.badges.length);
    } else {
      sortedChildren = children.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    // Add rank
    const leaderboard = sortedChildren.map((child, index) => ({
      rank: index + 1,
      childId: child._id,
      name: child.name,
      avatar: child.avatar,
      points: child.totalPoints,
      badges: child.badges.length,
      streak: child.currentStreak,
      ageBand: child.ageBand
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/leaderboard/subject/:subject
// @desc    Get leaderboard by subject
// @access  Private
router.get('/subject/:subject', auth, async (req, res) => {
  try {
    const { subject } = req.params;
    const { cohort = 'all' } = req.query;

    // Get all progress for this subject
    const Progress = require('../models/Progress');
    const Quest = require('../models/Quest');
    
    const quests = await Quest.find({ subject }).select('_id');
    const questIds = quests.map(q => q._id);

    const progressRecords = await Progress.find({
      questId: { $in: questIds },
      status: 'completed'
    });

    // Calculate points per child
    const childPoints = {};
    progressRecords.forEach(p => {
      if (!childPoints[p.childId]) {
        childPoints[p.childId] = 0;
      }
      childPoints[p.childId] += p.totalPointsEarned;
    });

    // Get children
    let children;
    if (cohort === 'family' && req.role === 'parent') {
      children = await Child.find({ parentId: req.userId });
    } else if (cohort === 'class' && req.role === 'educator') {
      children = await Child.find({ educatorIds: req.userId });
    } else {
      children = await Child.find();
    }

    const leaderboard = children
      .map(child => ({
        childId: child._id,
        name: child.name,
        avatar: child.avatar,
        points: childPoints[child._id] || 0,
        ageBand: child.ageBand
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

