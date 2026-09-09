const WritingSubmission = require('../models/WritingSubmission');
const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');
const Report = require('../models/Report');
const { successResponse, errorResponse } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * GET /api/admin/submissions
 */
const listSubmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const { limit, skip, paginationResponse } = parsePagination(req.query);

    const query = {};
    if (status && ['pending', 'graded'].includes(status)) {
      query.status = status;
    }

    const total = await WritingSubmission.countDocuments(query);
    const submissions = await WritingSubmission.find(query)
      .populate('user', 'name email')
      .select('testId tasks status bandScore submittedAt gradedAt')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pendingCount = await WritingSubmission.countDocuments({ status: 'pending' });
    const gradedCount = await WritingSubmission.countDocuments({ status: 'graded' });

    return successResponse(res, {
      submissions,
      stats: { pending: pendingCount, graded: gradedCount, total: pendingCount + gradedCount },
      pagination: paginationResponse(total),
    });
  } catch (error) {
    console.error('Admin list submissions error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/admin/submissions/:id
 */
const getSubmissionDetail = async (req, res) => {
  try {
    const submission = await WritingSubmission.findById(req.params.id)
      .populate('user', 'name email')
      .lean();

    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }

    return successResponse(res, submission);
  } catch (error) {
    console.error('Admin get submission error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * PATCH /api/admin/submissions/:id/grade
 */
const gradeSubmission = async (req, res) => {
  try {
    const { bandScore, feedback } = req.body;

    if (bandScore === undefined || !feedback) {
      return errorResponse(res, 'bandScore and feedback are required', 400);
    }

    if (bandScore < 0 || bandScore > 9) {
      return errorResponse(res, 'bandScore must be between 0 and 9', 400);
    }

    const submission = await WritingSubmission.findById(req.params.id);
    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }

    submission.status = 'graded';
    submission.bandScore = bandScore;

    // Apply per-task feedback if provided
    if (feedback.tasks && Array.isArray(feedback.tasks)) {
      for (const tf of feedback.tasks) {
        const task = submission.tasks.find(t => t.taskNumber === tf.taskNumber);
        if (task) {
          task.bandScore = tf.bandScore;
          task.feedback = {
            taskAchievement: tf.taskAchievement,
            coherence: tf.coherence,
            lexicalResource: tf.lexicalResource,
            grammar: tf.grammar,
            comments: tf.comments || '',
          };
        }
      }
    } else {
      // Legacy: apply same feedback to all tasks
      for (const task of submission.tasks) {
        task.feedback = {
          taskAchievement: feedback.taskAchievement,
          coherence: feedback.coherence,
          lexicalResource: feedback.lexicalResource,
          grammar: feedback.grammar,
          comments: feedback.comments || '',
        };
      }
    }

    submission.gradedAt = new Date();
    submission.markModified('tasks');
    await submission.save();

    return successResponse(res, submission.toObject(), 'Submission graded successfully');
  } catch (error) {
    console.error('Admin grade submission error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const { page, limit, skip, paginationResponse } = parsePagination(req.query);

    const [
      totalUsers,
      totalAttempts,
      pendingWriting,
      gradedWriting,
      openReports,
    ] = await Promise.all([
      User.countDocuments(),
      TestAttempt.countDocuments({ status: 'submitted' }),
      WritingSubmission.countDocuments({ status: 'pending' }),
      WritingSubmission.countDocuments({ status: 'graded' }),
      Report.countDocuments({ status: 'open' }),
    ]);

    // Fetch enough from each collection to build a merged feed
    const fetchLimit = limit + skip + 10; // fetch extra to ensure enough after merge
    const [recentUsers, recentAttempts, recentWriting, recentReports] = await Promise.all([
      User.find().select('name email createdAt').sort({ createdAt: -1 }).limit(fetchLimit).lean(),
      TestAttempt.find({ status: 'submitted' }).populate('user', 'name').select('testId skill bandScore submittedAt user').sort({ submittedAt: -1 }).limit(fetchLimit).lean(),
      WritingSubmission.find().populate('user', 'name').select('testId tasks status user submittedAt').sort({ submittedAt: -1 }).limit(fetchLimit).lean(),
      Report.find().populate('user', 'name').select('reportType description status user createdAt').sort({ createdAt: -1 }).limit(fetchLimit).lean(),
    ]);

    // Merge into a single activity feed sorted by date
    const activity = [];

    for (const u of recentUsers) {
      activity.push({
        type: 'signup',
        message: `${u.name} signed up`,
        time: u.createdAt,
      });
    }

    for (const a of recentAttempts) {
      const match = a.testId.match(/book-(\d+).*test-(\d+)/);
      const label = match ? `C${match[1]} ${a.skill === 'listening' ? 'L' : 'R'} Test ${match[2]}` : a.testId;
      activity.push({
        type: 'test',
        message: `${a.user?.name || 'User'} took ${label} — Band ${a.bandScore}`,
        time: a.submittedAt,
      });
    }

    for (const w of recentWriting) {
      activity.push({
        type: 'writing',
        message: `${w.user?.name || 'User'} submitted Writing ${w.testId} (${w.status})`,
        time: w.submittedAt,
      });
    }

    for (const r of recentReports) {
      activity.push({
        type: 'report',
        message: `${r.user?.name || 'User'} reported: ${r.reportType}`,
        time: r.createdAt,
      });
    }

    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const total = activity.length;
    const paginatedActivity = activity.slice(skip, skip + limit);

    return successResponse(res, {
      stats: {
        totalUsers,
        totalAttempts,
        pendingWriting,
        gradedWriting,
        openReports,
      },
      activity: paginatedActivity,
      pagination: paginationResponse(total),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/admin/users
 */
const listUsers = async (req, res) => {
  try {
    const { search, plan, status } = req.query;
    const { limit, skip, paginationResponse } = parsePagination(req.query);

    const query = { role: { $ne: 'admin' } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (plan && ['free', 'pro', 'premium'].includes(plan)) {
      query.plan = plan;
    }

    if (status === 'blocked') {
      query.isBlocked = true;
    } else if (status === 'active') {
      query.isBlocked = { $ne: true };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name email plan isBlocked createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get test count per user
    const userIds = users.map(u => u._id);
    const attemptCounts = await TestAttempt.aggregate([
      { $match: { user: { $in: userIds }, status: 'submitted' } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    for (const a of attemptCounts) {
      countMap[a._id.toString()] = a.count;
    }

    const formatted = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      plan: u.plan,
      isBlocked: u.isBlocked || false,
      testsTaken: countMap[u._id.toString()] || 0,
      joinedAt: u.createdAt,
    }));

    return successResponse(res, {
      users: formatted,
      pagination: paginationResponse(total),
    });
  } catch (error) {
    console.error('List users error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * PATCH /api/admin/users/:id/plan
 */
const updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !['free', 'pro', 'premium'].includes(plan)) {
      return errorResponse(res, 'Valid plan is required (free, pro, premium)', 400);
    }

    const user = await User.findByIdAndUpdate(req.params.id, { plan }, { returnDocument: 'after' });
    if (!user) return errorResponse(res, 'User not found', 404);

    return successResponse(res, { id: user._id, plan: user.plan }, 'Plan updated');
  } catch (error) {
    console.error('Update plan error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * PATCH /api/admin/users/:id/block
 */
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    if (user.role === 'admin') return errorResponse(res, 'Cannot block an admin', 400);

    user.isBlocked = !user.isBlocked;
    await user.save();

    // If blocking, invalidate their refresh tokens
    if (user.isBlocked) {
      const RefreshToken = require('../models/RefreshToken');
      await RefreshToken.deleteMany({ user: user._id });
    }

    return successResponse(res, { id: user._id, isBlocked: user.isBlocked }, user.isBlocked ? 'User blocked' : 'User unblocked');
  } catch (error) {
    console.error('Block user error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    if (user.role === 'admin') return errorResponse(res, 'Cannot delete an admin', 400);

    // Delete all related data
    const RefreshToken = require('../models/RefreshToken');
    await Promise.all([
      RefreshToken.deleteMany({ user: user._id }),
      TestAttempt.deleteMany({ user: user._id }),
      WritingSubmission.deleteMany({ user: user._id }),
      Report.deleteMany({ user: user._id }),
      User.deleteOne({ _id: user._id }),
    ]);

    return successResponse(res, null, 'User and all related data deleted');
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { getDashboard, listSubmissions, getSubmissionDetail, gradeSubmission, listUsers, updateUserPlan, toggleBlockUser, deleteUser };
