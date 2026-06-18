import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Protected route (requires 'dashboard' permission)
router.get('/stats', protect, requirePermission('dashboard'), getDashboardStats);

export default router;
