import express from 'express';
import { verifyToken } from '../middleware/auth';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  clearWishlist
} from '../controllers/wishlistController';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/wishlist - Get user's wishlist
router.get('/', getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post('/', addToWishlist);

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', checkWishlistStatus);

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// DELETE /api/wishlist/clear - Clear entire wishlist
router.delete('/clear', clearWishlist);

export default router;