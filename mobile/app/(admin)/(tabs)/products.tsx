import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Product } from '../../../types/product';
import { productService } from '../../../services/ProductService';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { useTheme } from '../../../contexts/ThemeContext';

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
  onStatusToggle?: (product: Product, newStatus: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onStatusToggle }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const isActive = product.isActive ?? true; // Default to true if not specified
  const imageUri = product.images?.[0];
  const hasDiscount = product.discount && product.discount > 0;
  
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };
  
  const getDiscountedPrice = () => {
    if (hasDiscount && product.discount) {
      const discountAmount = (product.price * product.discount) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  };

  const handleStatusToggle = () => {
    if (onStatusToggle) {
      onStatusToggle(product, !isActive);
    }
  };

  return (
    <Card onPress={onPress} style={{ marginHorizontal: spacing.base, marginVertical: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Thumbnail */}
        <View style={{
          width: 72,
          height: 72,
          borderRadius: borderRadius.base,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          marginRight: spacing.md,
          flexShrink: 0,
          position: 'relative',
        }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="cube-outline" size={28} color={colors.textLight} />
            </View>
          )}
          
          {/* Discount Badge */}
          {hasDiscount && product.discount && (
            <View style={{
              position: 'absolute',
              top: 4,
              left: 4,
              backgroundColor: '#FF3B30',
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 8,
                fontWeight: '600',
              }}>{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text style={{
            fontSize: fontSizes.base,
            fontWeight: fontWeights.semibold as any,
            color: colors.text,
            lineHeight: 20,
          }} numberOfLines={2}>
            {product.name}
          </Text>
          
          {/* Price with discount */}
          {hasDiscount ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={{
                fontSize: fontSizes.sm,
                color: colors.textSecondary,
                textDecorationLine: 'line-through',
              }}>
                {formatPrice(product.price)}
              </Text>
              <Text style={{
                fontSize: fontSizes.base,
                fontWeight: fontWeights.bold as any,
                color: '#FF3B30',
              }}>
                {formatPrice(getDiscountedPrice())}
              </Text>
            </View>
          ) : (
            <Text style={{
              fontSize: fontSizes.base,
              fontWeight: fontWeights.bold as any,
              color: colors.primary,
            }}>
              {formatPrice(product.price)}
            </Text>
          )}
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={{
              fontSize: fontSizes.sm,
              color: colors.textSecondary,
            }}>
              Stock: {product.stock}
            </Text>
            <TouchableOpacity onPress={handleStatusToggle}>
              <StatusBadge
                status={isActive ? 'active' : 'failed'}
                label={isActive ? 'Active' : 'Inactive'}
                size="sm"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textLight}
          style={{ marginLeft: spacing.sm, flexShrink: 0 }}
        />
      </View>
    </Card>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProductsScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // List
    listContent: {
      paddingBottom: spacing.xl,
    },
    listHeader: {
      paddingHorizontal: spacing.base,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    searchBar: {
      marginBottom: spacing.xs,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },

    // Filter chips
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    chipText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium as any,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.background,
    },

    // Product card
    card: {
      marginHorizontal: spacing.base,
      marginVertical: spacing.xs,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageContainer: {
      width: 72,
      height: 72,
      borderRadius: borderRadius.base,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      marginRight: spacing.md,
      flexShrink: 0,
      position: 'relative',
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
    discountBadge: {
      position: 'absolute',
      top: 4,
      left: 4,
      backgroundColor: '#FF3B30',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    discountBadgeText: {
      color: 'white',
      fontSize: 8,
      fontWeight: '600',
    },
    cardInfo: {
      flex: 1,
      gap: spacing.xs,
    },
    productName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: colors.text,
      lineHeight: 20,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    productPrice: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
    },
    originalPrice: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    discountedPrice: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold as any,
      color: '#FF3B30',
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    stockText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    chevron: {
      marginLeft: spacing.sm,
      flexShrink: 0,
    },

    // Error state
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
    },
    retryText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: colors.background,
    },
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await productService.getAdminProducts({
        page: 1,
        limit: 100, // Get all products for now
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = useCallback(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    const productsArray = Array.isArray(products) ? products : [];
    let result = productsArray;

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Status filter is now handled by the API call, but we can still filter client-side for immediate feedback
    if (statusFilter === 'active') {
      result = result.filter((p) => p.isActive ?? true);
    } else if (statusFilter === 'inactive') {
      result = result.filter((p) => !(p.isActive ?? true));
    }

    // Featured filter
    if (featuredOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    return result;
  }, [products, searchQuery, statusFilter, featuredOnly]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleAddProduct = useCallback(() => {
    router.push('/(admin)/product/new');
  }, [router]);

  const handleProductPress = useCallback(
    (product: Product) => {
      // Handle both _id and id fields from backend
      const productId = (product as any)._id || product.id;
      router.push({ pathname: '/(admin)/product/[id]', params: { id: productId } });
    },
    [router],
  );

  const handleStatusToggle = useCallback(
    async (product: Product, newStatus: boolean) => {
      const productId = (product as any)._id || product.id;
      const statusText = newStatus ? 'activate' : 'deactivate';
      
      Alert.alert(
        `${newStatus ? 'Activate' : 'Deactivate'} Product`,
        `Are you sure you want to ${statusText} "${product.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: newStatus ? 'Activate' : 'Deactivate',
            style: newStatus ? 'default' : 'destructive',
            onPress: async () => {
              try {
                const response = await productService.toggleProductStatus(productId, newStatus);
                if (response.success) {
                  // Update the product in the local state
                  setProducts(prevProducts => 
                    prevProducts.map(p => 
                      ((p as any)._id || p.id) === productId 
                        ? { ...p, isActive: newStatus }
                        : p
                    )
                  );
                } else {
                  throw new Error(response.error?.message || 'Failed to update status');
                }
              } catch (error) {
                console.error('Error toggling product status:', error);
                Alert.alert('Error', 'Failed to update product status. Please try again.');
              }
            }
          }
        ]
      );
    },
    [],
  );

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard 
        product={item} 
        onPress={() => handleProductPress(item)}
        onStatusToggle={handleStatusToggle}
      />
    ),
    [handleProductPress, handleStatusToggle],
  );

  const keyExtractor = useCallback((item: Product) => (item as any)._id || item.id, []);

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
            <Ionicons name="add" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
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
          <Ionicons name="add" size={24} color={colors.background} />
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  chipActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  chipText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});