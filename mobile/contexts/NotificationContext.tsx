/**
 * NotificationContext
 *
 * Provides comprehensive push notification handling:
 * - Requests notification permissions on mount
 * - Listens for notification taps and navigates to the relevant screen
 * - Exposes notification scheduling and management helpers
 * - Handles notification badges and real-time updates
 *
 * Note: Push notifications are disabled in Expo Go due to SDK 53+ limitations
 *
 * Requirements: 2.5, 3.6, 4.10, 5.10
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from './AuthContext';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only import and configure notifications if not in Expo Go
let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    
    // Configure notification behavior only if not in Expo Go
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.log('Notifications not available:', error);
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationData extends Record<string, unknown> {
  type?: 'order' | 'message' | 'report' | 'refund' | 'system';
  orderId?: string;
  threadId?: string;
  refundId?: string;
  url?: string;
}

interface NotificationContextType {
  /**
   * Schedule an immediate local notification.
   * @param title  Notification title
   * @param body   Notification body text
   * @param data   Optional payload attached to the notification
   */
  scheduleLocalNotification: (
    title: string,
    body: string,
    data?: NotificationData,
  ) => Promise<void>;

  /**
   * Request notification permissions from the user.
   */
  requestPermissions: () => Promise<boolean>;

  /**
   * Get the current notification permissions status.
   * Returns null in Expo Go environment.
   */
  getPermissions: () => Promise<any | null>;

  /**
   * Set the app badge count.
   */
  setBadgeCount: (count: number) => Promise<void>;

  /**
   * Clear all delivered notifications.
   */
  clearAllNotifications: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // ---------------------------------------------------------------------------
  // Setup notification listeners
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Skip notification setup in Expo Go
    if (isExpoGo || !Notifications) {
      console.log('Push notifications disabled in Expo Go. Use a development build for full functionality.');
      return;
    }

    // Request permissions on mount
    requestPermissions();

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Handle foreground notification if needed
    });

    // Listen for user tapping on notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as NotificationData;
      handleNotificationTap(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation handler
  // ---------------------------------------------------------------------------

  const handleNotificationTap = (data: NotificationData) => {
    if (!data) return;

    try {
      switch (data.type) {
        case 'order':
          if (data.orderId) {
            router.push(`/order/${data.orderId}`);
          }
          break;
        case 'message':
          if (data.threadId) {
            router.push(`/message-thread/${data.threadId}`);
          } else {
            router.push('/messages');
          }
          break;
        case 'refund':
          if (data.refundId) {
            router.push(`/refund/${data.refundId}`);
          } else {
            router.push('/refunds');
          }
          break;
        case 'system':
          router.push('/notifications');
          break;
        default:
          if (data.url) {
            router.push(data.url as any);
          } else {
            router.push('/notifications');
          }
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
      router.push('/notifications');
    }
  };

  // ---------------------------------------------------------------------------
  // Notification functions
  // ---------------------------------------------------------------------------

  const requestPermissions = async (): Promise<boolean> => {
    try {
      // Skip permission request in Expo Go
      if (isExpoGo || !Notifications) {
        console.log('Push notification permissions not available in Expo Go');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android' && Notifications.AndroidImportance) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const getPermissions = async (): Promise<any | null> => {
    try {
      if (isExpoGo || !Notifications) {
        return null;
      }
      return await Notifications.getPermissionsAsync();
    } catch (error) {
      console.error('Error getting notification permissions:', error);
      return null;
    }
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: NotificationData,
  ): Promise<void> => {
    try {
      // Skip local notifications in Expo Go
      if (isExpoGo || !Notifications) {
        console.log('Local notification (disabled in Expo Go):', { title, body, data });
        return;
      }

      const permissions = await getPermissions();
      if (!permissions || permissions.status !== 'granted') {
        console.log('Notification permissions not granted, cannot schedule notification');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  };

  const setBadgeCount = async (count: number): Promise<void> => {
    try {
      if (isExpoGo || !Notifications) {
        console.log('Badge count (disabled in Expo Go):', count);
        return;
      }
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  const clearAllNotifications = async (): Promise<void> => {
    try {
      if (isExpoGo || !Notifications) {
        console.log('Clear notifications (disabled in Expo Go)');
        return;
      }
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        scheduleLocalNotification,
        requestPermissions,
        getPermissions,
        setBadgeCount,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotificationContext must be used within a NotificationProvider',
    );
  }
  return context;
}
