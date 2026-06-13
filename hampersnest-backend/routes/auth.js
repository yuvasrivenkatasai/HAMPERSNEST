import express from 'express';
import { loginUser, verifyUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// @desc    Verify token and return user info
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', protect, verifyUser);

export default router;
