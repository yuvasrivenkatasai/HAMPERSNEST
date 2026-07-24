import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  bulkCreateProducts,
  updateProduct, 
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProducts,
  duplicateProduct,
  incrementProductViews, 
  incrementProductClicks,
  bulkWatermarkProducts,
  regenerateWatermark,
  bulkUpdateVariants
} from '../controllers/productController.js';
import { protect, requirePermission } from '../middleware/auth.js';

import multer from 'multer';
import { 
  exportProductsCsv, 
  exportProductsExcel, 
  downloadProductsCsvTemplate, 
  importProductsCsv,
  exportProductImagesZip,
  importProductImagesZipPreview,
  importProductImagesZipCommit
} from '../controllers/exportImportController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Export/Import routes (requires 'products' permission)
router.get('/export/csv', protect, requirePermission('products'), exportProductsCsv);
router.get('/export/excel', protect, requirePermission('products'), exportProductsExcel);
router.get('/export/images-zip', protect, requirePermission('products'), exportProductImagesZip);
router.get('/template/csv', protect, requirePermission('products'), downloadProductsCsvTemplate);
router.post('/import/csv', protect, requirePermission('products'), upload.single('file'), importProductsCsv);
router.post('/import/images-zip/preview', protect, requirePermission('products'), upload.single('file'), importProductImagesZipPreview);
router.post('/import/images-zip/commit', protect, requirePermission('products'), importProductImagesZipCommit);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/view', incrementProductViews);
router.post('/:id/click', incrementProductClicks);

// Protected routes (requires 'products' permission)
router.post('/', protect, requirePermission('products'), createProduct);
router.post('/bulk', protect, requirePermission('products'), bulkCreateProducts);
router.post('/bulk-update', protect, requirePermission('products'), bulkUpdateProducts);
router.post('/bulk-variants', protect, requirePermission('products'), bulkUpdateVariants);
router.post('/bulk-watermark', protect, requirePermission('products'), bulkWatermarkProducts);
router.post('/:id/duplicate', protect, requirePermission('products'), duplicateProduct);
router.post('/:id/watermark', protect, requirePermission('products'), regenerateWatermark);
router.put('/:id', protect, requirePermission('products'), updateProduct);

// Protected routes (requires 'products' permission for delete too)
router.post('/bulk-delete', protect, requirePermission('products'), bulkDeleteProducts);
router.delete('/:id', protect, requirePermission('products'), deleteProduct);

export default router;
