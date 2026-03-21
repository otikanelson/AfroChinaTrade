import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  getUserOrders,
  getUserActivity,
  getProfile,
  updateProfile,
  changePassword,
  updateAddress,
  deleteAccount,
} from '../controllers/userController';
import { verifyToken, authorize } from '../middleware/auth';

const router = Router();

// Profile management routes (for authenticated users)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/profile/password', verifyToken, changePassword);
router.put('/profile/addresses', verifyToken, updateAddress);
router.delete('/profile', verifyToken, deleteAccount);

// Admin routes
router.get('/', verifyToken, authorize('admin'), getUsers);
router.get('/:id', verifyToken, authorize('admin'), getUserById);
router.patch('/:id/status', verifyToken, authorize('admin'), updateUserStatus);
router.get('/:id/orders', verifyToken, authorize('admin'), getUserOrders);
router.get('/:id/activity', verifyToken, authorize('admin'), getUserActivity);

export default router;
