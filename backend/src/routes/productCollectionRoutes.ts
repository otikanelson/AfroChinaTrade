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
router.get('/collections/:type', getProductCollection);

// Specific collection endpoints for convenience
router.get('/trending', getTrendingProducts);
router.get('/featured-collection', getFeaturedProducts);
router.get('/seller-favorites', getSellerFavorites);

export default router;