const express = require('express');
const Game = require('../models/Game');
const Quest = require('../models/Quest');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/games
// @desc    Get games (filtered by age band and subject)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { ageBand, subject } = req.query;
    const query = { isActive: true };

    if (ageBand) {
      query.ageBand = ageBand;
    }
    if (subject) {
      query.subject = subject;
    }

    const games = await Game.find(query).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/games
// @desc    Create a new game (educator/admin only)
// @access  Private
router.post('/', auth, requireRole('educator', 'admin'), async (req, res) => {
  try {
    const {
      title,
      titleAr,
      description,
      descriptionAr,
      subject,
      ageBand,
      thumbnail,
      difficulty,
      estimatedTime,
      pointsReward
    } = req.body;

    if (!title || !titleAr || !description || !descriptionAr || !subject || !ageBand || !thumbnail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const game = new Game({
      title,
      titleAr,
      description,
      descriptionAr,
      subject,
      ageBand,
      createdBy: req.userId,
      thumbnail,
      difficulty,
      estimatedTime,
      pointsReward
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/games/mine
// @desc    Get games created by the logged-in educator/admin
// @access  Private
router.get('/mine', auth, requireRole('educator', 'admin'), async (req, res) => {
  try {
    const games = await Game.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/games/:id
// @desc    Get game by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/games/:id/quests
// @desc    Get quests for a game
// @access  Private
router.get('/:id/quests', auth, async (req, res) => {
  try {
    const quests = await Quest.find({ gameId: req.params.id });
    res.json(quests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

