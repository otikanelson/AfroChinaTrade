import Expo, { ExpoPushMessage, ExpoPushTicket, ExpoPushErrorReceipt } from 'expo-server-sdk';
import User, { IUser, IPushTokenRecord } from '../models/User';

interface PushPayload {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  settingKey?: 'orderUpdates' | 'promotions' | 'newProducts' | 'discountedProducts' | 'newAds' | 'priceDrops';
}

interface TokenWithUser {
  token: string;
  userId: string;
  deviceId: string;
  platform: 'ios' | 'android';
  notificationSettings: IUser['notificationSettings'];
}

class PushDeliveryService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Send push notifications to a list of users
   * Fetches tokens, filters by notification settings, batches, and sends via EPNS
   */
  async send(payload: PushPayload): Promise<void> {
    try {
      // Fetch all tokens for the target users
      const tokens = await this.fetchTokens(payload.userIds);

      if (tokens.length === 0) {
        return; // No tokens to send to
      }

      // Filter tokens based on notification settings
      const filteredTokens = this.filterBySettings(tokens, payload.settingKey);

      if (filteredTokens.length === 0) {
        return; // All users opted out
      }

      // Build EPNS messages
      const messages: ExpoPushMessage[] = filteredTokens.map(t => ({
        to: t.token,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: 'default',
        priority: 'high',
      }));

      // Send in batches of 100
      await this.sendBatch(messages);
    } catch (error) {
      // Log error but don't throw — push delivery is fire-and-forget
      console.error('[PushDeliveryService] Error sending push notifications:', error);
    }
  }

  /**
   * Fetch push tokens for a list of user IDs
   */
  private async fetchTokens(userIds: string[]): Promise<TokenWithUser[]> {
    const users = await User.find(
      { _id: { $in: userIds } },
      { pushTokens: 1, notificationSettings: 1 }
    ).lean();

    const tokens: TokenWithUser[] = [];

    for (const user of users) {
      if (user.pushTokens && user.pushTokens.length > 0) {
        for (const tokenRecord of user.pushTokens) {
          tokens.push({
            token: tokenRecord.token,
            userId: user._id.toString(),
            deviceId: tokenRecord.deviceId,
            platform: tokenRecord.platform,
            notificationSettings: user.notificationSettings,
          });
        }
      }
    }

    return tokens;
  }

  /**
   * Filter tokens based on user notification settings
   */
  private filterBySettings(
    tokens: TokenWithUser[],
    settingKey?: 'orderUpdates' | 'promotions' | 'newProducts' | 'discountedProducts' | 'newAds' | 'priceDrops'
  ): TokenWithUser[] {
    return tokens.filter(t => {
      // Always check global pushNotifications setting
      if (!t.notificationSettings.pushNotifications) {
        return false;
      }

      // If a specific setting key is provided, check it
      if (settingKey && !t.notificationSettings[settingKey]) {
        return false;
      }

      return true;
    });
  }

  /**
   * Send push messages in batches of 100 (EPNS limit)
   */
  private async sendBatch(messages: ExpoPushMessage[]): Promise<void> {
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        await this.handleTickets(tickets, chunk);
      } catch (error) {
        console.error('[PushDeliveryService] Error sending batch:', error);
      }
    }
  }

  /**
   * Process EPNS tickets and handle errors
   */
  private async handleTickets(
    tickets: ExpoPushTicket[],
    messages: ExpoPushMessage[]
  ): Promise<void> {
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const message = messages[i];

      if (ticket.status === 'error') {
        const errorTicket = ticket as ExpoPushErrorReceipt;

        if (errorTicket.details?.error === 'DeviceNotRegistered') {
          // Remove invalid token
          await this.removeInvalidToken(message.to as string);
        } else if (
          errorTicket.details?.error === 'MessageTooBig' ||
          errorTicket.details?.error === 'MessageRateExceeded'
        ) {
          // Log other errors
          console.error(
            `[PushDeliveryService] EPNS error: ${errorTicket.details.error}`,
            { token: message.to, message: errorTicket.message }
          );
        }
      }
    }
  }

  /**
   * Remove an invalid token from the user's pushTokens array
   */
  private async removeInvalidToken(token: string): Promise<void> {
    try {
      const result = await User.findOneAndUpdate(
        { 'pushTokens.token': token },
        { $pull: { pushTokens: { token } } },
        { new: true }
      );

      if (result) {
        console.log(
          `[PushDeliveryService] Removed invalid token for user ${result._id}: ${token}`
        );
      }
    } catch (error) {
      console.error('[PushDeliveryService] Error removing invalid token:', error);
    }
  }
}

export default new PushDeliveryService();
