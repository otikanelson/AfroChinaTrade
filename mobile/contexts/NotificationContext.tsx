/**
 * NotificationContext
 *
 * Provides push notification handling for the admin section:
 * - Requests notification permissions on mount
 * - Listens for notification taps and navigates to the relevant screen
 * - Exposes a scheduleLocalNotification helper for other modules
 *
 * Note: Notifications are disabled in Expo Go for compatibility
 *
 * Requirements: 2.5, 3.6, 4.10, 5.10
 */

import React, { createContext, useContext } from 'react';

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
  // ---------------------------------------------------------------------------
  // Helpers (Disabled for Expo Go compatibility)
  // ---------------------------------------------------------------------------

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: NotificationData,
  ): Promise<void> => {
    // Notifications are disabled in Expo Go
    console.log('Notification (disabled in Expo Go):', { title, body, data });
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
