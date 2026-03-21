import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getAdminProducts,
  toggleProductStatus,
} from '../controllers/productController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

// Admin routes
router.get('/admin/all', verifyToken, authorize('admin', 'super_admin'), getAdminProducts);
router.patch('/:id/status', verifyToken, authorize('admin', 'super_admin'), toggleProductStatus);
router.post('/', verifyToken, authorize('admin', 'super_admin'), createProduct);
router.put('/:id', verifyToken, authorize('admin', 'super_admin'), updateProduct);
router.delete('/:id', verifyToken, authorize('admin', 'super_admin'), deleteProduct);

export default router;
