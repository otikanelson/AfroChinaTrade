import express from 'express';
import { verifyToken } from '../middleware/auth';
import { checkUserStatus, allowSuspendedUsers } from '../middleware/userStatus';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from '../controllers/cartController';

const router = express.Router();

// GET /api/cart - Get user's cart (allow suspended users to view)
router.get('/', verifyToken, allowSuspendedUsers, getCart);

// GET /api/cart/summary - Get cart summary (allow suspended users to view)
router.get('/summary', verifyToken, allowSuspendedUsers, getCartSummary);

// POST /api/cart - Add item to cart (suspended users cannot modify cart)
router.post('/', verifyToken, checkUserStatus, addToCart);

// DELETE /api/cart/clear - Clear entire cart (suspended users cannot modify cart)
router.delete('/clear', verifyToken, checkUserStatus, clearCart);

// PUT /api/cart/:productId - Update cart item quantity (suspended users cannot modify cart)
router.put('/:productId', verifyToken, checkUserStatus, updateCartItem);

// DELETE /api/cart/:productId - Remove item from cart (suspended users cannot modify cart)
router.delete('/:productId', verifyToken, checkUserStatus, removeFromCart);

export default router;