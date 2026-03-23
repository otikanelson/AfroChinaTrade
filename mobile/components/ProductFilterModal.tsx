import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { ProductFilters } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { fontSizes, fontWeights } from '../theme/typography';
import { CustomModal } from './ui/CustomModal';
import { Toast } from './ui/Toast';

interface ProductFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
  collectionType: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'trending', label: 'Most Popular' },
];

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Health & Beauty',
  'Books & Media',
  'Toys & Games',
  'Automotive',
  'Food & Beverages',
  'Office Supplies',
];

export const ProductFilterModal: React.FC<ProductFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters = {},
  collectionType,
}) => {
  const { colors: themeColors } = useTheme();
  const toast = useToast();
  
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() || '');

  useEffect(() => {
    setFilters(initialFilters);
    setMinPrice(initialFilters.minPrice?.toString() || '');
    setMaxPrice(initialFilters.maxPrice?.toString() || '');
  }, [initialFilters]);

  const handleApplyFilters = () => {
    const updatedFilters: ProductFilters = {
      ...filters,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };

    // Validate price range
    if (updatedFilters.minPrice && updatedFilters.maxPrice) {
      if (updatedFilters.minPrice > updatedFilters.maxPrice) {
        toast.error('Minimum price cannot be greater than maximum price');
        return;
      }
    }

    onApplyFilters(updatedFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: ProductFilters = {};
    setFilters(clearedFilters);
    setMinPrice('');
    setMaxPrice('');
    onApplyFilters(clearedFilters);
    onClose();
  };

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xs,
    },
    sortOptionSelected: {
      backgroundColor: colors.primaryLight,
    },
    sortOptionText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    sortOptionTextSelected: {
      color: colors.primary,
      fontWeight: fontWeights.medium,
    },
    categoryOption: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryOptionText: {
      fontSize: fontSizes.sm,
      color: colors.text,
    },
    categoryOptionTextSelected: {
      color: colors.textInverse,
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    priceInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: fontSizes.sm,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    priceSeparator: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.md,
    },
    footerButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    clearButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    applyButton: {
      backgroundColor: colors.primary,
    },
    footerButtonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
    },
    clearButtonText: {
      color: colors.text,
    },
    applyButtonText: {
      color: colors.textInverse,
    },
  });

  return (
    <CustomModal
      visible={visible}
      title="Filter & Sort"
      onClose={onClose}
      size="large"
      position="bottom"
      scrollable={true}
    >
      {/* Sort Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              filters.sortBy === option.value && styles.sortOptionSelected,
            ]}
            onPress={() => updateFilter('sortBy', option.value)}
          >
            <Ionicons
              name={filters.sortBy === option.value ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={filters.sortBy === option.value ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.sortOptionText,
                filters.sortBy === option.value && styles.sortOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      {collectionType === 'all' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryOption,
                  filters.category === category && styles.categoryOptionSelected,
                ]}
                onPress={() => 
                  updateFilter('category', filters.category === category ? undefined : category)
                }
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    filters.category === category && styles.categoryOptionTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Price Range */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Range (₦)</Text>
        <View style={styles.priceContainer}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min"
            placeholderTextColor={colors.textLight}
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
          <Text style={styles.priceSeparator}>to</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max"
            placeholderTextColor={colors.textLight}
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerButton, styles.clearButton]} onPress={handleClearFilters}>
          <Text style={[styles.footerButtonText, styles.clearButtonText]}>Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.applyButton]} onPress={handleApplyFilters}>
          <Text style={[styles.footerButtonText, styles.applyButtonText]}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Component */}
      <Toast {...toast} />
    </CustomModal>
  );
};

export default ProductFilterModal;