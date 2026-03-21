import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  addAdminResponse,
  deleteReview,
} from '../controllers/reviewController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.post('/', verifyToken, createReview);
router.get('/product/:productId', getProductReviews);
router.post('/:id/response', verifyToken, authorize('admin'), addAdminResponse);
router.delete('/:id', verifyToken, authorize('admin'), deleteReview);

export default router;
