import { Router } from 'express';
import {
  getProductCollection,
  getTrendingProducts,
  getFeaturedProducts,
  getSellerFavorites
} from '../controllers/productCollectionController';

const router = Router();

// Public routes - all product collections are publicly accessible

// Generic collection endpoint
router.get('/products/collections/:type', getProductCollection);

// Specific collection endpoints for convenience
router.get('/products/trending', getTrendingProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/seller-favorites', getSellerFavorites);

export default router;