import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/ProductService';
import { categoryService } from '../services/CategoryService';
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
    loadInitialData();
  }, []);

  // Load products when category or search changes
  useEffect(() => {
    loadProducts();
  }, [activeCategory, searchQuery]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      const categoriesResponse = await categoryService.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Load initial products
      await loadProducts();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
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

      const response = await productService.searchProducts(params);
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
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
        <Header
          title="Search"
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
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
            onCameraPress={() => console.log('Camera pressed')}
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
              {searchQuery.trim() && ` for "${searchQuery}"`}
              {activeCategory !== 'All' && ` in ${activeCategory}`}
            </Text>
          </View>
        )}

        {/* Products Loading Indicator */}
        {isLoadingProducts && (
          <View style={styles.productsLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
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
                  : 'Try searching for products or browse categories.'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}