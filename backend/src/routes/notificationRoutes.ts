import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  registerPushToken,
  removePushToken,
  broadcastNotification,
} from '../controllers/notificationController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.patch('/:id/read', verifyToken, markAsRead);
router.patch('/mark-all-read', verifyToken, markAllAsRead);

// Push token management routes
router.post('/push-tokens', verifyToken, registerPushToken);
router.delete('/push-tokens', verifyToken, removePushToken);

// Admin broadcast route (auth + admin check handled in controller)
router.post('/broadcast', verifyToken, broadcastNotification);

export default router;