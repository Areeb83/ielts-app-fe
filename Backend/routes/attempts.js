const express = require('express');
const router = express.Router();
const { getAttempt } = require('../controllers/attemptController');
const { authenticate } = require('../middleware/auth');

router.get('/:id', authenticate, getAttempt);

module.exports = router;
