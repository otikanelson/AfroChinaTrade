import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { variantsMatch } from '../utils/variantUtils';

/**
 * Get user's cart
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    let cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'name price images category stock isActive supplierId',
        populate: {
          path: 'supplierId',
          select: 'name email verified rating location responseTime'
        }
      });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Filter out inactive products and update cart
    const activeItems = cart.items.filter(item => 
      item.productId && (item.productId as any).isActive
    );

    if (activeItems.length !== cart.items.length) {
      cart.items = activeItems;
      await cart.save();
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1, selectedVariant } = req.body;

    console.log('Add to cart request:', { userId, productId, quantity, selectedVariant });
    console.log('Database connection state:', mongoose.connection.readyState);

    // Validate required fields
    if (!productId) {
      console.log('Missing productId');
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (!userId) {
      console.log('Missing userId');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log('Invalid productId format:', productId);
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Validate product
    console.log('Looking for product with ID:', productId);
    const product = await Product.findById(productId);
    console.log('Product found:', product ? 'Yes' : 'No');
    console.log('Product details:', product ? { id: product._id, name: product.name, isActive: product.isActive, stock: product.stock } : 'None');
    
    if (!product) {
      console.log('Product not found in database');
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      console.log('Product is not active');
      return res.status(404).json({
        success: false,
        message: 'Product is not active'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      console.log('Stock check failed:', { available: product.stock, requested: quantity });
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Get or create cart
    console.log('Looking for cart for user:', userId);
    let cart = await Cart.findOne({ userId });
    console.log('Cart found:', cart ? 'Yes' : 'No');
    
    if (!cart) {
      console.log('Creating new cart for user:', userId);
      cart = new Cart({ userId, items: [] });
      console.log('New cart created');
    }

    // Check if item already exists in cart with inline variant matching
    const existingItemIndex = cart.items.findIndex(item => {
      const productMatches = item.productId.toString() === productId;
      
      // Inline variant matching with detailed logging
      const itemVariant = item.selectedVariant;
      const targetVariant = selectedVariant;
      
      console.log('=== DETAILED VARIANT ANALYSIS ===');
      console.log('Item variant:', itemVariant);
      console.log('Target variant:', targetVariant);
      console.log('Item variant JSON:', JSON.stringify(itemVariant));
      console.log('Target variant JSON:', JSON.stringify(targetVariant));
      
      // Simple comparison first - if both are exactly the same
      if (itemVariant === targetVariant) {
        console.log('Exact match (===)');
        return productMatches;
      }
      
      // If both are falsy (null, undefined, empty)
      if (!itemVariant && !targetVariant) {
        console.log('Both are falsy');
        return productMatches;
      }
      
      // If one is falsy and the other is an empty object
      if (!itemVariant && targetVariant && typeof targetVariant === 'object' && Object.keys(targetVariant).length === 0) {
        console.log('Item is falsy, target is empty object');
        return productMatches;
      }
      
      if (!targetVariant && itemVariant && typeof itemVariant === 'object' && Object.keys(itemVariant).length === 0) {
        console.log('Target is falsy, item is empty object');
        return productMatches;
      }
      
      // Check if both are objects with only empty values
      if (itemVariant && targetVariant && typeof itemVariant === 'object' && typeof targetVariant === 'object') {
        const itemKeys = Object.keys(itemVariant);
        const targetKeys = Object.keys(targetVariant);
        
        console.log('Item keys:', itemKeys);
        console.log('Target keys:', targetKeys);
        
        // Check if item variant has only empty values
        const itemHasOnlyEmptyValues = itemKeys.every(key => {
          const value = (itemVariant as Record<string, any>)[key];
          const isEmpty = value === null || value === undefined || value === '';
          console.log(`Item ${key}: "${value}" isEmpty: ${isEmpty}`);
          return isEmpty;
        });
        
        // Check if target variant has only empty values  
        const targetHasOnlyEmptyValues = targetKeys.every(key => {
          const value = (targetVariant as Record<string, any>)[key];
          const isEmpty = value === null || value === undefined || value === '';
          console.log(`Target ${key}: "${value}" isEmpty: ${isEmpty}`);
          return isEmpty;
        });
        
        console.log('Item has only empty values:', itemHasOnlyEmptyValues);
        console.log('Target has only empty values:', targetHasOnlyEmptyValues);
        
        // If both have only empty values, they match
        if (itemHasOnlyEmptyValues && targetHasOnlyEmptyValues) {
          console.log('Both have only empty values - MATCH');
          return productMatches;
        }
        
        // If both have the same keys and values
        if (itemKeys.length === targetKeys.length) {
          const allKeysMatch = itemKeys.every(key => (itemVariant as Record<string, any>)[key] === (targetVariant as Record<string, any>)[key]);
          console.log('All keys match:', allKeysMatch);
          if (allKeysMatch) {
            return productMatches;
          }
        }
      }
      
      // Special case: undefined vs empty object with empty values
      if (!targetVariant && itemVariant && typeof itemVariant === 'object') {
        const itemKeys = Object.keys(itemVariant);
        const allEmpty = itemKeys.every(key => {
          const value = (itemVariant as Record<string, any>)[key];
          return value === null || value === undefined || value === '';
        });
        console.log('Target undefined, item has empty values:', allEmpty);
        if (allEmpty) {
          return productMatches;
        }
      }
      
      if (!itemVariant && targetVariant && typeof targetVariant === 'object') {
        const targetKeys = Object.keys(targetVariant);
        const allEmpty = targetKeys.every(key => {
          const value = (targetVariant as Record<string, any>)[key];
          return value === null || value === undefined || value === '';
        });
        console.log('Item undefined, target has empty values:', allEmpty);
        if (allEmpty) {
          return productMatches;
        }
      }
      
      console.log('No match found');
      console.log('=== END VARIANT ANALYSIS ===');
      return false;
    });

    console.log('Existing item index:', existingItemIndex);

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add more items than available stock'
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      console.log('Updated existing item quantity to:', newQuantity);
    } else {
      // Add new item - calculate discounted price if applicable
      let itemPrice = product.price;
      if (product.discount && product.discount > 0) {
        itemPrice = Math.round(product.price * (1 - product.discount / 100));
      }
      
      const newItem = {
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        price: itemPrice,
        selectedVariant,
        addedAt: new Date()
      };
      
      console.log('Adding new item:', newItem);
      cart.items.push(newItem);
      console.log('Added new item to cart');
    }

    console.log('Saving cart...');
    await cart.save();
    console.log('Cart saved successfully');
    
    console.log('Populating cart items...');
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock supplierId',
      populate: {
        path: 'supplierId',
        select: 'name email verified rating location responseTime'
      }
    });
    console.log('Cart populated successfully');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity, selectedVariant } = req.body;

    console.log('Update cart item request:', { userId, productId, quantity, selectedVariant });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item in cart with inline variant matching
    const itemIndex = cart.items.findIndex(item => {
      const productMatches = item.productId.toString() === productId;
      
      // Inline variant matching
      const itemVariant = item.selectedVariant;
      const targetVariant = selectedVariant;
      
      // Normalize variants - treat empty objects, null, undefined as equivalent
      const normalizeVariant = (variant: any) => {
        if (!variant) return null;
        if (typeof variant === 'object') {
          const keys = Object.keys(variant);
          if (keys.length === 0) return null;
          
          // Check if all values are empty/falsy
          const hasNonEmptyValues = keys.some(key => {
            const value = variant[key];
            return value !== null && value !== undefined && value !== '';
          });
          
          if (!hasNonEmptyValues) return null;
        }
        return variant;
      };
      
      const normalizedItem = normalizeVariant(itemVariant);
      const normalizedTarget = normalizeVariant(targetVariant);
      
      let variantMatches = false;
      if (!normalizedItem && !normalizedTarget) {
        variantMatches = true;
      } else if (!normalizedItem || !normalizedTarget) {
        variantMatches = false;
      } else {
        // Both have values, compare properties
        const keys1 = Object.keys(normalizedItem);
        const keys2 = Object.keys(normalizedTarget);
        if (keys1.length !== keys2.length) {
          variantMatches = false;
        } else {
          variantMatches = keys1.every(key => normalizedItem[key] === normalizedTarget[key]);
        }
      }
      
      console.log('Checking item for update:', {
        itemProductId: item.productId.toString(),
        targetProductId: productId,
        productMatches,
        itemVariant: item.selectedVariant,
        targetVariant: selectedVariant,
        variantMatches,
        matches: productMatches && variantMatches
      });
      
      return productMatches && variantMatches;
    });

    console.log('Item index in cart:', itemIndex);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (!product || quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    console.log('Updating quantity from', cart.items[itemIndex].quantity, 'to', quantity);

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock supplierId',
      populate: {
        path: 'supplierId',
        select: 'name email verified rating location responseTime'
      }
    });

    console.log('Cart item updated successfully');

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { selectedVariant } = req.body;

    console.log('Remove from cart request:', { userId, productId, selectedVariant });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    console.log('Cart items before removal:', cart.items.length);

    // Remove item from cart
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => {
      const productMatches = item.productId.toString() === productId;
      
      // Inline variant matching with detailed logging
      const itemVariant = item.selectedVariant;
      const targetVariant = selectedVariant;
      
      console.log('Detailed variant comparison:', {
        itemVariant,
        targetVariant,
        itemVariantType: typeof itemVariant,
        targetVariantType: typeof targetVariant,
        itemVariantKeys: itemVariant ? Object.keys(itemVariant) : null,
        targetVariantKeys: targetVariant ? Object.keys(targetVariant) : null
      });
      
      // Normalize variants - treat empty objects, null, undefined as equivalent
      const normalizeVariant = (variant: any) => {
        if (!variant) return null;
        if (typeof variant === 'object') {
          const keys = Object.keys(variant);
          if (keys.length === 0) return null;
          
          // Check if all values are empty/falsy
          const hasNonEmptyValues = keys.some(key => {
            const value = variant[key];
            return value !== null && value !== undefined && value !== '';
          });
          
          if (!hasNonEmptyValues) return null;
        }
        return variant;
      };
      
      const normalizedItem = normalizeVariant(itemVariant);
      const normalizedTarget = normalizeVariant(targetVariant);
      
      console.log('Normalized variants:', {
        normalizedItem,
        normalizedTarget,
        bothNull: !normalizedItem && !normalizedTarget
      });
      
      let variantMatches = false;
      if (!normalizedItem && !normalizedTarget) {
        variantMatches = true;
      } else if (!normalizedItem || !normalizedTarget) {
        variantMatches = false;
      } else {
        // Both have values, compare properties
        const keys1 = Object.keys(normalizedItem);
        const keys2 = Object.keys(normalizedTarget);
        if (keys1.length !== keys2.length) {
          variantMatches = false;
        } else {
          variantMatches = keys1.every(key => normalizedItem[key] === normalizedTarget[key]);
        }
      }
      
      console.log('Checking item:', {
        itemProductId: item.productId.toString(),
        targetProductId: productId,
        productMatches,
        itemVariant: item.selectedVariant,
        targetVariant: selectedVariant,
        variantMatches,
        shouldKeep: !(productMatches && variantMatches)
      });
      
      return !(productMatches && variantMatches);
    });

    console.log('Cart items after removal:', cart.items.length);
    console.log('Items removed:', originalLength - cart.items.length);

    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name price images category stock supplierId',
      populate: {
        path: 'supplierId',
        select: 'name email verified rating location responseTime'
      }
    });

    console.log('Cart updated successfully');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    console.log('Clear cart request for user:', userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    console.log('Cart items before clearing:', cart.items.length);

    cart.items = [];
    await cart.save();

    console.log('Cart cleared successfully');

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get cart summary (item count and total)
 */
export const getCartSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.json({
        success: true,
        data: {
          totalItems: 0,
          totalAmount: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart summary'
    });
  }
};