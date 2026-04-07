import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Alert, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { ProductCard } from '../components/ProductCard';
import { ProductFilterModal } from '../components/ProductFilterModal';
import { ProductSectionSkeleton } from '../components/ProductSectionSkeleton';
import { SectionHeader } from '../components/SectionHeader';
import { BrowseAllCard } from '../components/BrowseAllCard';
import { productService } from '../services/ProductService';
import { collectionService } from '../services/CollectionService';
import { categoryService } from '../services/CategoryService';
import { productCacheService } from '../services/ProductCacheService';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Product, Category, Collection } from '../types/product';
import { NavigationSource } from '../types/navigation';
import { spacing, borderRadius } from '../theme/spacing';
import * as ImagePicker from 'expo-image-picker';

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

export default function ProductsPage() {
  const { 
    collectionId, 
    collection, 
    title, 
    showCategories,
    category,
    subcategory,
    showAll,
    query: initialQuery
  } = useLocalSearchParams<{
    collectionId?: string;
    collection?: string;
    title?: string;
    showCategories?: string;
    category?: string;
    subcategory?: string;
    showAll?: string;
    query?: string;
  }>();
  
  const router = useRouter();
  const { colors, fontSizes, fonts } = useTheme();
  const { user } = useAuth();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [activeCategory, setActiveCategory] = useState(category || 'All');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Product states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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
  const isSearchMode = !!searchQuery.trim() || activeCategory !== 'All';
  const pageTitle = title || 
    (isShowingCategories ? 'Categories' : 
     category ? `${category} Products` : 
     isSearchMode ? 'Search Results' :
     'Products');
  useEffect(() => {
    if (isShowingCategories) {
      loadCategories();
    } else {
      loadInitialData();
    }
  }, [collectionId, collection, category, isShowingCategories, showAll]);

  // Debounced search when query or category changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (isSearchMode) {
        performSearch();
      } else {
        loadProducts();
      }
    }, searchQuery.trim() ? 300 : 0);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [activeCategory, searchQuery, isSearchMode]);

  // Apply filters locally whenever filters or allProducts change
  useEffect(() => {
    if (!isSearchMode) {
      applyLocalFilters();
    }
  }, [filters, allProducts, isSearchMode]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load categories in background
      categoryService.getCategories().then(categoriesResponse => {
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      });

      // Load products or perform search based on initial state
      if (isSearchMode) {
        await performSearch();
      } else {
        await loadProducts();
        // Load collections when not navigated from a specific section
        if (!collectionId && !collection && !category && showAll !== 'true') {
          loadCollections();
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        setCollections(response.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        limit: 50,
        page: 1
      };

      // Add category filter if not "All"
      if (activeCategory !== 'All') {
        params.category = activeCategory;
      }

      // Add search query if provided
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Check cache first
      const cacheKey = `${searchQuery.trim()}_${activeCategory}`;
      const cachedResults = productCacheService.getCachedSearchResults(cacheKey, params);
      if (cachedResults) {
        setAllProducts(cachedResults);
        setFilteredProducts(cachedResults);
        setLoading(false);
        return;
      }

      const response = await productService.searchProducts(params);
      
      if (response.success && response.data) {
        setAllProducts(response.data);
        setFilteredProducts(response.data);
        // Cache the results
        productCacheService.cacheSearchResults(cacheKey, response.data, params);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };
  // Apply filters locally to already loaded products
  const applyLocalFilters = useCallback(() => {
    let filtered = [...allProducts];

    // Apply price filter
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      filtered = filtered.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      filtered = filtered.filter(p => p.price <= Number(filters.maxPrice));
    }

    // Apply rating filter
    if (filters.minRating !== undefined && filters.minRating !== '') {
      filtered = filtered.filter(p => (p.rating || 0) >= Number(filters.minRating));
    }

    // Apply tag filter
    if (filters.tag) {
      filtered = filtered.filter(p => 
        p.tags && Array.isArray(p.tags) && p.tags.includes(filters.tag)
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter (if not already filtered by route)
    if (filters.category && !category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filtered.sort((a, b) => {
            const dateA = new Date((a as any).createdAt || 0).getTime();
            const dateB = new Date((b as any).createdAt || 0).getTime();
            return dateB - dateA;
          });
          break;
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'trending':
          // Keep original order for trending
          break;
      }
    }

    setFilteredProducts(filtered);
  }, [allProducts, filters, category]);

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
        response = await collectionService.getCollectionProducts(collectionId, page, 20);
        if (response.success && response.data) {
          const collectionData = response.data;
          const newProducts = collectionData.products || [];
          const updatedProducts = page === 1 ? newProducts : [...allProducts, ...newProducts];
          setAllProducts(updatedProducts);
          setPagination({
            page,
            hasNext: newProducts.length === 20,
            total: collectionData.productCount || newProducts.length,
            pages: Math.ceil((collectionData.productCount || newProducts.length) / 20)
          });
        }
      } else if (collection) {
        switch (collection) {
          case 'featured':
            response = await productService.getFeaturedProducts(20);
            break;
          case 'trending':
            response = await productService.getTrendingProducts('7d', page, 20);
            break;
          case 'seller_favorites':
            response = await productService.getSellerFavorites(page, 20);
            break;
          case 'discounted':
            response = await productService.getProducts({
              page,
              limit: 20,
              ...getSortParams('price_desc'),
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
              ...getSortParams('newest'),
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
              category: category,
            });
        }
      } else if (category) {
        const params: any = { 
          page, 
          limit: 20,
          category,
        };
        
        if (subcategory) {
          params.subcategory = subcategory;
        }
        
        response = await productService.getProducts(params);
      } else if (showAll === 'true') {
        response = await productService.getProducts({ 
          page, 
          limit: 20,
          ...getSortParams('newest')
        });
      } else {
        response = await productService.getProducts({ 
          page, 
          limit: 20,
        });
      }

      if (response && response.success && response.data) {
        const newProducts = Array.isArray(response.data) ? response.data : response.data.products || [];
        const finalProducts = page === 1 ? newProducts : [...allProducts, ...newProducts];
        setAllProducts(finalProducts);
        
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
  }, [collectionId, collection, category, showAll, allProducts, user]);
  const handleRefresh = useCallback(() => {
    if (isShowingCategories) {
      loadCategories();
    } else if (isSearchMode) {
      performSearch();
    } else {
      loadProducts(1, true);
    }
  }, [isShowingCategories, isSearchMode, performSearch, loadProducts]);

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
      pathname: '/products',
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
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleImageSearch = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required for image search');
        return;
      }

      Alert.alert(
        'Image Search',
        'Choose how to search with an image',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                // TODO: Implement image search API call
                Alert.alert('Coming Soon', 'Image search functionality will be available soon!');
              }
            }
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                // TODO: Implement image search API call
                Alert.alert('Coming Soon', 'Image search functionality will be available soon!');
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Image search error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
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

  const categoryNames = ['All', ...categories.map(c => c.name)];
  const displayProducts = isSearchMode ? filteredProducts : filteredProducts;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    stickySection: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      zIndex: 1,
    },
    searchContainer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    content: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
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
    clearFiltersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      marginHorizontal: spacing.base,
      marginTop: -spacing.sm,
      marginBottom: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.error || '#EF4444',
      gap: spacing.xs,
    },
    clearFiltersButtonText: {
      fontSize: fontSizes.xs,
      color: colors.error || '#EF4444',
      fontFamily: fonts.medium,
    },
    resultsHeader: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    resultsText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
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
        
        {/* Show search bar and category tabs even while loading */}
        <View style={styles.stickySection}>
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products, suppliers..."
              onCameraPress={handleImageSearch}
            />
          </View>
          
          {!isShowingCategories && (
            <CategoryTabs
              categories={categoryNames}
              activeCategory={activeCategory}
              onCategoryPress={setActiveCategory}
            />
          )}
        </View>

        {!isShowingCategories && (
          <View style={[styles.filterButton, { opacity: 0.4 }]} pointerEvents="none">
            <Ionicons name="filter-outline" size={16} color={colors.text} />
            <Text style={styles.filterButtonText}>Filter & Sort</Text>
          </View>
        )}
        
        <ProductSectionSkeleton
          variant={isShowingCategories ? 'grid' : 'grid'}
          itemCount={6}
          showHeader={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={pageTitle} showBack />
      
      {/* Sticky Search and Tabs Section */}
      <View style={styles.stickySection}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products, suppliers..."
            onCameraPress={handleImageSearch}
          />
        </View>
        
        {!isShowingCategories && (
          <CategoryTabs
            categories={categoryNames}
            activeCategory={activeCategory}
            onCategoryPress={setActiveCategory}
          />
        )}
      </View>

      {!isShowingCategories && (
        <>
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
          
          {hasActiveFilters() && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Ionicons name="close-circle-outline" size={16} color={colors.error || '#EF4444'} />
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Results Header for Search Mode */}
        {isSearchMode && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {displayProducts.length} results
              {searchQuery.trim() ? ` for "${searchQuery}"` : ''}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </Text>
          </View>
        )}

        {isShowingCategories ? (
          /* Categories Section */
          categories.length === 0 ? (
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
          )
        ) : (
          /* Products Section */
          <>
            {displayProducts.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons 
                  name="cube-outline" 
                  size={64} 
                  color={colors.textLight} 
                />
                <Text style={styles.emptyText}>
                  {isSearchMode ? 'No products found' : 'No products available'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {isSearchMode 
                    ? searchQuery.trim() 
                      ? `No results for "${searchQuery}". Try different keywords.`
                      : 'Try searching for products or browse categories.'
                    : 'Try adjusting your filters or check back later'
                  }
                </Text>
              </View>
            ) : (
              /* Products - Grid View (consistent for all modes) */
              <View style={styles.masonryContainer}>
                <View style={styles.masonryColumn}>
                  {displayProducts.filter((_, index) => index % 2 === 0).map((item) => {
                    if (!item || (!item.id && !(item as any)._id)) {
                      return null;
                    }
                    
                    return (
                      <View key={(item as any)._id || item.id || Math.random().toString()} style={styles.masonryItem}>
                        <ProductCard
                          product={item}
                          onPress={() => handleProductPress(item)}
                          variant="grid"
                          showAddButton={true}
                          searchQuery={isSearchMode ? searchQuery.trim() : undefined}
                        />
                      </View>
                    );
                  })}
                </View>
                
                <View style={styles.masonryColumn}>
                  {displayProducts.filter((_, index) => index % 2 === 1).map((item) => {
                    if (!item || (!item.id && !(item as any)._id)) {
                      return null;
                    }
                    
                    return (
                      <View key={(item as any)._id || item.id || Math.random().toString()} style={styles.masonryItem}>
                        <ProductCard
                          product={item}
                          onPress={() => handleProductPress(item)}
                          variant="grid"
                          showAddButton={true}
                          searchQuery={isSearchMode ? searchQuery.trim() : undefined}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            
            {loadingMore && (
              <ProductSectionSkeleton variant="grid" itemCount={4} showHeader={false} />
            )}

            {/* Load More Button for Products */}
            {!isSearchMode && pagination.hasNext && !loadingMore && displayProducts.length > 0 && (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={() => loadProducts(pagination.page + 1)}
              >
                <Text style={styles.loadMoreText}>Load More Products</Text>
              </TouchableOpacity>
            )}

            {/* Collections Section - Only show when not in search mode and not navigated from a specific section */}
            {!isSearchMode && collections.length > 0 && showAll !== 'true' && !collectionId && !collection && !category && (
              <View style={styles.bottomSection}>
                <SectionHeader
                  title="Explore Collections"
                  subtitle="Curated product collections"
                  navigationSource={NavigationSource.HOME_COLLECTION}
                  onActionPress={() => router.push({
                    pathname: '/products',
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
                        pathname: '/products',
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

            {/* Browse All Products Section (only if not already showing all products and not in search mode) */}
            {!isSearchMode && showAll !== 'true' && (
              <BrowseAllCard
                onPress={() => router.push({
                  pathname: '/products',
                  params: { 
                    title: 'All Products',
                    showAll: 'true'
                  }
                })}
              />
            )}
          </>
        )}
      </ScrollView>

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