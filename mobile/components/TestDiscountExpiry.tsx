import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import { Product } from '../types/product';

// Test products with different discount expiry scenarios
const testProducts: Product[] = [
  {
    id: '1',
    name: 'Test Product - Ends Soon',
    description: 'Product with discount ending in 2 hours',
    price: 50000,
    images: ['https://via.placeholder.com/300'],
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 10,
    stock: 5,
    discount: 25,
    discountExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
  },
  {
    id: '2',
    name: 'Test Product - Ends Today',
    description: 'Product with discount ending in 12 hours',
    price: 75000,
    images: ['https://via.placeholder.com/300'],
    category: 'Fashion',
    rating: 4.2,
    reviewCount: 25,
    stock: 8,
    discount: 15,
    discountExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
  },
  {
    id: '3',
    name: 'Test Product - Ends Tomorrow',
    description: 'Product with discount ending tomorrow',
    price: 30000,
    images: ['https://via.placeholder.com/300'],
    category: 'Home',
    rating: 4.8,
    reviewCount: 50,
    stock: 12,
    discount: 30,
    discountExpiresAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // 25 hours (tomorrow)
  },
  {
    id: '4',
    name: 'Test Product - 3 Days Left',
    description: 'Product with discount ending in 3 days',
    price: 100000,
    images: ['https://via.placeholder.com/300'],
    category: 'Sports',
    rating: 4.0,
    reviewCount: 15,
    stock: 20,
    discount: 20,
    discountExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
  },
];

export const TestDiscountExpiry: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discount Expiry Test</Text>
      <View style={styles.grid}>
        {testProducts.map((product) => (
          <View key={product.id} style={styles.cardContainer}>
            <ProductCard 
              product={product} 
              onPress={() => console.log('Product pressed:', product.name)}
              showAddButton={true}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16,
  },
});