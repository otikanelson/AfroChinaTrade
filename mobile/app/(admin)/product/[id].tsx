import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../components/admin/Button';
import { FormField } from '../../../components/admin/forms/FormField';
import { ImagePickerField, PickedImage } from '../../../components/admin/forms/ImagePickerField';
import { PickerField, PickerOption } from '../../../components/admin/forms/PickerField';
import { SwitchField } from '../../../components/admin/forms/SwitchField';
import { mobileToastManager } from '../../../utils/toast';
import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { STORAGE_KEYS } from '../../../../shared/src/services/storage';
import { Product } from '../../../../shared/src/types/entities';
import { theme } from '../../../theme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: PickerOption[] = [
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Food & Beverages', value: 'food-beverages' },
  { label: 'Home & Garden', value: 'home-garden' },
  { label: 'Sports', value: 'sports' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Toys', value: 'toys' },
  { label: 'Books', value: 'books' },
];

const storage = new AsyncStorageAdapter();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  images: PickedImage[];
  featured: boolean;
  favorite: boolean;
  discounted: boolean;
  discountAmount: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
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

  const price = parseFloat(form.price);
  if (!form.price.trim() || isNaN(price) || price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  const stock = parseInt(form.stock, 10);
  if (form.stock.trim() === '' || isNaN(stock) || stock < 0) {
    errors.stock = 'Stock must be 0 or more';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    images: [],
    featured: false,
    favorite: false,
    discounted: false,
    discountAmount: '',
  });

  // ---------------------------------------------------------------------------
  // Load product
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        const products = (await storage.get<Product[]>(STORAGE_KEYS.PRODUCTS)) ?? [];
        const product = products.find((p) => p.id === id);

        if (cancelled) return;

        if (!product) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setForm({
          name: product.name,
          description: product.description ?? '',
          price: product.price.toString(),
          stock: product.stock.toString(),
          categoryId: product.categoryId ?? '',
          images: product.images.map(uriToPickedImage),
          featured: false,
          favorite: false,
          discounted: false,
          discountAmount: '',
        });
      } catch {
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
  };

  // ---------------------------------------------------------------------------
  // Submit (task 4.6)
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const products = (await storage.get<Product[]>(STORAGE_KEYS.PRODUCTS)) ?? [];
      const index = products.findIndex((p) => p.id === id);

      if (index === -1) {
        Alert.alert('Error', 'Product not found. It may have been deleted.');
        return;
      }

      const updated: Product = {
        ...products[index],
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: form.categoryId,
        images: form.images.map((img) => img.uri),
        updatedAt: new Date().toISOString(),
      };

      const updatedProducts = [...products];
      updatedProducts[index] = updated;
      await storage.set(STORAGE_KEYS.PRODUCTS, updatedProducts);

      mobileToastManager.success('Product updated successfully', 'Success');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        <Text style={styles.errorText}>
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
          multiline
          numberOfLines={4}
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
          value={form.categoryId}
          onValueChange={(v) => setField('categoryId', v)}
          options={CATEGORIES}
          placeholder="Select a category"
          testID="edit-product-category"
        />

        {/* Toggles */}
        <SwitchField
          label="Featured"
          value={form.featured}
          onValueChange={(v) => setField('featured', v)}
          description="Show this product in featured sections"
          testID="edit-product-featured"
        />

        <SwitchField
          label="Favorite"
          value={form.favorite}
          onValueChange={(v) => setField('favorite', v)}
          description="Mark as a seller favorite"
          testID="edit-product-favorite"
        />

        <SwitchField
          label="Discounted"
          value={form.discounted}
          onValueChange={(v) => setField('discounted', v)}
          description="Apply a discount to this product"
          testID="edit-product-discounted"
        />

        {form.discounted && (
          <FormField
            label="Discount Amount"
            value={form.discountAmount}
            onChangeText={(v) => setField('discountAmount', v)}
            placeholder="Enter discount amount"
            keyboardType="decimal-pad"
            helperText="Enter a fixed amount or percentage"
            testID="edit-product-discount-amount"
          />
        )}

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
            label="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            size="lg"
            disabled={saving}
            style={styles.cancelButton}
            testID="edit-product-cancel"
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
  errorTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    minWidth: 120,
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
});
