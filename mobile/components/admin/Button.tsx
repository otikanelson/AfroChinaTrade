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
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();
  
  const VARIANT_STYLES: Record<
    ButtonVariant,
    { container: ViewStyle; text: TextStyle; iconColor: string; disabledContainer: ViewStyle; disabledText: TextStyle }
  > = {
    primary: {
      container: { 
        backgroundColor: colors.primary,
        ...shadows.md,
      },
      text: { color: colors.textInverse },
      iconColor: colors.textInverse,
      disabledContainer: { 
        backgroundColor: colors.borderLight,
        ...shadows.sm,
      },
      disabledText: { color: colors.textLight },
    },
    secondary: {
      container: {
        backgroundColor: colors.background,
        borderWidth: 1.5,
        borderColor: colors.primary,
        ...shadows.sm,
      },
      text: { color: colors.primary },
      iconColor: colors.primary,
      disabledContainer: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.borderLight,
      },
      disabledText: { color: colors.textLight },
    },
    destructive: {
      container: { 
        backgroundColor: colors.error,
        ...shadows.md,
      },
      text: { color: colors.textInverse },
      iconColor: colors.textInverse,
      disabledContainer: { 
        backgroundColor: colors.borderLight,
        ...shadows.sm,
      },
      disabledText: { color: colors.textLight },
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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
      },
      text: { 
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.semibold as any,
      },
      iconSize: 16,
    },
    md: {
      container: {
        minHeight: 48,
        minWidth: 44,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
      },
      text: { 
        fontSize: fontSizes.base,
        fontWeight: fontWeights.semibold as any,
      },
      iconSize: 18,
    },
    lg: {
      container: {
        minHeight: 52,
        minWidth: 44,
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.xl,
      },
      text: { 
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.bold as any,
      },
      iconSize: 20,
    },
  };

  const isDisabled = disabled || loading;
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const containerStyle: ViewStyle[] = [
    {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    sizeStyle.container,
    isDisabled ? variantStyle.disabledContainer : variantStyle.container,
    style ?? {},
  ];

  const labelStyle: TextStyle[] = [
    {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium as any,
    },
    sizeStyle.text,
    isDisabled ? variantStyle.disabledText : variantStyle.text,
    textStyle ?? {},
  ];

  const iconColor = isDisabled
    ? colors.textLight
    : variantStyle.iconColor;

  const renderIcon = () =>
    icon ? (
      <Ionicons
        name={icon}
        size={sizeStyle.iconSize}
        color={iconColor}
        style={iconPosition === 'left' ? { marginRight: spacing.xs } : { marginLeft: spacing.xs }}
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
          color={isDisabled ? colors.textLight : variantStyle.iconColor}
          testID={testID ? `${testID}-spinner` : undefined}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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


