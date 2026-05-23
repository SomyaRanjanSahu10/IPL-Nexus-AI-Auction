const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized. No token provided.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('team', 'name shortName primaryColor');
    
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

const teamOwnerOnly = (req, res, next) => {
  if (!['admin', 'team_owner'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Team owner access required.' });
  }
  next();
};

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { protect, adminOnly, teamOwnerOnly, generateToken };
