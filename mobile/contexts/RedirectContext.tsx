import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RedirectContextType {
  pendingRedirect: string | null;
  setPendingRedirect: (path: string | null) => void;
  clearPendingRedirect: () => void;
  handlePendingRedirect: () => Promise<string | null>;
}

const RedirectContext = createContext<RedirectContextType | undefined>(undefined);

const PENDING_REDIRECT_KEY = '@afrochinatrade:pending_redirect';

export function RedirectProvider({ children }: { children: ReactNode }) {
  const [pendingRedirect, setPendingRedirectState] = useState<string | null>(null);

  const setPendingRedirect = async (path: string | null) => {
    setPendingRedirectState(path);
    if (path) {
      await AsyncStorage.setItem(PENDING_REDIRECT_KEY, path);
    } else {
      await AsyncStorage.removeItem(PENDING_REDIRECT_KEY);
    }
  };

  const clearPendingRedirect = async () => {
    setPendingRedirectState(null);
    await AsyncStorage.removeItem(PENDING_REDIRECT_KEY);
  };

  const handlePendingRedirect = async (): Promise<string | null> => {
    try {
      const storedRedirect = await AsyncStorage.getItem(PENDING_REDIRECT_KEY);
      if (storedRedirect) {
        await clearPendingRedirect();
        return storedRedirect;
      }
      return pendingRedirect;
    } catch (error) {
      console.error('Error handling pending redirect:', error);
      return null;
    }
  };

  const value: RedirectContextType = {
    pendingRedirect,
    setPendingRedirect,
    clearPendingRedirect,
    handlePendingRedirect,
  };

  return (
    <RedirectContext.Provider value={value}>
      {children}
    </RedirectContext.Provider>
  );
}

export function useRedirect(): RedirectContextType {
  const context = useContext(RedirectContext);
  if (context === undefined) {
    throw new Error('useRedirect must be used within a RedirectProvider');
  }
  return context;
}