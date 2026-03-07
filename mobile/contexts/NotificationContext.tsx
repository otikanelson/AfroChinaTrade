/**
 * NotificationContext
 *
 * Provides push notification handling for the admin section:
 * - Requests notification permissions on mount
 * - Listens for notification taps and navigates to the relevant screen
 * - Exposes a scheduleLocalNotification helper for other modules
 *
 * Requirements: 2.5, 3.6, 4.10, 5.10
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { requestNotificationPermissions } from '../hooks/useMessagePolling';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotificationData extends Record<string, unknown> {
  type?: 'order' | 'message' | 'report';
  orderId?: string;
  threadId?: string;
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
  const responseListenerRef =
    useRef<Notifications.EventSubscription | null>(null);

  // Request permissions when the admin layout mounts
  useEffect(() => {
    requestNotificationPermissions().catch(() => {
      // Permission request failure is non-fatal
    });
  }, []);

  // Listen for notification taps and navigate to the relevant screen
  useEffect(() => {
    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content
          .data as NotificationData | undefined;

        if (data?.type === 'order' && data.orderId) {
          router.push({
            pathname: '/(admin)/order/[id]',
            params: { id: data.orderId },
          });
        } else if (data?.type === 'message' && data.threadId) {
          router.push({
            pathname: '/(admin)/message/[threadId]',
            params: { threadId: data.threadId },
          });
        } else if (data?.type === 'report') {
          router.push('/(admin)/moderation/index' as any);
        } else {
          // Fallback: go to orders tab
          router.push('/(admin)/(tabs)/orders' as any);
        }
      });

    return () => {
      responseListenerRef.current?.remove();
    };
  }, [router]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: NotificationData,
  ): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        sound: false,
      },
      trigger: null, // fire immediately
    });
  };

  return (
    <NotificationContext.Provider value={{ scheduleLocalNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
}
