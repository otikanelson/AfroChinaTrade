import React, { ReactNode } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  /** Called when the card is pressed; enables press interaction */
  onPress?: () => void;
  /** Elevation level controlling shadow intensity */
  elevation?: 'sm' | 'base' | 'md' | 'lg';
  /** Override or extend the card container style */
  style?: ViewStyle;
  /** Override or extend the inner content style */
  contentStyle?: ViewStyle;
  /** Disable press interaction */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  elevation = 'base',
  style,
  contentStyle,
  disabled = false,
  testID,
}) => {
  const { colors, borderRadius, spacing, shadows } = useTheme();
  const shadowStyle = shadows[elevation];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    content: {
      padding: spacing.lg,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.5,
    },
  });

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.08)', borderless: false }}
        style={({ pressed }) => [
          styles.card,
          shadowStyle,
          style,
          // iOS press feedback via opacity
          Platform.OS === 'ios' && pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
        accessibilityRole="button"
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, shadowStyle, style]} testID={testID}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};


