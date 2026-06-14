import express from 'express';
import { 
  loginUser, 
  verifyUser, 
  changePassword, 
  getUsers, 
  createUser, 
  updateUser,
  deleteUser 
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Strict rate limiting for login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per `window` (here, per 15 minutes)
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Public routes
router.post('/login', loginLimiter, loginUser);

// Protected routes (All logged-in users can verify and change password)
router.get('/verify', protect, verifyUser);
router.post('/change-password', protect, changePassword);

// Protected routes (Super Admin only)
router.get('/users', protect, authorizeRoles('Super Admin'), getUsers);
router.post('/users', protect, authorizeRoles('Super Admin'), createUser);
router.put('/users/:id', protect, authorizeRoles('Super Admin'), updateUser);
router.delete('/users/:id', protect, authorizeRoles('Super Admin'), deleteUser);

export default router;
