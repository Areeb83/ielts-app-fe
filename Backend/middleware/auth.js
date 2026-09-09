const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access token required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, plan: decoded.plan };
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, plan: decoded.plan };
  } catch {
    req.user = null;
  }
  next();
};

const isAdmin = async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id).select('role').lean();
  if (!user || user.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};

module.exports = { authenticate, optionalAuth, isAdmin };
