import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Toast } from '../components/ui/Toast';
import { useAlert, AlertButton, AlertType } from '../hooks/useAlert';
import { setAlertFunction } from '../utils/alertUtils';

interface AlertContextType {
  show: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    type?: AlertType,
    autoClose?: number
  ) => void;
  showSuccess: (title: string, message?: string, autoClose?: number) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string, autoClose?: number) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
  showDestructiveConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    alertConfig,
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDestructiveConfirm,
    close,
  } = useAlert();

  // Initialize the alert utility function
  useEffect(() => {
    setAlertFunction(show);
  }, [show]);

  const value: AlertContextType = {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDestructiveConfirm,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <Toast
        visible={alertConfig.visible}
        type={alertConfig.type}
        message={alertConfig.message ? `${alertConfig.title}: ${alertConfig.message}` : alertConfig.title}
        autoClose={alertConfig.autoClose}
        onClose={close}
      />
    </AlertContext.Provider>
  );
};

export const useAlertContext = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within AlertProvider');
  }
  return context;
};
