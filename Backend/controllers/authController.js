const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { Resend } = require('resend');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { successResponse, errorResponse } = require('../utils/response');

const resend = new Resend(process.env.RESEND_API_KEY);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, plan: user.plan, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function generateRefreshTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

async function saveRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await RefreshToken.findOneAndUpdate(
    { user: userId },
    { user: userId, token, expiresAt },
    { upsert: true, returnDocument: 'after' }
  );
}

function validateRegistration(name, email, password) {
  const errors = {};

  if (!name || name.length < 2 || name.length > 100) {
    errors.name = ['Name must be between 2 and 100 characters'];
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = ['Please provide a valid email'];
  }
  if (!password || password.length < 8) {
    errors.password = ['Password must be at least 8 characters'];
  } else if (!/(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = ['Password must contain at least 1 uppercase letter and 1 number'];
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// ─── Handlers ───────────────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate
    const errors = validateRegistration(name, email, password);
    if (errors) {
      return errorResponse(res, 'Validation failed', 400, errors);
    }

    // Check if email exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 'Email already registered', 409);
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshTokenString();
    await saveRefreshToken(user._id, refreshToken);

    return successResponse(
      res,
      {
        user: user.toJSON(),
        tokens: { accessToken, refreshToken, expiresIn: 900 },
      },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if blocked
    if (user.isBlocked) {
      return errorResponse(res, 'Your account has been blocked. Contact support.', 403);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshTokenString();
    await saveRefreshToken(user._id, refreshToken);

    return successResponse(res, {
      user: user.toJSON(),
      tokens: { accessToken, refreshToken, expiresIn: 900 },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Find token in DB
    const stored = await RefreshToken.findOne({ token: refreshToken }).populate('user');
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await RefreshToken.deleteOne({ _id: stored._id });
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    // Rotate: generate new tokens
    const user = stored.user;
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshTokenString();
    await saveRefreshToken(user._id, newRefreshToken);

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user.toJSON());
  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Always return 200 to prevent email enumeration
    if (!email) {
      return successResponse(res, null, 'If an account with that email exists, a reset link has been sent.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // Invalidate any previous reset tokens
      await PasswordResetToken.deleteMany({ user: user._id });

      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      await PasswordResetToken.create({
        user: user._id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      // Send email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Reset your password — IELTS Practice',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              We received a request to reset the password for your IELTS Practice account.
              Click the button below to set a new password.
            </p>
            <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    }

    return successResponse(res, null, 'If an account with that email exists, a reset link has been sent.');
  } catch (error) {
    console.error('Forgot password error:', error);
    return successResponse(res, null, 'If an account with that email exists, a reset link has been sent.');
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return errorResponse(res, 'Google credential is required', 400);
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with a random password (they'll use Google to sign in)
      const randomPassword = crypto.randomBytes(32).toString('hex') + 'A1';
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        avatar: picture || null,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshTokenString();
    await saveRefreshToken(user._id, refreshToken);

    return successResponse(res, {
      user: user.toJSON(),
      tokens: { accessToken, refreshToken, expiresIn: 900 },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return errorResponse(res, 'Google authentication failed', 401);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, 'Token and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters', 400);
    }

    if (!/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return errorResponse(res, 'Password must contain at least 1 uppercase letter and 1 number', 400);
    }

    const resetToken = await PasswordResetToken.findOne({ token, used: false });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return errorResponse(res, 'Invalid or expired reset link', 400);
    }

    const user = await User.findById(resetToken.user);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.password = newPassword;
    await user.save();

    resetToken.used = true;
    await resetToken.save();

    // Force re-login on all devices
    await RefreshToken.deleteMany({ user: user._id });

    return successResponse(res, null, 'Password has been reset successfully.');
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { register, login, refresh, logout, getMe, forgotPassword, resetPassword, googleAuth };
