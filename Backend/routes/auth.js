const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, refresh, logout, getMe, forgotPassword, resetPassword, googleAuth } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.', statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour
  message: { success: false, message: 'Too many accounts created. Please try again later.', statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: { success: false, message: 'Too many password reset requests. Please try again later.', statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', loginLimiter, googleAuth);
router.get('/me', authenticate, getMe);

module.exports = router;
