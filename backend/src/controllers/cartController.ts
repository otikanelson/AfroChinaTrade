import { Request, Response } from 'express';
import { Cart, Product } from '../models';

/**
 * Get user's cart
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    let cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price images category stock isActive');

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

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId &&
      JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
    );

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
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        price: product.price,
        selectedVariant,
        addedAt: new Date()
      });
    }

    await cart.save();
    await cart.populate('items.productId', 'name price images category stock');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
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

    // Find item in cart
    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId &&
      JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
    );

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

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.productId', 'name price images category stock');

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
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

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(item => 
      !(item.productId.toString() === productId &&
        JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
    );

    await cart.save();
    await cart.populate('items.productId', 'name price images category stock');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
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