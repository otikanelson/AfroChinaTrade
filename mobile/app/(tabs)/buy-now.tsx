import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { SectionHeader } from '../../components/SectionHeader';
import { ProductSectionSkeleton } from '../../components/ProductSectionSkeleton';
import { productService } from '../../services/ProductService';
import { productCacheService } from '../../services/ProductCacheService';
import { Product } from '../../types/product';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';

export default function BuyNowTab() {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [sellerFavorites, setSellerFavorites] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    featured: true,
    trending: true,
    seller_favorites: true,
    discounted: true,
    all: true
  });
  const [loadingErrors, setLoadingErrors] = useState<string[]>([]);

  // Use recommendations hook for personalized products
  const { recommendations, hasRecommendations } = useRecommendations();

  useEffect(() => {
    loadAllSectionsOptimized();
  }, []);

  const loadAllSectionsOptimized = async () => {
    try {
      // Show UI immediately with skeletons
      setLoading(false);
      
      // Load cached data first for instant display
      loadCachedData();
      
      // Then load fresh data in background
      await loadFreshData();
      
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    }
  };

  const loadCachedData = () => {
    // Load from cache for instant display
    const cachedFeatured = productCacheService.getCachedFeaturedProducts();
    if (cachedFeatured) {
      setFeaturedProducts(cachedFeatured);
      setLoadingStates(prev => ({ ...prev, featured: false }));
    }

    const cachedTrending = productCacheService.getCachedTrendingProducts();
    if (cachedTrending) {
      setTrendingProducts(cachedTrending);
      setLoadingStates(prev => ({ ...prev, trending: false }));
    }

    const cachedSellerFavorites = productCacheService.getCachedSellerFavorites();
    if (cachedSellerFavorites) {
      setSellerFavorites(cachedSellerFavorites);
      setLoadingStates(prev => ({ ...prev, seller_favorites: false }));
    }

    const cachedDiscounted = productCacheService.getCachedDiscountedProducts();
    if (cachedDiscounted) {
      setDiscountedProducts(cachedDiscounted);
      setLoadingStates(prev => ({ ...prev, discounted: false }));
    }

    const cachedAll = productCacheService.getCachedAllProducts({ limit: 8, sortBy: 'newest' });
    if (cachedAll) {
      setAllProducts(cachedAll);
      setLoadingStates(prev => ({ ...prev, all: false }));
    }
  };

  const loadFreshData = async () => {
    // Load sections progressively for better UX
    const sections = [
      {
        key: 'featured',
        loader: () => productService.getFeaturedProducts(12),
        setter: setFeaturedProducts,
        cacher: (data: Product[]) => productCacheService.cacheFeaturedProducts(data)
      },
      {
        key: 'trending',
        loader: () => productService.getTrendingProducts('7d', 1, 12),
        setter: setTrendingProducts,
        cacher: (data: Product[]) => productCacheService.cacheTrendingProducts(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || []
      },
      {
        key: 'seller_favorites',
        loader: () => productService.getSellerFavorites(1, 12),
        setter: setSellerFavorites,
        cacher: (data: Product[]) => productCacheService.cacheSellerFavorites(data),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data?.products || []
      },
      {
        key: 'discounted',
        loader: () => productService.getProducts({ limit: 12, minPrice: 1, sortBy: 'price_desc' as any }),
        setter: setDiscountedProducts,
        cacher: (data: Product[]) => productCacheService.cacheDiscountedProducts(data),
        transformer: (response: any) => {
          const products = Array.isArray(response.data) ? response.data : response.data || [];
          return products.filter((product: Product) => product.discount && product.discount > 0);
        }
      },
      {
        key: 'all',
        loader: () => productService.getProducts({ limit: 8, sortBy: 'newest' as any }),
        setter: setAllProducts,
        cacher: (data: Product[]) => productCacheService.cacheAllProducts(data, { limit: 8, sortBy: 'newest' }),
        transformer: (response: any) => Array.isArray(response.data) ? response.data : response.data || []
      }
    ];

    // Load sections in parallel but update UI as each completes
    const promises = sections.map(async (section) => {
      try {
        const response = await section.loader();
        if (response.success && response.data) {
          const data = section.transformer ? section.transformer(response) : response.data;
          section.setter(data);
          section.cacher(data);
        } else {
          setLoadingErrors(prev => [...prev, section.key]);
        }
      } catch (error) {
        setLoadingErrors(prev => [...prev, section.key]);
      } finally {
        setLoadingStates(prev => ({ ...prev, [section.key]: false }));
      }
    });

    await Promise.all(promises);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-detail/[id]',
      params: { id: product.id }
    });
  };

  const handleSeeAll = (section: string) => {
    router.push({
      pathname: '/product-listing',
      params: { 
        collection: section,
        title: section === 'featured' ? 'Featured Products' : 
               section === 'trending' ? 'Trending Products' : 
               section === 'seller_favorites' ? 'Seller Favorites' :
               section === 'discounted' ? 'Discounted Products' :
               section === 'all' ? 'All Products' : 'Products'
      }
    });
  };

  const handleRefresh = () => {
    // Clear cache and reload
    productCacheService.clear();
    setLoadingStates({
      featured: true,
      trending: true,
      seller_favorites: true,
      discounted: true,
      all: true
    });
    setLoadingErrors([]);
    loadAllSectionsOptimized();
  };

  const renderProductSection = (
    title: string,
    products: Product[],
    sectionKey: string
  ) => {
    const isLoadingSection = loadingStates[sectionKey];
    
    // Show skeleton while loading and no cached data
    if (isLoadingSection && products.length === 0) {
      if (sectionKey === 'all') {
        return (
          <ProductSectionSkeleton
            key={`${sectionKey}_skeleton`}
            variant="grid"
            itemCount={4}
            showHeader={true}
          />
        );
      }
      return (
        <ProductSectionSkeleton
          key={`${sectionKey}_skeleton`}
          variant="horizontal"
          itemCount={4}
          showHeader={true}
        />
      );
    }

    // Don't render section if no products and not loading
    if (products.length === 0 && !isLoadingSection) return null;

    // Special handling for "all" products section - render in masonry layout
    if (sectionKey === 'all') {
      return (
        <View key={sectionKey} style={styles.section}>
          <SectionHeader
            title={title}
            actionText="See All"
            onActionPress={() => handleSeeAll(sectionKey)}
          />
          <View style={styles.masonryContainer}>
            <View style={styles.masonryColumn}>
              {products.filter((_, index) => index % 2 === 0).map((product) => (
                <View key={product.id || (product as any)._id} style={styles.masonryItem}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                    variant="grid"
                  />
                </View>
              ))}
            </View>
            
            <View style={styles.masonryColumn}>
              {products.filter((_, index) => index % 2 === 1).map((product) => (
                <View key={product.id || (product as any)._id} style={styles.masonryItem}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                    variant="grid"
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    }

    // Default horizontal layout for other sections
    return (
      <View key={sectionKey} style={styles.section}>
        <SectionHeader
          title={title}
          actionText="See All"
          onActionPress={() => handleSeeAll(sectionKey)}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {products.map((product) => (
            <View key={product.id || (product as any)._id} style={styles.productCardWrapper}>
              <ProductCard
                product={product}
                onPress={() => handleProductPress(product)}
                badge={sectionKey === 'seller_favorites' ? 'Seller Pick' : undefined}
              />
            </View>
          ))}
        </ScrollView>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.base,
    },
    loadingText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    section: {
      marginBottom: spacing.md, // Reduced from spacing.lg
    },
    horizontalList: {
      paddingHorizontal: spacing.base,
      gap: spacing.xs, // Reduced gap between cards
    },
    productCardWrapper: {
      width: 140, // Reduced from 160
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.base,
      justifyContent: 'space-between',
    },
    gridProductWrapper: {
      width: '48%', // Two columns with some spacing
      marginBottom: spacing.sm,
    },
    masonryContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    masonryColumn: {
      flex: 1,
    },
    masonryItem: {
      marginBottom: spacing.sm,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm, // Reduced from spacing.md
      gap: spacing.xs, // Reduced from spacing.sm
      backgroundColor: colors.surface,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      alignItems: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 70,
      justifyContent: 'center',
    },
    quickActionText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      textAlign: 'center',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing['2xl'],
      gap: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    browseButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    browseButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    bottomSpacing: {
      height: spacing.xl,
    },
    debugContainer: {
      backgroundColor: colors.surface,
      margin: spacing.sm, // Reduced from spacing.base
      padding: spacing.sm, // Reduced from spacing.md
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.warning || '#FFA500',
    },
    debugTitle: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    debugText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Buy Now" />
        <View style={styles.loadingContainer}>
          <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Buy Now"
        subtitle="Get fast items for you"
        showRefresh={true}
        onRefreshPress={handleRefresh}
        showCart={true}
        onCartPress={() => router.push('/cart')}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Browse All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/wishlist')}
          >
            <Ionicons name="heart" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/my-orders')}
          >
            <Ionicons name="receipt" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Product Sections */}
        {renderProductSection('Featured Products', featuredProducts, 'featured')}
        {renderProductSection('Seller Favorites', sellerFavorites, 'seller_favorites')}
        {renderProductSection('Special Discounts', discountedProducts, 'discounted')}
        
        {/* Recommended Products (for authenticated users) */}
        {user && hasRecommendations && renderProductSection('Recommended for You', recommendations, 'recommended')}
        
        {renderProductSection('Trending Products', trendingProducts, 'trending')}
        {renderProductSection('Browse All Products', allProducts, 'all')}

        {/* Show loading skeletons for sections that are still loading */}
        {Object.entries(loadingStates).some(([_, loading]) => loading) && (
          <>
            <ProductSectionSkeleton variant="horizontal" itemCount={4} />
            <ProductSectionSkeleton variant="horizontal" itemCount={4} />
          </>
        )}

        {/* Empty State - only show if ALL sections are empty and not loading */}
        {featuredProducts.length === 0 && 
         trendingProducts.length === 0 && 
         sellerFavorites.length === 0 && 
         discountedProducts.length === 0 && 
         allProducts.length === 0 && 
         (!user || !hasRecommendations || recommendations.length === 0) &&
         !Object.values(loadingStates).some(loading => loading) && (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              No products available at the moment. Check back later for exciting deals!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.browseButtonText}>Browse All Products</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}