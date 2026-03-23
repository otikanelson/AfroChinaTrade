import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
  autoClose?: number;
}

export const useToast = () => {
  const [toastState, setToastState] = useState<ToastState>({
    visible: false,
    type: 'info',
    message: '',
    autoClose: 2000,
  });

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', autoClose: number = type === 'success' ? 1500 : 2000) => {
      setToastState({
        visible: true,
        type,
        message,
        autoClose,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToastState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const success = useCallback((message: string, autoClose?: number) => {
    showToast(message, 'success', autoClose);
  }, [showToast]);

  const error = useCallback((message: string, autoClose?: number) => {
    showToast(message, 'error', autoClose);
  }, [showToast]);

  const warning = useCallback((message: string, autoClose?: number) => {
    showToast(message, 'warning', autoClose);
  }, [showToast]);

  const info = useCallback((message: string, autoClose?: number) => {
    showToast(message, 'info', autoClose);
  }, [showToast]);

  return {
    ...toastState,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
};
