import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../../components/admin/Button';
import { FormField } from '../../../components/admin/forms/FormField';
import { ImagePickerField, PickedImage } from '../../../components/admin/forms/ImagePickerField';
import { PickerField, PickerOption } from '../../../components/admin/forms/PickerField';
import { TagSelector } from '../../../components/admin/forms/TagSelector';
import { SpecificationsTable } from '../../../components/admin/forms/SpecificationsTable';
import { PolicyFields } from '../../../components/admin/forms/PolicyFields';
import { Header } from '../../../components/Header';
import { mobileToastManager } from '../../../utils/toast';
import { productService } from '../../../services/ProductService';
import { supplierService } from '../../../services/SupplierService';
import { categoryService } from '../../../services/CategoryService';
import { subcategoryService } from '../../../services/SubcategoryService';
import { tagService } from '../../../services/TagService';
import { DateField } from '../../../components/admin/forms/DateField';
import { useTheme } from '../../../contexts/ThemeContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Categories will be loaded dynamically from the backend

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------

interface Specification {
  id: string;
  key: string;
  value: string;
}

interface PolicyData {
  paymentPolicy?: string;
  shippingPolicy?: string;
  refundPolicy?: string;
  guidelines?: string;
  suggestions?: string;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  subcategory: string;
  supplier: string;
  images: PickedImage[];
  featured: boolean;
  favorite: boolean;
  discounted: boolean;
  discountAmount: string;
  discountExpiresAt: string;
  isActive: boolean;
  specifications: Specification[];
  policies: PolicyData;
  tags: string[];
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  subcategory?: string;
  supplier?: string;
  supplierId?: string;
  general?: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = 'Product name is required';
  }

  if (!form.description.trim()) {
    errors.description = 'Description is required';
  }

  const price = parseFloat(form.price);
  if (!form.price.trim() || isNaN(price) || price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  const stock = parseInt(form.stock, 10);
  if (form.stock.trim() === '' || isNaN(stock) || stock < 0) {
    errors.stock = 'Stock must be 0 or more';
  }

  if (!form.category) {
    errors.category = 'Category is required';
  }

  if (!form.supplier) {
    errors.supplier = 'Supplier is required';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function NewProductScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const [saving, setSaving] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [suppliers, setSuppliers] = useState<PickerOption[]>([]);
  const [categories, setCategories] = useState<PickerOption[]>([]);
  const [subcategories, setSubcategories] = useState<PickerOption[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    subcategory: '',
    supplier: '',
    images: [],
    featured: false,
    favorite: false,
    discounted: false,
    discountAmount: '',
    discountExpiresAt: '',
    isActive: true,
    specifications: [],
    policies: {},
    tags: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
    loadCategories();
    loadTags();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await supplierService.getSuppliers({ limit: 100 });
      
      if (response.success && response.data) {
        // Handle different response formats - suppliers might be in data.suppliers
        let suppliersArray: any[] = [];
        
        if (Array.isArray(response.data)) {
          suppliersArray = response.data;
        } else if ((response.data as any).suppliers && Array.isArray((response.data as any).suppliers)) {
          suppliersArray = (response.data as any).suppliers;
        }
        
        if (suppliersArray.length > 0) {
          const supplierOptions = suppliersArray.map((supplier: any) => ({
            label: supplier.name,
            value: supplier._id // MongoDB uses '_id'
          }));
          setSuppliers(supplierOptions);
        } else {
          console.warn('No suppliers found in response:', response.data);
        }
      }
    } catch (error: any) {
      console.error('Failed to load suppliers:', error);
      // Only show alert for non-authentication errors
      if (error?.code !== 'NETWORK_ERROR' && error?.code !== 'NO_TOKEN') {
        Alert.alert('Error', 'Failed to load suppliers. Please try again.');
      }
      // For authentication errors, set empty suppliers list
      if (error?.code === 'NO_TOKEN') {
        setSuppliers([]);
      }
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategories();
      
      if (response.success && response.data) {
        const categoryOptions = response.data.map((category: any) => ({
          label: category.name,
          value: category.name
        }));
        setCategories(categoryOptions);
      }
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      // Only show alert for non-authentication errors
      if (error?.code !== 'NETWORK_ERROR' && error?.code !== 'NO_TOKEN') {
        Alert.alert('Error', 'Failed to load categories. Please try again.');
      }
      // For authentication errors, set empty categories list
      if (error?.code === 'NO_TOKEN') {
        setCategories([]);
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubcategories = async (categoryName: string) => {
    if (!categoryName) {
      setSubcategories([]);
      return;
    }
    
    try {
      setLoadingSubcategories(true);
      const response = await subcategoryService.getSubcategoriesByCategory(categoryName);
      
      if (response.success && 'data' in response && response.data && Array.isArray(response.data)) {
        const subcategoryOptions = response.data.map((subcategory: any) => ({
          label: subcategory.name,
          value: subcategory.name
        }));
        setSubcategories(subcategoryOptions);
      } else {
        setSubcategories([]);
      }
    } catch (error: any) {
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const tagNames = await tagService.getTagNames();
      setAvailableTags(tagNames);
    } catch (error: any) {
      console.error('Failed to load tags:', error);
      setAvailableTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  // Generic field updater
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    // Clear error on change
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    // Clear general error when any field changes
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
    
    // Load subcategories when category changes
    if (key === 'category') {
      setForm((prev) => ({ ...prev, subcategory: '' })); // Clear subcategory when category changes
      loadSubcategories(value as string);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: form.category, // Frontend interface expects 'categoryId'
        subcategory: form.subcategory.trim() || undefined,
        supplierId: form.supplier, // Use selected supplier ID
        images: form.images.map((img) => img.uploadedUrl || img.uri),
        isFeatured: form.featured,
        isActive: form.isActive,
        // Add discount if enabled
        discount: form.discounted && form.discountAmount ? parseFloat(form.discountAmount) : 0,
        discountExpiresAt: form.discounted && form.discountExpiresAt ? form.discountExpiresAt : undefined,
        // Convert specifications array to object format for backend
        specifications: form.specifications.reduce((acc, spec) => {
          if (spec.key.trim() && spec.value.trim()) {
            acc[spec.key.trim()] = spec.value.trim();
          }
          return acc;
        }, {} as Record<string, string>),
        // Include policies
        policies: form.policies,
        // Map favorite field to isSellerFavorite for backend
        isSellerFavorite: form.favorite,
      };

      const response = await productService.createProduct(productData);

      if (response.success) {
        mobileToastManager.success('Product created successfully', 'Success');
        router.back();
      } else {
        throw new Error(response.error?.message || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      
      // Handle validation errors from backend
      if (error?.code === 'MISSING_FIELDS' || error?.code === 'VALIDATION_ERROR') {
        const serverErrors: FormErrors = {};
        
        if (error.details) {
          // Map backend field names to form field names
          const fieldMapping: Record<string, keyof FormErrors> = {
            'name': 'name',
            'description': 'description',
            'price': 'price',
            'stock': 'stock',
            'category': 'category',
            'categoryId': 'category',
            'supplier': 'supplier',
            'supplierId': 'supplier'
          };
          
          Object.entries(error.details).forEach(([field, message]) => {
            const formField = fieldMapping[field] || field as keyof FormErrors;
            if (formField in serverErrors || formField === 'name' || formField === 'description' || formField === 'price' || formField === 'stock' || formField === 'category' || formField === 'supplier') {
              serverErrors[formField] = message as string;
            }
          });
        }
        
        // If we have specific field errors, show them
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
        } else {
          // Otherwise show general error
          setErrors({ general: error.message || 'Please check your input and try again.' });
        }
      } else {
        // For other errors, show general error message
        const errorMessage = error?.message || 'Failed to save product. Please try again.';
        setErrors({ general: errorMessage });
      }
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.base,
      paddingBottom: spacing['2xl'],
    },
    errorContainer: {
      backgroundColor: colors.error || '#fee2e2',
      borderColor: colors.error || '#fca5a5',
      borderWidth: 1,
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      marginBottom: spacing.base,
    },
    errorText: {
      color: colors.error || '#dc2626',
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    actions: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    saveButton: {
      width: '100%',
    },
    cancelButton: {
      width: '100%',
    },
    discountPreview: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.base,
      borderWidth: 1,
      borderColor: colors.border,
    },
    discountPreviewLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    pricePreviewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    originalPricePreview: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    discountedPricePreview: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.error || '#FF3B30',
    },
    discountBadgePreview: {
      backgroundColor: colors.error || '#FF3B30',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
    },
    discountBadgeTextPreview: {
      color: colors.textInverse || 'white',
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* General Error Display */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Supplier ID Error (if backend requires it) */}
        {errors.supplier && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Supplier: {errors.supplier}</Text>
          </View>
        )}
        {/* Images */}
        <ImagePickerField
          label="Product Images"
          images={form.images}
          onImagesChange={(imgs) => setField('images', imgs)}
          maxImages={8}
          helperText="Add up to 8 photos"
          testID="new-product-images"
        />

        {/* Name */}
        <FormField
          label="Product Name"
          value={form.name}
          onChangeText={(v) => setField('name', v)}
          placeholder="Enter product name"
          required
          error={errors.name}
          returnKeyType="next"
          testID="new-product-name"
        />

        {/* Description */}
        <FormField
          label="Description"
          value={form.description}
          onChangeText={(v) => setField('description', v)}
          placeholder="Describe your product"
          required
          multiline
          numberOfLines={4}
          error={errors.description}
          testID="new-product-description"
        />

        {/* Price */}
        <FormField
          label="Price"
          value={form.price}
          onChangeText={(v) => setField('price', v)}
          placeholder="0.00"
          required
          keyboardType="decimal-pad"
          error={errors.price}
          testID="new-product-price"
        />

        {/* Stock / Inventory */}
        <FormField
          label="Inventory (Stock)"
          value={form.stock}
          onChangeText={(v) => setField('stock', v)}
          placeholder="0"
          required
          keyboardType="number-pad"
          error={errors.stock}
          testID="new-product-stock"
        />

        {/* Category */}
        <PickerField
          label="Category"
          value={form.category}
          onValueChange={(v) => setField('category', v)}
          options={categories}
          placeholder={loadingCategories ? "Loading categories..." : categories.length === 0 ? "No categories available" : "Select a category"}
          required
          disabled={loadingCategories}
          error={errors.category}
          testID="new-product-category"
        />

        {/* Subcategory */}
        {form.category && (
          <PickerField
            label="Subcategory"
            value={form.subcategory}
            onValueChange={(v) => setField('subcategory', v)}
            options={subcategories}
            placeholder={loadingSubcategories ? "Loading subcategories..." : subcategories.length === 0 ? "No subcategories available" : "Select a subcategory (optional)"}
            disabled={loadingSubcategories}
            error={errors.subcategory}
            testID="new-product-subcategory"
          />
        )}

        {/* Supplier */}
        <PickerField
          label="Supplier"
          value={form.supplier}
          onValueChange={(v) => setField('supplier', v)}
          options={suppliers}
          placeholder={loadingSuppliers ? "Loading suppliers..." : suppliers.length === 0 ? "No suppliers available" : "Select a supplier"}
          required
          disabled={loadingSuppliers}
          error={errors.supplier}
          testID="new-product-supplier"
        />

        {/* Product Status Tags */}
        <TagSelector
          label="Product Status & Features"
          description="Select which features apply to this product"
          tags={[
            { id: 'active', label: 'Active', value: form.isActive },
            { id: 'featured', label: 'Featured', value: form.featured },
            { id: 'favorite', label: 'Seller Favorite', value: form.favorite },
            { id: 'discounted', label: 'Discounted', value: form.discounted },
          ]}
          onTagToggle={(tagId) => {
            switch (tagId) {
              case 'active':
                setField('isActive', !form.isActive);
                break;
              case 'featured':
                setField('featured', !form.featured);
                break;
              case 'favorite':
                setField('favorite', !form.favorite);
                break;
              case 'discounted':
                setField('discounted', !form.discounted);
                break;
            }
          }}
          testID="new-product-status-tags"
        />

        {/* Product Collection Tags */}
        <TagSelector
          label="Collection Tags"
          description="Add tags to help categorize and filter this product"
          tags={availableTags.map(tag => ({
            id: tag,
            label: tag,
            value: form.tags?.includes(tag) || false
          }))}
          onTagToggle={(tagId) => {
            const currentTags = form.tags || [];
            const updatedTags = currentTags.includes(tagId)
              ? currentTags.filter(tag => tag !== tagId)
              : [...currentTags, tagId];
            setField('tags', updatedTags);
          }}
          testID="new-product-collection-tags"
        />

        {/* Conditional discount amount */}
        {form.discounted && (
          <>
            <FormField
              label="Discount Amount (%)"
              value={form.discountAmount}
              onChangeText={(v) => setField('discountAmount', v)}
              placeholder="Enter discount percentage (e.g., 25)"
              keyboardType="decimal-pad"
              helperText="Enter discount percentage (0-100)"
              testID="new-product-discount-amount"
            />

            <DateField
              label="Discount Expires At (Optional)"
              value={form.discountExpiresAt}
              onChangeText={(v) => setField('discountExpiresAt', v)}
              helperText="Leave empty for no expiration"
              testID="new-product-discount-expires"
            />
            
            {/* Discount Preview */}
            {form.price && form.discountAmount && parseFloat(form.discountAmount) > 0 && (
              <View style={styles.discountPreview}>
                <Text style={styles.discountPreviewLabel}>Price Preview:</Text>
                <View style={styles.pricePreviewContainer}>
                  <Text style={styles.originalPricePreview}>
                    ₦{parseFloat(form.price).toLocaleString()}
                  </Text>
                  <Text style={styles.discountedPricePreview}>
                    ₦{Math.round(parseFloat(form.price) * (1 - parseFloat(form.discountAmount) / 100)).toLocaleString()}
                  </Text>
                  <View style={styles.discountBadgePreview}>
                    <Text style={styles.discountBadgeTextPreview}>{form.discountAmount}% OFF</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* Product Specifications */}
        <SpecificationsTable
          label="Product Specifications"
          specifications={form.specifications}
          onSpecificationsChange={(specs) => setField('specifications', specs)}
          helperText="Add detailed specifications like size, color, material, etc."
          testID="new-product-specifications"
        />

        {/* Policies and Guidelines */}
        <PolicyFields
          label="Policies & Guidelines"
          policies={form.policies}
          onPoliciesChange={(policies) => setField('policies', policies)}
          helperText="Optional: Add payment, shipping, and refund policies to help customers understand your terms"
          testID="new-product-policies"
        />

        {/* Submit */}
        <View style={styles.actions}>
          <Button
            label="Save Product"
            onPress={handleSubmit}
            loading={saving}
            icon="checkmark-circle-outline"
            size="lg"
            style={styles.saveButton}
            testID="new-product-save"
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            size="lg"
            disabled={saving}
            style={styles.cancelButton}
            testID="new-product-cancel"
          />
        </View>
      </ScrollView>
    </View>
  );
}
