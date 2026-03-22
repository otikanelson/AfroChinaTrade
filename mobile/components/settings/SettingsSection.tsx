import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsSection as SettingsSectionType, SettingsItem } from '../../types/settings';
import { SettingsItemComponent } from './SettingsItem';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography, fontSizes, fontWeights } from '../../theme/typography';

interface SettingsSectionProps {
  section: SettingsSectionType;
  onItemPress?: (item: SettingsItem) => void;
  onToggle?: (item: SettingsItem, value: boolean) => void;
  onPickerChange?: (item: SettingsItem, value: any) => void;
}

export const SettingsSectionComponent: React.FC<SettingsSectionProps> = ({
  section,
  onItemPress,
  onToggle,
  onPickerChange,
}) => {
  const { colors } = useTheme();
  
  if (section.items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        {section.icon && (
          <Ionicons
            name={section.icon as any}
            size={16}
            color={colors.textSecondary}
            style={styles.headerIcon}
          />
        )}
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>{section.title}</Text>
      </View>

      {/* Section Items */}
      <View style={[styles.itemsContainer, { backgroundColor: colors.background }]}>
        {section.items.map((item, index) => (
          <SettingsItemComponent
            key={item.id}
            item={item}
            onPress={onItemPress}
            onToggle={onToggle}
            onPickerChange={onPickerChange}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerIcon: {
    marginRight: spacing.xs,
  },
  headerTitle: {
    ...typography.h4,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
});