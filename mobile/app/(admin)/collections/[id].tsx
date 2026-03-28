import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { FormField } from '../../../components/admin/forms/FormField';
import { PickerField } from '../../../components/admin/forms/PickerField';
import { collectionService } from '../../../services/CollectionService';
import { categoryService } from '../../../services/CategoryService';
import { useTheme } from '../../../contexts/ThemeContext';
import { CollectionFilter, Category, Collection } from '../../../types/product';

const FILTER_TYPES = [
  { 
    label: 'Category', 
    value: 'category',
    icon: 'folder-outline',
    description: 'Filter by product category'
  },
  { 
    label: 'Name Contains', 
    value: 'name_contains',
    icon: 'search-outline',
    description: 'Products containing specific text'
  },
  { 
    label: 'Tag', 
    value: 'tag',
    icon: 'pricetag-outline',
    description: 'Products with specific tags'
  },
  { 
    label: 'Price Range', 
    value: 'price_range',
    icon: 'cash-outline',
    description: 'Products within price range'
  },
  { 
    label: 'Minimum Rating', 
    value: 'rating_min',
    icon: 'star-outline',
    description: 'Products with rating above threshold'
  },
  { 
    label: 'Minimum Discount', 
    value: 'discount_min',
    icon: 'percent-outline',
    description: 'Products with discount percentage'
  },
];

const TAG_OPTIONS = [
  'featured', 'trending', 'new', 'sale', 'bestseller', 'limited', 'premium', 'eco-friendly'
];

export default function EditCollection() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
  });
  
  const [filters, setFilters] = useState<CollectionFilter[]>([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    section: {
      backgroundColor: colors.background,
      marginHorizontal: spacing.base,
      marginVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    filtersContainer: {
      gap: spacing.md,
    },
    filterCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    filterTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    filterTypeText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    removeFilterButton: {
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.errorLight,
    },
    filterInputs: {
      gap: spacing.sm,
    },
    priceRangeContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    priceRangeInput: {
      flex: 1,
    },
    addFilterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    addFilterText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.primary,
    },
    saveButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      margin: spacing.base,
      gap: spacing.sm,
    },
    saveButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    saveButtonDisabled: {
      backgroundColor: colors.disabled,
    },
  });

  useEffect(() => {
    console.log('🔍 Edit collection page loaded with ID:', id);
    if (id) {
      loadCollection();
      loadCategories();
    } else {
      console.log('❌ No ID provided to edit collection page');
      Alert.alert('Error', 'No collection ID provided');
      router.back();
    }
  }, [id]);

  const loadCollection = async () => {
    try {
      console.log('🔍 Loading collection with ID:', id);
      setLoading(true);
      // Since we don't have a getCollection method, we'll get it from the list
      const response = await collectionService.getActiveCollections();
      console.log('📦 Collections response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Found collections:', response.data.length);
        const foundCollection = response.data.find(c => {
          const collectionId = (c as any)._id || c.id;
          return collectionId === id;
        });
        console.log('🔍 Looking for collection with ID:', id);
        console.log('📋 Available collection IDs:', response.data.map(c => (c as any)._id || c.id));
        
        if (foundCollection) {
          console.log('✅ Found collection:', foundCollection.name);
          setCollection(foundCollection);
          setFormData({
            name: foundCollection.name,
            description: foundCollection.description || '',
            displayOrder: foundCollection.displayOrder,
          });
          setFilters(foundCollection.filters);
        } else {
          console.log('❌ Collection not found with ID:', id);
          Alert.alert('Error', 'Collection not found');
          router.back();
        }
      } else {
        console.log('❌ Failed to load collections:', response.error);
        Alert.alert('Error', 'Failed to load collections');
        router.back();
      }
    } catch (error) {
      console.error('❌ Error loading collection:', error);
      Alert.alert('Error', 'Failed to load collection');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const addFilter = () => {
    const newFilter: CollectionFilter = {
      type: 'category',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (index: number, updates: Partial<CollectionFilter>) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], ...updates };
    
    // Reset value when type changes
    if (updates.type && updates.type !== updatedFilters[index].type) {
      updatedFilters[index].value = updates.type === 'price_range' ? { min: 0, max: 0 } : '';
    }
    
    setFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Collection name is required');
      return;
    }

    if (filters.length === 0) {
      Alert.alert('Error', 'At least one filter is required');
      return;
    }

    // Validate filters
    for (const filter of filters) {
      if (!filter.value || (typeof filter.value === 'string' && !filter.value.trim())) {
        Alert.alert('Error', 'All filters must have values');
        return;
      }
    }

    try {
      setSaving(true);
      const collectionId = (collection as any)?._id || id;
      console.log('💾 Saving collection with ID:', collectionId);
      
      const response = await collectionService.updateCollection(collectionId!, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        filters,
        displayOrder: formData.displayOrder,
      });

      if (response.success) {
        Alert.alert('Success', 'Collection updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to update collection');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      Alert.alert('Error', 'Failed to update collection');
    } finally {
      setSaving(false);
    }
  };

  const renderFilterInput = (filter: CollectionFilter, index: number) => {
    switch (filter.type) {
      case 'category':
        return (
          <PickerField
            label="Category"
            value={filter.value as string}
            onValueChange={(value) => updateFilter(index, { value })}
            options={categories.map(cat => ({ label: cat.name, value: cat.name }))}
            placeholder="Select category"
          />
        );

      case 'name_contains':
        return (
          <FormField
            label="Text to search in product names"
            value={filter.value as string}
            onChangeText={(value) => updateFilter(index, { value })}
            placeholder="e.g., wireless, premium, etc."
          />
        );

      case 'tag':
        return (
          <PickerField
            label="Tag"
            value={filter.value as string}
            onValueChange={(value) => updateFilter(index, { value })}
            options={TAG_OPTIONS.map(tag => ({ label: tag, value: tag }))}
            placeholder="Select tag"
          />
        );

      case 'price_range':
        const priceRange = filter.value as { min?: number; max?: number } || {};
        return (
          <View style={styles.priceRangeContainer}>
            <View style={styles.priceRangeInput}>
              <FormField
                label="Min Price"
                value={priceRange.min?.toString() || ''}
                onChangeText={(value) => {
                  const numValue = parseFloat(value) || 0;
                  updateFilter(index, { 
                    value: { ...priceRange, min: numValue } 
                  });
                }}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.priceRangeInput}>
              <FormField
                label="Max Price"
                value={priceRange.max?.toString() || ''}
                onChangeText={(value) => {
                  const numValue = parseFloat(value) || 0;
                  updateFilter(index, { 
                    value: { ...priceRange, max: numValue } 
                  });
                }}
                placeholder="1000000"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 'rating_min':
        return (
          <FormField
            label="Minimum Rating (1-5)"
            value={filter.value?.toString() || ''}
            onChangeText={(value) => {
              const numValue = Math.min(5, Math.max(1, parseFloat(value) || 1));
              updateFilter(index, { value: numValue });
            }}
            placeholder="4.0"
            keyboardType="numeric"
          />
        );

      case 'discount_min':
        return (
          <FormField
            label="Minimum Discount Percentage"
            value={filter.value?.toString() || ''}
            onChangeText={(value) => {
              const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
              updateFilter(index, { value: numValue });
            }}
            placeholder="10"
            keyboardType="numeric"
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Edit Collection" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.container}>
        <Header title="Edit Collection" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Collection not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Edit Collection" showBack />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <FormField
            label="Collection Name"
            value={formData.name}
            onChangeText={(name) => setFormData({ ...formData, name })}
            placeholder="Enter collection name"
            required
          />
          
          <FormField
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(description) => setFormData({ ...formData, description })}
            placeholder="Describe this collection"
            multiline
            numberOfLines={3}
          />
          
          <FormField
            label="Display Order"
            value={formData.displayOrder.toString()}
            onChangeText={(value) => {
              const numValue = parseInt(value) || 0;
              setFormData({ ...formData, displayOrder: numValue });
            }}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        {/* Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filters</Text>
          
          <View style={styles.filtersContainer}>
            {filters.map((filter, index) => (
              <View key={index} style={styles.filterCard}>
                <View style={styles.filterHeader}>
                  <View style={styles.filterTypeContainer}>
                    <Ionicons 
                      name={FILTER_TYPES.find(t => t.value === filter.type)?.icon as any || 'filter'} 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={styles.filterTypeText}>
                      {FILTER_TYPES.find(t => t.value === filter.type)?.label || filter.type}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFilterButton}
                    onPress={() => removeFilter(index)}
                  >
                    <Ionicons name="close" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.filterInputs}>
                  <PickerField
                    label="Filter Type"
                    value={filter.type}
                    onValueChange={(type) => updateFilter(index, { type: type as any })}
                    options={FILTER_TYPES.map(type => ({ 
                      label: type.label, 
                      value: type.value 
                    }))}
                  />
                  
                  {renderFilterInput(filter, index)}
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addFilterButton} onPress={addFilter}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={styles.addFilterText}>Add Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.textInverse} />
        ) : (
          <Ionicons name="checkmark" size={20} color={colors.textInverse} />
        )}
        <Text style={styles.saveButtonText}>
          {saving ? 'Updating...' : 'Update Collection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}