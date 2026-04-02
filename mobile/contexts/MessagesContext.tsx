import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '../services/MessageService';
import { useAuth } from './AuthContext';
import { MessageThread } from '../types/message';

interface MessagesContextType {
  unreadCount: number;
  threads: MessageThread[];
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: (count?: number) => void;
  incrementUnreadCount: (count?: number) => void;
  markThreadAsRead: (threadId: string) => void;
  refreshThreads: (silent?: boolean) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const { isAuthenticated, isAdmin } = useAuth();
  const lastFetchRef = useRef<number>(0);
  const STALE_THRESHOLD = 30_000; // consider data stale after 30s

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || isAdmin) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await messageService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error: any) {
      if (error?.code !== 'NETWORK_ERROR' && error?.code !== 'TIMEOUT_ERROR') {
        console.error('Failed to load unread count:', error);
      }
    }
  }, [isAuthenticated, isAdmin]);

  const refreshThreads = useCallback(async (silent = false) => {
    if (!isAuthenticated || isAdmin) return;

    // Skip if data is fresh enough (unless forced)
    const now = Date.now();
    if (!silent && now - lastFetchRef.current < STALE_THRESHOLD) return;

    try {
      const response = await messageService.getThreads();
      if (response.success && response.data) {
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        setThreads(sorted);
        // Derive unread count from threads directly — no extra API call needed
        const total = sorted.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
        setUnreadCount(total);
        lastFetchRef.current = now;
      }
    } catch (error: any) {
      if (error?.code !== 'NETWORK_ERROR' && error?.code !== 'TIMEOUT_ERROR') {
        console.error('Failed to load threads:', error);
      }
    }
  }, [isAuthenticated, isAdmin]);

  // Optimistically mark a thread as read — instant UI update, no API call
  const markThreadAsRead = useCallback((threadId: string) => {
    setThreads(prev => prev.map(t => {
      if (t.threadId !== threadId) return t;
      const wasUnread = t.unreadCount || 0;
      if (wasUnread === 0) return t;
      setUnreadCount(c => Math.max(0, c - wasUnread));
      return { ...t, unreadCount: 0 };
    }));
  }, []);

  const decrementUnreadCount = useCallback((count: number = 1) => {
    setUnreadCount(prev => Math.max(0, prev - count));
  }, []);

  const incrementUnreadCount = useCallback((count: number = 1) => {
    setUnreadCount(prev => prev + count);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      refreshThreads(true);
      const interval = setInterval(() => refreshThreads(true), 60_000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setThreads([]);
    }
  }, [isAuthenticated, isAdmin]);

  const value: MessagesContextType = {
    unreadCount,
    threads,
    refreshUnreadCount,
    decrementUnreadCount,
    incrementUnreadCount,
    markThreadAsRead,
    refreshThreads,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}