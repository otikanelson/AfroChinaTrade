import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from '../controllers/categoryController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/:id/products', getCategoryProducts);
router.get('/:id', getCategoryById);
router.post('/', verifyToken, authorize('admin'), createCategory);
router.put('/:id', verifyToken, authorize('admin'), updateCategory);
router.delete('/:id', verifyToken, authorize('admin'), deleteCategory);

export default router;
