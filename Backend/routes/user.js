const express = require('express');
const router = express.Router();
const { updateProfile, updatePassword, getProgress } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.patch('/profile', authenticate, updateProfile);
router.patch('/password', authenticate, updatePassword);
router.get('/progress', authenticate, getProgress);

module.exports = router;
