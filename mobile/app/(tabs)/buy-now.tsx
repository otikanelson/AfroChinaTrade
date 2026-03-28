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
  const [loading, setLoading] = useState(true);

  // Use recommendations hook for personalized products
  const { recommendations, hasRecommendations } = useRecommendations();

  useEffect(() => {
    loadAllSections();
  }, []);

  const loadAllSections = async () => {
    try {
      setLoading(true);
      
      // Load featured and trending products
      const [featuredResponse, trendingResponse] = await Promise.all([
        productService.getFeaturedProducts(12),
        productService.getTrendingProducts('7d', 12)
      ]);

      if (featuredResponse.success && featuredResponse.data) {
        setFeaturedProducts(featuredResponse.data);
      }

      if (trendingResponse.success && trendingResponse.data) {
        const trendingData = Array.isArray(trendingResponse.data) 
          ? trendingResponse.data 
          : trendingResponse.data.products || [];
        setTrendingProducts(trendingData);
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
               section === 'trending' ? 'Trending Products' : 'Products'
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
    if (products.length === 0) return null;

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
            <View key={product.id} style={styles.productCardWrapper}>
              <ProductCard
                product={product}
                onPress={() => handleProductPress(product)}
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
      marginBottom: spacing.lg,
    },
    horizontalList: {
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    productCardWrapper: {
      width: 160,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      gap: spacing.sm,
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

        {/* Featured Products */}
        {renderProductSection('Featured Products', featuredProducts, 'featured')}

        {/* Recommended Products (for authenticated users) */}
        {user && hasRecommendations && renderProductSection('Recommended for You', recommendations, 'recommended')}

        {/* Trending Products */}
        {renderProductSection('Trending Products', trendingProducts, 'trending')}

        {/* Empty State */}
        {featuredProducts.length === 0 && trendingProducts.length === 0 && (
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