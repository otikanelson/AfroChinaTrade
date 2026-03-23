import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../components/admin/Button';
import { FormField } from '../../../components/admin/forms/FormField';
import { ImagePickerField, PickedImage } from '../../../components/admin/forms/ImagePickerField';
import { PickerField, PickerOption } from '../../../components/admin/forms/PickerField';
import { TagSelector } from '../../../components/admin/forms/TagSelector';
import { SpecificationsTable } from '../../../components/admin/forms/SpecificationsTable';
import { PolicyFields } from '../../../components/admin/forms/PolicyFields';
import { CustomModal } from '../../../components/ui/CustomModal';
import { mobileToastManager } from '../../../utils/toast';
import { productService } from '../../../services/ProductService';
import { supplierService } from '../../../services/SupplierService';
import { categoryService } from '../../../services/CategoryService';
import { useTheme } from '../../../contexts/ThemeContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Categories will be loaded dynamically from the backend

// ---------------------------------------------------------------------------
// Types
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
  general?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uriToPickedImage(uri: string): PickedImage {
  return { uri, width: 0, height: 0 };
}

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

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fonts, fontSizes, spacing, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      padding: spacing.base,
      paddingBottom: spacing['3xl'],
    },
    errorContainer: {
      backgroundColor: '#fee2e2',
      borderColor: '#fca5a5',
      borderWidth: 1,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginBottom: spacing.base,
      ...shadows.sm,
    },
    errorText: {
      color: '#dc2626',
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: spacing.base,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      fontFamily: fonts.medium,
    },
    errorTitle: {
      fontSize: fontSizes['2xl'],
      fontFamily: fonts.bold,
      color: colors.text,
      marginBottom: spacing.base,
      textAlign: 'center',
    },
    notFoundText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 22,
    },
    backButton: {
      minWidth: 140,
    },
    actions: {
      marginTop: spacing.xl,
      gap: spacing.base,
    },
    saveButton: {
      width: '100%',
      ...shadows.md,
    },
    deleteButton: {
      width: '100%',
      ...shadows.sm,
    },
    cancelButton: {
      width: '100%',
    },
    discountPreview: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginBottom: spacing.base,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },
    discountPreviewLabel: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
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
      fontFamily: fonts.regular,
    },
    discountedPricePreview: {
      fontSize: fontSizes.xl,
      fontFamily: fonts.bold,
      color: '#FF3B30',
    },
    discountBadgePreview: {
      backgroundColor: '#FF3B30',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      ...shadows.sm,
    },
    discountBadgeTextPreview: {
      color: 'white',
      fontSize: fontSizes.sm,
      fontFamily: fonts.bold,
    },
    
    // Delete Modal
    deleteModalText: {
      fontSize: fontSizes.base,
      color: colors.text,
      marginBottom: spacing.xl,
      textAlign: 'center',
      lineHeight: 22,
    },
    deleteModalButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      width: '100%',
    },
    deleteModalButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    deleteModalCancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteModalConfirmButton: {
      backgroundColor: colors.error || '#EF4444',
    },
    deleteModalButtonText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.bold,
    },
    deleteModalCancelText: {
      color: colors.text,
    },
    deleteModalConfirmText: {
      color: '#FFFFFF',
    },
  });

  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [suppliers, setSuppliers] = useState<PickerOption[]>([]);
  const [categories, setCategories] = useState<PickerOption[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  // ---------------------------------------------------------------------------
  // Load suppliers, categories, and product
  // ---------------------------------------------------------------------------

  useEffect(() => {
    loadSuppliers();
    loadCategories();
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
            value: supplier._id
          }));
          setSuppliers(supplierOptions);
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

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        const response = await productService.getProductById(id);

        if (cancelled) return;

        if (!response.success || !response.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const product = response.data;
        
        // Convert specifications object to array format for the form
        const specificationsArray: Specification[] = [];
        if (product.specifications && typeof product.specifications === 'object') {
          Object.entries(product.specifications).forEach(([key, value], index) => {
            specificationsArray.push({
              id: `spec-${index}`,
              key,
              value: String(value),
            });
          });
        }
        
        setForm({
          name: product.name,
          description: product.description ?? '',
          price: product.price.toString(),
          stock: product.stock.toString(),
          category: product.category ?? '',
          supplier: (product as any).supplierId?._id?.toString() || (product as any).supplierId?.toString() || '', // Handle both populated and non-populated supplierId
          images: product.images.map(uriToPickedImage),
          featured: product.isFeatured ?? false,
          favorite: product.isSellerFavorite ?? false,
          discounted: !!(product.discount && product.discount > 0),
          discountAmount: product.discount ? product.discount.toString() : '',
          isActive: product.isActive ?? true,
          specifications: specificationsArray,
          policies: (product as any).policies || {},
        });
      } catch (error) {
        console.error('Error loading product:', error);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => { cancelled = true; };
  }, [id]);

  // ---------------------------------------------------------------------------
  // Field updater
  // ---------------------------------------------------------------------------

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    // Clear general error when any field changes
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  // ---------------------------------------------------------------------------
  // Submit and Delete
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: form.category, // Frontend interface expects 'categoryId'
        supplierId: form.supplier, // Backend expects 'supplierId'
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
        // Map favorite field to isSellerFavorite for backend
        isSellerFavorite: form.favorite,
      };

      const response = await productService.updateProduct(id, updateData);

      if (response.success) {
        mobileToastManager.success('Product updated successfully', 'Success');
        router.back();
      } else {
        throw new Error(response.error?.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      
      // Handle validation errors from backend
      if (error?.code === 'MISSING_FIELDS' || error?.code === 'VALIDATION_ERROR') {
        const serverErrors: FormErrors = {};
        
        if (error.details) {
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
        
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
        } else {
          setErrors({ general: error.message || 'Please check your input and try again.' });
        }
      } else {
        const errorMessage = error?.message || 'Failed to update product. Please try again.';
        setErrors({ general: errorMessage });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteModalVisible(true);
  };
  
  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteModalVisible(false);
    
    try {
      const response = await productService.deleteProduct(id);
      
      if (response.success) {
        mobileToastManager.success('Product deleted successfully', 'Success');
        router.back();
      } else {
        throw new Error(response.error?.message || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', error?.message || 'Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Error / not found state
  // ---------------------------------------------------------------------------

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.notFoundText}>
          The product you are looking for does not exist or has been removed.
        </Text>
        <Button
          label="Go Back"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.backButton}
          testID="edit-product-go-back"
        />
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  return (
    <>
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

        {/* Supplier Error (if backend requires it) */}
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
          testID="edit-product-images"
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
          testID="edit-product-name"
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
          testID="edit-product-description"
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
          testID="edit-product-price"
        />

        {/* Stock */}
        <FormField
          label="Inventory (Stock)"
          value={form.stock}
          onChangeText={(v) => setField('stock', v)}
          placeholder="0"
          required
          keyboardType="number-pad"
          error={errors.stock}
          testID="edit-product-stock"
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
          testID="edit-product-category"
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
          testID="edit-product-supplier"
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
          testID="edit-product-status-tags"
        />

        {form.discounted && (
          <>
            <FormField
              label="Discount Amount (%)"
              value={form.discountAmount}
              onChangeText={(v) => setField('discountAmount', v)}
              placeholder="Enter discount percentage (e.g., 25)"
              keyboardType="decimal-pad"
              helperText="Enter discount percentage (0-100)"
              testID="edit-product-discount-amount"
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
          testID="edit-product-specifications"
        />

        {/* Policies and Guidelines */}
        <PolicyFields
          label="Policies & Guidelines"
          policies={form.policies}
          onPoliciesChange={(policies) => setField('policies', policies)}
          helperText="Optional: Add payment, shipping, and refund policies to help customers understand your terms"
          testID="edit-product-policies"
        />

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Save Changes"
            onPress={handleSubmit}
            loading={saving}
            icon="checkmark-circle-outline"
            size="lg"
            style={styles.saveButton}
            testID="edit-product-save"
          />
          <Button
            label="Delete Product"
            onPress={handleDelete}
            loading={deleting}
            variant="destructive"
            icon="trash-outline"
            size="lg"
            disabled={saving}
            style={styles.deleteButton}
            testID="edit-product-delete"
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            size="lg"
            disabled={saving || deleting}
            style={styles.cancelButton}
            testID="edit-product-cancel"
          />
        </View>
      </ScrollView>
      
      {/* Delete Confirmation Modal */}
      <CustomModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Product"
        size="small"
        position="center"
        scrollable={false}
      >
        <>
          <Text style={styles.deleteModalText}>
            Are you sure you want to delete this product? This action cannot be undone.
          </Text>
          <View style={styles.deleteModalButtons}>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteModalCancelButton]}
              onPress={() => setDeleteModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteModalButtonText, styles.deleteModalCancelText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteModalConfirmButton]}
              onPress={confirmDelete}
              activeOpacity={0.7}
            >
              <Text style={[styles.deleteModalButtonText, styles.deleteModalConfirmText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </CustomModal>
    </>
  );
}
