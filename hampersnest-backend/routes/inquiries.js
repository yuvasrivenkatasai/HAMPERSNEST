import express from 'express';
import { 
  createInquiry, 
  getInquiries, 
  updateInquiryStatus,
  deleteInquiry,
  exportInquiriesCSV
} from '../controllers/inquiryController.js';
import { exportInquiriesExcel } from '../controllers/exportImportController.js';
import { protect, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Public route (Customer submit)
router.post('/', createInquiry);

// Protected routes (requires 'inquiries' permission)
router.get('/', protect, requirePermission('inquiries'), getInquiries);
router.put('/:id', protect, requirePermission('inquiries'), updateInquiryStatus);

// Export/Delete routes (requires 'inquiries' permission)
router.get('/export/csv', protect, requirePermission('inquiries'), exportInquiriesCSV);
router.get('/export/excel', protect, requirePermission('inquiries'), exportInquiriesExcel);
router.delete('/:id', protect, requirePermission('inquiries'), deleteInquiry);

export default router;
