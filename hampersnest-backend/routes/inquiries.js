import express from 'express';
import { 
  createInquiry, 
  getInquiries, 
  deleteInquiry 
} from '../controllers/inquiryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route (Customer submit)
router.post('/', createInquiry);

// Protected routes (Admin only)
router.get('/', protect, getInquiries);
router.delete('/:id', protect, deleteInquiry);

export default router;
