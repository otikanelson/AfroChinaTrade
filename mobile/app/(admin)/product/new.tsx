import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../../components/admin/Button';
import { FormField } from '../../../components/admin/forms/FormField';
import { ImagePickerField, PickedImage } from '../../../components/admin/forms/ImagePickerField';
import { PickerField, PickerOption } from '../../../components/admin/forms/PickerField';
import { SwitchField } from '../../../components/admin/forms/SwitchField';
import { SpecificationsTable } from '../../../components/admin/forms/SpecificationsTable';
import { PolicyFields } from '../../../components/admin/forms/PolicyFields';
import { mobileToastManager } from '../../../utils/toast';
import { productService } from '../../../services/ProductService';
import { supplierService } from '../../../services/SupplierService';
import { theme } from '../../../theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: PickerOption[] = [
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Fashion', value: 'Fashion' },
  { label: 'Home & Garden', value: 'Home & Garden' },
  { label: 'Sports & Outdoors', value: 'Sports & Outdoors' },
  { label: 'Books & Media', value: 'Books & Media' },
  { label: 'Health & Beauty', value: 'Health & Beauty' },
  { label: 'Automotive', value: 'Automotive' },
  { label: 'Toys & Games', value: 'Toys & Games' },
];

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
  supplier: string;
  images: PickedImage[];
  featured: boolean;
  favorite: boolean;
  discounted: boolean;
  discountAmount: string;
  isActive: boolean;
  specifications: Specification[];
  policies: PolicyData;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
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
  const [saving, setSaving] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [suppliers, setSuppliers] = useState<PickerOption[]>([]);

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    supplier: '',
    images: [],
    featured: false,
    favorite: false,
    discounted: false,
    discountAmount: '',
    isActive: true,
    specifications: [],
    policies: {},
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
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
        supplierId: form.supplier, // Use selected supplier ID
        images: form.images.map((img) => img.uploadedUrl || img.uri),
        isFeatured: form.featured,
        isActive: form.isActive,
        // Add discount if enabled
        discount: form.discounted && form.discountAmount ? parseFloat(form.discountAmount) : 0,
        // Convert specifications array to object format for backend
        specifications: form.specifications.reduce((acc, spec) => {
          if (spec.key.trim() && spec.value.trim()) {
            acc[spec.key.trim()] = spec.value.trim();
          }
          return acc;
        }, {} as Record<string, string>),
        // Include policies
        policies: form.policies,
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

  return (
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
          options={CATEGORIES}
          placeholder="Select a category"
          required
          error={errors.category}
          testID="new-product-category"
        />

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

        {/* Toggles */}
        <SwitchField
          label="Active"
          value={form.isActive}
          onValueChange={(v) => setField('isActive', v)}
          description="Product is visible to customers when active"
          testID="new-product-active"
        />

        <SwitchField
          label="Featured"
          value={form.featured}
          onValueChange={(v) => setField('featured', v)}
          description="Show this product in featured sections"
          testID="new-product-featured"
        />

        <SwitchField
          label="Favorite"
          value={form.favorite}
          onValueChange={(v) => setField('favorite', v)}
          description="Mark as a seller favorite"
          testID="new-product-favorite"
        />

        <SwitchField
          label="Discounted"
          value={form.discounted}
          onValueChange={(v) => setField('discounted', v)}
          description="Apply a discount to this product"
          testID="new-product-discounted"
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
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing['2xl'],
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  errorText: {
    color: '#dc2626',
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
  },
  actions: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  saveButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
  discountPreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  discountPreviewLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pricePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  originalPricePreview: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountedPricePreview: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: '#FF3B30',
  },
  discountBadgePreview: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.base,
  },
  discountBadgeTextPreview: {
    color: 'white',
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
  },
});
