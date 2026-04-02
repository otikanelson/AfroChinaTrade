import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { COLLECTION_TAGS, TAG_LABELS } from '../../constants/tags';

export interface FilterOptions {
  statusFilter: 'all' | 'active' | 'inactive';
  discountFilter: 'all' | 'discounted' | 'regular';
  categoryFilter: string;
  tagFilter: string;
  featuredOnly: boolean;
  sellerFavoriteOnly: boolean;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface ProductFiltersDropdownProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: CategoryOption[];
  style?: ViewStyle;
  testID?: string;
  compact?: boolean; // New prop for compact mode
}

export const ProductFiltersDropdown: React.FC<ProductFiltersDropdownProps> = ({
  filters,
  onFiltersChange,
  categories,
  style,
  testID,
  compact = false, // Default to false for backward compatibility
}) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.base,
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      backgroundColor: colors.input,
      paddingHorizontal: spacing.md,
      minHeight: 44,
      paddingVertical: spacing.sm,
    },
    triggerCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      minHeight: 48,
      minWidth: 48,
    },
    triggerCompactActive: {
      borderColor: colors.primary,
      backgroundColor: (colors as any).primaryLight || colors.surface,
    },
    triggerText: {
      fontSize: fontSizes.base,
      color: colors.text,
      marginRight: spacing.xs,
    },
    placeholderText: {
      color: colors.textLight,
    },
    // Modal styles
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      maxHeight: '80%',
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    sheetTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    closeButton: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    section: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    optionText: {
      fontSize: fontSizes.base,
      color: colors.text,
      flex: 1,
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: fontWeights.semibold as any,
    },
    separator: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: spacing.lg,
    },
    sectionSeparator: {
      height: 8,
      backgroundColor: colors.surface,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      borderRadius: borderRadius.base,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearButtonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium as any,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
  });

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.statusFilter !== 'all') count++;
    if (filters.discountFilter !== 'all') count++;
    if (filters.categoryFilter !== 'all') count++;
    if (filters.tagFilter !== 'all') count++;
    if (filters.featuredOnly) count++;
    if (filters.sellerFavoriteOnly) count++;
    return count;
  };

  const getDisplayText = () => {
    const activeCount = getActiveFiltersCount();
    if (activeCount === 0) {
      return 'All Products';
    }
    return `${activeCount} Filter${activeCount > 1 ? 's' : ''} Applied`;
  };

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    onFiltersChange({ ...filters, statusFilter: status });
  };

  const handleDiscountChange = (discount: 'all' | 'discounted' | 'regular') => {
    onFiltersChange({ ...filters, discountFilter: discount });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, categoryFilter: category });
  };

  const handleTagChange = (tag: string) => {
    onFiltersChange({ ...filters, tagFilter: tag });
  };

  const handleFeaturedToggle = () => {
    onFiltersChange({ ...filters, featuredOnly: !filters.featuredOnly });
  };

  const handleSellerFavoriteToggle = () => {
    onFiltersChange({ ...filters, sellerFavoriteOnly: !filters.sellerFavoriteOnly });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      statusFilter: 'all',
      discountFilter: 'all',
      categoryFilter: 'all',
      tagFilter: 'all',
      featuredOnly: false,
      sellerFavoriteOnly: false,
    });
    setModalVisible(false);
  };

  const renderOption = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    key: string
  ) => (
    <TouchableOpacity
      key={key}
      style={styles.optionRow}
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
    >
      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
        {label}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" size={18} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Trigger button */}
      <TouchableOpacity
        style={[
          compact ? styles.triggerCompact : styles.trigger,
          compact && getActiveFiltersCount() > 0 && styles.triggerCompactActive,
        ]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Product filters"
        accessibilityHint={`Currently: ${getDisplayText()}. Tap to change filters.`}
        testID={testID ? `${testID}-trigger` : undefined}
      >
        {compact ? (
          // Compact mode: just show filter icon with badge
          <>
            <Ionicons
              name="filter"
              size={18}
              color={getActiveFiltersCount() > 0 ? colors.primary : colors.textSecondary}
            />
            {getActiveFiltersCount() > 0 && (
              <View style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: colors.primary,
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}>
                <Text style={{
                  color: colors.textInverse,
                  fontSize: 10,
                  fontWeight: '600',
                  lineHeight: 12,
                }}>
                  {getActiveFiltersCount()}
                </Text>
              </View>
            )}
          </>
        ) : (
          // Full mode: show text and chevron
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons
                name="filter"
                size={16}
                color={getActiveFiltersCount() > 0 ? colors.primary : colors.textSecondary}
                style={{ marginRight: spacing.xs }}
              />
              <Text style={styles.triggerText}>
                {getDisplayText()}
              </Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.textSecondary}
            />
          </>
        )}
      </TouchableOpacity>

      {/* Modal picker */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close filters"
        />
        <SafeAreaView style={styles.sheet}>
          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter Products</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
              testID={testID ? `${testID}-close` : undefined}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Status Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              {renderOption('All', filters.statusFilter === 'all', () => handleStatusChange('all'), 'status-all')}
              {renderOption('Active', filters.statusFilter === 'active', () => handleStatusChange('active'), 'status-active')}
              {renderOption('Inactive', filters.statusFilter === 'inactive', () => handleStatusChange('inactive'), 'status-inactive')}
            </View>

            <View style={styles.sectionSeparator} />

            {/* Features Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              {renderOption('Featured Only', filters.featuredOnly, handleFeaturedToggle, 'featured')}
              {renderOption('Seller Favorites Only', filters.sellerFavoriteOnly, handleSellerFavoriteToggle, 'seller-favorite')}
            </View>

            <View style={styles.sectionSeparator} />

            {/* Pricing Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              {renderOption('All Prices', filters.discountFilter === 'all', () => handleDiscountChange('all'), 'discount-all')}
              {renderOption('Discounted', filters.discountFilter === 'discounted', () => handleDiscountChange('discounted'), 'discount-discounted')}
              {renderOption('Regular Price', filters.discountFilter === 'regular', () => handleDiscountChange('regular'), 'discount-regular')}
            </View>

            {/* Categories Section */}
            {categories.length > 0 && (
              <>
                <View style={styles.sectionSeparator} />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Categories</Text>
                  {renderOption('All Categories', filters.categoryFilter === 'all', () => handleCategoryChange('all'), 'category-all')}
                  {categories.map((category) =>
                    renderOption(
                      category.label,
                      filters.categoryFilter === category.value,
                      () => handleCategoryChange(category.value),
                      `category-${category.value}`
                    )
                  )}
                </View>
              </>
            )}

            {/* Tags Section */}
            <View style={styles.sectionSeparator} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              {renderOption('All Tags', filters.tagFilter === 'all', () => handleTagChange('all'), 'tag-all')}
              {COLLECTION_TAGS.map((tag) =>
                renderOption(
                  TAG_LABELS[tag],
                  filters.tagFilter === tag,
                  () => handleTagChange(tag),
                  `tag-${tag}`
                )
              )}
            </View>

            {/* Clear Filters Button */}
            {getActiveFiltersCount() > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllFilters}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};