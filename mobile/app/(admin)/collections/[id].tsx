import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/admin/Card';
import { FormField } from '../../../components/admin/forms/FormField';
import { PickerField } from '../../../components/admin/forms/PickerField';
import { collectionService } from '../../../services/CollectionService';
import { categoryService } from '../../../services/CategoryService';
import { useTheme } from '../../../contexts/ThemeContext';
import { CollectionFilter, Category, Collection } from '../../../types/product';

const FILTER_TYPES = [
  { label: 'Category', value: 'category' },
  { label: 'Name Contains', value: 'name_contains' },
  { label: 'Tag', value: 'tag' },
  { label: 'Price Range', value: 'price_range' },
  { label: 'Minimum Rating', value: 'rating_min' },
  { label: 'Minimum Discount', value: 'discount_min' },
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
  });
  
  const [filters, setFilters] = useState<CollectionFilter[]>([]);

  useEffect(() => {
    if (id) {
      loadCollection();
      loadCategories();
    }
  }, [id]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      // Note: You'll need to implement getCollectionById in the service
      // For now, this is a placeholder
      Alert.alert('Info', 'Collection editing is not yet implemented. Please use the collections list to manage collections.');
      router.back();
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert('Error', 'Failed to load collection');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Edit Collection" showBack />
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color={colors.textLight} />
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Edit Collection" showBack />
      <View style={styles.content}>
        <Card>
          <Text style={{ fontSize: fontSizes.lg, color: colors.text, textAlign: 'center' }}>
            Collection editing will be implemented in a future update.
          </Text>
        </Card>
      </View>
    </View>
  );
}