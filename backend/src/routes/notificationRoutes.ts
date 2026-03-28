import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notificationController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.patch('/:id/read', verifyToken, markAsRead);
router.patch('/mark-all-read', verifyToken, markAllAsRead);

export default router;