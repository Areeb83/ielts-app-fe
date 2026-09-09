const ReadingTest = require('../models/ReadingTest');
const AnswerKey = require('../models/AnswerKey');
const TestAttempt = require('../models/TestAttempt');
const { scoreTest } = require('../utils/scoring');
const { successResponse, errorResponse } = require('../utils/response');
const { isTestFree } = require('../utils/planLimits');

/**
 * GET /api/reading/:examType/books/:bookSlug/tests/:testSlug
 */
const getTestDetail = async (req, res) => {
  try {
    const { examType, bookSlug, testSlug } = req.params;
    const testId = `${bookSlug}-reading-${testSlug}`;

    const test = await ReadingTest.findOne({ testId, examType });

    if (!test) {
      return errorResponse(res, `Test not found: ${testId}`, 404);
    }

    return successResponse(res, {
      testId: test.testId,
      bookId: test.bookId,
      title: test.title,
      totalQuestions: test.totalQuestions,
      sections: test.sections,
    });
  } catch (error) {
    console.error('Error fetching reading test detail:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/reading/:examType/books/:bookSlug/tests/:testSlug/answers
 */
const getAnswerKey = async (req, res) => {
  try {
    const { bookSlug, testSlug } = req.params;
    const testId = `${bookSlug}-reading-${testSlug}`;

    const answerKey = await AnswerKey.findOne({ testId, skill: 'reading' });

    if (!answerKey) {
      return errorResponse(res, `Answer key not found: ${testId}`, 404);
    }

    return successResponse(res, {
      testId: answerKey.testId,
      answers: answerKey.answers,
    });
  } catch (error) {
    console.error('Error fetching reading answer key:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * POST /api/reading/:examType/books/:bookSlug/tests/:testSlug/submit
 */
const submitTest = async (req, res) => {
  try {
    const { examType, bookSlug, testSlug } = req.params;
    const { answers, timeSpent } = req.body;
    const testId = `${bookSlug}-reading-${testSlug}`;

    if (!answers || typeof answers !== 'object') {
      return errorResponse(res, 'Answers are required', 400);
    }

    // Free plan check
    const user = await require('../models/User').findById(req.user.id).select('plan').lean();
    if (user?.plan === 'free' && !isTestFree(testId)) {
      return errorResponse(res, 'Upgrade to access this test', 403);
    }

    const answerKey = await AnswerKey.findOne({ testId, skill: 'reading' });
    if (!answerKey) {
      return errorResponse(res, `Answer key not found: ${testId}`, 404);
    }

    const result = scoreTest(answers, answerKey);

    // Timer enforcement: reading 60 min + 2 min grace = 3720 seconds
    const maxDuration = 62 * 60; // 62 minutes in seconds
    const isLate = (timeSpent || 0) > maxDuration;

    const attempt = await TestAttempt.create({
      user: req.user.id,
      testId,
      skill: 'reading',
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
    console.error('Error submitting reading test:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/reading/:examType/books
 */
const getBooks = async (req, res) => {
  try {
    const { examType } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(20, parseInt(req.query.limit) || 6));

    // Build book list statically — no need to query ReadingTest collection
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
          dbTestId: `${bookId}-reading-test-${t}`,
          testNumber: t,
          bookNumber: num,
          examType,
          skill: 'reading',
          duration: 60,
          totalQuestions: 40,
          sections: 3,
          status: 'not_started',
          result: null,
          locked: false,
        })),
      };
    }

    let completedCount = 0;
    let totalBand = 0;

    if (req.user) {
      const attempts = await TestAttempt.find({
        user: req.user.id,
        skill: 'reading',
        status: 'submitted',
      })
        .sort({ submittedAt: -1 })
        .lean();

      const latestAttempts = {};
      for (const attempt of attempts) {
        if (!latestAttempts[attempt.testId]) {
          latestAttempts[attempt.testId] = attempt;
        }
      }

      for (const book of Object.values(bookMap)) {
        for (const test of book.tests) {
          const attempt = latestAttempts[test.dbTestId];
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

    // Clean up dbTestId and set locked
    const allBooks = Object.values(bookMap);
    for (const book of allBooks) {
      for (const test of book.tests) {
        if (userPlan === 'free') {
          // Use dbTestId for reading plan check (has "reading" in it)
          test.locked = !isTestFree(test.dbTestId);
        }
        delete test.dbTestId;
      }
    }

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
    console.error('Error fetching reading books:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { getTestDetail, getAnswerKey, submitTest, getBooks };
