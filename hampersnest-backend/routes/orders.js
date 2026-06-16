import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus,
  exportOrdersCSV,
  exportOrdersExcel
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route (Customer checkout)
router.post('/', createOrder);

// Protected routes (Admin, Manager, Staff)
router.get('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getOrders);
router.get('/:id', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getOrderById);
router.put('/:id', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), updateOrderStatus);

// Export routes (Admin, Manager only)
router.get('/export/csv', protect, authorizeRoles('Super Admin', 'Manager'), exportOrdersCSV);
router.get('/export/excel', protect, authorizeRoles('Super Admin', 'Manager'), exportOrdersExcel);

export default router;
