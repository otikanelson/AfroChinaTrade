/**
 * useMessagePolling
 *
 * Polls the API for new unread messages every 10 seconds.
 * Updates the message list when changes are detected.
 *
 * Requirements: 3.6, 3.8
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { messageService } from '../services/MessageService';
import { MessageThread } from '../types/message';

const POLL_INTERVAL_MS = 10_000;

/**
 * Request notification permissions. Returns true if granted.
 * Currently disabled for Expo Go compatibility.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const response = await messageService.getThreads();
      if (response.success && response.data) {
        // Sort newest first (same as messages screen)
        const sorted = [...response.data].sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
        );

        onThreadsUpdated?.(sorted);
      }
    } catch (error) {
      // Silently ignore polling errors
      console.warn('Message polling failed:', error);
    }
  }, [onThreadsUpdated]);

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
}
