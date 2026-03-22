import { Router } from 'express';
import {
  getUserRecommendations,
  getUserBrowsingHistory,
  addBrowsingHistoryEntry,
  getUserRecommendationStats
} from '../controllers/recommendationController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Public route - get user recommendations (can be used by authenticated users)
router.get('/products/recommendations/:userId', getUserRecommendations);

// Authenticated routes - browsing history management
router.get('/users/:userId/browsing-history', verifyToken, getUserBrowsingHistory);
router.post('/users/:userId/browsing-history', verifyToken, addBrowsingHistoryEntry);

// Admin route - get user recommendation statistics
router.get('/users/:userId/recommendation-stats', verifyToken, authorize('admin', 'super_admin'), getUserRecommendationStats);

export default router;