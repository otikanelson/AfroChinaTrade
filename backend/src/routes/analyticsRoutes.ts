import { Router } from 'express';
import {
  getRevenue,
  getOrderStats,
  getProductStats,
} from '../controllers/analyticsController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/revenue', verifyToken, authorize('admin'), getRevenue);
router.get('/orders', verifyToken, authorize('admin'), getOrderStats);
router.get('/products', verifyToken, authorize('admin'), getProductStats);

export default router;
