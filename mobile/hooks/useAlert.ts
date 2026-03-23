import { useCallback, useState } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
  text: string;
  style: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertConfig {
  visible: boolean;
  title: string;
  message?: string;
  type: AlertType;
  buttons: AlertButton[];
  autoClose: number;
}

const defaultConfig: AlertConfig = {
  visible: false,
  title: '',
  message: '',
  type: 'info',
  buttons: [{ text: 'OK', style: 'default' }],
  autoClose: 0,
};

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(defaultConfig);

  const show = useCallback(
    (
      title: string,
      message?: string,
      buttons?: AlertButton[],
      type: AlertType = 'info',
      autoClose: number = 0
    ) => {
      setAlertConfig({
        visible: true,
        title,
        message,
        type,
        buttons: buttons || [{ text: 'OK', style: 'default' }],
        autoClose,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message?: string, autoClose: number = 2000) => {
      show(title, message, [{ text: 'OK', style: 'default' }], 'success', autoClose);
    },
    [show]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      show(title, message, [{ text: 'OK', style: 'default' }], 'error', 0);
    },
    [show]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      show(title, message, [{ text: 'OK', style: 'default' }], 'warning', 0);
    },
    [show]
  );

  const showInfo = useCallback(
    (title: string, message?: string, autoClose: number = 0) => {
      show(title, message, [{ text: 'OK', style: 'default' }], 'info', autoClose);
    },
    [show]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText: string = 'Confirm',
      cancelText: string = 'Cancel'
    ) => {
      show(
        title,
        message,
        [
          { text: cancelText, style: 'cancel', onPress: onCancel },
          { text: confirmText, style: 'default', onPress: onConfirm },
        ],
        'info',
        0
      );
    },
    [show]
  );

  const showDestructiveConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText: string = 'Delete',
      cancelText: string = 'Cancel'
    ) => {
      show(
        title,
        message,
        [
          { text: cancelText, style: 'cancel', onPress: onCancel },
          { text: confirmText, style: 'destructive', onPress: onConfirm },
        ],
        'warning',
        0
      );
    },
    [show]
  );

  const close = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    alertConfig,
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDestructiveConfirm,
    close,
  };
};
