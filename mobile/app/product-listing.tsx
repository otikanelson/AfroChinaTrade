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
import { collectionService } from '../services/CollectionService';
import { categoryService } from '../services/CategoryService';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Product, Category } from '../types/product';
import { spacing, borderRadius } from '../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductListingPage() {
  const { 
    collectionId, 
    collection, 
    title, 
    showCategories,
    category 
  } = useLocalSearchParams<{
    collectionId?: string;
    collection?: string;
    title?: string;
    showCategories?: string;
    category?: string;
  }>();
  
  const router = useRouter();
  const { colors, fontSizes, fonts } = useTheme();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [filters, setFilters] = useState<any>({});

  const isShowingCategories = showCategories === 'true';
  const pageTitle = title || 
    (isShowingCategories ? 'Categories' : 
     category ? `${category} Products` : 
     'Products');

  useEffect(() => {
    if (isShowingCategories) {
      loadCategories();
    } else {
      loadProducts();
    }
  }, [collectionId, collection, category, isShowingCategories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

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

      if (collectionId) {
        // Load products from a specific collection
        response = await collectionService.getCollectionProducts(collectionId, page, 20);
        if (response.success && response.data) {
          const newProducts = response.data.products || [];
          setProducts(page === 1 ? newProducts : [...products, ...newProducts]);
          // Note: Collection API might not return pagination info
          setPagination({
            page,
            hasNext: newProducts.length === 20,
            total: response.data.productCount || newProducts.length,
            pages: Math.ceil((response.data.productCount || newProducts.length) / 20)
          });
        }
      } else if (collection) {
        // Load products by collection type
        switch (collection) {
          case 'featured':
            response = await productService.getFeaturedProducts(20);
            break;
          case 'trending':
            response = await productService.getTrendingProducts('7d', 20);
            break;
          case 'recommended':
            if (user?.id) {
              response = await productService.getRecommendedProducts(user.id, page, 20);
            } else {
              response = await productService.getFeaturedProducts(20);
            }
            break;
          default:
            response = await productService.getProducts({ 
              page, 
              limit: 20,
              category: category || filters.category,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
              minRating: filters.minRating,
              search: filters.search
            });
        }
      } else if (category) {
        // Load products by category
        response = await productService.getProducts({ 
          page, 
          limit: 20,
          category,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          search: filters.search
        });
      } else {
        // Load all products
        response = await productService.getProducts({ 
          page, 
          limit: 20,
          category: filters.category,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          search: filters.search
        });
      }

      if (response && response.success && response.data) {
        const newProducts = Array.isArray(response.data) ? response.data : response.data.products || [];
        setProducts(page === 1 ? newProducts : [...products, ...newProducts]);
        
        // Handle pagination from different response types
        if ('pagination' in response && response.pagination) {
          const paginationData = response.pagination as any;
          setPagination({
            page: paginationData.page || page,
            hasNext: paginationData.hasNext !== undefined ? paginationData.hasNext : 
                     (paginationData.totalPages ? page < paginationData.totalPages : 
                      paginationData.pages ? page < paginationData.pages : false),
            total: paginationData.total || 0,
            pages: paginationData.pages || paginationData.totalPages || 1
          });
        } else if (response.data && typeof response.data === 'object' && 'pagination' in response.data) {
          const paginationData = (response.data as any).pagination;
          setPagination({
            page: paginationData.page || page,
            hasNext: paginationData.hasNext !== undefined ? paginationData.hasNext : 
                     (paginationData.totalPages ? page < paginationData.totalPages : 
                      paginationData.pages ? page < paginationData.pages : false),
            total: paginationData.total || 0,
            pages: paginationData.pages || paginationData.totalPages || 1
          });
        } else {
          setPagination({
            page,
            hasNext: newProducts.length === 20,
            total: newProducts.length,
            pages: 1
          });
        }
      }

    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [collectionId, collection, category, filters, products, user]);

  const handleRefresh = useCallback(() => {
    if (isShowingCategories) {
      loadCategories();
    } else {
      loadProducts(1, true);
    }
  }, [isShowingCategories, loadProducts]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && pagination.hasNext && !isShowingCategories) {
      loadProducts(pagination.page + 1);
    }
  }, [loadingMore, pagination, loadProducts, isShowingCategories]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-detail/[id]',
      params: { id: product.id }
    });
  };

  const handleCategoryPress = (selectedCategory: Category) => {
    router.push({
      pathname: '/product-listing',
      params: { 
        category: selectedCategory.name,
        title: `${selectedCategory.name} Products`
      }
    });
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    loadProducts(1, true);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item)}
        variant="grid"
      />
    </View>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name={item.icon as any} size={32} color={colors.primary} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      {item.subcategories && item.subcategories.length > 0 && (
        <Text style={styles.subcategoryCount}>
          {item.subcategories.length} subcategories
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.base,
      marginVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
    filterButtonText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontFamily: fonts.medium,
    },
    productContainer: {
      flex: 1,
      margin: spacing.xs,
      maxWidth: (screenWidth - spacing.base * 3) / 2,
      alignSelf: 'center',
    },
    categoryCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      margin: spacing.xs,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 120,
      justifyContent: 'center',
      flex: 1,
      maxWidth: (screenWidth - spacing.base * 3) / 2,
      alignSelf: 'center',
    },
    categoryIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    categoryName: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subcategoryCount: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
      textAlign: 'center',
    },
    footerLoader: {
      padding: spacing.lg,
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={pageTitle} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isShowingCategories ? 'Loading categories...' : 'Loading products...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={pageTitle} showBack />
      
      {!isShowingCategories && (
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Ionicons name="filter-outline" size={16} color={colors.text} />
          <Text style={styles.filterButtonText}>Filter & Sort</Text>
        </TouchableOpacity>
      )}

      {isShowingCategories ? (
        <FlatList<Category>
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ 
            padding: spacing.xs,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          columnWrapperStyle={{
            justifyContent: 'space-around',
            paddingHorizontal: spacing.xs
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="grid-outline" 
                size={64} 
                color={colors.textLight} 
              />
              <Text style={styles.emptyText}>
                No categories found
              </Text>
              <Text style={styles.emptySubtext}>
                Categories will appear here once they are created
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList<Product>
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ 
            padding: spacing.xs,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          columnWrapperStyle={{
            justifyContent: 'space-around',
            paddingHorizontal: spacing.xs
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="cube-outline" 
                size={64} 
                color={colors.textLight} 
              />
              <Text style={styles.emptyText}>
                No products found
              </Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or check back later
              </Text>
            </View>
          }
        />
      )}

      {showFilterModal && (
        <ProductFilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApplyFilters={handleApplyFilters}
          initialFilters={filters}
          collectionType={collection || category || 'all'}
        />
      )}
    </View>
  );
}