import { Router, Request, Response, NextFunction } from 'express';
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
import { verifyToken, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Wrapper to handle AuthRequest type
const asyncHandler = (fn: (req: AuthRequest, res: Response) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthRequest, res).catch(next);

// Profile management routes (for authenticated users)
router.get('/profile', verifyToken, asyncHandler(getProfile));
router.put('/profile', verifyToken, asyncHandler(updateProfile));
router.put('/profile/password', verifyToken, asyncHandler(changePassword));
router.put('/profile/addresses', verifyToken, asyncHandler(updateAddress));
router.delete('/profile', verifyToken, asyncHandler(deleteAccount));

// Admin routes
router.get('/', verifyToken, authorize('admin'), asyncHandler(getUsers));
router.get('/:id', verifyToken, authorize('admin'), asyncHandler(getUserById));
router.patch('/:id/status', verifyToken, authorize('admin'), asyncHandler(updateUserStatus));
router.get('/:id/orders', verifyToken, authorize('admin'), asyncHandler(getUserOrders));
router.get('/:id/activity', verifyToken, authorize('admin'), asyncHandler(getUserActivity));

export default router;
