import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/authController';
import { verifyToken } from '../middleware/auth';
import { authRateLimit, loginRateLimit } from '../middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting (temporarily disabled for development)
router.post('/register', /* authRateLimit, */ register);
router.post('/login', /* loginRateLimit, */ login);
router.post('/forgot-password', /* authRateLimit, */ forgotPassword);
router.post('/reset-password', /* authRateLimit, */ resetPassword);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateProfile);
router.post('/refresh', refreshToken); // No verifyToken middleware needed
router.post('/logout', verifyToken, logout);

export default router;
