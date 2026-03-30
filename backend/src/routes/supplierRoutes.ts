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

// Supplier CRUD - Public routes for viewing suppliers
router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', verifyToken, authorize('admin'), createSupplier);
router.put('/:id', verifyToken, authorize('admin'), updateSupplier);
router.delete('/:id', verifyToken, authorize('admin'), deleteSupplier);

// Supplier Reviews
router.post('/:supplierId/reviews', verifyToken, createSupplierReview);
router.get('/:supplierId/reviews', getSupplierReviews);
router.put('/:supplierId/reviews/:reviewId', verifyToken, updateSupplierReview);

export default router;
