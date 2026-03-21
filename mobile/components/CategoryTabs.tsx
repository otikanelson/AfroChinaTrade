import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryPress: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryPress,
}) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingHorizontal: spacing.base, gap: spacing.sm }]}
    >
      {categories.map((category) => {
        const isActive = category === activeCategory;
        return (
          <TouchableOpacity
            key={category}
            style={[styles.tab, { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }]}
            onPress={() => onCategoryPress(category)}
          >
            <Text style={[
              styles.tabText, 
              { 
                fontSize: fontSizes.base, 
                fontWeight: isActive ? fontWeights.semibold : fontWeights.medium,
                color: isActive ? colors.primary : colors.textSecondary 
              }
            ]}>
              {category}
            </Text>
            {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.primary, borderRadius: borderRadius.sm }]} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  content: {
    // Styles applied inline
  },
  tab: {
    position: 'relative',
  },
  tabText: {
    // Styles applied inline
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    height: 3,
  },
});
