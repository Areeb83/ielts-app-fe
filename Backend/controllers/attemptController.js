const TestAttempt = require('../models/TestAttempt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/attempts/:id
 * Returns full attempt detail including user answers.
 */
const getAttempt = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).lean();

    if (!attempt) {
      return errorResponse(res, 'Attempt not found', 404);
    }

    return successResponse(res, {
      id: attempt._id,
      testId: attempt.testId,
      skill: attempt.skill,
      examType: attempt.examType,
      score: attempt.score,
      bandScore: attempt.bandScore,
      timeSpent: attempt.timeSpent,
      answers: attempt.answers || {},
      results: attempt.results || [],
      submittedAt: attempt.submittedAt,
    });
  } catch (error) {
    console.error('Get attempt error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { getAttempt };
