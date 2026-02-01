const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  followUser,
  updateProfile
} = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/:username', optionalAuth, getUserProfile);
router.post('/:username/follow', authenticate, followUser);
router.put('/profile', authenticate, updateProfile);

module.exports = router;

