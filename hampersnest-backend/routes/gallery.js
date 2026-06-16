import express from 'express';
import { 
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} from '../controllers/galleryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch items
router.get('/', getGalleryItems);

// Protected routes for admin operations
router.post('/', protect, authorizeRoles('Super Admin', 'Manager'), createGalleryItem);
router.put('/:id', protect, authorizeRoles('Super Admin', 'Manager'), updateGalleryItem);
router.delete('/:id', protect, authorizeRoles('Super Admin', 'Manager'), deleteGalleryItem);

export default router;
