import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateTrackingNumber,
  cancelOrder,
  confirmDelivery,
  checkout,
} from '../controllers/orderController';
import { verifyToken, authorize, AuthRequest } from '../middleware/auth';
import { checkUserStatus, allowSuspendedUsers } from '../middleware/userStatus';

const router = Router();

// Customer routes - suspended users cannot place orders but can view them
router.post('/', verifyToken, checkUserStatus, createOrder);
router.post('/checkout', verifyToken, checkUserStatus, checkout);
router.get('/', verifyToken, allowSuspendedUsers, getOrders); // Allow suspended users to view orders
router.get('/:id', verifyToken, allowSuspendedUsers, getOrderById); // Allow suspended users to view order details
router.delete('/:id', verifyToken, checkUserStatus, cancelOrder); // Suspended users cannot cancel orders
router.patch('/:id/confirm-delivery', verifyToken, checkUserStatus, confirmDelivery);

// Admin only routes - no user status check needed
router.patch('/:id/status', verifyToken, authorize('admin', 'super_admin'), updateOrderStatus);
router.patch('/:id/tracking', verifyToken, authorize('admin', 'super_admin'), updateTrackingNumber);

export default router;
