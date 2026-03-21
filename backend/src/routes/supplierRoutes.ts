import { Router } from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, getSuppliers);
router.get('/:id', verifyToken, getSupplierById);
router.post('/', verifyToken, authorize('admin'), createSupplier);
router.put('/:id', verifyToken, authorize('admin'), updateSupplier);
router.delete('/:id', verifyToken, authorize('admin'), deleteSupplier);

export default router;
