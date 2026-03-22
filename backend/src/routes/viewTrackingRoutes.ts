import { Router } from 'express';
import {
  trackProductView,
  getProductAnalytics,
  recordInteraction
} from '../controllers/viewTrackingController';
import { verifyToken, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public route with optional auth - track product view (works for both authenticated and anonymous users)
router.post('/products/:productId/view', optionalAuth, trackProductView);

// Authenticated route - record user interactions
router.post('/products/:productId/interaction', verifyToken, recordInteraction);

// Admin route - get product analytics
router.get('/products/:productId/analytics', verifyToken, authorize('admin', 'super_admin'), getProductAnalytics);

export default router;