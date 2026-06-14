import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch all categories
router.get('/', getCategories);

// Admin/Manager protected routes
router.post('/', protect, authorizeRoles('Super Admin', 'Manager'), createCategory);
router.put('/:id', protect, authorizeRoles('Super Admin', 'Manager'), updateCategory);

// Super Admin only for delete
router.delete('/:id', protect, authorizeRoles('Super Admin'), deleteCategory);

export default router;
