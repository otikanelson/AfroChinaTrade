import express from 'express';
import { verifyToken, authorize } from '../middleware/auth';
import {
  createCollection,
  getCollections,
  getCollectionProducts,
  updateCollection,
  deleteCollection,
  toggleCollectionStatus
} from '../controllers/collectionController';

const router = express.Router();

// Public routes
router.get('/', getCollections);
router.get('/:id/products', getCollectionProducts);

// Admin routes
router.post('/', verifyToken, authorize('admin'), createCollection);
router.put('/:id', verifyToken, authorize('admin'), updateCollection);
router.delete('/:id', verifyToken, authorize('admin'), deleteCollection);
router.patch('/:id/status', verifyToken, authorize('admin'), toggleCollectionStatus);

export default router;