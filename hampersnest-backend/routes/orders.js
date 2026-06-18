import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrder,
  deleteOrder,
  exportOrdersCSV,
  exportOrdersExcel
} from '../controllers/orderController.js';
import { protect, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Public route (Customer checkout)
router.post('/', createOrder);

// Protected routes (requires 'orders' permission)
router.get('/', protect, requirePermission('orders'), getOrders);
router.get('/:id', protect, requirePermission('orders'), getOrderById);
router.put('/:id', protect, requirePermission('orders'), updateOrder);
router.delete('/:id', protect, requirePermission('orders'), deleteOrder);

// Export routes (requires 'orders' permission)
router.get('/export/csv', protect, requirePermission('orders'), exportOrdersCSV);
router.get('/export/excel', protect, requirePermission('orders'), exportOrdersExcel);

export default router;
