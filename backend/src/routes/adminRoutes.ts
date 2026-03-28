import { Router } from 'express';
import { syncProductReviews, getReviewStats } from '../controllers/adminController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Admin-only routes for system maintenance
router.post('/sync-reviews', verifyToken, authorize('admin'), syncProductReviews);
router.get('/review-stats', verifyToken, authorize('admin'), getReviewStats);

export default router;