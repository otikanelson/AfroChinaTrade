import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { productService } from '../../services/ProductService';
import { Product } from '../../types/product';
import { useTheme } from '../../contexts/ThemeContext';

export default function BuyNowTab() {
  const router = useRouter();
  const { colors, spacing, fontSizes, borderRadius, fontWeights } = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getFeaturedProducts(20);

      if (response.success && response.data) {
        setFeaturedProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
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

  const handleRefresh = () => {
    loadFeaturedProducts();
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
    section: {
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.sm,
      backgroundColor: colors.surface,
    },
    sectionHeader: {
      marginBottom: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    sectionTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing['2xl'],
      gap: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
    },
    emptyIcon: {
      marginBottom: spacing.sm,
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
    productsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.lg,
      marginTop: spacing.sm,
    },
    productCardContainer: {
      width: '31%',
      marginBottom: spacing.sm,
    },
    bottomSpacing: {
      height: spacing.xl,
    },
  });

  if (loading && featuredProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Buy Now"
          subtitle="Featured deals & quick purchases"
          showRefresh={true}
          onRefreshPress={handleRefresh}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="storefront-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.loadingText}>Loading featured deals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title="Buy Now"
        subtitle="Featured deals & quick purchases"
        showRefresh={true}
        onRefreshPress={handleRefresh}
      />

      {/* Content */}
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
            <View>
              <Ionicons name="search" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Browse All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/wishlist')}
          >
            <View>
              <Ionicons name="heart" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Wishlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/orders')}
          >
            <View>
              <Ionicons name="receipt" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Deals</Text>
            <Text style={styles.sectionSubtitle}>
              {featuredProducts.length} products available for quick purchase
            </Text>
          </View>

          {featuredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="storefront-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyText}>
                No featured products available at the moment. Check back later for exciting deals!
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Text style={styles.browseButtonText}>Browse All Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {featuredProducts.map((product) => (
                <View key={product.id} style={styles.productCardContainer}>
                  <ProductCard
                    product={product}
                    onPress={() => handleProductPress(product)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}