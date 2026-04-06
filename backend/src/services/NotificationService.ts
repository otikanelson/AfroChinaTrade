import User from '../models/User';
import Notification, { INotification } from '../models/Notification';
import PushDeliveryService from './PushDeliveryService';

export class NotificationService {
  
  // Get users who have opted in for a specific notification type
  static async getUsersForNotificationType(notificationType: string): Promise<string[]> {
    try {
      const settingKey = this.getSettingKeyForNotificationType(notificationType);
      if (!settingKey) return [];

      const users = await User.find({
        [`notificationSettings.${settingKey}`]: true,
        'notificationSettings.pushNotifications': true // Only send to users who want push notifications
      }).select('_id');

      return users.map(user => user._id.toString());
    } catch (error) {
      console.error('Error getting users for notification type:', error);
      return [];
    }
  }

  // Get users who have opted in for email notifications
  static async getUsersForEmailNotifications(notificationType: string): Promise<string[]> {
    try {
      const settingKey = this.getSettingKeyForNotificationType(notificationType);
      if (!settingKey) return [];

      const users = await User.find({
        [`notificationSettings.${settingKey}`]: true,
        'notificationSettings.emailNotifications': true
      }).select('_id email');

      return users.map(user => user._id.toString());
    } catch (error) {
      console.error('Error getting users for email notifications:', error);
      return [];
    }
  }

  // Get users who have opted in for SMS notifications
  static async getUsersForSMSNotifications(notificationType: string): Promise<string[]> {
    try {
      const settingKey = this.getSettingKeyForNotificationType(notificationType);
      if (!settingKey) return [];

      const users = await User.find({
        [`notificationSettings.${settingKey}`]: true,
        'notificationSettings.smsNotifications': true,
        phone: { $exists: true, $ne: '' }
      }).select('_id phone');

      return users.map(user => user._id.toString());
    } catch (error) {
      console.error('Error getting users for SMS notifications:', error);
      return [];
    }
  }

  // Map notification types to user setting keys
  private static getSettingKeyForNotificationType(notificationType: string): string | null {
    const mapping: { [key: string]: string } = {
      'new_product': 'newProducts',
      'discounted_product': 'discountedProducts',
      'order_update': 'orderUpdates',
      'promotion': 'promotions',
      'new_ad': 'newAds',
      'chat_message': 'chatMessages',
      'help_support': 'helpAndSupport',
      'newsletter': 'newsletter'
    };

    return mapping[notificationType] || null;
  }

  // Create notification (internal use)
  private static async createNotification(
    userId: string,
    type: INotification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
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
  }

  // Bulk create notifications for multiple users
  private static async createBulkNotifications(
    userIds: string[],
    type: INotification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
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
  }
  // Send new product notification to opted-in users
  static async sendNewProductNotification(
    productName: string,
    productId: string,
    category: string,
    price: number
  ) {
    try {
      const userIds = await this.getUsersForNotificationType('new_product');
      if (userIds.length > 0) {
        // Send in-app notifications
        await this.createBulkNotifications(
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

        // Send push notifications
        PushDeliveryService.send({
          userIds,
          title: `New Arrival: ${productName}`,
          body: `Check out our latest ${category} product starting at ₦${price.toLocaleString()}`,
          data: {
            productId,
            productName,
            category,
            price,
            type: 'new_product'
          },
          settingKey: 'newProducts',
        }).catch((error) => {
          console.error('Error sending new product push notifications:', error);
        });
      }
      console.log(`New product notification sent to ${userIds.length} users`);
    } catch (error) {
      console.error('Error sending new product notification:', error);
    }
  }

  // Send discounted product notification to opted-in users
  static async sendDiscountedProductNotification(
    productName: string,
    productId: string,
    originalPrice: number,
    discountedPrice: number,
    discountPercentage: number
  ) {
    try {
      const userIds = await this.getUsersForNotificationType('discounted_product');
      if (userIds.length > 0) {
        // Send in-app notifications
        await this.createBulkNotifications(
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

        // Send push notifications
        PushDeliveryService.send({
          userIds,
          title: `Price Drop: ${productName}`,
          body: `Save ${discountPercentage}%! Now ₦${discountedPrice.toLocaleString()} (was ₦${originalPrice.toLocaleString()})`,
          data: {
            productId,
            productName,
            originalPrice,
            discountedPrice,
            discountPercentage,
            type: 'discounted_product'
          },
          settingKey: 'discountedProducts',
        }).catch((error) => {
          console.error('Error sending discounted product push notifications:', error);
        });
      }
      console.log(`Discounted product notification sent to ${userIds.length} users`);
    } catch (error) {
      console.error('Error sending discounted product notification:', error);
    }
  }

  // Send new ad notification to opted-in users
  static async sendNewAdNotification(
    adTitle: string,
    adId: string,
    adType: string
  ) {
    try {
      const userIds = await this.getUsersForNotificationType('new_ad');
      if (userIds.length > 0) {
        await this.createBulkNotifications(
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
      }
      console.log(`New ad notification sent to ${userIds.length} users`);
    } catch (error) {
      console.error('Error sending new ad notification:', error);
    }
  }

  // Send chat message notification to specific user (if opted in)
  static async sendChatMessageNotification(
    userId: string,
    senderName: string,
    messagePreview: string,
    threadId: string
  ) {
    try {
      // Check if user has chat message notifications enabled
      const user = await User.findById(userId).select('notificationSettings');
      if (user?.notificationSettings?.chatMessages && user?.notificationSettings?.pushNotifications) {
        await this.createNotification(
          userId,
          'chat_message',
          `New message from ${senderName}`,
          messagePreview.length > 100 ? `${messagePreview.substring(0, 100)}...` : messagePreview,
          {
            threadId,
            senderName,
          }
        );
        console.log(`Chat message notification sent to user ${userId}`);
      }
    } catch (error) {
      console.error('Error sending chat message notification:', error);
    }
  }

  // Send help and support notification to specific user (if opted in)
  static async sendHelpSupportNotification(
    userId: string,
    ticketId: string,
    ticketTitle: string,
    updateType: 'created' | 'updated' | 'resolved'
  ) {
    try {
      // Check if user has help and support notifications enabled
      const user = await User.findById(userId).select('notificationSettings');
      if (user?.notificationSettings?.helpAndSupport && user?.notificationSettings?.pushNotifications) {
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

        await this.createNotification(
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
        console.log(`Help support notification sent to user ${userId}`);
      }
    } catch (error) {
      console.error('Error sending help support notification:', error);
    }
  }

  // Send newsletter notification to opted-in users
  static async sendNewsletterNotification(
    subject: string,
    preview: string
  ) {
    try {
      const userIds = await this.getUsersForNotificationType('newsletter');
      if (userIds.length > 0) {
        await this.createBulkNotifications(
          userIds,
          'newsletter',
          `Newsletter: ${subject}`,
          preview,
          {
            subject,
          }
        );
      }
      console.log(`Newsletter notification sent to ${userIds.length} users`);
    } catch (error) {
      console.error('Error sending newsletter notification:', error);
    }
  }

  // Send promotion notification to opted-in users
  static async sendPromotionNotification(
    title: string,
    message: string,
    data?: any
  ) {
    try {
      const userIds = await this.getUsersForNotificationType('promotion');
      if (userIds.length > 0) {
        await this.createBulkNotifications(
          userIds,
          'promotion',
          title,
          message,
          data
        );
      }
      console.log(`Promotion notification sent to ${userIds.length} users`);
    } catch (error) {
      console.error('Error sending promotion notification:', error);
    }
  }

  // Send order update notification to specific user (if opted in)
  static async sendOrderUpdateNotification(
    userId: string,
    orderId: string,
    status: string,
    message: string
  ) {
    try {
      // Check if user has order update notifications enabled
      const user = await User.findById(userId).select('notificationSettings');
      if (user?.notificationSettings?.orderUpdates && user?.notificationSettings?.pushNotifications) {
        await this.createNotification(
          userId,
          'order_update',
          `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message,
          {
            orderId,
            status,
          }
        );
        console.log(`Order update notification sent to user ${userId}`);
      }
    } catch (error) {
      console.error('Error sending order update notification:', error);
    }
  }
}

export default NotificationService;