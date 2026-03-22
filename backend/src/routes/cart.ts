import express from 'express';
import { verifyToken } from '../middleware/auth';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from '../controllers/cartController';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// GET /api/cart/summary - Get cart summary (count and total)
router.get('/summary', getCartSummary);

// POST /api/cart - Add item to cart
router.post('/', addToCart);

// DELETE /api/cart/clear - Clear entire cart (must come before /:productId)
router.delete('/clear', clearCart);

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', updateCartItem);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', removeFromCart);

export default router;