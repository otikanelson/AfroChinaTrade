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
import { collectionService } from '../../../services/CollectionService';
import { categoryService } from '../../../services/CategoryService';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBarWithFilters } from '../../../components/admin/SearchBarWithFilters';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { FilterOptions } from '../../../components/admin/ProductFiltersDropdown';
import { Header } from '../../../components/Header';
import { CustomModal } from '../../../components/ui/CustomModal';
import { useTheme } from '../../../contexts/ThemeContext';

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
  const hasDiscount = !!product.discount && product.discount > 0;

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
  const [collectionsCount, setCollectionsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    statusFilter: 'all',
    discountFilter: 'all',
    categoryFilter: 'all',
    tagFilter: 'all',
    featuredOnly: false,
    sellerFavoriteOnly: false,
  });
  
  // Status toggle modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [productToToggle, setProductToToggle] = useState<{ product: Product; newStatus: boolean } | null>(null);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: themeColors.surface,
    },

    // Quick Actions
    quickActionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: themeSpacing.base,
      paddingVertical: themeSpacing.md,
      gap: themeSpacing.sm,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderLight,
    },
    quickActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeColors.primary,
      paddingVertical: themeSpacing.md,
      paddingHorizontal: themeSpacing.lg,
      borderRadius: borderRadius.md,
      gap: themeSpacing.sm,
    },
    quickActionButtonSecondary: {
      backgroundColor: themeColors.background,
      borderWidth: 1,
      borderColor: themeColors.primary,
    },
    quickActionText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: themeColors.textInverse,
    },
    quickActionTextSecondary: {
      color: themeColors.primary,
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
    
    // Status Modal
    statusModalText: {
      fontSize: fontSizes.base,
      color: themeColors.text,
      marginBottom: themeSpacing.xl,
      textAlign: 'center',
      lineHeight: 22,
    },
    statusModalButtons: {
      flexDirection: 'row',
      gap: themeSpacing.sm,
      width: '100%',
    },
    statusModalButton: {
      flex: 1,
      paddingVertical: themeSpacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    statusModalCancelButton: {
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    statusModalConfirmButton: {
      backgroundColor: themeColors.primary,
    },
    statusModalDeactivateButton: {
      backgroundColor: themeColors.error || '#EF4444',
    },
    statusModalButtonText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
    },
    statusModalCancelText: {
      color: themeColors.text,
    },
    statusModalConfirmText: {
      color: '#FFFFFF',
    },
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const [categoriesResponse, collectionsResponse] = await Promise.all([
        categoryService.getCategories(),
        collectionService.getActiveCollections()
      ]);

      if (categoriesResponse.success && categoriesResponse.data) {
        const categoryOptions = categoriesResponse.data.map((category: any) => ({
          label: category.name,
          value: category.name
        }));
        setCategories(categoryOptions);
      }

      if (collectionsResponse.success && collectionsResponse.data) {
        setCollectionsCount(collectionsResponse.data.length);
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
        status: filters.statusFilter === 'all' ? undefined : filters.statusFilter,
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
  }, [filters.statusFilter]);

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
    if (filters.statusFilter === 'active') {
      result = result.filter((p) => p.isActive ?? true);
    } else if (filters.statusFilter === 'inactive') {
      result = result.filter((p) => !(p.isActive ?? true));
    }

    // Discount filter
    if (filters.discountFilter === 'discounted') {
      result = result.filter((p) => p.discount && p.discount > 0);
    } else if (filters.discountFilter === 'regular') {
      result = result.filter((p) => !p.discount || p.discount === 0);
    }

    // Category filter
    if (filters.categoryFilter !== 'all') {
      result = result.filter((p) => p.category === filters.categoryFilter);
    }

    // Tag filter
    if (filters.tagFilter !== 'all') {
      result = result.filter((p) => (p as any).tags && (p as any).tags.includes(filters.tagFilter));
    }

    // Featured filter
    if (filters.featuredOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    // Seller Favorite filter
    if (filters.sellerFavoriteOnly) {
      result = result.filter((p) => (p as any).isSellerFavorite);
    }

    return result;
  }, [products, searchQuery, filters]);

  const hasActiveFilters = filters.statusFilter !== 'all' || filters.discountFilter !== 'all' || filters.categoryFilter !== 'all' || filters.tagFilter !== 'all' || filters.featuredOnly || filters.sellerFavoriteOnly || searchQuery.trim();

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      statusFilter: 'all',
      discountFilter: 'all',
      categoryFilter: 'all',
      tagFilter: 'all',
      featuredOnly: false,
      sellerFavoriteOnly: false,
    });
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleAddProduct = useCallback(() => {
    router.push('/(admin)/product/new');
  }, [router]);

  const handleManageCollections = useCallback(() => {
    router.push('/(admin)/collections');
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
      setProductToToggle({ product, newStatus });
      setStatusModalVisible(true);
    },
    [],
  );
  
  const confirmStatusToggle = async () => {
    if (!productToToggle) return;
    
    const { product, newStatus } = productToToggle;
    const productId = (product as any)._id || product.id;
    
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
    } finally {
      setStatusModalVisible(false);
      setProductToToggle(null);
    }
  };

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
    <>
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleAddProduct}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={themeColors.textInverse} />
          <Text style={styles.quickActionText}>Add Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionButton, styles.quickActionButtonSecondary]}
          onPress={handleManageCollections}
          activeOpacity={0.8}
        >
          <Ionicons name="albums-outline" size={20} color={themeColors.primary} />
          <Text style={[styles.quickActionText, styles.quickActionTextSecondary]}>
            Collections {collectionsCount > 0 && `(${collectionsCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.listHeader}>
        <SearchBarWithFilters
          value={searchQuery}
          onChangeText={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
          placeholder="Search products…"
          testID="products-search"
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && searchQuery.trim() && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearAllFilters}
          >
            <Ionicons name="close-circle-outline" size={16} color={themeColors.textSecondary} />
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
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
        subtitle={`Manage your inventory\n${hasActiveFilters ? `• ${filteredProducts.length} filtered` : `• ${products.length} total`}`}
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
          searchQuery || filters.statusFilter !== 'all' || filters.discountFilter !== 'all' || filters.categoryFilter !== 'all' || filters.featuredOnly || filters.sellerFavoriteOnly
            ? 'No products match your filters.'
            : 'No products yet. Tap + to add one.'
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        skeletonCount={8}
      />

      {/* Status Toggle Modal */}
      <CustomModal
        visible={statusModalVisible}
        onClose={() => {
          setStatusModalVisible(false);
          setProductToToggle(null);
        }}
        title={productToToggle?.newStatus ? 'Activate Product' : 'Deactivate Product'}
        size="small"
        position="center"
        scrollable={false}
      >
        <>
          <Text style={styles.statusModalText}>
            Are you sure you want to {productToToggle?.newStatus ? 'activate' : 'deactivate'} "{productToToggle?.product.name}"?
          </Text>
          <View style={styles.statusModalButtons}>
            <TouchableOpacity
              style={[styles.statusModalButton, styles.statusModalCancelButton]}
              onPress={() => {
                setStatusModalVisible(false);
                setProductToToggle(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.statusModalButtonText, styles.statusModalCancelText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusModalButton,
                productToToggle?.newStatus ? styles.statusModalConfirmButton : styles.statusModalDeactivateButton
              ]}
              onPress={confirmStatusToggle}
              activeOpacity={0.7}
            >
              <Text style={[styles.statusModalButtonText, styles.statusModalConfirmText]}>
                {productToToggle?.newStatus ? 'Activate' : 'Deactivate'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </CustomModal>
    </View>
  );
}