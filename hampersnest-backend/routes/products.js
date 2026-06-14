import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProducts,
  duplicateProduct,
  incrementProductViews, 
  incrementProductClicks 
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

import multer from 'multer';
import { 
  exportProductsCsv, 
  exportProductsExcel, 
  downloadProductsCsvTemplate, 
  importProductsCsv 
} from '../controllers/exportImportController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Export/Import routes (Admin/Manager only)
router.get('/export/csv', protect, authorizeRoles('Super Admin', 'Manager'), exportProductsCsv);
router.get('/export/excel', protect, authorizeRoles('Super Admin', 'Manager'), exportProductsExcel);
router.get('/template/csv', protect, authorizeRoles('Super Admin', 'Manager'), downloadProductsCsvTemplate);
router.post('/import/csv', protect, authorizeRoles('Super Admin', 'Manager'), upload.single('file'), importProductsCsv);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/view', incrementProductViews);
router.post('/:id/click', incrementProductClicks);

// Protected routes (Admin/Manager)
router.post('/', protect, authorizeRoles('Super Admin', 'Manager'), createProduct);
router.post('/bulk-update', protect, authorizeRoles('Super Admin', 'Manager'), bulkUpdateProducts);
router.post('/:id/duplicate', protect, authorizeRoles('Super Admin', 'Manager'), duplicateProduct);
router.put('/:id', protect, authorizeRoles('Super Admin', 'Manager'), updateProduct);

// Protected routes (Super Admin only for Delete)
router.post('/bulk-delete', protect, authorizeRoles('Super Admin'), bulkDeleteProducts);
router.delete('/:id', protect, authorizeRoles('Super Admin'), deleteProduct);

export default router;
