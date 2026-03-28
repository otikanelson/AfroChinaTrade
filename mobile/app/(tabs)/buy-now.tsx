import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { SectionHeader } from '../../components/SectionHeader';
import { productService } from '../../services/ProductService';
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
  const [loadingErrors, setLoadingErrors] = useState<string[]>([]);

  // Use recommendations hook for personalized products
  const { recommendations, hasRecommendations } = useRecommendations();

  useEffect(() => {
    loadAllSections();
  }, []);

  const loadAllSections = async () => {
    try {
      setLoading(true);
      
      console.log('🚀 Starting to load all sections...');
      console.log('📡 API Base URL:', process.env.EXPO_PUBLIC_API_URL || 'Using fallback');
      
      // Load all product sections
      const [
        featuredResponse, 
        trendingResponse, 
        sellerFavoritesResponse,
        discountedResponse,
        allProductsResponse
      ] = await Promise.all([
        productService.getFeaturedProducts(12),
        productService.getTrendingProducts('7d', 1, 12),
        productService.getSellerFavorites(1, 12),
        productService.getProducts({ limit: 12, minPrice: 1, sortBy: 'price_desc' as any }), // Products with discounts
        productService.getProducts({ limit: 8, sortBy: 'newest' as any }) // All products, newest first - reduced to 8 for better grid layout
      ]);

      console.log('📊 API Responses received:');
      console.log('Featured:', featuredResponse.success, featuredResponse.data?.length || 0);
      console.log('Trending:', trendingResponse.success, Array.isArray(trendingResponse.data) ? trendingResponse.data.length : (trendingResponse.data?.products?.length || 0));
      console.log('Seller Favorites:', sellerFavoritesResponse.success, Array.isArray(sellerFavoritesResponse.data) ? sellerFavoritesResponse.data.length : (sellerFavoritesResponse.data?.products?.length || 0));
      console.log('Discounted:', discountedResponse.success, discountedResponse.data?.length || 0);
      console.log('All Products:', allProductsResponse.success, allProductsResponse.data?.length || 0);

      if (featuredResponse.success && featuredResponse.data) {
        console.log('✅ Setting featured products:', featuredResponse.data.length);
        setFeaturedProducts(featuredResponse.data);
      } else {
        console.error('❌ Featured products failed:', featuredResponse.error);
        setLoadingErrors(prev => [...prev, 'Featured Products']);
      }

      if (trendingResponse.success && trendingResponse.data) {
        const trendingData = Array.isArray(trendingResponse.data) 
          ? trendingResponse.data 
          : trendingResponse.data.products || [];
        console.log('✅ Setting trending products:', trendingData.length);
        setTrendingProducts(trendingData);
      } else {
        console.error('❌ Trending products failed:', trendingResponse.error);
      }

      if (sellerFavoritesResponse.success && sellerFavoritesResponse.data) {
        const sellerData = Array.isArray(sellerFavoritesResponse.data) 
          ? sellerFavoritesResponse.data 
          : sellerFavoritesResponse.data.products || [];
        console.log('✅ Setting seller favorites:', sellerData.length);
        setSellerFavorites(sellerData);
      } else {
        console.error('❌ Seller favorites failed:', sellerFavoritesResponse.error);
      }

      if (discountedResponse.success && discountedResponse.data) {
        const discountData = Array.isArray(discountedResponse.data) 
          ? discountedResponse.data 
          : discountedResponse.data || [];
        // Filter for products with actual discounts
        const withDiscounts = discountData.filter(product => product.discount && product.discount > 0);
        console.log('✅ Setting discounted products:', withDiscounts.length, 'out of', discountData.length);
        setDiscountedProducts(withDiscounts);
      } else {
        console.error('❌ Discounted products failed:', discountedResponse.error);
      }

      if (allProductsResponse.success && allProductsResponse.data) {
        const allData = Array.isArray(allProductsResponse.data) 
          ? allProductsResponse.data 
          : allProductsResponse.data || [];
        console.log('✅ Setting all products:', allData.length);
        setAllProducts(allData);
      } else {
        console.error('❌ All products failed:', allProductsResponse.error);
      }

    } catch (error) {
      console.error('Error loading buy-now sections:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
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
    loadAllSections();
  };

  const renderProductSection = (
    title: string,
    products: Product[],
    sectionKey: string
  ) => {
    // Don't render section if no products
    if (products.length === 0) return null;

    // Special handling for "all" products section - render in masonry layout
    if (sectionKey === 'all') {
      return (
        <View style={styles.section}>
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
      <View style={styles.section}>
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
            onPress={() => router.push('/orders')}
          >
            <Ionicons name="receipt" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Debug: Show loading errors if any */}
        {loadingErrors.length > 0 && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>⚠️ Loading Issues:</Text>
            {loadingErrors.map((error, index) => (
              <Text key={index} style={styles.debugText}>• {error}</Text>
            ))}
          </View>
        )}

        {/* Featured Products */}
        {renderProductSection('Featured Products', featuredProducts, 'featured')}

        {/* Seller Favorites */}
        {renderProductSection('Seller Favorites', sellerFavorites, 'seller_favorites')}

        {/* Discounted Products */}
        {renderProductSection('Special Discounts', discountedProducts, 'discounted')}

        {/* Recommended Products (for authenticated users) */}
        {user && hasRecommendations && renderProductSection('Recommended for You', recommendations, 'recommended')}

        {/* Trending Products */}
        {renderProductSection('Trending Products', trendingProducts, 'trending')}

        {/* All Products */}
        {renderProductSection('Browse All Products', allProducts, 'all')}

        {/* Empty State - only show if ALL sections are empty */}
        {featuredProducts.length === 0 && 
         trendingProducts.length === 0 && 
         sellerFavorites.length === 0 && 
         discountedProducts.length === 0 && 
         allProducts.length === 0 && 
         (!user || !hasRecommendations || recommendations.length === 0) && (
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