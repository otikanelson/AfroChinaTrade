import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ProductCard } from '../../components/ProductCard';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionHeader } from '../../components/SectionHeader';
import { productService } from '../../services/ProductService';
import { categoryService } from '../../services/CategoryService';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { Product, Category } from '../../types/product';
import { NavigationSource } from '../../types/navigation';
import { spacing } from '../../theme/spacing';

export default function HomeTab() {
  const router = useRouter();
  const { fonts, fontSizes, colors, isDark } = useTheme();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [sellerFavorites, setSellerFavorites] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use the recommendations hook
  const { recommendations, hasRecommendations, refreshRecommendations } = useRecommendations();

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
    searchContainer: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.xs,
    },
    featureCardsContainer: {
      paddingVertical: spacing.sm,
      marginBottom: 0,
    },
    featureCardsRow: {
      paddingHorizontal: spacing.base,
      gap: spacing.xs,
    },
    section: {
      marginBottom: spacing.xs,
      marginTop: 0,
    },
    horizontalList: {
      paddingHorizontal: 3,
    },
    featuredCardWrapper: {
      width: 110,
      margin: 5,
    },
    masonryContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.lg,
    },
    masonryColumn: {
      flex: 1,
      alignItems: 'center',
    },
    masonryItem: {
      marginBottom: spacing.md,
      width: '100%',
      alignItems: 'center',
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
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load products when category changes
  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  // Refresh data when screen comes into focus (user navigates back to home)
  useFocusEffect(
    useCallback(() => {
      // Refresh recommendations when user comes back to home
      refreshRecommendations();

      // Optionally refresh other data if needed
      // You can add a timestamp check to avoid too frequent refreshes
      const lastRefresh = Date.now() - (window as any).lastHomeRefresh || 0;
      if (lastRefresh > 30000) { // Refresh if last refresh was more than 30 seconds ago
        handleRefresh();
        (window as any).lastHomeRefresh = Date.now();
      }
    }, [refreshRecommendations])
  );

  const loadInitialData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }

      // Load categories first
      const categoriesResponse = await categoryService.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Load different product collections in parallel with cache busting
      const timestamp = Date.now();
      const [featuredResponse, trendingResponse, sellerFavoritesResponse] = await Promise.all([
        productService.getProductCollection('featured', { limit: 10, _t: timestamp } as any),
        productService.getProductCollection('trending', { limit: 10, _t: timestamp } as any),
        productService.getProductCollection('seller_favorites', { limit: 10, _t: timestamp } as any)
      ]);

      // Set featured products only if there are any
      if (featuredResponse.success && featuredResponse.data?.products && featuredResponse.data.products.length > 0) {
        setFeaturedProducts(featuredResponse.data.products);
      } else {
        setFeaturedProducts([]);
      }

      // Set trending products only if there are any
      if (trendingResponse.success && trendingResponse.data?.products && trendingResponse.data.products.length > 0) {
        setTrendingProducts(trendingResponse.data.products);
      } else {
        setTrendingProducts([]);
      }

      // Set seller favorites only if there are any
      if (sellerFavoritesResponse.success && sellerFavoritesResponse.data?.products && sellerFavoritesResponse.data.products.length > 0) {
        setSellerFavorites(sellerFavoritesResponse.data.products);
      } else {
        setSellerFavorites([]);
      }

      // Load initial products for the "All Products" section
      await loadProducts();
    } catch (error) {
      console.error('Failed to load initial data:', error);
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to load data. Please try again.');
      }
    } finally {
      if (!isRefresh) {
        setIsLoading(false);
      }
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);

      const params: any = {
        limit: 20,
        page: 1
      };

      // Add category filter if not "All"
      if (activeCategory !== 'All') {
        params.category = activeCategory;
      }

      const response = await productService.getProducts(params);

      if (response.success && response.data) {
        const productsData = response.data || [];
        setProducts(productsData);
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

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reload all data
      await Promise.all([
        loadInitialData(true), // Pass true to indicate this is a refresh
        refreshRecommendations()
      ]);
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshRecommendations]);

  const categoryNames = ['All', ...categories.map(c => c.name)];

  // Split products into three columns for masonry layout
  const getMasonryColumns = (productList: Product[]) => {
    const column1: Product[] = [];
    const column2: Product[] = [];
    const column3: Product[] = [];
    productList.forEach((product, index) => {
      if (index % 3 === 0) column1.push(product);
      else if (index % 3 === 1) column2.push(product);
      else column3.push(product);
    });
    return { column1, column2, column3 };
  };

  const { column1, column2, column3 } = getMasonryColumns(products);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title="AfroChinaTrade"
          showLogo={true}
          showCart={true}
          cartCount={cartCount}
          onCartPress={() => router.push('/cart')}
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
      <StatusBar
        backgroundColor={colors.surface}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <Header
        title="AfroChinaTrade"
        showLogo={true}
        showCart={user?.role !== 'admin'} // Hide cart for admin users
        cartCount={cartCount}
        onCartPress={() => router.push('/cart')}
      />

      {/* Sticky Search and Tabs Section */}
      <View style={styles.stickySection}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value=""
            onChangeText={() => { }}
            placeholder="Search products, suppliers..."
            onCameraPress={() => console.log('Camera pressed')}
            onPress={() => router.push('/search')}
            editable={false}
          />
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categoryNames}
          activeCategory={activeCategory}
          onCategoryPress={setActiveCategory}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >

        {/* Feature Cards - Single Row */}
        <View style={styles.featureCardsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featureCardsRow}
          >
            <FeatureCard
              key="verified-suppliers"
              iconName="shield-check"
              title="Verified"
              subtitle="Suppliers"
              iconColor={colors.secondary}
              onPress={() => router.push('/suppliers')}
            />
            <FeatureCard
              key="secure-trading"
              iconName="lock"
              title="Secure"
              subtitle="Trading"
              iconColor={colors.accent}
            />
            <FeatureCard
              key="categories"
              iconName="view-grid"
              title="Categories"
              subtitle="Browse all"
              iconColor={colors.primary}
            />
            <FeatureCard
              key="get-quotes"
              iconName="file-document-edit"
              title="Get Quotes"
              subtitle="Request"
              iconColor={colors.secondary}
              onPress={() => router.push('/messages')}
            />
          </ScrollView>
        </View>

        {/* Featured Products - Only show if there are featured products */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Featured Products"
              subtitle="Handpicked deals for you"
              actionText="See All"
              navigationSource={NavigationSource.HOME_FEATURED}
              collectionType="featured"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {featuredProducts.map(product => {
                const productId = (product as any)._id || product.id;
                const badgeText = product.isNew ? 'New' : undefined;
                return (
                  <View key={productId} style={styles.featuredCardWrapper}>
                    <ProductCard
                      product={product}
                      badge={badgeText}
                      onPress={() => handleProductPress(product)}
                      showViewCount={true}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Trending Products - Only show if there are trending products */}
        {trendingProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Trending Products"
              subtitle="Popular right now"
              actionText="See All"
              navigationSource={NavigationSource.HOME_TRENDING}
              collectionType="trending"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {trendingProducts.map(product => {
                const productId = (product as any)._id || product.id;
                return (
                  <View key={productId} style={styles.featuredCardWrapper}>
                    <ProductCard
                      product={product}
                      onPress={() => handleProductPress(product)}
                      showViewCount={true}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Seller Favorites - Only show if there are seller favorites */}
        {sellerFavorites.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Seller Favorites"
              subtitle="Top picks from our sellers"
              actionText="See All"
              navigationSource={NavigationSource.HOME_SELLER_FAVORITES}
              collectionType="seller_favorites"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {sellerFavorites.map(product => {
                const productId = (product as any)._id || product.id;
                const badgeText = 'Seller Pick';
                return (
                  <View key={productId} style={styles.featuredCardWrapper}>
                    <ProductCard
                      product={product}
                      badge={badgeText}
                      onPress={() => handleProductPress(product)}
                      showViewCount={true}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Recommended Products - Only show for authenticated users with recommendations */}
        {user && hasRecommendations && (
          <View style={styles.section}>
            <SectionHeader
              title="Recommended for You"
              subtitle="Based on your interests"
              actionText="See All"
              navigationSource={NavigationSource.HOME_RECOMMENDED}
              collectionType="recommended"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recommendations.map(product => {
                const productId = (product as any)._id || product.id;
                return (
                  <View key={productId} style={styles.featuredCardWrapper}>
                    <ProductCard
                      product={product}
                      onPress={() => handleProductPress(product)}
                      showViewCount={true}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Products Loading Indicator */}
        {isLoadingProducts && (
          <View style={styles.productsLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        )}

        {/* Masonry Product Grid */}
        <View style={styles.section}>
          <SectionHeader
            title={activeCategory === 'All' ? 'All Products' : activeCategory}
            subtitle={`${products.length || 0} products`}
            actionText="See All"
            navigationSource={NavigationSource.HOME_ALL}
            collectionType="all"
          />
          {products.length > 0 ? (
            <View style={styles.masonryContainer}>
              <View style={styles.masonryColumn}>
                {column1.map(product => {
                  const productId = (product as any)._id || product.id;
                  const badgeText = product.isNew ? 'New' : undefined;
                  return (
                    <View key={productId} style={styles.masonryItem}>
                      <ProductCard
                        product={product}
                        badge={badgeText}
                        onPress={() => handleProductPress(product)}
                        showViewCount={true}
                      />
                    </View>
                  );
                })}
              </View>
              <View style={styles.masonryColumn}>
                {column2.map(product => {
                  const productId = (product as any)._id || product.id;
                  const badgeText = product.isNew ? 'New' : undefined;
                  return (
                    <View key={productId} style={styles.masonryItem}>
                      <ProductCard
                        product={product}
                        badge={badgeText}
                        onPress={() => handleProductPress(product)}
                        showViewCount={true}
                      />
                    </View>
                  );
                })}
              </View>
              <View style={styles.masonryColumn}>
                {column3.map(product => {
                  const productId = (product as any)._id || product.id;
                  const badgeText = product.isNew ? 'New' : undefined;
                  return (
                    <View key={productId} style={styles.masonryItem}>
                      <ProductCard
                        product={product}
                        badge={badgeText}
                        onPress={() => handleProductPress(product)}
                        showViewCount={true}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}