import { Router } from 'express';
import {
  getRevenue,
  getOrderStats,
  getProductStats,
  getMostSoldProducts,
} from '../controllers/analyticsController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/revenue', verifyToken, authorize('admin'), getRevenue);
router.get('/orders', verifyToken, authorize('admin'), getOrderStats);
router.get('/products', verifyToken, authorize('admin'), getProductStats);
router.get('/most-sold-products', getMostSoldProducts); // Public endpoint for buy-now page

export default router;
