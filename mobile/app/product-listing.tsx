import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Alert, 
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductFilterModal } from '../components/ProductFilterModal';
import { SectionHeader } from '../components/SectionHeader';
import { BrowseAllCard } from '../components/BrowseAllCard';
import { productService } from '../services/ProductService';
import { collectionService } from '../services/CollectionService';
import { categoryService } from '../services/CategoryService';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Product, Category, Collection } from '../types/product';
import { NavigationSource } from '../types/navigation';
import { spacing, borderRadius } from '../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

// Helper function to convert sort options from modal to service format
const getSortParams = (sortBy?: string): { sortBy?: 'price' | 'rating' | 'createdAt' | 'name'; sortOrder?: 'asc' | 'desc' } => {
  switch (sortBy) {
    case 'newest':    return { sortBy: 'createdAt', sortOrder: 'desc' };
    case 'price_asc': return { sortBy: 'price', sortOrder: 'asc' };
    case 'price_desc':return { sortBy: 'price', sortOrder: 'desc' };
    case 'rating':    return { sortBy: 'rating', sortOrder: 'desc' };
    case 'trending':  return { sortBy: 'createdAt', sortOrder: 'desc' };
    default:          return {};
  }
};

export default function ProductListingPage() {
  const { 
    collectionId, 
    collection, 
    title, 
    showCategories,
    category,
    showAll
  } = useLocalSearchParams<{
    collectionId?: string;
    collection?: string;
    title?: string;
    showCategories?: string;
    category?: string;
    showAll?: string;
  }>();
  
  const router = useRouter();
  const { colors, fontSizes, fonts } = useTheme();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
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
      // Only load collections when not navigated from a specific section
      if (!collectionId && !collection && !category && showAll !== 'true') {
        loadCollections();
      }
    }
  }, [collectionId, collection, category, isShowingCategories, showAll]);

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

  const loadCollections = async () => {
    try {
      const response = await collectionService.getActiveCollections();
      if (response.success && response.data) {
        // Get first 5 collections
        setCollections(response.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadProducts = useCallback(async (page: number = 1, refresh: boolean = false, overrideFilters?: any) => {
    const activeFilters = overrideFilters !== undefined ? overrideFilters : filters;
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
        // If filters are active, use getProducts filtered by collection via getProducts
        // Otherwise use the dedicated collection endpoint
        if (Object.keys(activeFilters).length > 0) {
          response = await productService.getProducts({
            page,
            limit: 20,
            minPrice: activeFilters.minPrice,
            maxPrice: activeFilters.maxPrice,
            minRating: activeFilters.minRating,
            tag: activeFilters.tag,
            ...getSortParams(activeFilters.sortBy),
          });
        } else {
          response = await collectionService.getCollectionProducts(collectionId, page, 20);
          if (response.success && response.data) {
            const collectionData = response.data;
            const newProducts = collectionData.products || [];
            setProducts(page === 1 ? newProducts : [...products, ...newProducts]);
            setPagination({
              page,
              hasNext: newProducts.length === 20,
              total: collectionData.productCount || newProducts.length,
              pages: Math.ceil((collectionData.productCount || newProducts.length) / 20)
            });
          }
        }
      } else if (collection) {
        switch (collection) {
          case 'featured':
            // If filters are active, use getProducts with isFeatured flag so filters apply
            if (Object.keys(activeFilters).length > 0) {
              response = await productService.getProducts({
                page,
                limit: 20,
                isFeatured: true,
                minPrice: activeFilters.minPrice,
                maxPrice: activeFilters.maxPrice,
                minRating: activeFilters.minRating,
                tag: activeFilters.tag,
                ...getSortParams(activeFilters.sortBy),
              });
            } else {
              response = await productService.getFeaturedProducts(20);
            }
            break;
          case 'trending':
            response = await productService.getTrendingProducts('7d', page, 20, {
              minPrice: activeFilters.minPrice,
              maxPrice: activeFilters.maxPrice,
              minRating: activeFilters.minRating,
              category: activeFilters.category,
              tag: activeFilters.tag,
            });
            break;
          case 'seller_favorites':
            response = await productService.getSellerFavorites(page, 20, {
              minPrice: activeFilters.minPrice,
              maxPrice: activeFilters.maxPrice,
              minRating: activeFilters.minRating,
              category: activeFilters.category,
              tag: activeFilters.tag,
            });
            break;
          case 'discounted':
            response = await productService.getProducts({
              page,
              limit: 20,
              minPrice: activeFilters.minPrice,
              maxPrice: activeFilters.maxPrice,
              minRating: activeFilters.minRating,
              tag: activeFilters.tag,
              ...getSortParams(activeFilters.sortBy || 'price_desc'),
            });
            if (response.success && response.data) {
              const allData = Array.isArray(response.data) ? response.data : response.data || [];
              const withDiscounts = allData.filter((product: Product) => product.discount && product.discount > 0);
              response.data = withDiscounts;
            }
            break;
          case 'all':
            response = await productService.getProducts({
              page,
              limit: 20,
              category: activeFilters.category,
              minPrice: activeFilters.minPrice,
              maxPrice: activeFilters.maxPrice,
              minRating: activeFilters.minRating,
              tag: activeFilters.tag,
              ...getSortParams(activeFilters.sortBy || 'newest'),
            });
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
              category: category || activeFilters.category,
              minPrice: activeFilters.minPrice,
              maxPrice: activeFilters.maxPrice,
              minRating: activeFilters.minRating,
              search: activeFilters.search,
              tag: activeFilters.tag,
              ...getSortParams(activeFilters.sortBy),
            });
        }
      } else if (category) {
        response = await productService.getProducts({ 
          page, 
          limit: 20,
          category,
          minPrice: activeFilters.minPrice,
          maxPrice: activeFilters.maxPrice,
          minRating: activeFilters.minRating,
          search: activeFilters.search,
          tag: activeFilters.tag,
          ...getSortParams(activeFilters.sortBy)
        });
      } else if (showAll === 'true') {
        response = await productService.getProducts({ 
          page, 
          limit: 20,
          minPrice: activeFilters.minPrice,
          maxPrice: activeFilters.maxPrice,
          minRating: activeFilters.minRating,
          search: activeFilters.search,
          tag: activeFilters.tag,
          ...getSortParams(activeFilters.sortBy || 'newest')
        });
      } else {
        response = await productService.getProducts({ 
          page, 
          limit: 20,
          category: activeFilters.category,
          minPrice: activeFilters.minPrice,
          maxPrice: activeFilters.maxPrice,
          minRating: activeFilters.minRating,
          search: activeFilters.search,
          tag: activeFilters.tag,
          ...getSortParams(activeFilters.sortBy)
        });
      }

      if (response && response.success && response.data) {
        const newProducts = Array.isArray(response.data) ? response.data : response.data.products || [];
        const finalProducts = page === 1 ? newProducts : [...products, ...newProducts];
        setProducts(finalProducts);
        
        if ('pagination' in response && response.pagination) {
          const paginationData = response.pagination;
          const totalPages = paginationData.totalPages || 1;
          setPagination({
            page: paginationData.page || page,
            hasNext: page < totalPages,
            total: paginationData.total || 0,
            pages: totalPages
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
      } else {
        const errorMessage = response?.error && typeof response.error === 'object' 
          ? response.error.message 
          : typeof response?.error === 'string' 
            ? response.error 
            : 'Failed to load products';
        Alert.alert('Error', errorMessage);
      }

    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [collectionId, collection, category, showAll, products, user]);

  const handleRefresh = useCallback(() => {
    if (isShowingCategories) {
      loadCategories();
    } else {
      loadProducts(1, true);
    }
  }, [isShowingCategories, loadProducts]);

  const handleProductPress = (product: Product) => {
    const productId = (product as any)._id || product.id;
    if (!productId) {
      console.warn('Product has no ID:', product);
      return;
    }
    
    router.push({
      pathname: '/product-detail/[id]',
      params: { id: productId }
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

  const hasActiveFilters = () => {
    return !!(
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRating ||
      filters.search ||
      filters.tag ||
      filters.sortBy
    );
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    loadProducts(1, true, newFilters);
  };


  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons 
          name={item.icon as any || 'grid-outline'} 
          size={32} 
          color={colors.primary} 
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      {item.subcategories && item.subcategories.length > 0 && (
        <Text style={styles.subcategoryCount}>
          {item.subcategories.length} subcategories
        </Text>
      )}
    </TouchableOpacity>
  );


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
    filterButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    filterButtonText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontFamily: fonts.medium,
    },
    filterButtonTextActive: {
      color: colors.primary,
    },
    filterBadge: {
      marginLeft: spacing.xs,
    },
    filterBadgeText: {
      fontSize: fontSizes.lg,
      color: colors.primary,
      fontFamily: fonts.bold,
    },
    productContainer: {
      width: '48%',
      margin: spacing.xs,
      alignSelf: 'center',
    },
    masonryContainer: {
      flexDirection: 'row',
      padding: spacing.base,
      gap: spacing.sm,
    },
    masonryColumn: {
      flex: 1,
    },
    masonryItem: {
      marginBottom: spacing.sm,
    },
    categoryCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 120,
      justifyContent: 'center',
      flex: 1,
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
    emptyStateContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing['4xl'],
      paddingHorizontal: spacing.xl,
      minHeight: 300,
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
    loadMoreButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginHorizontal: spacing.base,
      marginVertical: spacing.lg,
    },
    loadMoreText: {
      color: colors.background,
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
    },
    bottomSection: {
      marginTop: spacing.xl,
      marginBottom: spacing.base,
    },
    collectionsScrollView: {
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    collectionCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginRight: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      width: 120,
      minHeight: 100,
      justifyContent: 'center',
    },
    collectionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    collectionName: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    collectionCount: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
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
        <TouchableOpacity 
          style={[
            styles.filterButton,
            hasActiveFilters() && styles.filterButtonActive
          ]} 
          onPress={handleFilterPress}
        >
          <Ionicons 
            name="filter-outline" 
            size={16} 
            color={hasActiveFilters() ? colors.primary : colors.text} 
          />
          <Text style={[
            styles.filterButtonText,
            hasActiveFilters() && styles.filterButtonTextActive
          ]}>
            Filter & Sort
          </Text>
          {hasActiveFilters() && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>•</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {isShowingCategories ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Categories Section */}
          {categories.length === 0 ? (
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
          ) : (
            <View style={{ padding: spacing.base }}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
                {categories.map((item) => (
                  <View 
                    key={(item as any)._id || item.id || Math.random().toString()}
                    style={{
                      width: '48%',
                      marginBottom: spacing.sm,
                    }}
                  >
                    {renderCategory({ item })}
                  </View>
                ))}
              </View>
            </View>
          )}


        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Show empty state prominently if no products */}
          {products.length === 0 && !loading ? (
            <View style={styles.emptyStateContainer}>
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
          ) : (
            <View style={styles.masonryContainer}>
              <View style={styles.masonryColumn}>
                {products.filter((_, index) => index % 2 === 0).map((item) => {
                  if (!item || (!item.id && !(item as any)._id)) {
                    return null;
                  }
                  
                  return (
                    <View key={(item as any)._id || item.id || Math.random().toString()} style={styles.masonryItem}>
                      <ProductCard
                        product={item}
                        onPress={() => handleProductPress(item)}
                        variant="grid"
                      />
                    </View>
                  );
                })}
              </View>
              
              <View style={styles.masonryColumn}>
                {products.filter((_, index) => index % 2 === 1).map((item) => {
                  if (!item || (!item.id && !(item as any)._id)) {
                    return null;
                  }
                  
                  return (
                    <View key={(item as any)._id || item.id || Math.random().toString()} style={styles.masonryItem}>
                      <ProductCard
                        product={item}
                        onPress={() => handleProductPress(item)}
                        variant="grid"
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          
          {loadingMore && (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          {/* Load More Button for Products */}
          {!isShowingCategories && pagination.hasNext && !loadingMore && products.length > 0 && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={() => loadProducts(pagination.page + 1)}
            >
              <Text style={styles.loadMoreText}>Load More Products</Text>
            </TouchableOpacity>
          )}

          {/* Collections Section - Only show when not navigated from a specific section */}
          {collections.length > 0 && showAll !== 'true' && !collectionId && !collection && !category && (
            <View style={styles.bottomSection}>
              <SectionHeader
                title="Explore Collections"
                subtitle="Curated product collections"
                navigationSource={NavigationSource.HOME_COLLECTION}
                onActionPress={() => router.push({
                  pathname: '/product-listing',
                  params: { 
                    showCategories: 'true',
                    title: 'All Collections'
                  }
                })}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.collectionsScrollView}
              >
                {collections.map(collection => (
                  <TouchableOpacity
                    key={collection.id}
                    style={styles.collectionCard}
                    onPress={() => router.push({
                      pathname: '/product-listing',
                      params: { 
                        collectionId: collection.id,
                        title: collection.name
                      }
                    })}
                  >
                    <View style={styles.collectionIconContainer}>
                      <Ionicons name="albums-outline" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.collectionName} numberOfLines={2}>
                      {collection.name}
                    </Text>
                    {collection.productCount && (
                      <Text style={styles.collectionCount}>
                        {collection.productCount} products
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Browse All Products Section (only if not already showing all products) */}
          {showAll !== 'true' && (
            <BrowseAllCard
              onPress={() => router.push({
                pathname: '/product-listing',
                params: { 
                  title: 'All Products',
                  showAll: 'true'
                }
              })}
            />
          )}
        </ScrollView>
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