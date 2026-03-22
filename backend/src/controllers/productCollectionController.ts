import { Request, Response } from 'express';
import { productCollectionService } from '../services/ProductCollectionService';

/**
 * Get products by collection type
 * GET /api/products/collections/:type
 */
export const getProductCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      category, 
      minPrice, 
      maxPrice, 
      minRating, 
      search, 
      tags, 
      sortBy = 'newest',
      timeframe = '24h' // For trending collections
    } = req.query;

    // Validate collection type
    const validTypes = ['featured', 'all', 'seller_favorites', 'trending'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid collection type. Valid types: featured, all, seller_favorites, trending',
        errorCode: 'INVALID_COLLECTION_TYPE'
      });
      return;
    }

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));

    // Build filters
    const filters: any = {};
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (minRating) filters.minRating = parseFloat(minRating as string);
    if (search) filters.search = search;
    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags];
    }

    let result;

    // Route to appropriate service method based on collection type
    switch (type) {
      case 'featured':
        result = await productCollectionService.getFeaturedProducts(pageNum, limitNum, filters);
        break;
      case 'seller_favorites':
        result = await productCollectionService.getSellerFavorites(pageNum, limitNum, filters);
        break;
      case 'trending':
        result = await productCollectionService.getTrendingProducts(
          timeframe as string, 
          limitNum, 
          filters
        );
        break;
      case 'all':
      default:
        result = await productCollectionService.getAllProducts(
          pageNum, 
          limitNum, 
          filters, 
          sortBy as string
        );
        break;
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Error getting product collection:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get product collection',
      errorCode: 'COLLECTION_FETCH_FAILED'
    });
  }
};

/**
 * Get trending products with specific timeframe
 * GET /api/products/trending
 */
export const getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      timeframe = '24h', 
      limit = 20, 
      category,
      minPrice,
      maxPrice,
      minRating
    } = req.query;

    // Validate timeframe
    const validTimeframes = ['1h', '24h', '7d', '30d'];
    if (!validTimeframes.includes(timeframe as string)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid timeframe. Valid values: 1h, 24h, 7d, 30d',
        errorCode: 'INVALID_TIMEFRAME'
      });
      return;
    }

    // Validate limit
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));

    // Build filters
    const filters: any = {};
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (minRating) filters.minRating = parseFloat(minRating as string);

    const result = await productCollectionService.getTrendingProducts(
      timeframe as string,
      limitNum,
      filters
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('Error getting trending products:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get trending products',
      errorCode: 'TRENDING_FETCH_FAILED'
    });
  }
};

/**
 * Get featured products
 * GET /api/products/featured
 */
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category,
      minPrice,
      maxPrice,
      minRating
    } = req.query;

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));

    // Build filters
    const filters: any = {};
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (minRating) filters.minRating = parseFloat(minRating as string);

    const result = await productCollectionService.getFeaturedProducts(pageNum, limitNum, filters);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error getting featured products:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get featured products',
      errorCode: 'FEATURED_FETCH_FAILED'
    });
  }
};

/**
 * Get seller favorite products
 * GET /api/products/seller-favorites
 */
export const getSellerFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category,
      minPrice,
      maxPrice,
      minRating
    } = req.query;

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));

    // Build filters
    const filters: any = {};
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (minRating) filters.minRating = parseFloat(minRating as string);

    const result = await productCollectionService.getSellerFavorites(pageNum, limitNum, filters);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error getting seller favorites:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get seller favorites',
      errorCode: 'SELLER_FAVORITES_FETCH_FAILED'
    });
  }
};