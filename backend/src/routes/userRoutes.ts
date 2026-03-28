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
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/userController';
import { verifyToken, authorize, AuthRequest } from '../middleware/auth';
import { checkUserStatus } from '../middleware/userStatus';

const router = Router();

// Wrapper to handle AuthRequest type
const asyncHandler = (fn: (req: AuthRequest, res: Response) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthRequest, res).catch(next);

// Profile management routes (for authenticated users) - apply user status check
router.get('/profile', verifyToken, checkUserStatus, asyncHandler(getProfile));
router.put('/profile', verifyToken, checkUserStatus, asyncHandler(updateProfile));
router.put('/profile/password', verifyToken, checkUserStatus, asyncHandler(changePassword));
router.put('/profile/addresses', verifyToken, checkUserStatus, asyncHandler(updateAddress));
router.delete('/profile', verifyToken, checkUserStatus, asyncHandler(deleteAccount));

// Notification settings routes
router.get('/notification-settings', verifyToken, checkUserStatus, asyncHandler(getNotificationSettings));
router.put('/notification-settings', verifyToken, checkUserStatus, asyncHandler(updateNotificationSettings));

// Admin routes - no user status check needed for admins managing other users
router.get('/', verifyToken, authorize('admin'), asyncHandler(getUsers));
router.get('/:id', verifyToken, authorize('admin'), asyncHandler(getUserById));
router.patch('/:id/status', verifyToken, authorize('admin'), asyncHandler(updateUserStatus));
router.get('/:id/orders', verifyToken, authorize('admin'), asyncHandler(getUserOrders));
router.get('/:id/activity', verifyToken, authorize('admin'), asyncHandler(getUserActivity));

export default router;
