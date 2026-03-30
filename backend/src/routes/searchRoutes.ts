import { Router } from 'express';
import {
  searchProducts,
  searchOrders,
  searchByImage,
  uploadImageSearch,
} from '../controllers/searchController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/products', searchProducts);
router.get('/orders', verifyToken, authorize('admin'), searchOrders);
router.post('/image', uploadImageSearch, searchByImage);

export default router;
