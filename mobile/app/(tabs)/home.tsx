import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, Alert, RefreshControl, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';
import { ProductCard } from '../../components/ProductCard';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionHeader } from '../../components/SectionHeader';
import { BrowseAllCard } from '../../components/BrowseAllCard';
import { ProductSectionSkeleton } from '../../components/ProductSectionSkeleton';
import { CameraSearchModal } from '../../components/CameraSearchModal';
import { categoryService } from '../../services/CategoryService';
import { collectionService } from '../../services/CollectionService';
import { productCacheService } from '../../services/ProductCacheService';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { Product, Category, Collection } from '../../types/product';
import { NavigationSource } from '../../types/navigation';
import { testConnectionWithRetry, getConnectionErrorMessage } from '../../utils/connectionUtils';
import { spacing, borderRadius } from '../../theme';

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
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
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
    categoriesSection: {
      marginBottom: spacing.lg,
    },
    categoriesScrollView: {
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    categoryCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      marginRight: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      width: 100,
      minHeight: 90,
      justifyContent: 'center',
    },
    categoryIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    categoryName: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.medium,
      color: colors.text,
      textAlign: 'center',
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

      // Show UI immediately, load data progressively
      if (!isRefresh) {
        setIsLoading(false); // Show UI immediately
      }

      // Test backend connection in background
      const connectionResult = await testConnectionWithRetry(3, 15000);
      
      if (!connectionResult.success) {
        const errorMessage = getConnectionErrorMessage(connectionResult);
        
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
      }

      // Load categories and collections in parallel
      const [categoriesResponse, collectionsResponse] = await Promise.all([
        categoryService.getCategories(),
        collectionService.getActiveCollections()
      ]);

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data.slice(0, 6));
      }

      if (collectionsResponse.success && collectionsResponse.data) {
        setCollections(collectionsResponse.data);
        // Load collection products progressively
        loadCollectionProductsProgressively(collectionsResponse.data);
      }

    } catch (error) {
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to load data. Please try again.');
      }
    }
  };

  const loadCollectionProductsProgressively = async (collections: Collection[]) => {
    // Load collection products one by one to show progressive updates
    for (const collection of collections) {
      try {
        setLoadingStates(prev => ({ ...prev, [collection.id]: true }));
        
        // Check cache first
        const cachedProducts = productCacheService.getCachedCollectionProducts(collection.id);
        if (cachedProducts) {
          setCollectionProducts(prev => ({
            ...prev,
            [collection.id]: cachedProducts
          }));
          setLoadingStates(prev => ({ ...prev, [collection.id]: false }));
          continue;
        }

        const collectionProductsResponse = await collectionService.getCollectionProducts(collection.id, 1, 10);
        if (collectionProductsResponse.success && collectionProductsResponse.data) {
          const products = collectionProductsResponse.data.products || [];
          setCollectionProducts(prev => ({
            ...prev,
            [collection.id]: products
          }));
          // Cache the results
          productCacheService.cacheCollectionProducts(collection.id, products);
        }
      } catch (error) {
        // Continue loading other collections even if one fails
      } finally {
        setLoadingStates(prev => ({ ...prev, [collection.id]: false }));
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
      // Clear cache on refresh
      productCacheService.clear();
      // Reload all data
      await Promise.all([
        loadInitialData(true),
        refreshRecommendations()
      ]);
    } catch (error) {
      // Error refreshing home data
    } finally {
      setRefreshing(false);
    }
  }, [refreshRecommendations]);

  const handleCameraPress = () => {
    setShowCameraModal(true);
  };

  const renderCollectionSection = (collection: Collection) => {
    const products = collectionProducts[collection.id] || [];
    const isLoadingSection = loadingStates[collection.id];
    
    // Show skeleton while loading
    if (isLoadingSection && products.length === 0) {
      return (
        <ProductSectionSkeleton
          key={`${collection.id}_skeleton`}
          variant="horizontal"
          itemCount={4}
          showHeader={true}
        />
      );
    }
    
    // Don't render if no products and not loading
    if (products.length === 0 && !isLoadingSection) return null;
    
    return (
      <View key={collection.id} style={styles.section}>
        <SectionHeader
          title={collection.name}
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
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={colors.surface}
          barStyle={isDark ? "light-content" : "dark-content"}
        />

        <Header
          title="AfroChinaTrade"
          showLogo={true}
          showCart={user?.role !== 'admin'}
          cartCount={cartCount}
          onCartPress={() => router.push('/cart')}
        />

        {/* Sticky Search Section */}
        <View style={styles.stickySection}>
          <View style={styles.searchContainer}>
            <SearchBar
              value=""
              onChangeText={() => { }}
              placeholder="Search products, suppliers..."
              onCameraPress={handleCameraPress}
              onPress={() => router.push('/search')}
              editable={false}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Feature Cards Skeleton */}
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
                onPress={() => {
                  router.push('/verified-suppliers');
                }}
              />
              <FeatureCard
                key="quick delivery"
                iconName="truck-fast"
                title="quick delivery"
                subtitle="make order"
                iconColor={colors.accent}
                onPress={() => {
                    router.push('/my-orders');
                  }
                }
              />
              <FeatureCard
                key="categories"
                iconName="view-grid"
                title="All Categories"
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

          {/* Loading Skeletons */}
          <ProductSectionSkeleton variant="horizontal" itemCount={4} />
          <ProductSectionSkeleton variant="horizontal" itemCount={4} />
          <ProductSectionSkeleton variant="horizontal" itemCount={4} />
        </ScrollView>
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
            onCameraPress={handleCameraPress}
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
              onPress={() => {
                router.push('/verified-suppliers');
              }}
            />
            <FeatureCard
              key="delivery"
              iconName="speedometer"
              title="Quick Delivery"
              subtitle="Make order"
              iconColor={colors.accent}
              onPress={() => {
                router.push('/my-orders');
              }}
            />
            <FeatureCard
              key="categories"
              iconName="view-grid"
              title="All Categories"
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

        {/* Collections Sections - Display all admin-created collections */}
        {collections.map(renderCollectionSection)}

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

        {/* Show loading skeletons for collections that are still loading */}
        {Object.entries(loadingStates).some(([_, loading]) => loading) && (
          <ProductSectionSkeleton variant="horizontal" itemCount={4} />
        )}

        {/* Empty State - Show when no collections are available */}
        {collections.length === 0 && !Object.values(loadingStates).some(loading => loading) && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections available</Text>
            <Text style={styles.emptySubtext}>Collections will appear here once they are created by admin</Text>
          </View>
        )}

        {/* Browse All Products Section */}
        <BrowseAllCard
          onPress={() => router.push({
            pathname: '/product-listing',
            params: { 
              title: 'All Products',
              showAll: 'true'
            }
          })}
        />
      </ScrollView>

      {/* Camera Search Modal */}
      <CameraSearchModal
        visible={showCameraModal}
        onClose={() => setShowCameraModal(false)}
      />
    </View>
  );
}