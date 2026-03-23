import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import DeliveryAddress from '../models/DeliveryAddress';

// Create new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, deliveryAddress, paymentMethod, notes } = req.body;

    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Order must contain at least one item',
        errorCode: 'MISSING_ITEMS',
      });
      return;
    }

    if (!deliveryAddress || !paymentMethod) {
      res.status(400).json({
        status: 'error',
        message: 'Delivery address and payment method are required',
        errorCode: 'MISSING_FIELDS',
      });
      return;
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        res.status(400).json({
          status: 'error',
          message: `Product ${item.productId} not found`,
          errorCode: 'PRODUCT_NOT_FOUND',
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          status: 'error',
          message: `Insufficient stock for product ${product.name}`,
          errorCode: 'INSUFFICIENT_STOCK',
        });
        return;
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg',
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.userId,
      items: validatedItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      notes,
    });

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'CREATE_ORDER_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to create order',
        errorCode: 'CREATE_ORDER_FAILED',
      });
    }
  }
};

// Get orders with role-based filtering
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    // Role-based filtering: customers see only their orders
    if (req.userRole === 'customer') {
      filter.userId = req.userId;
    } else if (customerId) {
      // Admins can filter by customer
      filter.userId = customerId;
    }

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_ORDERS_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get orders',
        errorCode: 'GET_ORDERS_FAILED',
      });
    }
  }
};

// Get single order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('userId', 'name email phone');

    if (!order) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });
      return;
    }

    // Check authorization: customers can only view their own orders
    if (req.userRole === 'customer' && order.userId._id.toString() !== req.userId) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'GET_ORDER_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get order',
        errorCode: 'GET_ORDER_FAILED',
      });
    }
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        status: 'error',
        message: 'Status is required',
        errorCode: 'MISSING_STATUS',
      });
      return;
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid status value',
        errorCode: 'INVALID_STATUS',
      });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });
      return;
    }

    // Prevent modification of delivered or cancelled orders
    if (order.status === 'delivered' || order.status === 'cancelled') {
      res.status(400).json({
        status: 'error',
        message: `Cannot modify ${order.status} orders`,
        errorCode: 'ORDER_IMMUTABLE',
      });
      return;
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
    };

    if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
      res.status(400).json({
        status: 'error',
        message: `Cannot transition from ${order.status} to ${status}`,
        errorCode: 'INVALID_TRANSITION',
      });
      return;
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'UPDATE_STATUS_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update order status',
        errorCode: 'UPDATE_STATUS_FAILED',
      });
    }
  }
};

// Update tracking number (admin only)
export const updateTrackingNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      res.status(400).json({
        status: 'error',
        message: 'Tracking number is required',
        errorCode: 'MISSING_TRACKING',
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { trackingNumber },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Tracking number updated successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'UPDATE_TRACKING_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update tracking number',
        errorCode: 'UPDATE_TRACKING_FAILED',
      });
    }
  }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });
      return;
    }

    // Check authorization: customers can only cancel their own orders
    if (req.userRole === 'customer' && order.userId.toString() !== req.userId) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    // Can only cancel pending or processing orders
    if (order.status !== 'pending' && order.status !== 'processing') {
      res.status(400).json({
        status: 'error',
        message: `Cannot cancel ${order.status} orders`,
        errorCode: 'CANNOT_CANCEL',
      });
      return;
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'CANCEL_ORDER_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to cancel order',
        errorCode: 'CANCEL_ORDER_FAILED',
      });
    }
  }
};

// Checkout endpoint - validates and creates order from cart
export const checkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, deliveryAddressId, paymentMethodId } = req.body;

    if (!req.userId) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Order must contain at least one item',
        errorCode: 'MISSING_ITEMS',
      });
      return;
    }

    if (!deliveryAddressId || !paymentMethodId) {
      res.status(400).json({
        status: 'error',
        message: 'Delivery address and payment method are required',
        errorCode: 'MISSING_FIELDS',
      });
      return;
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        res.status(400).json({
          status: 'error',
          message: `Product ${item.productId} not found`,
          errorCode: 'PRODUCT_NOT_FOUND',
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          status: 'error',
          message: `Insufficient stock for product ${product.name}`,
          errorCode: 'INSUFFICIENT_STOCK',
        });
        return;
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images && product.images.length > 0 ? product.images[0] : 'placeholder.jpg',
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
    }

    // Fetch delivery address and payment method
    const deliveryAddress = await DeliveryAddress.findOne({
      _id: deliveryAddressId,
      userId: req.userId,
      isActive: true
    });

    if (!deliveryAddress) {
      res.status(404).json({
        status: 'error',
        message: 'Delivery address not found',
        errorCode: 'ADDRESS_NOT_FOUND',
      });
      return;
    }

    // Create order with full address object
    const order = await Order.create({
      userId: req.userId,
      items: validatedItems,
      totalAmount,
      deliveryAddress: {
        street: deliveryAddress.addressLine1,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        country: deliveryAddress.country || 'Nigeria',
        postalCode: deliveryAddress.postalCode || '',
      },
      paymentMethod: paymentMethodId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
        errorCode: 'CHECKOUT_FAILED',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to process checkout',
        errorCode: 'CHECKOUT_FAILED',
      });
    }
  }
};
