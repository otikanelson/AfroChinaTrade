import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OptimizedProductImage } from './OptimizedProductImage';

/**
 * Example usage of OptimizedProductImage component
 * 
 * This file demonstrates various ways to use the OptimizedProductImage component
 * with different configurations and use cases.
 */

export const OptimizedProductImageExamples = () => {
  return (
    <View style={styles.container}>
      {/* Basic usage with Cloudinary URL */}
      <OptimizedProductImage
        source="https://res.cloudinary.com/demo/image/upload/sample.jpg"
        width={200}
        height={200}
        quality={85}
        format="auto"
      />

      {/* Usage with regular URL (non-Cloudinary) */}
      <OptimizedProductImage
        source="https://example.com/product-image.jpg"
        width={150}
        height={150}
        borderRadius={15}
        placeholder="Product Image"
      />

      {/* Usage with custom loading and error components */}
      <OptimizedProductImage
        source="https://res.cloudinary.com/demo/image/upload/invalid-image.jpg"
        width={100}
        height={100}
        LoadingComponent={() => (
          <View style={styles.customLoading}>
            {/* Custom loading spinner */}
          </View>
        )}
        ErrorComponent={({ onRetry }) => (
          <View style={styles.customError}>
            {/* Custom error UI with retry button */}
          </View>
        )}
      />

      {/* Usage for product cards (small size, optimized for performance) */}
      <OptimizedProductImage
        source="https://res.cloudinary.com/demo/image/upload/product-thumbnail.jpg"
        width={80}
        height={80}
        quality={75}
        format="webp"
        borderRadius={8}
        onLoad={() => console.log('Product thumbnail loaded')}
        onError={(error) => console.log('Product thumbnail failed to load:', error)}
      />

      {/* Usage for product detail page (larger size, higher quality) */}
      <OptimizedProductImage
        source="https://res.cloudinary.com/demo/image/upload/product-detail.jpg"
        width={300}
        height={300}
        quality={95}
        format="auto"
        borderRadius={12}
        resizeMode="contain"
      />

      {/* Usage with no image (placeholder only) */}
      <OptimizedProductImage
        source=""
        width={120}
        height={120}
        placeholder="No Image Available"
        borderRadius={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  customLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  customError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
  },
});

export default OptimizedProductImageExamples;