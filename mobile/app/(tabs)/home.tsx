import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, ActivityIndicator, Alert, RefreshControl, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs';
import { ProductCard } from '../../components/ProductCard';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionHeader } from '../../components/SectionHeader';
import { productService } from '../../services/ProductService';
import { categoryService } from '../../services/CategoryService';
import { collectionService } from '../../services/CollectionService';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { Product, Category, Collection } from '../../types/product';
import { NavigationSource } from '../../types/navigation';
import { testConnectionWithRetry, getConnectionErrorMessage } from '../../utils/connectionUtils';
import { spacing } from '../../theme';

export default function HomeTab() {
  const router = useRouter();
  const { fonts, fontSizes, colors, isDark } = useTheme();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<Record<string, Product[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  

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
      paddingVertical: spacing.md,
    },
    featureCardsRow: {
      width: screenWidth,
      marginHorizontal: 18,
      marginTop: spacing.md,
      gap: spacing.xs,
    },
    section: {
      marginBottom: spacing.xs,
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
      gap: spacing.sm,
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

      // Test backend connection first with retry logic for cold starts
      console.log('🔍 Testing backend connection...');
      const connectionResult = await testConnectionWithRetry(3, 15000);
      
      if (!connectionResult.success) {
        const errorMessage = getConnectionErrorMessage(connectionResult);
        console.error('❌ All connection attempts failed:', connectionResult.error);
        
        if (!isRefresh) {
          Alert.alert(
            'Connection Issue', 
            errorMessage,
            [
              { text: 'Retry', onPress: () => loadInitialData(false) },
              { text: 'Continue Offline', style: 'cancel' }
            ]
          );
        }
        // Continue loading even if connection test fails - the individual API calls might still work
      } else {
        if (connectionResult.isColdStart) {
          console.log('🥶 Cold start detected - server was sleeping');
        }
      }

      // Load categories first
      const categoriesResponse = await categoryService.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Load collections with lazy loading
      await loadCollections();
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

  const loadCollections = async () => {
    try {
      setIsLoadingCollections(true);
      
      // Load collections
      const collectionsResponse = await collectionService.getActiveCollections();
      if (collectionsResponse.success && collectionsResponse.data) {
        setCollections(collectionsResponse.data);
        
        // Load products for each collection (limit to 10 per collection for performance)
        const collectionProductsMap: Record<string, Product[]> = {};
        for (const collection of collectionsResponse.data) {
          const collectionProductsResponse = await collectionService.getCollectionProducts(collection.id, 1, 10);
          if (collectionProductsResponse.success && collectionProductsResponse.data) {
            collectionProductsMap[collection.id] = collectionProductsResponse.data.products || [];
          }
        }
        setCollectionProducts(collectionProductsMap);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setIsLoadingCollections(false);
    }
  };
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

  const categoryNames = ['All', ...(categories || []).map(c => c.name)];

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

      {/* Sticky Search Section */}
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
        <View>
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
              onPress={() => router.push({
                pathname: '/product-listing',
                params: { showCategories: 'true', title: 'Categories' }
              })}
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

        {/* Collections Sections - Display all admin-created collections */}
        {collections.map(collection => {
          const products = collectionProducts[collection.id] || [];
          if (products.length === 0) return null;
          
          return (
            <View key={collection.id} style={styles.section}>
              <SectionHeader
                title={collection.name}
                subtitle={collection.description || `${products.length} products`}
                actionText="See All"
                navigationSource={NavigationSource.HOME_COLLECTION}
                collectionType="custom"
                onActionPress={() => router.push({
                  pathname: '/product-listing',
                  params: { 
                    collectionId: collection.id,
                    title: collection.name
                  }
                })}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {products.map(product => {
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
          );
        })}

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