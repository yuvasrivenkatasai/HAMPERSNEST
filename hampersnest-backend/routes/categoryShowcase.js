import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import {
  getActiveShowcases,
  getAllShowcases,
  createShowcase,
  updateShowcase,
  deleteShowcase,
  updateAnimationSetting
} from '../controllers/categoryShowcaseController.js';

const router = express.Router();

// Public routes
router.get('/', getActiveShowcases);

// Admin routes
router.get('/admin', protect, requirePermission('category_showcase'), getAllShowcases);
router.post('/', protect, requirePermission('category_showcase'), createShowcase);
router.put('/settings/animation', protect, requirePermission('category_showcase'), updateAnimationSetting);
router.put('/:id', protect, requirePermission('category_showcase'), updateShowcase);
router.delete('/:id', protect, requirePermission('category_showcase'), deleteShowcase);

export default router;
