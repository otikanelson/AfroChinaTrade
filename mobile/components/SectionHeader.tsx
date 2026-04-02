import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { NavigationSource, CollectionType } from '../types/navigation';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  navigationSource?: NavigationSource;
  collectionType?: CollectionType;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  navigationSource,
  collectionType,
  icon,
  iconColor,
}) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();
  const router = useRouter();

  const handleActionPress = () => {
    if (onActionPress) {
      onActionPress();
    } else if (navigationSource && collectionType) {
      router.push({
        pathname: '/product-listing',
        params: { source: navigationSource, collectionType, title },
      });
    }
  };

  const accentColor = iconColor || colors.primary;

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.base, marginBottom: spacing.sm }]}>
      {/* Left: icon + title block */}
      <View style={styles.leftBlock}>
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

        {/* Icon + text pill */}
        <View style={[
          styles.titlePill,
          {
            backgroundColor: `${accentColor}14`,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          }
        ]}>
          {icon && (
            <Ionicons
              name={icon}
              size={16}
              color={accentColor}
              style={styles.icon}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={[styles.title, {
              fontSize: fontSizes.base,
              fontWeight: fontWeights.bold,
              color: colors.text,
            }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, {
                fontSize: fontSizes.xs,
                color: colors.textSecondary,
                fontWeight: fontWeights.medium,
              }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Right: action button */}
      {actionText && (onActionPress || (navigationSource && collectionType)) && (
        <TouchableOpacity
          onPress={handleActionPress}
          style={[styles.actionButton, {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.sm,
          }]}
        >
          <Text style={[styles.actionText, {
            fontSize: fontSizes.xs,
            color: colors.primary,
            fontWeight: fontWeights.semibold,
            marginRight: 2,
          }]}>
            {actionText}
          </Text>
          <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 6,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 1,
  },
  subtitle: {},
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionText: {},
});
