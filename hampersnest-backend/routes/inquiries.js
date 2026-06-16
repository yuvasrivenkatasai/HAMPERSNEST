import express from 'express';
import { 
  createInquiry, 
  getInquiries, 
  updateInquiryStatus,
  deleteInquiry,
  exportInquiriesCSV
} from '../controllers/inquiryController.js';
import { exportInquiriesExcel } from '../controllers/exportImportController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route (Customer submit)
router.post('/', createInquiry);

// Protected routes (Admin, Manager, Staff)
router.get('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getInquiries);
router.put('/:id', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), updateInquiryStatus);

// Export/Delete routes (Admin, Manager only)
router.get('/export/csv', protect, authorizeRoles('Super Admin', 'Manager'), exportInquiriesCSV);
router.get('/export/excel', protect, authorizeRoles('Super Admin', 'Manager'), exportInquiriesExcel);
router.delete('/:id', protect, authorizeRoles('Super Admin', 'Manager'), deleteInquiry);

export default router;
