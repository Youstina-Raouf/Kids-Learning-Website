const express = require('express');
const Session = require('../models/Session');
const Alert = require('../models/Alert');
const Child = require('../models/Child');
const { auth, requireRole } = require('../middleware/auth');
const { detectInappropriateContent, generateGuidanceText } = require('../utils/safetyFilter');

const router = express.Router();

// @route   POST /api/monitoring/session/start
// @desc    Start a session
// @access  Private (Child)
router.post('/session/start', auth, async (req, res) => {
  try {
    if (req.role !== 'child') {
      return res.status(403).json({ message: 'Only children can start sessions' });
    }

    const { contentType, contentId, subject } = req.body;

    const session = new Session({
      childId: req.userId,
      contentType,
      contentId,
      subject,
      startTime: new Date()
    });

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/monitoring/session/end
// @desc    End a session
// @access  Private (Child)
router.post('/session/end', auth, async (req, res) => {
  try {
    if (req.role !== 'child') {
      return res.status(403).json({ message: 'Only children can end sessions' });
    }

    const { sessionId, pointsEarned } = req.body;

    const session = await Session.findById(sessionId);
    if (!session || session.childId.toString() !== req.userId) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.endTime = new Date();
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);
    session.pointsEarned = pointsEarned || 0;

    await session.save();

    // Check for excessive gaming
    const child = await Child.findById(req.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = await Session.find({
      childId: req.userId,
      startTime: { $gte: today }
    });

    const totalTimeToday = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const timeLimitMinutes = child.settings.timeLimit || 60;
    const timeLimitSeconds = timeLimitMinutes * 60;

    if (totalTimeToday > timeLimitSeconds) {
      const alert = new Alert({
        childId: req.userId,
        type: 'excessive_gaming',
        severity: 'medium',
        message: `You've reached your daily time limit of ${timeLimitMinutes} minutes. Great job learning today!`,
        messageAr: `لقد وصلت إلى الحد اليومي للوقت وهو ${timeLimitMinutes} دقيقة. عمل رائع في التعلم اليوم!`,
        guidanceText: 'Take a break! Rest is important for your brain. Come back tomorrow for more fun learning!',
        guidanceTextAr: 'خذ استراحة! الراحة مهمة لعقلك. عد غدًا لمزيد من التعلم الممتع!',
        source: 'time_tracker'
      });
      await alert.save();
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/monitoring/check-content
// @desc    Check content for safety
// @access  Private
router.post('/check-content', auth, async (req, res) => {
  try {
    const { text, childId } = req.body;
    const targetChildId = req.role === 'child' ? req.userId : childId;

    if (!targetChildId) {
      return res.status(400).json({ message: 'Child ID required' });
    }

    const result = detectInappropriateContent(text);

    if (!result.isSafe) {
      const child = await Child.findById(targetChildId);
      const locale = child?.locale || 'en';

      const alert = new Alert({
        childId: targetChildId,
        type: result.reason,
        severity: result.severity,
        message: result.message,
        messageAr: result.messageAr || result.message,
        guidanceText: generateGuidanceText(result.reason, locale),
        guidanceTextAr: generateGuidanceText(result.reason, 'ar'),
        source: 'content_filter',
        metadata: { text }
      });

      await alert.save();

      return res.json({
        isSafe: false,
        alert: alert,
        guidance: locale === 'ar' ? alert.guidanceTextAr : alert.guidanceText
      });
    }

    res.json({ isSafe: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/monitoring/dashboard/:childId
// @desc    Get monitoring dashboard data
// @access  Private (Parent/Educator)
router.get('/dashboard/:childId', auth, requireRole('parent', 'educator', 'admin'), async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId);

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Check permissions
    if (req.role === 'parent' && child.parentId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get sessions
    const sessions = await Session.find({
      childId,
      startTime: { $gte: weekAgo }
    }).sort({ startTime: -1 });

    // Calculate statistics
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const todayTime = sessions
      .filter(s => new Date(s.startTime) >= today)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    // Group by subject
    const subjectBreakdown = {};
    sessions.forEach(s => {
      if (s.subject) {
        subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + (s.duration || 0);
      }
    });

    // Group by content type
    const contentTypeBreakdown = {};
    sessions.forEach(s => {
      contentTypeBreakdown[s.contentType] = (contentTypeBreakdown[s.contentType] || 0) + (s.duration || 0);
    });

    // Get alerts
    const alerts = await Alert.find({
      childId,
      createdAt: { $gte: weekAgo }
    }).sort({ createdAt: -1 });

    // Daily time breakdown
    const dailyTime = {};
    sessions.forEach(s => {
      const date = new Date(s.startTime).toDateString();
      dailyTime[date] = (dailyTime[date] || 0) + (s.duration || 0);
    });

    res.json({
      child: {
        name: child.name,
        ageBand: child.ageBand,
        settings: child.settings
      },
      statistics: {
        totalTime: Math.floor(totalTime / 60), // minutes
        todayTime: Math.floor(todayTime / 60), // minutes
        sessionCount: sessions.length,
        averageSessionTime: sessions.length > 0 ? Math.floor(totalTime / sessions.length / 60) : 0
      },
      breakdown: {
        bySubject: subjectBreakdown,
        byContentType: contentTypeBreakdown,
        daily: dailyTime
      },
      alerts: alerts,
      recentSessions: sessions.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/monitoring/alerts/:childId
// @desc    Get alerts for a child
// @access  Private
router.get('/alerts/:childId', auth, async (req, res) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId);

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Check permissions
    if (req.role === 'child' && req.userId !== childId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.role === 'parent' && child.parentId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, type } = req.query;
    const query = { childId };

    if (status) query.status = status;
    if (type) query.type = type;

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/monitoring/alerts/:id/resolve
// @desc    Resolve an alert
// @access  Private (Parent/Educator)
router.put('/alerts/:id/resolve', auth, requireRole('parent', 'educator', 'admin'), async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const child = await Child.findById(alert.childId);
    if (req.role === 'parent' && child.parentId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.userId;
    await alert.save();

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

