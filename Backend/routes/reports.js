const express = require('express');
const router = express.Router();
const { submitReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, submitReport);

module.exports = router;
