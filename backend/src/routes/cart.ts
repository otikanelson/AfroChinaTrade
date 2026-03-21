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

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', updateCartItem);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', removeFromCart);

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', clearCart);

export default router;