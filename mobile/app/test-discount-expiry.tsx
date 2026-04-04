import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types/product';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography, fontSizes, fontWeights } from '../theme/typography';

export default function TestDiscountExpiryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      // Fetch products with discounts from the API
      const response = await fetch('http://192.168.100.14:3001/api/products?discount=true&limit=10');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Discount Expiry Test</Text>
        <Text style={styles.subtitle}>
          Products with discount expiry timestamps
        </Text>
      </View>

      <View style={styles.grid}>
        {products.map((product) => (
          <View key={product.id || product._id} style={styles.cardContainer}>
            <ProductCard 
              product={product} 
              onPress={() => console.log('Product pressed:', product.name)}
              showAddButton={true}
              variant="grid"
            />
          </View>
        ))}
      </View>

      {products.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No products with discounts found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  cardContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});