import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Product } from '../../../types/product';
import { productService } from '../../../services/ProductService';
import { categoryService } from '../../../services/CategoryService';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { CategoryFilterModal } from '../../../components/admin/CategoryFilterModal';
import { Header } from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';

// ─── Filter chips ─────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'inactive';
type DiscountFilter = 'all' | 'discounted' | 'regular';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: borderRadius.full,
          borderWidth: 1.5,
          borderColor: colors.border,
          backgroundColor: colors.background,
        },
        active && {
          borderColor: colors.primary,
          backgroundColor: colors.primary,
        }
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[
        {
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.medium as any,
          color: colors.textSecondary,
        },
        active && {
          color: colors.background,
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

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
              backgroundColor: colors.error,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
              <Text style={{
                color: colors.textInverse,
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
                color: colors.error,
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
            
            {/* Seller Favorite Badge */}
            {(product as any).isSellerFavorite && (
              <View style={{
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.xs,
                paddingVertical: 2,
                borderRadius: borderRadius.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}>
                <Ionicons name="star" size={10} color={colors.textInverse} />
                <Text style={{
                  fontSize: 8,
                  fontWeight: '600',
                  color: colors.textInverse,
                }}>SELLER PICK</Text>
              </View>
            )}
            
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
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ label: string, value: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sellerFavoriteOnly, setSellerFavoriteOnly] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: themeColors.surface,
    },

    // List
    listContent: {
      paddingBottom: themeSpacing.xl,
    },
    listHeader: {
      paddingHorizontal: themeSpacing.base,
      paddingTop: themeSpacing.md,
      paddingBottom: themeSpacing.sm,
      gap: themeSpacing.sm,
    },
    searchBar: {
      marginBottom: themeSpacing.xs,
    },
    filterRow: {
      flexDirection: 'row',
      gap: themeSpacing.sm,
      flexWrap: 'wrap',
    },
    filterSectionLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium as any,
      color: themeColors.textSecondary,
      marginBottom: themeSpacing.xs,
      marginTop: themeSpacing.sm,
    },
    clearFiltersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: themeSpacing.md,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
      alignSelf: 'flex-start',
      marginTop: themeSpacing.sm,
    },
    clearFiltersText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium as any,
      color: themeColors.textSecondary,
      marginLeft: themeSpacing.xs,
    },

    // Filter chips
    chip: {
      paddingHorizontal: themeSpacing.md,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: themeColors.border,
      backgroundColor: themeColors.background,
    },
    chipActive: {
      borderColor: themeColors.primary,
      backgroundColor: themeColors.primary,
    },
    chipText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium as any,
      color: themeColors.textSecondary,
    },
    chipTextActive: {
      color: themeColors.background,
    },

    // Product card
    card: {
      marginHorizontal: themeSpacing.base,
      marginVertical: themeSpacing.xs,
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
      backgroundColor: themeColors.surface,
      marginRight: themeSpacing.md,
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
      gap: themeSpacing.xs,
    },
    productName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: themeColors.text,
      lineHeight: 20,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeSpacing.xs,
    },
    productPrice: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold as any,
      color: themeColors.primary,
    },
    originalPrice: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
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
      gap: themeSpacing.sm,
    },
    stockText: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
    },
    chevron: {
      marginLeft: themeSpacing.sm,
      flexShrink: 0,
    },

    // Error state
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: themeSpacing.xl,
      gap: themeSpacing.md,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: themeSpacing.xl,
      paddingVertical: themeSpacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: themeColors.primary,
    },
    retryText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: themeColors.background,
    },
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
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
      // Silently fail for categories as it's not critical
    } finally {
      setLoadingCategories(false);
    }
  }, []);

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
    loadCategories();
  }, [fetchProducts, loadCategories]);

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

    // Discount filter
    if (discountFilter === 'discounted') {
      result = result.filter((p) => p.discount && p.discount > 0);
    } else if (discountFilter === 'regular') {
      result = result.filter((p) => !p.discount || p.discount === 0);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Featured filter
    if (featuredOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    // Seller Favorite filter
    if (sellerFavoriteOnly) {
      result = result.filter((p) => (p as any).isSellerFavorite);
    }

    return result;
  }, [products, searchQuery, statusFilter, discountFilter, categoryFilter, featuredOnly, sellerFavoriteOnly]);

  const hasActiveFilters = statusFilter !== 'all' || discountFilter !== 'all' || categoryFilter !== 'all' || featuredOnly || sellerFavoriteOnly || searchQuery.trim();

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDiscountFilter('all');
    setCategoryFilter('all');
    setFeaturedOnly(false);
    setSellerFavoriteOnly(false);
  };

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

      {/* Status Filters */}
      <Text style={styles.filterSectionLabel}>Status & Features</Text>
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
        <FilterChip
          label="Seller Favorite"
          active={sellerFavoriteOnly}
          onPress={() => setSellerFavoriteOnly((v) => !v)}
        />
      </View>

      {/* Discount Filters */}
      <Text style={styles.filterSectionLabel}>Pricing</Text>
      <View style={styles.filterRow}>
        <FilterChip
          label="All Prices"
          active={discountFilter === 'all'}
          onPress={() => setDiscountFilter('all')}
        />
        <FilterChip
          label="Discounted"
          active={discountFilter === 'discounted'}
          onPress={() => setDiscountFilter('discounted')}
        />
        <FilterChip
          label="Regular Price"
          active={discountFilter === 'regular'}
          onPress={() => setDiscountFilter('regular')}
        />
      </View>

      {/* Category Filters */}
      {!loadingCategories && categories.length > 0 && (
        <>
          <Text style={styles.filterSectionLabel}>Categories</Text>
          <View style={styles.filterRow}>
            <FilterChip
              label="All Categories"
              active={categoryFilter === 'all'}
              onPress={() => setCategoryFilter('all')}
            />
            {categories.slice(0, 4).map((category) => (
              <FilterChip
                key={category.value}
                label={category.label}
                active={categoryFilter === category.value}
                onPress={() => setCategoryFilter(category.value)}
              />
            ))}
            {categories.length > 4 && (
              <FilterChip
                label={`+${categories.length - 4} more`}
                active={false}
                onPress={() => setCategoryModalVisible(true)}
              />
            )}
          </View>
        </>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={clearAllFilters}
        >
          <Ionicons name="close-circle-outline" size={16} color={themeColors.textSecondary} />
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Error state ────────────────────────────────────────────────────────────

  if (error && !loading && products.length === 0) {
    return (
      <View style={styles.screen}>
        <Header
          title="Products"
          subtitle="Manage your inventory"
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={themeColors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProducts()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header
        title="Products"
        subtitle={`Manage your inventory${hasActiveFilters ? ` • ${filteredProducts.length} filtered` : ` • ${products.length} total`}`}
      />

      {/* List */}
      <DataList<Product>
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage={
          searchQuery || statusFilter !== 'all' || discountFilter !== 'all' || categoryFilter !== 'all' || featuredOnly || sellerFavoriteOnly
            ? 'No products match your filters.'
            : 'No products yet. Tap + to add one.'
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        skeletonCount={8}
      />

      {/* Category Filter Modal */}
      <CategoryFilterModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        categories={categories}
        selectedCategory={categoryFilter}
        onSelectCategory={setCategoryFilter}
      />
    </View>
  );
}