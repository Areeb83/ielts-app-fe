const express = require('express');
const router = express.Router();
const { getDashboard, listSubmissions, getSubmissionDetail, gradeSubmission, listUsers, updateUserPlan, toggleBlockUser, deleteUser } = require('../controllers/adminController');
const { listReports, updateReportStatus } = require('../controllers/reportController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/dashboard', authenticate, isAdmin, getDashboard);
router.get('/submissions', authenticate, isAdmin, listSubmissions);
router.get('/submissions/:id', authenticate, isAdmin, getSubmissionDetail);
router.patch('/submissions/:id/grade', authenticate, isAdmin, gradeSubmission);
router.get('/users', authenticate, isAdmin, listUsers);
router.patch('/users/:id/plan', authenticate, isAdmin, updateUserPlan);
router.patch('/users/:id/block', authenticate, isAdmin, toggleBlockUser);
router.delete('/users/:id', authenticate, isAdmin, deleteUser);
router.get('/reports', authenticate, isAdmin, listReports);
router.patch('/reports/:id/status', authenticate, isAdmin, updateReportStatus);

module.exports = router;
