import { Request, Response } from 'express';
import { Wishlist, Product } from '../models';

/**
 * Get user's wishlist
 */
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    const wishlist = await Wishlist.find({ userId })
      .populate({
        path: 'productId',
        select: 'name price images category stock isActive supplierId discount viewCount reviewCount',
        populate: {
          path: 'supplierId',
          select: 'name email verified rating location responseTime'
        }
      })
      .sort({ addedAt: -1 });

    // Filter out products that are no longer active
    const activeWishlist = wishlist.filter(item => 
      item.productId && (item.productId as any).isActive
    );

    res.json({
      success: true,
      data: activeWishlist,
      count: activeWishlist.length
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      userId,
      productId
    });

    await wishlistItem.save();
    await wishlistItem.populate({
      path: 'productId',
      select: 'name price images category supplierId discount viewCount reviewCount stock',
      populate: {
        path: 'supplierId',
        select: 'name email verified rating location responseTime'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    });
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const result = await Wishlist.findOneAndDelete({ userId, productId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    });
  }
};

/**
 * Check if product is in wishlist
 */
export const checkWishlistStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOne({ userId, productId });

    res.json({
      success: true,
      isInWishlist: !!wishlistItem
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status'
    });
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await Wishlist.deleteMany({ userId });

    res.json({
      success: true,
      message: `Removed ${result.deletedCount} items from wishlist`
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist'
    });
  }
};