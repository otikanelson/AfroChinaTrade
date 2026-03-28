import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';

// Get notifications for a user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { userId };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const count = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create notification (internal use)
export const createNotification = async (
  userId: string,
  type: 'refund_request' | 'order_update' | 'system' | 'general' | 'promotion' | 'price_drop' | 'new_product',
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {},
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Bulk create notifications for multiple users
export const createBulkNotifications = async (
  userIds: string[],
  type: 'refund_request' | 'order_update' | 'system' | 'general' | 'promotion' | 'price_drop' | 'new_product',
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      data: data || {},
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return true;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return false;
  }
};

// Notify users about order updates
export const notifyOrderUpdate = async (
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string,
  customerName: string
) => {
  try {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed',
      processing: 'Your order is currently being prepared',
      shipped: 'Your order has been shipped and is on its way',
      delivered: 'Your order has been delivered successfully',
      cancelled: 'Your order has been cancelled',
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to ${status}`;

    await createNotification(
      userId,
      'order_update',
      `Order #${orderNumber} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message,
      {
        orderId,
        orderNumber,
        status,
        customerName,
      }
    );

    return true;
  } catch (error) {
    console.error('Error notifying order update:', error);
    return false;
  }
};

// Notify users about promotions
export const notifyPromotion = async (
  userIds: string[],
  title: string,
  message: string,
  promotionData?: Record<string, any>
) => {
  try {
    return await createBulkNotifications(
      userIds,
      'promotion',
      title,
      message,
      promotionData
    );
  } catch (error) {
    console.error('Error notifying promotion:', error);
    return false;
  }
};

// Notify users about price drops
export const notifyPriceDrop = async (
  userIds: string[],
  productName: string,
  oldPrice: number,
  newPrice: number,
  productId: string
) => {
  try {
    const savings = oldPrice - newPrice;
    const percentage = Math.round((savings / oldPrice) * 100);

    return await createBulkNotifications(
      userIds,
      'price_drop',
      `Price Drop Alert: ${productName}`,
      `Save ₦${savings.toLocaleString()} (${percentage}% off)! Now ₦${newPrice.toLocaleString()}`,
      {
        productId,
        productName,
        oldPrice,
        newPrice,
        savings,
        percentage,
      }
    );
  } catch (error) {
    console.error('Error notifying price drop:', error);
    return false;
  }
};

// Notify users about new products
export const notifyNewProduct = async (
  userIds: string[],
  productName: string,
  productId: string,
  category: string,
  price: number
) => {
  try {
    return await createBulkNotifications(
      userIds,
      'new_product',
      `New Arrival: ${productName}`,
      `Check out our latest ${category} product starting at ₦${price.toLocaleString()}`,
      {
        productId,
        productName,
        category,
        price,
      }
    );
  } catch (error) {
    console.error('Error notifying new product:', error);
    return false;
  }
};

// Delete old notifications (cleanup)
export const cleanupOldNotifications = async (daysOld: number = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true, // Only delete read notifications
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    return 0;
  }
};

// Notify all admins about new refund request
export const notifyAdminsOfRefundRequest = async (
  orderId: string,
  orderNumber: string,
  amount: number,
  customerName: string
) => {
  try {
    // Get all admin users
    const admins = await User.find({ role: 'admin' });

    const notifications = admins.map(admin => ({
      userId: admin._id,
      type: 'refund_request' as const,
      title: 'New Refund Request',
      message: `${customerName} has requested a refund for order #${orderNumber} (₦${amount.toLocaleString()})`,
      data: {
        orderId,
        orderNumber,
        amount,
        customerName,
      },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return true;
  } catch (error) {
    console.error('Error notifying admins of refund request:', error);
    return false;
  }
};

// Generic function to notify all admins
export const notifyAdmins = async (
  type: 'refund_request' | 'order_update' | 'system' | 'general' | 'promotion' | 'price_drop' | 'new_product',
  title: string,
  message: string,
  data?: any
) => {
  try {
    // Get all admin users
    const admins = await User.find({ role: 'admin' });

    const notifications = admins.map(admin => ({
      userId: admin._id,
      type,
      title,
      message,
      data,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return true;
  } catch (error) {
    console.error('Error notifying admins:', error);
    return false;
  }
};