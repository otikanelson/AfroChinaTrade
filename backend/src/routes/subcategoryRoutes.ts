import express from 'express';
import { Request, Response } from 'express';
import { 
  getSubcategories, 
  getSubcategoryById,
  createSubcategory, 
  updateSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategory
} from '../controllers/subcategoryController';
import { verifyToken, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getSubcategories);
router.get('/category/:categoryName', getSubcategoriesByCategory);
router.get('/:id', getSubcategoryById);

// Admin routes
router.post('/', verifyToken, authorize('admin'), createSubcategory);
router.put('/:id', verifyToken, authorize('admin'), updateSubcategory);
router.delete('/:id', verifyToken, authorize('admin'), deleteSubcategory);

// Simple test route
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Subcategory routes working',
    data: []
  });
});

export default router;