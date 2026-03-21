import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateTrackingNumber,
  cancelOrder,
} from '../controllers/orderController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Customer and admin routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.delete('/:id', cancelOrder);

// Admin only routes
router.patch('/:id/status', authorize('admin', 'super_admin'), updateOrderStatus);
router.patch('/:id/tracking', authorize('admin', 'super_admin'), updateTrackingNumber);

export default router;
