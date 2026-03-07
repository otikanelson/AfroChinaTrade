import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product } from '../../../../shared/src/types/entities';
import { ProductService } from '../../../../shared/src/services/ProductService';
import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { theme } from '../../../theme';

// ─── Service singleton ────────────────────────────────────────────────────────

const storageAdapter = new AsyncStorageAdapter();
const productService = new ProductService(storageAdapter);

// ─── Filter chips ─────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'inactive';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Product card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const isActive = product.stock > 0;
  const imageUri = product.images?.[0];

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.cardRow}>
        {/* Thumbnail */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={28} color={theme.colors.textLight} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            ${product.price.toFixed(2)}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.stockText}>
              Stock: {product.stock}
            </Text>
            <StatusBadge
              status={isActive ? 'active' : 'failed'}
              label={isActive ? 'Active' : 'Inactive'}
              size="sm"
            />
          </View>
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.textLight}
          style={styles.chevron}
        />
      </View>
    </Card>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProductsScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = useCallback(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Status filter (active = stock > 0)
    if (statusFilter === 'active') {
      result = result.filter((p) => p.stock > 0);
    } else if (statusFilter === 'inactive') {
      result = result.filter((p) => p.stock === 0);
    }

    // Featured filter — ProductService.getFeaturedProducts returns first 10
    // We replicate that logic here: featured = first 10 by insertion order
    if (featuredOnly) {
      const featuredIds = new Set(products.slice(0, 10).map((p) => p.id));
      result = result.filter((p) => featuredIds.has(p.id));
    }

    return result;
  }, [products, searchQuery, statusFilter, featuredOnly]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleAddProduct = useCallback(() => {
    router.push('/(admin)/product/new');
  }, [router]);

  const handleProductPress = useCallback(
    (product: Product) => {
      router.push({ pathname: '/(admin)/product/[id]', params: { id: product.id } });
    },
    [router],
  );

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onPress={() => handleProductPress(item)} />
    ),
    [handleProductPress],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const ListHeader = (
    <View style={styles.listHeader}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products…"
        style={styles.searchBar}
        testID="products-search"
      />
      <View style={styles.filterRow}>
        <FilterChip
          label="All"
          active={statusFilter === 'all'}
          onPress={() => setStatusFilter('all')}
        />
        <FilterChip
          label="Active"
          active={statusFilter === 'active'}
          onPress={() => setStatusFilter('active')}
        />
        <FilterChip
          label="Inactive"
          active={statusFilter === 'inactive'}
          onPress={() => setStatusFilter('inactive')}
        />
        <FilterChip
          label="Featured"
          active={featuredOnly}
          onPress={() => setFeaturedOnly((v) => !v)}
        />
      </View>
    </View>
  );

  // ── Error state ────────────────────────────────────────────────────────────

  if (error && !loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Products</Text>
          <TouchableOpacity
            onPress={handleAddProduct}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel="Add product"
          >
            <Ionicons name="add" size={24} color={theme.colors.background} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProducts()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          onPress={handleAddProduct}
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add product"
        >
          <Ionicons name="add" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <DataList<Product>
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage={
          searchQuery || statusFilter !== 'all' || featuredOnly
            ? 'No products match your filters.'
            : 'No products yet. Tap + to add one.'
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        skeletonCount={8}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  listHeader: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchBar: {
    marginBottom: theme.spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },

  // Filter chips
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium as any,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.background,
  },

  // Product card
  card: {
    marginHorizontal: theme.spacing.base,
    marginVertical: theme.spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.base,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  productName: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.primary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stockText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
    flexShrink: 0,
  },

  // Error state
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  retryText: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.background,
  },
});
