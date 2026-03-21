import { Router } from 'express';
import {
  createRefund,
  getRefunds,
  getRefundById,
  updateRefundStatus,
} from '../controllers/refundController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.post('/', verifyToken, authorize('admin'), createRefund);
router.get('/', verifyToken, authorize('admin'), getRefunds);
router.get('/:id', verifyToken, authorize('admin'), getRefundById);
router.patch('/:id/status', verifyToken, authorize('admin'), updateRefundStatus);

export default router;
