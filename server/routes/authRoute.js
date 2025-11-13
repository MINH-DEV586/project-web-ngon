const express = require('express');
const router = express.Router();
const { register, login, getUserProfile, changePassword, updateProfile } = require('../controller/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
