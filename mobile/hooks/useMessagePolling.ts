/**
 * useMessagePolling
 *
 * Polls AsyncStorage for new unread messages every 10 seconds.
 * When new unread messages are detected, schedules a local push notification.
 * Also registers a notification response listener so tapping a notification
 * navigates to the relevant thread.
 *
 * Requirements: 3.6, 3.8
 */

import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { AsyncStorageAdapter } from '../../shared/src/services/storage/AsyncStorageAdapter';
import { MESSAGE_THREADS_KEY, MessageThread } from '../app/(admin)/(tabs)/messages';

const POLL_INTERVAL_MS = 10_000;

// Configure how notifications are presented when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions. Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule a local notification for new unread messages.
 */
async function scheduleUnreadNotification(
  unreadCount: number,
  threadId?: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Message',
      body:
        unreadCount === 1
          ? 'You have 1 new message from a customer.'
          : `You have ${unreadCount} new messages from customers.`,
      data: { threadId: threadId ?? null },
      sound: false,
    },
    trigger: null, // fire immediately
  });
}

interface UseMessagePollingOptions {
  /** Called whenever the thread list is refreshed so the screen can update. */
  onThreadsUpdated?: (threads: MessageThread[]) => void;
  /** Whether polling is active. Defaults to true. */
  enabled?: boolean;
}

export function useMessagePolling({
  onThreadsUpdated,
  enabled = true,
}: UseMessagePollingOptions = {}) {
  const router = useRouter();
  // Track the last known total unread count so we only notify on increases.
  const lastUnreadRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Lazily create storage instance inside the hook so mocks work in tests
  const storageRef = useRef<AsyncStorageAdapter | null>(null);
  const getStorage = useCallback(() => {
    if (!storageRef.current) storageRef.current = new AsyncStorageAdapter();
    return storageRef.current;
  }, []);

  const poll = useCallback(async () => {
    try {
      const threads = await getStorage().get<MessageThread[]>(MESSAGE_THREADS_KEY);
      if (!threads) return;

      // Sort newest first (same as messages screen)
      const sorted = [...threads].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );

      onThreadsUpdated?.(sorted);

      const totalUnread = sorted.reduce((sum, t) => sum + t.unreadCount, 0);

      // Only fire a notification when unread count has increased
      if (lastUnreadRef.current !== null && totalUnread > lastUnreadRef.current) {
        const newUnread = totalUnread - lastUnreadRef.current;
        // Find the thread with the most recent unread message for deep-linking
        const unreadThread = sorted.find((t) => t.unreadCount > 0);
        await scheduleUnreadNotification(newUnread, unreadThread?.id);
      }

      lastUnreadRef.current = totalUnread;
    } catch {
      // Silently ignore polling errors
    }
  }, [onThreadsUpdated, getStorage]);

  // Start / stop polling
  useEffect(() => {
    if (!enabled) return;

    // Run immediately on mount
    poll();

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, poll]);

  // Handle notification tap → navigate to thread
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          threadId?: string | null;
        };
        if (data?.threadId) {
          router.push({
            pathname: '/(admin)/message/[threadId]',
            params: { threadId: data.threadId },
          });
        } else {
          // No specific thread — navigate to messages list
          router.push('/(admin)/(tabs)/messages');
        }
      },
    );

    return () => subscription.remove();
  }, [router]);
}
