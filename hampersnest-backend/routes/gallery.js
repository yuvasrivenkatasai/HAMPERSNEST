import express from 'express';
import { 
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} from '../controllers/galleryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch items
router.get('/', getGalleryItems);

// Protected routes for admin operations
router.post('/', protect, createGalleryItem);
router.put('/:id', protect, updateGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

export default router;
