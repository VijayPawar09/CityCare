const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

// GET /api/users/profile
router.get('/profile', authMiddleware, getProfile);

// PUT /api/users/profile (supports optional profileImage upload)
router.put('/profile', authMiddleware, upload.single('profileImage'), updateProfile);

module.exports = router;
