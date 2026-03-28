import { Router } from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  createSupplierReview,
  getSupplierReviews,
  updateSupplierReview,
} from '../controllers/supplierController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Supplier CRUD
router.get('/', verifyToken, getSuppliers);
router.get('/:id', verifyToken, getSupplierById);
router.post('/', verifyToken, authorize('admin'), createSupplier);
router.put('/:id', verifyToken, authorize('admin'), updateSupplier);
router.delete('/:id', verifyToken, authorize('admin'), deleteSupplier);

// Supplier Reviews
router.post('/:supplierId/reviews', verifyToken, createSupplierReview);
router.get('/:supplierId/reviews', verifyToken, getSupplierReviews);
router.put('/:supplierId/reviews/:reviewId', verifyToken, updateSupplierReview);

export default router;
