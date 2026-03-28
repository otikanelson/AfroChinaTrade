import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
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
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow swiping in both directions
        swipeAnim.setValue(gestureState.dx);
        // Fade out as user swipes
        const opacity = 1 - Math.abs(gestureState.dx) / (screenWidth * 0.5);
        opacityAnim.setValue(Math.max(0, opacity));
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = screenWidth * 0.3;
        
        if (Math.abs(gestureState.dx) > swipeThreshold) {
          // Swipe threshold met - dismiss the toast
          const direction = gestureState.dx > 0 ? screenWidth : -screenWidth;
          Animated.parallel([
            Animated.timing(swipeAnim, {
              toValue: direction,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose?.();
            // Reset animations
            swipeAnim.setValue(0);
            opacityAnim.setValue(1);
          });
        } else {
          // Swipe threshold not met - bounce back
          Animated.parallel([
            Animated.spring(swipeAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset swipe position when showing
      swipeAnim.setValue(0);
      opacityAnim.setValue(1);
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Always auto-close, use provided duration or default
      const duration = autoClose && autoClose > 0 ? autoClose : 3000;
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
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
      bottom: 70,
      left: 0,
      right: 0,
      zIndex: 9999,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: typeColor,
      borderRadius: 20,
      paddingHorizontal: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      minHeight: 50,
      maxWidth: screenWidth - 40,
    },
    iconContainer: {
      marginRight: 12,
      marginTop: 2,
    },
    icon: {
      color: '#FFFFFF',
      fontSize: 18,
    },
    messageContainer: {
      flex: 1,
      flexShrink: 1,
    },
    message: {
      fontSize: 14,
      fontWeight: '500',
      color: '#FFFFFF',
      lineHeight: 20,
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
      {...panResponder.panHandlers}
    >
      <Animated.View 
        style={[
          styles.toast,
          {
            transform: [{ translateX: swipeAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={getIconName(type)} style={styles.icon} />
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={4}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};
