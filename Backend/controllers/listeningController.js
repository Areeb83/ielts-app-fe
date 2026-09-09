const ListeningTest = require('../models/ListeningTest');
const AnswerKey = require('../models/AnswerKey');
const Transcript = require('../models/Transcript');
const TestAttempt = require('../models/TestAttempt');
const { scoreTest } = require('../utils/scoring');
const { successResponse, errorResponse } = require('../utils/response');
const { isTestFree } = require('../utils/planLimits');

/**
 * GET /api/listening/:examType/books/:bookSlug/tests/:testSlug
 */
const getTestDetail = async (req, res) => {
  try {
    const { examType, bookSlug, testSlug } = req.params;
    const testId = `${bookSlug}-${testSlug}`;

    const test = await ListeningTest.findOne({ testId, examType });

    if (!test) {
      return errorResponse(res, `Test not found: ${testId}`, 404);
    }

    return successResponse(res, {
      testId: test.testId,
      bookId: test.bookId,
      title: test.title,
      audioSrc: test.audioSrc,
      totalQuestions: test.totalQuestions,
      sections: test.sections,
    });
  } catch (error) {
    console.error('Error fetching test detail:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/listening/:examType/books/:bookSlug/tests/:testSlug/answers
 */
const getAnswerKey = async (req, res) => {
  try {
    const { bookSlug, testSlug } = req.params;
    const testId = `${bookSlug}-${testSlug}`;

    const answerKey = await AnswerKey.findOne({ testId, skill: 'listening' });

    if (!answerKey) {
      return errorResponse(res, `Answer key not found: ${testId}`, 404);
    }

    return successResponse(res, {
      testId: answerKey.testId,
      answers: answerKey.answers,
    });
  } catch (error) {
    console.error('Error fetching answer key:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/listening/:examType/books/:bookSlug/tests/:testSlug/transcript
 */
const getTranscript = async (req, res) => {
  try {
    const { bookSlug, testSlug } = req.params;
    const testId = `${bookSlug}-${testSlug}`;

    const transcript = await Transcript.findOne({ testId });

    if (!transcript) {
      return errorResponse(res, `Transcript not found: ${testId}`, 404);
    }

    return successResponse(res, {
      testId: transcript.testId,
      sections: transcript.sections,
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * POST /api/listening/:examType/books/:bookSlug/tests/:testSlug/submit
 */
const submitTest = async (req, res) => {
  try {
    const { examType, bookSlug, testSlug } = req.params;
    const { answers, timeSpent } = req.body;
    const testId = `${bookSlug}-${testSlug}`;

    if (!answers || typeof answers !== 'object') {
      return errorResponse(res, 'Answers are required', 400);
    }

    // Free plan check
    const user = await require('../models/User').findById(req.user.id).select('plan').lean();
    if (user?.plan === 'free' && !isTestFree(testId)) {
      return errorResponse(res, 'Upgrade to access this test', 403);
    }

    const answerKey = await AnswerKey.findOne({ testId, skill: 'listening' });
    if (!answerKey) {
      return errorResponse(res, `Answer key not found: ${testId}`, 404);
    }

    const result = scoreTest(answers, answerKey);

    // Timer enforcement: listening ~30 min + 2 min grace = 1920 seconds
    const maxDuration = 32 * 60; // 32 minutes in seconds
    const isLate = (timeSpent || 0) > maxDuration;

    const attempt = await TestAttempt.create({
      user: req.user.id,
      testId,
      skill: 'listening',
      examType,
      status: 'submitted',
      score: result.correct,
      bandScore: result.bandScore,
      timeSpent: timeSpent || 0,
      isLate,
      answers,
      results: result.results,
      submittedAt: new Date(),
    });

    return successResponse(res, {
      attemptId: attempt._id,
      bandScore: result.bandScore,
      correctAnswers: result.correct,
      totalQuestions: result.total,
      timeSpent: timeSpent || 0,
      isLate,
      results: result.results,
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/listening/:examType/books
 */
const getBooks = async (req, res) => {
  try {
    const { examType } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(20, parseInt(req.query.limit) || 6));

    // Build book list statically — no need to query ListeningTest collection
    const bookMap = {};
    for (let num = 11; num <= 19; num++) {
      const bookId = `book-${num}`;
      bookMap[bookId] = {
        id: bookId,
        number: num,
        title: `Cambridge IELTS ${num}`,
        totalTests: 4,
        tests: [1, 2, 3, 4].map(t => ({
          id: `${bookId}-test-${t}`,
          testNumber: t,
          bookNumber: num,
          examType,
          skill: 'listening',
          duration: 30,
          totalQuestions: 40,
          sections: 4,
          status: 'not_started',
          result: null,
          locked: false,
        })),
      };
    }

    // If user is logged in, attach their results
    let completedCount = 0;
    let totalBand = 0;

    if (req.user) {
      const attempts = await TestAttempt.find({
        user: req.user.id,
        skill: 'listening',
        status: 'submitted',
      })
        .sort({ submittedAt: -1 })
        .lean();

      // Build map: testId → latest attempt
      const latestAttempts = {};
      for (const attempt of attempts) {
        if (!latestAttempts[attempt.testId]) {
          latestAttempts[attempt.testId] = attempt;
        }
      }

      for (const book of Object.values(bookMap)) {
        for (const test of book.tests) {
          const attempt = latestAttempts[test.id];
          if (attempt) {
            test.status = 'completed';
            test.result = {
              attemptId: attempt._id,
              testNumber: test.testNumber,
              bandScore: attempt.bandScore,
              correctAnswers: attempt.score,
              totalQuestions: attempt.results?.length || 40,
              completedAt: attempt.submittedAt,
            };
            completedCount++;
            totalBand += attempt.bandScore;
          }
        }
      }
    }

    // Set locked status based on user plan
    const userPlan = req.user
      ? (await require('../models/User').findById(req.user.id).select('plan').lean())?.plan || 'free'
      : 'free';

    if (userPlan === 'free') {
      for (const book of Object.values(bookMap)) {
        for (const test of book.tests) {
          test.locked = !isTestFree(test.id);
        }
      }
    }

    const allBooks = Object.values(bookMap);
    const totalBooks = allBooks.length;
    const totalTests = totalBooks * 4;
    const totalPages = Math.ceil(totalBooks / limit);
    const paginatedBooks = allBooks.slice((page - 1) * limit, page * limit);

    return successResponse(res, {
      books: paginatedBooks,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalBooks,
        itemsPerPage: limit,
      },
      stats: {
        totalBooks,
        totalTests,
        completedTests: completedCount,
        averageBandScore: completedCount > 0 ? Math.round((totalBand / completedCount) * 10) / 10 : null,
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { getTestDetail, getAnswerKey, getTranscript, submitTest, getBooks };
