import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  autoClose?: number; // milliseconds, 0 = no auto close
  onClose?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const getIconName = (type: ToastType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'success':
      return 'checkmark-circle';
    case 'error':
      return 'close-circle';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'information-circle';
  }
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  type = 'info',
  message,
  autoClose = 2000,
  onClose,
}) => {
  const { colors } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);
        return () => clearTimeout(timer);
      }
    } else {
      slideAnim.setValue(-100);
    }
  }, [visible, autoClose]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  const getTypeColor = (): string => {
    switch (type) {
      case 'success':
        return colors.success || '#10B981';
      case 'error':
        return colors.error || '#EF4444';
      case 'warning':
        return colors.warning || '#F59E0B';
      case 'info':
      default:
        return colors.primary || '#3B82F6';
    }
  };

  const typeColor = getTypeColor();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 20,
      left: 0,
      right: 0,
      zIndex: 9999,
      paddingHorizontal: 12,
      paddingTop: 8,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: typeColor,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    icon: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    message: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: '#FFFFFF',
      lineHeight: 18,
    },
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toast}>
        <Ionicons name={getIconName(type)} style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};
