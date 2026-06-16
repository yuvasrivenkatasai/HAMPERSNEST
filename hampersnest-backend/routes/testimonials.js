import express from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route to fetch testimonials for storefront
router.get('/', getTestimonials);

// Protected routes to manage testimonials (Admin dashboard)
router.post('/', protect, authorizeRoles('Super Admin', 'Manager'), createTestimonial);
router.put('/:id', protect, authorizeRoles('Super Admin', 'Manager'), updateTestimonial);
router.delete('/:id', protect, authorizeRoles('Super Admin'), deleteTestimonial);

export default router;
