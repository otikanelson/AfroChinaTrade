import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { handleNotificationDeepLink } from '../utils/notificationDeepLink';

const { width: screenWidth } = Dimensions.get('window');

interface InAppToastProps {
  title: string;
  body: string;
  data?: Record<string, any>;
  onDismiss: () => void;
}

export const InAppToast: React.FC<InAppToastProps> = ({
  title,
  body,
  data,
  onDismiss,
}) => {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Auto-dismiss after 4000ms
    timeoutRef.current = setTimeout(() => {
      handleDismiss();
    }, 4000);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const handleTap = () => {
    // Clear auto-dismiss timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Navigate via deep link
    if (data) {
      handleNotificationDeepLink(data, router);
    }

    // Dismiss toast
    handleDismiss();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 50,
      left: spacing.base,
      right: spacing.base,
      zIndex: 9999,
      elevation: 10,
    },
    toast: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      flexDirection: 'row',
      alignItems: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    content: {
      flex: 1,
      marginRight: spacing.xs,
    },
    title: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    body: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    closeButton: {
      padding: spacing.xs,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={handleTap}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={20} color={colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};
