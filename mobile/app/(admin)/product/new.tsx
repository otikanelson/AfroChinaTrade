import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';

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
// Form state type
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
// Validation
// ---------------------------------------------------------------------------

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

export default function NewProductScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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

  const [errors, setErrors] = useState<FormErrors>({});

  // Generic field updater
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
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
      // Build new product object
      const now = new Date().toISOString();
      const newProduct: Product = {
        id: Date.now().toString(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: form.categoryId,
        supplierId: '',
        rating: 0,
        reviewCount: 0,
        images: form.images.map((img) => img.uri),
        createdAt: now,
        updatedAt: now,
      };

      // Persist to storage
      const existing = (await storage.get<Product[]>(STORAGE_KEYS.PRODUCTS)) ?? [];
      await storage.set(STORAGE_KEYS.PRODUCTS, [newProduct, ...existing]);

      mobileToastManager.success('Product created successfully', 'Success');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save product. Please try again.');
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
          multiline
          numberOfLines={4}
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
          value={form.categoryId}
          onValueChange={(v) => setField('categoryId', v)}
          options={CATEGORIES}
          placeholder="Select a category"
          testID="new-product-category"
        />

        {/* Toggles */}
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
          <FormField
            label="Discount Amount"
            value={form.discountAmount}
            onChangeText={(v) => setField('discountAmount', v)}
            placeholder="Enter discount amount"
            keyboardType="decimal-pad"
            helperText="Enter a fixed amount or percentage"
            testID="new-product-discount-amount"
          />
        )}

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
