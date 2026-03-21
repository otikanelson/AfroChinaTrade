import { Router } from 'express';
import {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  handleMulterError,
} from '../controllers/uploadController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Single image upload
router.post('/image', verifyToken, upload.single('image'), handleMulterError, uploadImage);

// Multiple images upload (max 10 files)
router.post('/images', verifyToken, upload.array('images', 10), handleMulterError, uploadMultipleImages);

// Delete image (admin only) - now uses Cloudinary ID instead of filename
router.delete('/image/:cloudinaryId', verifyToken, authorize('admin', 'super_admin'), deleteImage);

// Error handling middleware for multer
router.use(handleMulterError);

export default router;