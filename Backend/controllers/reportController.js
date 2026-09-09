const Report = require('../models/Report');
const { successResponse, errorResponse } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

/**
 * POST /api/reports
 */
const submitReport = async (req, res) => {
  try {
    const { testId, module, reportType, questionNumber, description } = req.body;

    if (!reportType || !description) {
      return errorResponse(res, 'Report type and description are required', 400);
    }

    const report = await Report.create({
      user: req.user.id,
      testId: testId || '',
      module: module || 'unknown',
      reportType,
      questionNumber: questionNumber || '',
      description,
    });

    return successResponse(res, {
      reportId: report._id,
      status: 'open',
    }, 'Report submitted successfully', 201);
  } catch (error) {
    console.error('Submit report error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * GET /api/admin/reports
 */
const listReports = async (req, res) => {
  try {
    const { status } = req.query;
    const { limit, skip, paginationResponse } = parsePagination(req.query);

    const query = {};
    if (status && ['open', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      query.status = status;
    }

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const openCount = await Report.countDocuments({ status: 'open' });

    return successResponse(res, {
      reports,
      stats: { open: openCount, total },
      pagination: paginationResponse(total),
    });
  } catch (error) {
    console.error('List reports error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * PATCH /api/admin/reports/:id/status
 */
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['open', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return errorResponse(res, 'Valid status is required', 400);
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' }
    );

    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    return successResponse(res, report, 'Report status updated');
  } catch (error) {
    console.error('Update report status error:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
};

module.exports = { submitReport, listReports, updateReportStatus };
