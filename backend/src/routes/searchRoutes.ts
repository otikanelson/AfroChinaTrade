import { Router } from 'express';
import {
  searchProducts,
  searchOrders,
} from '../controllers/searchController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/products', searchProducts);
router.get('/orders', verifyToken, authorize('admin'), searchOrders);

export default router;
