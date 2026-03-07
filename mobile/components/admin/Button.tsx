import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button label */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  disabled?: boolean;
  /** Ionicons icon name rendered before the label */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Render icon after the label instead of before */
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { container: ViewStyle; text: TextStyle; iconColor: string; disabledContainer: ViewStyle; disabledText: TextStyle }
> = {
  primary: {
    container: { backgroundColor: theme.colors.primary },
    text: { color: theme.colors.textInverse },
    iconColor: theme.colors.textInverse,
    disabledContainer: { backgroundColor: theme.colors.borderLight },
    disabledText: { color: theme.colors.textLight },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    text: { color: theme.colors.primary },
    iconColor: theme.colors.primary,
    disabledContainer: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.borderLight,
    },
    disabledText: { color: theme.colors.textLight },
  },
  destructive: {
    container: { backgroundColor: theme.colors.error },
    text: { color: theme.colors.textInverse },
    iconColor: theme.colors.textInverse,
    disabledContainer: { backgroundColor: theme.colors.borderLight },
    disabledText: { color: theme.colors.textLight },
  },
};

const SIZE_STYLES: Record<
  ButtonSize,
  { container: ViewStyle; text: TextStyle; iconSize: number }
> = {
  sm: {
    container: {
      // Minimum 44x44 touch target enforced via minHeight/minWidth
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.base,
    },
    text: { fontSize: theme.fontSizes.sm },
    iconSize: 16,
  },
  md: {
    container: {
      minHeight: 44,
      minWidth: 44,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.base,
    },
    text: { fontSize: theme.fontSizes.base },
    iconSize: 18,
  },
  lg: {
    container: {
      minHeight: 52,
      minWidth: 44,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    text: { fontSize: theme.fontSizes.md },
    iconSize: 20,
  },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const containerStyle: ViewStyle[] = [
    styles.base,
    sizeStyle.container,
    isDisabled ? variantStyle.disabledContainer : variantStyle.container,
    style ?? {},
  ];

  const labelStyle: TextStyle[] = [
    styles.label,
    sizeStyle.text,
    isDisabled ? variantStyle.disabledText : variantStyle.text,
    textStyle ?? {},
  ];

  const iconColor = isDisabled
    ? theme.colors.textLight
    : variantStyle.iconColor;

  const renderIcon = () =>
    icon ? (
      <Ionicons
        name={icon}
        size={sizeStyle.iconSize}
        color={iconColor}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    ) : null;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isDisabled ? theme.colors.textLight : variantStyle.iconColor}
          testID={testID ? `${testID}-spinner` : undefined}
        />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'left' && renderIcon()}
          <Text style={labelStyle} numberOfLines={1}>
            {label}
          </Text>
          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.button,
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
});
