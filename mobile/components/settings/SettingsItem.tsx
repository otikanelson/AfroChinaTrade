import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsItem as SettingsItemType } from '../../types/settings';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography, fontSizes, fontWeights } from '../../theme/typography';

interface SettingsItemProps {
  item: SettingsItemType;
  onPress?: (item: SettingsItemType) => void;
  onToggle?: (item: SettingsItemType, value: boolean) => void;
  onPickerChange?: (item: SettingsItemType, value: any) => void;
}

export const SettingsItemComponent: React.FC<SettingsItemProps> = ({
  item,
  onPress,
  onToggle,
  onPickerChange,
}) => {
  const { colors } = useTheme();
  const handlePress = () => {
    if (item.disabled) return;
    
    if (item.type === 'navigation' || item.type === 'action') {
      if (item.onPress) {
        item.onPress();
      } else if (onPress) {
        onPress(item);
      }
    } else if (item.type === 'picker') {
      if (onPickerChange) {
        onPickerChange(item, item.value);
      }
    }
  };

  const handleToggle = (value: boolean) => {
    if (item.disabled) return;
    
    if (item.onChange) {
      item.onChange(value);
    } else if (onToggle) {
      onToggle(item, value);
    }
  };

  const renderRightContent = () => {
    switch (item.type) {
      case 'toggle':
        return (
          <Switch
            value={item.value || false}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
            disabled={item.disabled}
          />
        );
      
      case 'picker':
        const selectedOption = item.options?.find(opt => opt.value === item.value);
        return (
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerValue, { color: colors.textSecondary }]}>
              {selectedOption?.label || 'Select'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        );
      
      case 'navigation':
      case 'action':
        return (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        );
      
      default:
        return null;
    }
  };

  const isInteractive = item.type !== 'toggle' && !item.disabled;

  return (
    <View style={[styles.itemWrapper, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.surface }, item.disabled && styles.disabled]}
        onPress={isInteractive ? handlePress : undefined}
        disabled={item.disabled}
        activeOpacity={isInteractive ? 0.7 : 1}
      >
        {/* Left Icon */}
        {item.iconName && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={item.iconName as any}
              size={20}
              color={item.iconColor || colors.primary}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }, item.disabled && { color: colors.textSecondary }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }, item.disabled && { color: colors.textLight }]}>
              {item.subtitle}
            </Text>
          )}
        </View>

        {/* Right Content */}
        <View style={styles.rightContent}>
          {renderRightContent()}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    fontSize: fontSizes.sm,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pickerValue: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
});