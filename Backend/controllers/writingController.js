const WritingSubmission = require('../models/WritingSubmission');
const { successResponse, errorResponse } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * POST /api/writing/submit
 */
const submitWriting = async (req, res) => {
  try {
    const { testId, tasks, timeSpent } = req.body;

    if (!testId || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return errorResponse(res, 'testId and tasks are required', 400);
    }

    const formattedTasks = tasks.map(t => ({
      taskNumber: t.taskNumber,
      prompt: t.prompt || '',
      response: (t.response || '').trim(),
      wordCount: t.wordCount || (t.response ? t.response.trim().split(/\s+/).filter(Boolean).length : 0),
    }));

    const submission = await WritingSubmission.create({
      user: req.user.id,
      testId,
      tasks: formattedTasks,
      timeSpent: timeSpent || 0,
      status: 'pending',
      submittedAt: new Date(),
    });

    return successResponse(res, {
      submissionId: submission._id,
      status: 'pending',
      message: 'Your writing test has been submitted and is being reviewed by our tutor.',
    }, 'Writing submitted successfully', 201);
  } catch (error) {
    console.error('Submit writing error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/writing/submissions
 */
const getMySubmissions = async (req, res) => {
  try {
    const { limit, skip, paginationResponse } = parsePagination(req.query);

    const query = { user: req.user.id };
    const total = await WritingSubmission.countDocuments(query);
    const submissions = await WritingSubmission.find(query)
      .select('testId tasks status bandScore submittedAt gradedAt')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse(res, {
      submissions,
      pagination: paginationResponse(total),
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/writing/submissions/:id
 */
const getSubmission = async (req, res) => {
  try {
    const submission = await WritingSubmission.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).lean();

    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }

    return successResponse(res, submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/writing/:examType/books
 */
const getBooks = async (req, res) => {
  try {
    const { examType } = req.params;
    const { limit, skip, paginationResponse } = parsePagination(req.query);

    // Build books statically
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
          skill: 'writing',
          duration: 60,
          totalQuestions: 0,
          sections: 2,
          status: 'not_started',
          result: null,
        })),
      };
    }

    // If user is logged in, check their writing submissions
    if (req.user) {
      const submissions = await WritingSubmission.find({ user: req.user.id })
        .select('testId status bandScore submittedAt')
        .sort({ submittedAt: -1 })
        .lean();

      // Latest submission per testId
      const latestPerTest = {};
      for (const sub of submissions) {
        if (!latestPerTest[sub.testId]) {
          latestPerTest[sub.testId] = sub;
        }
      }

      for (const book of Object.values(bookMap)) {
        for (const test of book.tests) {
          const sub = latestPerTest[test.id];
          if (sub) {
            test.status = 'completed';
            test.result = {
              testNumber: test.testNumber,
              bandScore: sub.bandScore || 0,
              correctAnswers: 0,
              totalQuestions: 0,
              completedAt: sub.submittedAt,
              pending: sub.status === 'pending',
            };
          }
        }
      }
    }

    const allBooks = Object.values(bookMap);
    const totalBooks = allBooks.length;
    const paginatedBooks = allBooks.slice(skip, skip + limit);

    return successResponse(res, {
      books: paginatedBooks,
      pagination: paginationResponse(totalBooks),
      stats: {
        totalBooks,
        totalTests: totalBooks * 4,
      },
    });
  } catch (error) {
    console.error('Error fetching writing books:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { submitWriting, getMySubmissions, getSubmission, getBooks };
