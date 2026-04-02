import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { ProductCard } from '../components/ProductCard';
import { ProductSectionSkeleton } from '../components/ProductSectionSkeleton';
import { productService } from '../services/ProductService';
import { categoryService } from '../services/CategoryService';
import { productCacheService } from '../services/ProductCacheService';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { Product, Category } from '../types/product';
import { spacing } from '../theme/spacing';

export default function SearchPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fonts, fontSizes, colors, isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState((params.query as string) || '');
  const [activeCategory, setActiveCategory] = useState((params.category as string) || 'All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    searchContainer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    section: {
      marginBottom: spacing.lg,
    },
    productsList: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      gap: spacing.lg,
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
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    productsLoadingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.base,
      gap: spacing.sm,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textLight,
      textAlign: 'center',
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
  });

  // Load initial data
  useEffect(() => {
    loadInitialDataOptimized();
  }, []);

  // Debounced search when query or category changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (searchQuery.trim() || activeCategory !== 'All') {
        loadProducts();
      } else {
        // Clear products if no search query and "All" category
        setProducts([]);
        setIsLoadingProducts(false);
      }
    }, searchQuery.trim() ? 300 : 0); // Debounce search queries
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [activeCategory, searchQuery]);

  const loadInitialDataOptimized = async () => {
    try {
      // Load categories in background without blocking UI
      categoryService.getCategories().then(categoriesResponse => {
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      });

      // If there's an initial query from params, load products
      if (searchQuery.trim() || activeCategory !== 'All') {
        await loadProducts();
      }
    } catch (error) {
      // Silently fail - categories will show as empty
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      
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

      // Check cache first for better performance
      const cacheKey = `${searchQuery.trim()}_${activeCategory}`;
      const cachedResults = productCacheService.getCachedSearchResults(cacheKey, params);
      if (cachedResults) {
        setProducts(cachedResults);
        setIsLoadingProducts(false);
        return;
      }

      const response = await productService.searchProducts(params);
      
      if (response.success && response.data) {
        setProducts(response.data);
        // Cache the results
        productCacheService.cacheSearchResults(cacheKey, response.data, params);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductPress = (product: Product) => {
    // Handle both _id and id fields from backend
    const productId = (product as any)._id || product.id;
    router.push({ pathname: '/product-detail/[id]', params: { id: productId } });
  };

  const categoryNames = ['All', ...categories.map(c => c.name)];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar 
          backgroundColor={colors.surface} 
          barStyle={isDark ? "light-content" : "dark-content"} 
        />
        
        <Header
          title="Search"
          showBack={true}
        />

        {/* Sticky Search and Tabs Section */}
        <View style={styles.stickySection}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products, suppliers..."
              onCameraPress={() => {
                // Camera functionality not implemented yet
              }}
            />
          </View>

          {/* Category Tabs - Show "All" immediately */}
          <CategoryTabs
            categories={['All']}
            activeCategory={activeCategory}
            onCategoryPress={setActiveCategory}
          />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Start searching</Text>
          <Text style={styles.emptySubtext}>
            Enter keywords or browse categories to find products
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor={colors.surface} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />
      
      <Header
        title="Search"
        showBack={true}
      />

      {/* Sticky Search and Tabs Section */}
      <View style={styles.stickySection}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products, suppliers..."
            onCameraPress={() => {
              // Camera functionality not implemented yet
            }}
          />
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categoryNames}
          activeCategory={activeCategory}
          onCategoryPress={setActiveCategory}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Results Header */}
        {(searchQuery.trim() || activeCategory !== 'All') && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {products.length} results
              {searchQuery.trim() ? ` for "${searchQuery}"` : ''}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </Text>
          </View>
        )}

        {/* Products Loading Indicator */}
        {isLoadingProducts && products.length === 0 && (
          <ProductSectionSkeleton variant="list" itemCount={4} showHeader={false} />
        )}

        {/* Products List */}
        <View style={styles.section}>
          {products.length > 0 ? (
            <View style={styles.productsList}>
              {products.map(product => {
                const productId = (product as any)._id || product.id;
                return (
                  <ProductCard
                    key={productId}
                    product={product}
                    variant="list"
                    onPress={() => handleProductPress(product)}
                    showAddButton={true}
                  />
                );
              })}
            </View>
          ) : !isLoadingProducts && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery.trim() 
                  ? `No results for "${searchQuery}". Try different keywords.`
                  : 'Try searching for products or browse categories.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}