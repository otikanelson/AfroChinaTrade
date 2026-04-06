import { Request, Response } from 'express';
import Notification, { INotification } from '../models/Notification';
import User from '../models/User';
import PushDeliveryService from '../services/PushDeliveryService';

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
  type: INotification['type'],
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
  type: INotification['type'],
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
      'promotion',
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

// Notify users about discounted products
export const notifyDiscountedProduct = async (
  userIds: string[],
  productName: string,
  productId: string,
  originalPrice: number,
  discountedPrice: number,
  discountPercentage: number
) => {
  try {
    return await createBulkNotifications(
      userIds,
      'discounted_product',
      `Price Drop: ${productName}`,
      `Save ${discountPercentage}%! Now ₦${discountedPrice.toLocaleString()} (was ₦${originalPrice.toLocaleString()})`,
      {
        productId,
        productName,
        originalPrice,
        discountedPrice,
        discountPercentage,
      }
    );
  } catch (error) {
    console.error('Error notifying discounted product:', error);
    return false;
  }
};

// Notify users about new ads created by admin
export const notifyNewAd = async (
  userIds: string[],
  adTitle: string,
  adId: string,
  adType: string
) => {
  try {
    const success = await createBulkNotifications(
      userIds,
      'new_ad',
      `New Promotion: ${adTitle}`,
      `Don't miss out on our latest ${adType} promotion!`,
      {
        adId,
        adTitle,
        adType,
      }
    );

    // Send push notifications
    if (success) {
      const PushDeliveryService = require('../services/PushDeliveryService').default;
      PushDeliveryService.send({
        userIds,
        title: `New Promotion: ${adTitle}`,
        body: `Don't miss out on our latest ${adType} promotion!`,
        data: {
          adId,
          adTitle,
          adType,
          type: 'new_ad'
        },
        settingKey: 'newAds',
      }).catch((error: any) => {
        console.error('Error sending new ad push notifications:', error);
      });
    }

    return success;
  } catch (error) {
    console.error('Error notifying new ad:', error);
    return false;
  }
};

// Notify users about new chat messages
export const notifyChatMessage = async (
  userId: string,
  senderName: string,
  messagePreview: string,
  threadId: string
) => {
  try {
    return await createNotification(
      userId,
      'chat_message',
      `New message from ${senderName}`,
      messagePreview.length > 100 ? `${messagePreview.substring(0, 100)}...` : messagePreview,
      {
        threadId,
        senderName,
      }
    );
  } catch (error) {
    console.error('Error notifying chat message:', error);
    return false;
  }
};

// Notify users about help and support updates
export const notifyHelpSupport = async (
  userId: string,
  ticketId: string,
  ticketTitle: string,
  updateType: 'created' | 'updated' | 'resolved'
) => {
  try {
    const titles = {
      created: 'Support Ticket Created',
      updated: 'Support Ticket Updated',
      resolved: 'Support Ticket Resolved'
    };
    
    const messages = {
      created: `Your support ticket "${ticketTitle}" has been created and assigned to our team.`,
      updated: `Your support ticket "${ticketTitle}" has been updated with new information.`,
      resolved: `Your support ticket "${ticketTitle}" has been resolved. Check the details for more information.`
    };

    return await createNotification(
      userId,
      'help_support',
      titles[updateType],
      messages[updateType],
      {
        ticketId,
        ticketTitle,
        updateType,
      }
    );
  } catch (error) {
    console.error('Error notifying help support:', error);
    return false;
  }
};

// Notify users about newsletter
export const notifyNewsletter = async (
  userIds: string[],
  subject: string,
  preview: string
) => {
  try {
    return await createBulkNotifications(
      userIds,
      'newsletter',
      `Newsletter: ${subject}`,
      preview,
      {
        subject,
      }
    );
  } catch (error) {
    console.error('Error notifying newsletter:', error);
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
  type: 'refund_request' | 'order_update' | 'system' | 'general' | 'promotion' | 'new_product' | 'new_order' | 'new_refund_request',
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

// Register push token for the current user
export const registerPushToken = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { token, deviceId, platform } = req.body;

    // Validate required fields
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Token is required and must be a non-empty string',
      });
    }

    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required and must be a non-empty string',
      });
    }

    if (!platform || !['ios', 'android'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required and must be either "ios" or "android"',
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if token already exists for this user
    const existingTokenIndex = user.pushTokens.findIndex(
      (t) => t.token === token
    );

    if (existingTokenIndex !== -1) {
      // Token already exists, no need to add it again
      return res.json({
        success: true,
        message: 'Push token already registered',
      });
    }

    // If we're at the cap of 10 tokens, remove the oldest one
    if (user.pushTokens.length >= 10) {
      // Sort by createdAt and remove the oldest
      user.pushTokens.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      user.pushTokens.shift(); // Remove the oldest
    }

    // Add the new token
    user.pushTokens.push({
      token,
      deviceId,
      platform: platform as 'ios' | 'android',
      createdAt: new Date(),
    });

    await user.save();

    res.json({
      success: true,
      message: 'Push token registered successfully',
    });
  } catch (error: any) {
    console.error('Error registering push token:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove push token for the current user
export const removePushToken = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { token } = req.body;

    // Validate required field
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Token is required and must be a non-empty string',
      });
    }

    // Find the user and remove the token
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Filter out the token
    const initialLength = user.pushTokens.length;
    user.pushTokens = user.pushTokens.filter((t) => t.token !== token);

    // Check if any token was removed
    if (user.pushTokens.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Push token not found',
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Push token removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing push token:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Broadcast notification to all users or a segment (admin only)
export const broadcastNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { title, message, data, segment = 'all' } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required and must be a non-empty string',
      });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string',
      });
    }

    // Check if user is admin or super_admin
    const user = await User.findById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Build query based on segment
    const query: any = { status: 'active' };
    if (segment !== 'all') {
      // Future: add segment filtering logic here (e.g., by role, location, etc.)
      // For now, 'all' is the only supported segment
    }

    // Get all targeted users
    const targetedUsers = await User.find(query, { _id: 1 });
    const userIds = targetedUsers.map((u) => u._id.toString());

    // Save in-app notification for every targeted user
    await createBulkNotifications(
      userIds,
      'promotion',
      title,
      message,
      data || {}
    );

    // Send push notifications (fire-and-forget)
    // Count tokens before sending to get tokensDispatched count
    let tokensDispatched = 0;
    try {
      // Fetch tokens for all users to count them
      const usersWithTokens = await User.find(
        { _id: { $in: userIds } },
        { pushTokens: 1, notificationSettings: 1 }
      ).lean();

      // Count tokens that will actually be dispatched (respecting settings)
      for (const u of usersWithTokens) {
        if (u.pushTokens && u.pushTokens.length > 0) {
          // Check if user has push notifications and promotions enabled
          if (
            u.notificationSettings?.pushNotifications &&
            u.notificationSettings?.promotions
          ) {
            tokensDispatched += u.pushTokens.length;
          }
        }
      }

      // Send push notifications asynchronously
      PushDeliveryService.send({
        userIds,
        title,
        body: message,
        data: data || {},
        settingKey: 'promotions',
      }).catch((error) => {
        console.error('Error sending broadcast push notifications:', error);
      });
    } catch (error) {
      console.error('Error counting tokens for broadcast:', error);
    }

    res.json({
      success: true,
      message: 'Broadcast notification sent successfully',
      data: {
        usersTargeted: userIds.length,
        tokensDispatched,
      },
    });
  } catch (error: any) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};