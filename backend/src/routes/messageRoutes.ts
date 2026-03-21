import { Router } from 'express';
import {
  createMessage,
  getThreads,
  getThreadMessages,
  markAsRead,
  getUnreadCount,
} from '../controllers/messageController';
import { verifyToken } from '../middleware/auth';
import { validateMessage } from '../middleware/validation';

const router = Router();

// All message routes require authentication
router.use(verifyToken);

// Create a new message in a thread
router.post('/', validateMessage, createMessage);

// Get all message threads for the authenticated user
router.get('/threads', getThreads);

// Get messages in a specific thread
router.get('/threads/:threadId', getThreadMessages);

// Mark a message as read
router.patch('/:id/read', markAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

export default router;
