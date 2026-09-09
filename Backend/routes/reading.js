const express = require('express');
const router = express.Router();
const { getBooks, getTestDetail, getAnswerKey, submitTest } = require('../controllers/readingController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/:examType/books', optionalAuth, getBooks);
router.get('/:examType/books/:bookSlug/tests/:testSlug', getTestDetail);
router.get('/:examType/books/:bookSlug/tests/:testSlug/answers', getAnswerKey);
router.post('/:examType/books/:bookSlug/tests/:testSlug/submit', authenticate, submitTest);

module.exports = router;
