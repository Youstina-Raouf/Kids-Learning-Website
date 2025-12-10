const express = require('express');
const Quest = require('../models/Quest');
const Progress = require('../models/Progress');
const Child = require('../models/Child');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quests
// @desc    Get quests (filtered by age band and subject)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { ageBand, subject } = req.query;
    const query = {};

    if (ageBand) {
      query.ageBand = ageBand;
    }
    if (subject) {
      query.subject = subject;
    }

    const quests = await Quest.find(query).populate('gameId').sort({ createdAt: -1 });
    res.json(quests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/quests/:id
// @desc    Get quest by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id).populate('gameId');
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    res.json(quest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/quests/:id/start
// @desc    Start a quest
// @access  Private (Child)
router.post('/:id/start', auth, async (req, res) => {
  try {
    if (req.role !== 'child') {
      return res.status(403).json({ message: 'Only children can start quests' });
    }

    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    let progress = await Progress.findOne({
      childId: req.userId,
      questId: req.params.id
    });

    if (!progress) {
      progress = new Progress({
        childId: req.userId,
        questId: req.params.id,
        gameId: quest.gameId,
        status: 'in_progress',
        startedAt: new Date()
      });
    } else if (progress.status === 'completed') {
      return res.status(400).json({ message: 'Quest already completed' });
    } else {
      progress.status = 'in_progress';
      if (!progress.startedAt) {
        progress.startedAt = new Date();
      }
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/quests/:id/complete-step
// @desc    Complete a quest step
// @access  Private (Child)
router.post('/:id/complete-step', auth, async (req, res) => {
  try {
    if (req.role !== 'child') {
      return res.status(403).json({ message: 'Only children can complete steps' });
    }

    const { stepNumber, answer } = req.body;
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    const step = quest.steps.find(s => s.stepNumber === stepNumber);
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }

    let progress = await Progress.findOne({
      childId: req.userId,
      questId: req.params.id
    });

    if (!progress) {
      return res.status(400).json({ message: 'Quest not started' });
    }

    // Check if step already completed
    const alreadyCompleted = progress.completedSteps.find(
      cs => cs.stepNumber === stepNumber
    );

    if (alreadyCompleted) {
      return res.json(progress);
    }

    // Validate answer (simplified - can be enhanced)
    const isCorrect = step.answer ? 
      JSON.stringify(step.answer) === JSON.stringify(answer) : true;

    if (!isCorrect) {
      return res.status(400).json({ message: 'Incorrect answer' });
    }

    // Add completed step
    progress.completedSteps.push({
      stepNumber,
      completedAt: new Date(),
      pointsEarned: step.points
    });

    progress.totalPointsEarned += step.points;
    progress.currentStep = Math.max(progress.currentStep, stepNumber);

    // Check if quest is completed
    if (progress.completedSteps.length === quest.steps.length) {
      progress.status = 'completed';
      progress.completedAt = new Date();
      
      if (progress.startedAt) {
        progress.timeSpent = Math.floor(
          (progress.completedAt - progress.startedAt) / 1000
        );
      }

      // Award rewards
      const child = await Child.findById(req.userId);
      child.totalPoints += quest.rewards.xp + progress.totalPointsEarned;
      
      if (quest.rewards.badge) {
        const badgeExists = child.badges.find(
          b => b.badgeId.toString() === quest.rewards.badge.toString()
        );
        if (!badgeExists) {
          child.badges.push({
            badgeId: quest.rewards.badge,
            earnedAt: new Date()
          });
        }
      }
      
      await child.save();
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/quests/:id/progress
// @desc    Get progress for a quest
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const childId = req.role === 'child' ? req.userId : req.query.childId;
    
    if (!childId) {
      return res.status(400).json({ message: 'Child ID required' });
    }

    const progress = await Progress.findOne({
      childId,
      questId: req.params.id
    }).populate('questId');

    if (!progress) {
      return res.json({ status: 'not_started' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

