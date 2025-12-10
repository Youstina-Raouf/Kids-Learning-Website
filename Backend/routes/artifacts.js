const express = require('express');
const Artifact = require('../models/Artifact');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/artifacts
// @desc    Create an artifact
// @access  Private (Child)
router.post('/', auth, async (req, res) => {
  try {
    if (req.role !== 'child') {
      return res.status(403).json({ message: 'Only children can create artifacts' });
    }

    const { type, title, content, questId, subject } = req.body;

    const artifact = new Artifact({
      childId: req.userId,
      type,
      title,
      content,
      questId,
      subject,
      status: 'pending'
    });

    await artifact.save();
    res.status(201).json(artifact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/artifacts
// @desc    Get artifacts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { childId, status, type } = req.query;
    const query = {};

    if (req.role === 'child') {
      query.childId = req.userId;
    } else if (childId) {
      query.childId = childId;
    }

    if (status) query.status = status;
    if (type) query.type = type;

    const artifacts = await Artifact.find(query)
      .populate('childId', 'name avatar')
      .populate('questId')
      .sort({ createdAt: -1 });

    res.json(artifacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/artifacts/pending
// @desc    Get pending artifacts for review
// @access  Private (Parent/Educator)
router.get('/pending', auth, requireRole('parent', 'educator', 'admin'), async (req, res) => {
  try {
    let query = { status: 'pending' };

    if (req.role === 'parent') {
      const Child = require('../models/Child');
      const children = await Child.find({ parentId: req.userId });
      query.childId = { $in: children.map(c => c._id) };
    }

    const artifacts = await Artifact.find(query)
      .populate('childId', 'name avatar')
      .populate('questId')
      .sort({ createdAt: -1 });

    res.json(artifacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/artifacts/:id/review
// @desc    Review an artifact (approve/reject)
// @access  Private (Parent/Educator)
router.put('/:id/review', auth, requireRole('parent', 'educator', 'admin'), async (req, res) => {
  try {
    const { status, feedback, isPublic } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({ message: 'Artifact not found' });
    }

    // Check permissions
    if (req.role === 'parent') {
      const Child = require('../models/Child');
      const child = await Child.findById(artifact.childId);
      if (child.parentId.toString() !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    artifact.status = status;
    artifact.reviewedBy = req.userId;
    artifact.reviewedAt = new Date();
    artifact.feedback = feedback;
    artifact.isPublic = status === 'approved' ? (isPublic || false) : false;

    await artifact.save();
    res.json(artifact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

