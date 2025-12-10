const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Child = require('../models/Child');

// JWT secret (with dev fallback to avoid secretOrPrivateKey errors)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role === 'child') {
      req.child = await Child.findById(decoded.id);
      if (!req.child) {
        return res.status(401).json({ message: 'Child not found' });
      }
      req.userId = decoded.id;
      req.role = 'child';
    } else {
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.userId = decoded.id;
      req.role = decoded.role;
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, requireRole };

