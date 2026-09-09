const express = require('express');
const router = express.Router();
const { submitWriting, getMySubmissions, getSubmission, getBooks } = require('../controllers/writingController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/:examType/books', optionalAuth, getBooks);
router.post('/submit', authenticate, submitWriting);
router.get('/submissions', authenticate, getMySubmissions);
router.get('/submissions/:id', authenticate, getSubmission);

module.exports = router;
