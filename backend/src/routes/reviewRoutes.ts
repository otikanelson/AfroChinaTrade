import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getUserReviews,
  getAllReviews,
  addAdminResponse,
  flagReview,
  deleteReview,
} from '../controllers/reviewController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Customer routes
router.post('/', verifyToken, createReview);
router.get('/user', verifyToken, getUserReviews);
router.get('/product/:productId', getProductReviews);

// Admin routes
router.get('/admin/all', verifyToken, authorize('admin'), getAllReviews);
router.post('/:id/response', verifyToken, authorize('admin'), addAdminResponse);
router.patch('/:id/flag', verifyToken, authorize('admin'), flagReview);
router.delete('/:id', verifyToken, authorize('admin'), deleteReview);

export default router;
