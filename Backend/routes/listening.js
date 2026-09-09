const express = require('express');
const router = express.Router();
const { getBooks, getTestDetail, getAnswerKey, getTranscript, submitTest } = require('../controllers/listeningController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/:examType/books', optionalAuth, getBooks);
router.get('/:examType/books/:bookSlug/tests/:testSlug', getTestDetail);
router.get('/:examType/books/:bookSlug/tests/:testSlug/answers', getAnswerKey);
router.get('/:examType/books/:bookSlug/tests/:testSlug/transcript', getTranscript);
router.post('/:examType/books/:bookSlug/tests/:testSlug/submit', authenticate, submitTest);

module.exports = router;
