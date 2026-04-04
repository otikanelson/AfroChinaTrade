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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { FormField } from '../../../components/admin/forms/FormField';
import { PickerField } from '../../../components/admin/forms/PickerField';
import { collectionService } from '../../../services/CollectionService';
import { categoryService } from '../../../services/CategoryService';
import { tagService } from '../../../services/TagService';
import { useTheme } from '../../../contexts/ThemeContext';
import { CollectionFilter, Category } from '../../../types/product';

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

export default function CreateCollection() {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  
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
    // Step Indicator
    stepIndicator: {
      backgroundColor: colors.background,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stepContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    step: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepNumber: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.textLight,
    },
    stepNumberActive: {
      color: colors.textInverse,
    },
    stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
    },
    stepLineActive: {
      backgroundColor: colors.primary,
    },
    stepLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    stepLabel: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      flex: 1,
      textAlign: 'center',
    },
    stepLabelActive: {
      color: colors.primary,
      fontWeight: fontWeights.semibold,
    },
    // Step Content
    stepContent: {
      flex: 1,
      padding: spacing.base,
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    stepTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    stepDescription: {
      fontSize: fontSizes.base,
      color: colors.textLight,
      marginBottom: spacing.lg,
      lineHeight: 22,
    },
    formSection: {
      gap: spacing.base,
    },
    fieldHint: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      marginTop: -spacing.sm,
      fontStyle: 'italic',
    },
    // Filter Cards
    filtersContainer: {
      gap: spacing.base,
    },
    filterCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    filterCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    filterCardTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    filterCardTitleText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    removeFilterButton: {
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.error + '20',
    },
    filterDescription: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
      marginBottom: spacing.md,
      fontStyle: 'italic',
    },
    addFilterCard: {
      backgroundColor: colors.primaryLight + '20',
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primary + '30',
      borderStyle: 'dashed',
    },
    addFilterText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      marginTop: spacing.sm,
    },
    addFilterSubtext: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    // Review Section
    reviewSection: {
      gap: spacing.base,
    },
    reviewCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewCardTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    reviewItem: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    reviewLabel: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
      width: 80,
      fontWeight: fontWeights.medium,
    },
    reviewValue: {
      fontSize: fontSizes.sm,
      color: colors.text,
      flex: 1,
    },
    reviewFilterItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    reviewFilterText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      flex: 1,
    },
    // Navigation
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    backButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextButton: {
      backgroundColor: colors.primary,
    },
    nextButtonDisabled: {
      backgroundColor: colors.textLight,
    },
    navButtonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    backButtonText: {
      color: colors.text,
    },
    nextButtonText: {
      color: colors.textInverse,
    },
    createButton: {
      backgroundColor: colors.success,
    },
    createButtonText: {
      color: colors.textInverse,
    },
    // Utility
    priceRangeContainer: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    priceInput: {
      flex: 1,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      gap: spacing.sm,
    },
    loadingText: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.warning + '20',
      borderRadius: borderRadius.sm,
      gap: spacing.sm,
    },
    warningText: {
      fontSize: fontSizes.sm,
      color: colors.warning,
    },
  });

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        console.error('Failed to load categories:', response.error);
        Alert.alert('Warning', 'Failed to load categories. Category filters may not work properly.');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Warning', 'Failed to load categories. Category filters may not work properly.');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      setTagsLoading(true);
      const tagNames = await tagService.getTagNames();
      setAvailableTags(tagNames);
    } catch (error) {
      console.error('Error loading tags:', error);
      Alert.alert('Warning', 'Failed to load tags. Tag filters may not work properly.');
      setAvailableTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleAddFilter = () => {
    setFilters([...filters, { type: 'category', value: '', operator: 'equals' }]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, field: keyof CollectionFilter, value: any) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };

  const renderFilterValue = (filter: CollectionFilter, index: number) => {
    switch (filter.type) {
      case 'category':
        if (categoriesLoading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          );
        }
        
        const categoryItems = (categories || []).map(cat => ({ 
          label: cat.name, 
          value: cat.name 
        }));
        
        if (categoryItems.length === 0) {
          return (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={styles.warningText}>No categories available</Text>
            </View>
          );
        }
        
        return (
          <PickerField
            label="Category"
            value={filter.value as string}
            onValueChange={(value) => handleFilterChange(index, 'value', value)}
            options={categoryItems}
            placeholder="Select category"
          />
        );
      
      case 'tag':
        return (
          <PickerField
            label="Tag"
            value={filter.value as string}
            onValueChange={(value) => handleFilterChange(index, 'value', value)}
            options={availableTags.map(tag => ({ label: tag, value: tag }))}
            placeholder="Select tag"
          />
        );
      
      case 'name_contains':
        return (
          <FormField
            label="Search Text"
            value={filter.value as string}
            onChangeText={(value) => handleFilterChange(index, 'value', value)}
            placeholder="e.g., winter, shoes, phone"
          />
        );
      
      case 'price_range':
        const priceRange = (filter.value as any) || {};
        return (
          <View style={styles.priceRangeContainer}>
            <View style={styles.priceInput}>
              <FormField
                label="Min Price"
                value={priceRange.min !== undefined ? priceRange.min.toString() : ''}
                onChangeText={(value) => {
                  const currentRange = (filter.value as any) || {};
                  handleFilterChange(index, 'value', { 
                    ...currentRange, 
                    min: value ? parseFloat(value) : undefined 
                  });
                }}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={styles.priceInput}>
              <FormField
                label="Max Price"
                value={priceRange.max !== undefined ? priceRange.max.toString() : ''}
                onChangeText={(value) => {
                  const currentRange = (filter.value as any) || {};
                  handleFilterChange(index, 'value', { 
                    ...currentRange, 
                    max: value ? parseFloat(value) : undefined 
                  });
                }}
                keyboardType="numeric"
                placeholder="No limit"
              />
            </View>
          </View>
        );
      
      case 'rating_min':
        return (
          <FormField
            label="Minimum Rating (1-5)"
            value={(filter.value || '').toString()}
            onChangeText={(value) => handleFilterChange(index, 'value', value ? parseFloat(value) : '')}
            keyboardType="numeric"
            placeholder="e.g., 4.0"
          />
        );
      
      case 'discount_min':
        return (
          <FormField
            label="Minimum Discount (%)"
            value={(filter.value || '').toString()}
            onChangeText={(value) => handleFilterChange(index, 'value', value ? parseFloat(value) : '')}
            keyboardType="numeric"
            placeholder="e.g., 10"
          />
        );
      
      default:
        return null;
    }
  };

  const canProceedToStep2 = () => {
    return formData.name.trim().length > 0;
  };

  const canProceedToStep3 = () => {
    return filters.length > 0 && filters.every(filter => {
      if (!filter.value || (typeof filter.value === 'string' && !filter.value.trim())) {
        return false;
      }
      return true;
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[styles.step, currentStep >= 1 && styles.stepActive]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
        <View style={[styles.step, currentStep >= 2 && styles.stepActive]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
        </View>
        <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
        <View style={[styles.step, currentStep >= 3 && styles.stepActive]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
        </View>
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>Basic Info</Text>
        <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>Filters</Text>
        <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>Review</Text>
      </View>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Collection Details</Text>
      </View>
      <Text style={styles.stepDescription}>
        Give your collection a name and description that customers will see.
      </Text>
      
      <View style={styles.formSection}>
        <FormField
          label="Collection Name"
          value={formData.name}
          onChangeText={(value) => setFormData({ ...formData, name: value })}
          placeholder="e.g., Winter Sale, Best Sellers, New Arrivals"
          required
        />
        
        <FormField
          label="Description (Optional)"
          value={formData.description}
          onChangeText={(value) => setFormData({ ...formData, description: value })}
          placeholder="Brief description to help customers understand this collection"
          multiline
          numberOfLines={3}
        />
        
        <FormField
          label="Display Priority"
          value={formData.displayOrder.toString()}
          onChangeText={(value) => setFormData({ ...formData, displayOrder: parseInt(value) || 0 })}
          placeholder="0"
          keyboardType="numeric"
        />
        <Text style={styles.fieldHint}>Lower numbers appear first (0 = highest priority)</Text>
      </View>
    </View>
  );

  const renderFilterCard = (filter: CollectionFilter, index: number) => {
    const filterType = FILTER_TYPES.find(f => f.value === filter.type);
    
    return (
      <View key={`filter-${index}-${filter.type}`} style={styles.filterCard}>
        <View style={styles.filterCardHeader}>
          <View style={styles.filterCardTitle}>
            <Ionicons 
              name={filterType?.icon as any || 'filter-outline'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={styles.filterCardTitleText}>
              {filterType?.label || 'Filter'} #{index + 1}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeFilterButton}
            onPress={() => handleRemoveFilter(index)}
          >
            <Ionicons name="close" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.filterDescription}>
          {filterType?.description || 'Configure this filter'}
        </Text>
        
        <PickerField
          label="Filter Type"
          value={filter.type}
          onValueChange={(value) => {
            // Set appropriate default value based on filter type
            let defaultValue: any = '';
            switch (value) {
              case 'price_range':
                defaultValue = { min: undefined, max: undefined };
                break;
              case 'rating_min':
              case 'discount_min':
                defaultValue = '';
                break;
              default:
                defaultValue = '';
            }
            
            // Update both type and value in a single state update to avoid stale closure issues
            const updatedFilters = [...filters];
            updatedFilters[index] = { 
              ...updatedFilters[index], 
              type: value as CollectionFilter['type'],
              value: defaultValue 
            };
            
            setFilters(updatedFilters);
          }}
          options={[
            { label: 'Category', value: 'category' },
            { label: 'Name Contains', value: 'name_contains' },
            { label: 'Tag', value: 'tag' },
            { label: 'Price Range', value: 'price_range' },
            { label: 'Minimum Rating', value: 'rating_min' },
            { label: 'Minimum Discount', value: 'discount_min' },
          ]}
          placeholder="Select filter type"
        />
        
        {renderFilterValue(filter, index)}
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="funnel-outline" size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Product Filters</Text>
      </View>
      <Text style={styles.stepDescription}>
        Define rules to automatically include products in this collection.
      </Text>
      
      <View style={styles.filtersContainer}>
        {filters.map((filter, index) => renderFilterCard(filter, index))}
        
        <TouchableOpacity style={styles.addFilterCard} onPress={handleAddFilter}>
          <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
          <Text style={styles.addFilterText}>Add Filter Rule</Text>
          <Text style={styles.addFilterSubtext}>
            {filters.length === 0 ? 'Collections need at least one filter' : 'Add another condition'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="funnel-outline" size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Product Filters</Text>
      </View>
      <Text style={styles.stepDescription}>
        Define rules to automatically include products in this collection.
      </Text>
      
      <View style={styles.filtersContainer}>
        {filters.map((filter, index) => renderFilterCard(filter, index))}
        
        <TouchableOpacity style={styles.addFilterCard} onPress={handleAddFilter}>
          <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
          <Text style={styles.addFilterText}>Add Filter Rule</Text>
          <Text style={styles.addFilterSubtext}>
            {filters.length === 0 ? 'Collections need at least one filter' : 'Add another condition'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ;

  const renderReview = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
        <Text style={styles.stepTitle}>Review & Create</Text>
      </View>
      <Text style={styles.stepDescription}>
        Review your collection settings before creating.
      </Text>
      
      <View style={styles.reviewSection}>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardTitle}>Collection Info</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Name:</Text>
            <Text style={styles.reviewValue}>{formData.name || 'Untitled Collection'}</Text>
          </View>
          {formData.description && (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Description:</Text>
              <Text style={styles.reviewValue}>{formData.description}</Text>
            </View>
          )}
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Priority:</Text>
            <Text style={styles.reviewValue}>{formData.displayOrder}</Text>
          </View>
        </View>
        
        <View style={styles.reviewCard}>
          <Text style={styles.reviewCardTitle}>Filters ({filters.length})</Text>
          {filters.map((filter, index) => {
            const filterType = FILTER_TYPES.find(f => f.value === filter.type);
            return (
              <View key={index} style={styles.reviewFilterItem}>
                <Ionicons 
                  name={filterType?.icon as any || 'filter-outline'} 
                  size={16} 
                  color={colors.textLight} 
                />
                <Text style={styles.reviewFilterText}>
                  {filterType?.label}: {typeof filter.value === 'object' 
                    ? `${(filter.value as any).min || 0} - ${(filter.value as any).max || '∞'}`
                    : filter.value}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Collection name is required');
      return;
    }

    if (filters.length === 0) {
      Alert.alert('Error', 'At least one filter is required');
      return;
    }

    // Validate filters
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      if (!filter.value || (typeof filter.value === 'string' && !filter.value.trim())) {
        Alert.alert('Error', `Filter ${i + 1} value is required`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const response = await collectionService.createCollection(
        formData.name,
        filters,
        formData.description || undefined,
        formData.displayOrder
      );

      if (response.success) {
        Alert.alert('Success', 'Collection created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderFilters();
      case 3:
        return renderReview();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Create Collection" showBack />
      
      {renderStepIndicator()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>
      
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={[styles.navButton, styles.backButton]} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
            <Text style={[styles.navButtonText, styles.backButtonText]}>Back</Text>
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1 }} />
        
        {currentStep < 3 ? (
          <TouchableOpacity 
            style={[
              styles.navButton, 
              styles.nextButton,
              (currentStep === 1 && !canProceedToStep2()) || (currentStep === 2 && !canProceedToStep3()) 
                ? styles.nextButtonDisabled 
                : null
            ]} 
            onPress={handleNext}
            disabled={(currentStep === 1 && !canProceedToStep2()) || (currentStep === 2 && !canProceedToStep3())}
          >
            <Text style={[styles.navButtonText, styles.nextButtonText]}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.navButton, styles.createButton]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Ionicons name="checkmark" size={20} color={colors.textInverse} />
            )}
            <Text style={[styles.navButtonText, styles.createButtonText]}>
              {loading ? 'Creating...' : 'Create Collection'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}