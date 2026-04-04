import express from 'express';
import { verifyToken, authorize } from '../middleware/auth';
import {
  getTags,
  getAllTags,
  createTag,
  syncTagUsage,
  deleteTag,
} from '../controllers/tagController';

const router = express.Router();

// Public routes
router.get('/', getTags);

// Admin routes
router.get('/all', verifyToken, authorize('admin'), getAllTags);
router.post('/', verifyToken, authorize('admin'), createTag);
router.post('/sync-usage', verifyToken, authorize('admin'), syncTagUsage);
router.delete('/:id', verifyToken, authorize('admin'), deleteTag);

export default router;
