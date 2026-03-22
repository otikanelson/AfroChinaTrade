import React, { createContext, useContext, useState, useEffect } from 'react';
import { messageService } from '../services/MessageService';
import { useAuth } from './AuthContext';

interface MessagesContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnreadCount: (count?: number) => void;
  incrementUnreadCount: (count?: number) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // Load unread count when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCount();
      
      // Set up polling for unread count every 30 seconds
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const refreshUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await messageService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error: any) {
      // Only log network errors, don't spam console when backend is down
      if (error?.code !== 'NETWORK_ERROR' && error?.code !== 'TIMEOUT_ERROR') {
        console.error('Failed to load unread count:', error);
      }
      // Silently fail for network errors to avoid console spam
    }
  };

  const decrementUnreadCount = (count: number = 1) => {
    setUnreadCount(prev => Math.max(0, prev - count));
  };

  const incrementUnreadCount = (count: number = 1) => {
    setUnreadCount(prev => prev + count);
  };

  const value: MessagesContextType = {
    unreadCount,
    refreshUnreadCount,
    decrementUnreadCount,
    incrementUnreadCount,
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