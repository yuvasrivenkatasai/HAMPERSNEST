import express from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { protect, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch testimonials for storefront
router.get('/', getTestimonials);

// Protected routes (requires 'testimonials' permission)
router.post('/', protect, requirePermission('testimonials'), createTestimonial);
router.put('/:id', protect, requirePermission('testimonials'), updateTestimonial);
router.delete('/:id', protect, requirePermission('testimonials'), deleteTestimonial);

export default router;
