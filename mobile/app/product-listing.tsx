import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Alert, 
  RefreshControl,
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductFilterModal } from '../components/ProductFilterModal';
import { productService } from '../services/ProductService';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/product';
import { NavigationSource, CollectionType, ProductFilters } from '../types/navigation';
import { spacing, borderRadius } from '../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

interface ProductListingPageProps {
  source: NavigationSource;
  collectionType: CollectionType;
  title?: string;
  initialFilters?: ProductFilters;
}

export default function ProductListingPage() {
  const { source, collectionType, title } = useLocalSearchParams<{
    source: NavigationSource;
    collectionType: CollectionType;
    title?: string;
  }>();
  
  const router = useRouter();
  const { colors, fontSizes, fonts } = useTheme();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState<ProductFilters>({});

  // Load products based on collection type
  const loadProducts = useCallback(async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;

      switch (collectionType) {
        case 'featured':
          response = await productService.getFeaturedProducts(20);
          break;
        case 'recommended':
          if (user?.id) {
            response = await productService.getRecommendedProducts(user.id, page, 20);
          } else {
            // Fallback to featured products for unauthenticated users
            response = await productService.getFeaturedProducts(20);
          }
          break;
        case 'trending':
          response = await productService.getProducts({ 
            page, 
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            minRating: filters.minRating,
            search: filters.search
          });
          break;
        case 'seller_favorites':
          response = await productService.getProducts({ 
            page, 
            limit: 20,
            isSellerFavorite: true, // Use actual seller favorites
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            minRating: filters.minRating,
            search: filters.search,
            sortBy: filters.sortBy === 'newest' ? 'createdAt' : 
                   filters.sortBy === 'trending' ? 'createdAt' : 
                   filters.sortBy === 'price_asc' || filters.sortBy === 'price_desc' ? 'price' : 
                   filters.sortBy === 'rating' ? 'rating' : undefined,
            sortOrder: filters.sortBy === 'price_desc' ? 'desc' : 'asc'
          });
          break;
        case 'all':
        default:
          response = await productService.getProducts({ 
            page, 
            limit: 20, 
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            minRating: filters.minRating,
            search: filters.search,
            sortBy: filters.sortBy === 'newest' ? 'createdAt' : 
                   filters.sortBy === 'trending' ? 'createdAt' : 
                   filters.sortBy === 'price_asc' || filters.sortBy === 'price_desc' ? 'price' : 
                   filters.sortBy === 'rating' ? 'rating' : undefined,
            sortOrder: filters.sortBy === 'price_desc' ? 'desc' : 'asc'
          });
          break;
      }

      if (response.success && response.data) {
        // Handle different response structures
        let newProducts: Product[];
        let paginationData: any;

        if (Array.isArray(response.data)) {
          // Direct array response (from getFeaturedProducts, getProducts, etc.)
          newProducts = response.data;
          paginationData = {
            page: page,
            hasNext: newProducts.length === 20,
            total: newProducts.length,
            pages: Math.ceil(newProducts.length / 20)
          };
        } else if (response.data.products) {
          // Wrapped response (from getRecommendedProducts, etc.)
          newProducts = response.data.products;
          paginationData = response.data.pagination || {
            page: page,
            hasNext: newProducts.length === 20,
            total: newProducts.length,
            pages: Math.ceil(newProducts.length / 20)
          };
        } else {
          // Fallback
          newProducts = [];
          paginationData = {
            page: page,
            hasNext: false,
            total: 0,
            pages: 1
          };
        }
        
        if (refresh || page === 1) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }
        
        setPagination(paginationData);
      } else {
        if (page === 1) {
          setProducts([]);
        }
        Alert.alert('Error', 'Failed to load products');
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      if (page === 1) {
        setProducts([]);
      }
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [collectionType, user?.id, filters]);

  // Initial load
  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  // Handle product press with view tracking
  const handleProductPress = (product: Product) => {
    const productId = (product as any)._id || product.id;
    router.push({
      pathname: '/product-detail/[id]',
      params: { 
        id: productId,
        source: source // Pass source for analytics
      }
    });
  };

  // Load more products (pagination)
  const handleLoadMore = () => {
    if (pagination.hasNext && !loading && !loadingMore) {
      loadProducts(pagination.page + 1);
    }
  };

  // Pull to refresh
  const handleRefresh = () => {
    loadProducts(1, true);
  };

  // Handle filter application
  const handleApplyFilters = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    // Reload products with new filters
    loadProducts(1, true);
  };

  const getPageTitle = (): string => {
    if (title) return title;
    
    switch (collectionType) {
      case 'featured': return 'Featured Products';
      case 'recommended': return user ? 'Recommended for You' : 'Featured Products';
      case 'trending': return 'Trending Products';
      case 'seller_favorites': return 'Seller Favorites';
      case 'all': return 'All Products';
      default: return 'Products';
    }
  };

  const getPageSubtitle = (): string => {
    const count = pagination.total;
    if (count === 0) return 'No products found';
    if (count === 1) return '1 product';
    return `${count.toLocaleString()} products`;
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productColumn, { marginLeft: index % 2 === 0 ? 0 : spacing.md }]}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        showViewCount={true}
        variant="grid"
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadMoreText, { color: colors.textSecondary }]}>
          Loading more products...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No products found
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
        Try adjusting your filters or check back later
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    productsGrid: {
      padding: spacing.base,
    },
    productColumn: {
      flex: 1,
      marginBottom: spacing.md,
    },
    loadMoreContainer: {
      padding: spacing.lg,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    loadMoreText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      minHeight: 300,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  if (loading && products.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          showBack={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={getPageTitle()}
        subtitle={getPageSubtitle()}
        showBack={true}
        onBackPress={() => router.back()}
        showFilter={collectionType === 'all'}
        onFilterPress={() => setShowFilterModal(true)}
      />
      
      <FlatList
        style={styles.content}
        data={products}
        numColumns={2}
        keyExtractor={(item) => (item as any)._id || item.id}
        renderItem={renderProduct}
        contentContainerStyle={[
          styles.productsGrid,
          products.length === 0 && { flex: 1 }
        ]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
      
      <ProductFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
        collectionType={collectionType || 'all'}
      />
    </View>
  );
}