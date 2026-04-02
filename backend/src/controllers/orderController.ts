import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import DeliveryAddress from '../models/DeliveryAddress';
import PushDeliveryService from '../services/PushDeliveryService';
import User from '../models/User';

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

    // Send admin alert push notification (fire-and-forget)
    (async () => {
      try {
        const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin'] } }, { _id: 1 });
        const adminUserIds = adminUsers.map(u => u._id.toString());
        
        if (adminUserIds.length > 0) {
          await PushDeliveryService.send({
            userIds: adminUserIds,
            title: 'New Order Placed',
            body: `Order #${order._id.toString().slice(-8)} - ₦${totalAmount.toFixed(2)}`,
            data: { screen: 'admin-order', orderId: order._id.toString() },
          });
        }
      } catch (error) {
        console.error('[orderController] Error sending admin alert push:', error);
      }
    })();

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
    };

    // Only customers can mark as delivered — block it here (admin route)
    if (status === 'delivered') {
      res.status(403).json({
        status: 'error',
        message: 'Only the customer can confirm delivery',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

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

    // Send customer push notification (fire-and-forget)
    (async () => {
      try {
        const statusMessages: { [key: string]: string } = {
          pending: 'is pending',
          processing: 'is being processed',
          shipped: 'has been shipped',
          delivered: 'has been delivered',
          cancelled: 'has been cancelled',
        };

        await PushDeliveryService.send({
          userIds: [order.userId.toString()],
          title: 'Order Status Update',
          body: `Order #${order._id.toString().slice(-8)} ${statusMessages[status] || status}`,
          data: { screen: 'order-detail', orderId: order._id.toString() },
          settingKey: 'orderUpdates',
        });
      } catch (error) {
        console.error('[orderController] Error sending order status push:', error);
      }
    })();

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

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND',
      });
      return;
    }

    if (order.status !== 'processing') {
      res.status(400).json({
        status: 'error',
        message: `Cannot add tracking number to an order with status "${order.status}". Order must be in processing state.`,
        errorCode: 'INVALID_ORDER_STATUS',
      });
      return;
    }

    order.trackingNumber = trackingNumber;
    order.status = 'shipped';
    await order.save();

    // Send customer push notification (fire-and-forget)
    (async () => {
      try {
        await PushDeliveryService.send({
          userIds: [order.userId.toString()],
          title: 'Order Status Update',
          body: `Order #${order._id.toString().slice(-8)} has been shipped`,
          data: { screen: 'order-detail', orderId: order._id.toString() },
          settingKey: 'orderUpdates',
        });
      } catch (error) {
        console.error('[orderController] Error sending order shipped push:', error);
      }
    })();

    res.status(200).json({
      status: 'success',
      message: 'Order marked as shipped',
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

    // Send customer push notification (fire-and-forget)
    (async () => {
      try {
        await PushDeliveryService.send({
          userIds: [order.userId.toString()],
          title: 'Order Status Update',
          body: `Order #${order._id.toString().slice(-8)} has been cancelled`,
          data: { screen: 'order-detail', orderId: order._id.toString() },
          settingKey: 'orderUpdates',
        });
      } catch (error) {
        console.error('[orderController] Error sending order cancelled push:', error);
      }
    })();

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

// Confirm delivery (customer only)
export const confirmDelivery = async (req: Request, res: Response): Promise<void> => {
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

    // Only the order owner can confirm delivery
    if (order.userId.toString() !== req.userId) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    if (order.status !== 'shipped') {
      res.status(400).json({
        status: 'error',
        message: `Cannot confirm delivery for an order with status "${order.status}". Order must be shipped first.`,
        errorCode: 'INVALID_ORDER_STATUS',
      });
      return;
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Send customer push notification (fire-and-forget)
    (async () => {
      try {
        await PushDeliveryService.send({
          userIds: [order.userId.toString()],
          title: 'Order Status Update',
          body: `Order #${order._id.toString().slice(-8)} has been delivered`,
          data: { screen: 'order-detail', orderId: order._id.toString() },
          settingKey: 'orderUpdates',
        });
      } catch (error) {
        console.error('[orderController] Error sending order delivered push:', error);
      }
    })();

    res.status(200).json({
      status: 'success',
      message: 'Order marked as delivered',
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        errorCode: 'CONFIRM_DELIVERY_FAILED',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to confirm delivery',
        errorCode: 'CONFIRM_DELIVERY_FAILED',
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

    // Send admin alert push notification (fire-and-forget)
    (async () => {
      try {
        const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin'] } }, { _id: 1 });
        const adminUserIds = adminUsers.map(u => u._id.toString());
        
        if (adminUserIds.length > 0) {
          await PushDeliveryService.send({
            userIds: adminUserIds,
            title: 'New Order Placed',
            body: `Order #${order._id.toString().slice(-8)} - ₦${totalAmount.toFixed(2)}`,
            data: { screen: 'admin-order', orderId: order._id.toString() },
          });
        }
      } catch (error) {
        console.error('[orderController] Error sending admin alert push:', error);
      }
    })();

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
