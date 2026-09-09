const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');
const WritingSubmission = require('../models/WritingSubmission');
const { successResponse, errorResponse } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * PATCH /api/user/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (name.length < 2 || name.length > 100) {
        return errorResponse(res, 'Name must be between 2 and 100 characters', 400);
      }
      updates.name = name;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, 'No fields to update', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { returnDocument: 'after' }
    );

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user.toJSON(), 'Profile updated');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * PATCH /api/user/password
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters', 400);
    }

    if (!/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return errorResponse(res, 'New password must contain at least 1 uppercase letter and 1 number', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    console.error('Update password error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/user/progress
 */
const getProgress = async (req, res) => {
  try {
    const { skill } = req.query;
    const { page, limit, paginationResponse } = parsePagination(req.query);

    // Get all test attempts for stats
    const allAttempts = await TestAttempt.find({ user: req.user.id, status: 'submitted' })
      .select('skill bandScore score timeSpent')
      .lean();

    // Get all writing submissions
    const allWriting = await WritingSubmission.find({ user: req.user.id })
      .select('testId taskNumber status bandScore wordCount timeSpent submittedAt')
      .lean();

    // Calculate stats
    const totalAttempts = allAttempts.length + allWriting.length;
    const totalBand = allAttempts.reduce((sum, a) => sum + (a.bandScore || 0), 0);
    const avgBandScore = allAttempts.length > 0 ? Math.round((totalBand / allAttempts.length) * 10) / 10 : 0;
    const bestScore = allAttempts.length > 0 ? Math.max(...allAttempts.map(a => a.bandScore || 0)) : 0;
    const totalTimeSpent = allAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
      + allWriting.reduce((sum, w) => sum + (w.timeSpent || 0), 0);

    // Skill breakdown
    const listeningAttempts = allAttempts.filter(a => a.skill === 'listening');
    const readingAttempts = allAttempts.filter(a => a.skill === 'reading');
    const gradedWriting = allWriting.filter(w => w.status === 'graded' && w.bandScore != null);

    const stats = {
      totalAttempts,
      avgBandScore,
      bestScore,
      totalTimeSpent,
      listening: {
        attempts: listeningAttempts.length,
        avgBand: listeningAttempts.length > 0
          ? Math.round((listeningAttempts.reduce((s, a) => s + (a.bandScore || 0), 0) / listeningAttempts.length) * 10) / 10
          : 0,
        bestBand: listeningAttempts.length > 0
          ? Math.max(...listeningAttempts.map(a => a.bandScore || 0))
          : 0,
      },
      reading: {
        attempts: readingAttempts.length,
        avgBand: readingAttempts.length > 0
          ? Math.round((readingAttempts.reduce((s, a) => s + (a.bandScore || 0), 0) / readingAttempts.length) * 10) / 10
          : 0,
        bestBand: readingAttempts.length > 0
          ? Math.max(...readingAttempts.map(a => a.bandScore || 0))
          : 0,
      },
      writing: {
        submissions: allWriting.length,
        pending: allWriting.filter(w => w.status === 'pending').length,
        graded: gradedWriting.length,
        avgBand: gradedWriting.length > 0
          ? Math.round((gradedWriting.reduce((s, w) => s + (w.bandScore || 0), 0) / gradedWriting.length) * 10) / 10
          : 0,
        bestBand: gradedWriting.length > 0
          ? Math.max(...gradedWriting.map(w => w.bandScore || 0))
          : 0,
      },
    };

    // Build history based on skill filter
    let history = [];

    if (!skill || skill === 'listening' || skill === 'reading') {
      const query = { user: req.user.id, status: 'submitted' };
      if (skill && ['listening', 'reading'].includes(skill)) {
        query.skill = skill;
      }

      const attempts = await TestAttempt.find(query)
        .select('testId skill examType score bandScore timeSpent submittedAt')
        .sort({ submittedAt: -1 })
        .lean();

      history.push(...attempts.map(a => {
        let bookNum = 0;
        let testNum = 0;
        let displayName = a.testId;

        if (a.skill === 'reading') {
          const match = a.testId.match(/book-(\d+)-reading-test-(\d+)/);
          if (match) {
            bookNum = parseInt(match[1]);
            testNum = parseInt(match[2]);
            displayName = `C${bookNum} Reading Test ${testNum}`;
          }
        } else {
          const match = a.testId.match(/book-(\d+)-test-(\d+)/);
          if (match) {
            bookNum = parseInt(match[1]);
            testNum = parseInt(match[2]);
            displayName = `C${bookNum} Listening Test ${testNum}`;
          }
        }

        return {
          id: a._id,
          testId: a.testId,
          skill: a.skill,
          displayName,
          bookNumber: bookNum,
          testNumber: testNum,
          score: a.score,
          bandScore: a.bandScore,
          totalQuestions: 40,
          timeSpent: a.timeSpent,
          submittedAt: a.submittedAt,
        };
      }));
    }

    if (!skill || skill === 'writing') {
      const writingSubs = await WritingSubmission.find({ user: req.user.id })
        .select('testId tasks status bandScore timeSpent submittedAt')
        .sort({ submittedAt: -1 })
        .lean();

      history.push(...writingSubs.map(w => {
        const match = w.testId.match(/book-(\d+)-test-(\d+)/);
        const bookNum = match ? parseInt(match[1]) : 0;
        const testNum = match ? parseInt(match[2]) : 0;
        const totalWords = (w.tasks || []).reduce((sum, t) => sum + (t.wordCount || 0), 0);

        return {
          id: w._id,
          testId: w.testId,
          skill: 'writing',
          displayName: `C${bookNum} Writing Test ${testNum}`,
          bookNumber: bookNum,
          testNumber: testNum,
          score: totalWords,
          bandScore: w.bandScore || 0,
          totalQuestions: 0,
          timeSpent: w.timeSpent || 0,
          submittedAt: w.submittedAt,
          status: w.status,
        };
      }));
    }

    // Sort all by date and paginate
    history.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const total = history.length;
    history = history.slice((page - 1) * limit, page * limit);

    return successResponse(res, {
      stats,
      history,
      pagination: paginationResponse(total),
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { updateProfile, updatePassword, getProgress };
