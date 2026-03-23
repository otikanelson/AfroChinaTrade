import { useState, useCallback } from 'react';

export interface ModalState {
  visible: boolean;
  title: string;
  children?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom';
  showCloseButton?: boolean;
  scrollable?: boolean;
}

export const useModal = (initialState?: Partial<ModalState>) => {
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    size: 'medium',
    position: 'center',
    showCloseButton: true,
    scrollable: false,
    ...initialState,
  });

  const openModal = useCallback((config: Partial<ModalState>) => {
    setModalState((prev) => ({
      ...prev,
      visible: true,
      ...config,
    }));
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const updateModal = useCallback((config: Partial<ModalState>) => {
    setModalState((prev) => ({
      ...prev,
      ...config,
    }));
  }, []);

  return {
    ...modalState,
    openModal,
    closeModal,
    updateModal,
  };
};
