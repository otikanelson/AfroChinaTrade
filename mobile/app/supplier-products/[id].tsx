import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { productService } from '../../services/ProductService';
import { supplierService } from '../../services/SupplierService';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { Product, Supplier } from '../../types/product';
import { spacing } from '../../theme/spacing';

export default function SupplierProductsScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { fonts, fontSizes, colors } = useTheme();
  const { cartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    supplierInfo: {
      backgroundColor: colors.background,
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    supplierName: {
      fontSize: fontSizes.xl,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    supplierDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    detailText: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
    productsSection: {
      padding: spacing.base,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: spacing.base,
    },
    productsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    productWrapper: {
      width: '48%',
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.medium,
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

  useEffect(() => {
    if (id) {
      loadSupplierAndProducts();
    }
  }, [id]);

  const loadSupplierAndProducts = async () => {
    try {
      setIsLoading(true);
      
      // Load supplier details and products in parallel
      const [supplierResponse, productsResponse] = await Promise.all([
        supplierService.getSupplierById(id),
        loadProductsBySupplier()
      ]);

      if (supplierResponse.success && supplierResponse.data) {
        setSupplier(supplierResponse.data);
      }
    } catch (error) {
      console.error('Failed to load supplier data:', error);
      Alert.alert('Error', 'Failed to load supplier information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsBySupplier = async () => {
    try {
      setIsLoadingProducts(true);
      
      // Use the new getProductsBySupplier method
      const response = await productService.getProductsBySupplier(id, { limit: 100 });
      
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
    const productId = (product as any)._id || product.id;
    router.push({ pathname: '/product-detail/[id]', params: { id: productId } });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title={name || 'Supplier Products'}
          showBack={true}
          onBackPress={() => router.back()}
          showCart={true}
          cartCount={cartCount}
          onCartPress={() => router.push('/cart')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading supplier information...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={supplier?.name || name || 'Supplier Products'}
        showBack={true}
        onBackPress={() => router.back()}
        showCart={true}
        cartCount={cartCount}
        onCartPress={() => router.push('/cart')}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Supplier Information */}
        {supplier && (
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{supplier.name}</Text>
            
            <View style={styles.supplierDetails}>
              <Text style={styles.detailText}>📍 {supplier.location}</Text>
            </View>
            
            {supplier.responseTime && (
              <View style={styles.supplierDetails}>
                <Text style={styles.detailText}>⏱️ Response time: {supplier.responseTime}</Text>
              </View>
            )}
            
            <View style={styles.supplierDetails}>
              <Text style={styles.detailText}>⭐ {supplier.rating.toFixed(1)} rating</Text>
            </View>
          </View>
        )}

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            Products ({products.length})
          </Text>

          {/* Products Loading Indicator */}
          {isLoadingProducts && (
            <View style={styles.productsLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          )}

          {/* Products Grid */}
          {!isLoadingProducts && (
            <>
              {products.length > 0 ? (
                <View style={styles.productsGrid}>
                  {products.map(product => {
                    const productId = (product as any)._id || product.id;
                    const badgeText = product.discount && product.discount > 0 
                      ? `${product.discount}% OFF` 
                      : product.isNew ? 'New' : undefined;
                    
                    return (
                      <View key={productId} style={styles.productWrapper}>
                        <ProductCard
                          product={product}
                          badge={badgeText}
                          onPress={() => handleProductPress(product)}
                        />
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No products found</Text>
                  <Text style={styles.emptySubtext}>
                    This supplier hasn't added any products yet
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}