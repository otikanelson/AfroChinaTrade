import { Router } from 'express';
import {
  createRefund,
  getRefunds,
  getRefundById,
  updateRefundStatus,
  getUserRefunds,
  createRefundRequest,
  getRefundStats,
} from '../controllers/refundController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Admin routes
router.post('/', verifyToken, authorize('admin'), createRefund);
router.get('/', verifyToken, authorize('admin'), getRefunds);
router.get('/stats', verifyToken, authorize('admin'), getRefundStats);
router.get('/:id', verifyToken, authorize('admin'), getRefundById);
router.patch('/:id/status', verifyToken, authorize('admin'), updateRefundStatus);

// Customer routes
router.get('/user/my-refunds', verifyToken, getUserRefunds);
router.post('/request', verifyToken, createRefundRequest);

export default router;
