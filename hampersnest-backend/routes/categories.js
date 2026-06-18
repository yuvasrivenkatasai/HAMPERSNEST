import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch all categories
router.get('/', getCategories);

// Protected routes (requires 'categories' permission)
router.post('/', protect, requirePermission('categories'), createCategory);
router.put('/:id', protect, requirePermission('categories'), updateCategory);
router.delete('/:id', protect, requirePermission('categories'), deleteCategory);

export default router;
