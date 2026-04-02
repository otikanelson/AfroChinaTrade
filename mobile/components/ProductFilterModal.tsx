import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ProductFilters } from '../types/navigation';
import { COLLECTION_TAGS, TAG_LABELS } from '../constants/tags';

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
  'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
  'Health & Beauty', 'Books & Media', 'Toys & Games', 'Automotive',
  'Food & Beverages', 'Office Supplies',
];

export const ProductFilterModal: React.FC<ProductFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters = {},
  collectionType,
}) => {
  const { colors } = useTheme();

  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() || '');
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
      setMinPrice(initialFilters.minPrice?.toString() || '');
      setMaxPrice(initialFilters.maxPrice?.toString() || '');
      setPriceError('');
    }
  }, [visible]);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    if (min !== undefined && max !== undefined && min > max) {
      setPriceError('Min price cannot exceed max price');
      return;
    }
    setPriceError('');
    onApplyFilters({ ...filters, minPrice: min, maxPrice: max });
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    setMinPrice('');
    setMaxPrice('');
    setPriceError('');
    onApplyFilters({});
    onClose();
  };

  const s = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
      padding: 20,
    },
    sheet: {
      backgroundColor: colors.background,
      padding: 5,
      borderRadius: 20,
      maxHeight: '85%',
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    closeBtn: {
      padding: 4,
    },
    scroll: {
      flexGrow: 0,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sortRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 4,
    },
    sortRowActive: {
      backgroundColor: colors.primaryLight,
    },
    sortLabel: {
      fontSize: 15,
      color: colors.text,
      marginLeft: 10,
    },
    sortLabelActive: {
      color: colors.primary,
      fontWeight: '500',
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: colors.text,
    },
    chipTextActive: {
      color: '#fff',
      fontWeight: '500',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    priceInput: {
      flex: 1,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    priceSep: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    priceError: {
      fontSize: 12,
      color: '#e53935',
      marginTop: 6,
    },
    footer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    clearBtn: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    clearBtnText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    applyBtn: {
      flex: 1,
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    applyBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={s.sheet}>
            <View style={s.handle} />

            {/* Header */}
            <View style={s.header}>
              <Text style={s.headerTitle}>Filter & Sort</Text>
              <TouchableOpacity style={s.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable content */}
            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Sort */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>Sort By</Text>
                {SORT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[s.sortRow, filters.sortBy === opt.value && s.sortRowActive]}
                    onPress={() => updateFilter('sortBy', filters.sortBy === opt.value ? undefined : opt.value as any)}
                  >
                    <Ionicons
                      name={filters.sortBy === opt.value ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={filters.sortBy === opt.value ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[s.sortLabel, filters.sortBy === opt.value && s.sortLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category */}
              {collectionType === 'all' && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>Category</Text>
                  <View style={s.chips}>
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[s.chip, filters.category === cat && s.chipActive]}
                        onPress={() => updateFilter('category', filters.category === cat ? undefined : cat)}
                      >
                        <Text style={[s.chipText, filters.category === cat && s.chipTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Tags */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>Tags</Text>
                <View style={s.chips}>
                  {COLLECTION_TAGS.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[s.chip, filters.tag === tag && s.chipActive]}
                      onPress={() => updateFilter('tag', filters.tag === tag ? undefined : tag)}
                    >
                      <Text style={[s.chipText, filters.tag === tag && s.chipTextActive]}>{TAG_LABELS[tag]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>Price Range (₦)</Text>
                <View style={s.priceRow}>
                  <TextInput
                    style={s.priceInput}
                    placeholder="Min"
                    placeholderTextColor={colors.textSecondary}
                    value={minPrice}
                    onChangeText={v => { setMinPrice(v); setPriceError(''); }}
                    keyboardType="numeric"
                  />
                  <Text style={s.priceSep}>–</Text>
                  <TextInput
                    style={s.priceInput}
                    placeholder="Max"
                    placeholderTextColor={colors.textSecondary}
                    value={maxPrice}
                    onChangeText={v => { setMaxPrice(v); setPriceError(''); }}
                    keyboardType="numeric"
                  />
                </View>
                {!!priceError && <Text style={s.priceError}>{priceError}</Text>}
              </View>

              {/* Rating */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>Minimum Rating</Text>
                <View style={s.chips}>
                  {[4, 3, 2, 1].map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[s.chip, filters.minRating === r && s.chipActive]}
                      onPress={() => updateFilter('minRating', filters.minRating === r ? undefined : r)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[s.chipText, filters.minRating === r && s.chipTextActive]}>{r}</Text>
                        <Ionicons name="star" size={12} color={filters.minRating === r ? '#fff' : colors.primary} />
                        <Text style={[s.chipText, filters.minRating === r && s.chipTextActive]}>& up</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={s.footer}>
              <TouchableOpacity style={s.clearBtn} onPress={handleClear}>
                <Text style={s.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.applyBtn} onPress={handleApply}>
                <Text style={s.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ProductFilterModal;
