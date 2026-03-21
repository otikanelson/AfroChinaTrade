/**
 * Mobile-specific toast notification implementation
 * Uses React Native components for native feel
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

export interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastManager {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  show: (options: ToastOptions) => void;
}

interface ToastItem extends ToastOptions {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  title?: string;
  message: string;
}

// Toast queue and event emitter
class ToastEventEmitter {
  private listeners: Array<(toast: ToastItem) => void> = [];

  subscribe(listener: (toast: ToastItem) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(toast: ToastItem): void {
    this.listeners.forEach(listener => listener(toast));
  }
}

const toastEmitter = new ToastEventEmitter();

/**
 * Mobile toast manager implementation
 */
class MobileToastManager implements ToastManager {
  show(options: ToastOptions): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toastItem: ToastItem = {
      ...options,
      id,
      type: options.type || 'info',
      duration: options.duration || 4000,
    };
    toastEmitter.emit(toastItem);
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title });
  }
}

/**
 * Toast component for rendering individual toasts
 */
const Toast: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {toast.title && <Text style={styles.title}>{toast.title}</Text>}
      <Text style={styles.message}>{toast.message}</Text>
    </Animated.View>
  );
};

/**
 * Toast container component
 * Should be placed at the root of the app
 */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastEmitter.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    minWidth: Dimensions.get('window').width - 40,
    maxWidth: Dimensions.get('window').width - 40,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});

// Export singleton instance
export const mobileToastManager = new MobileToastManager();
