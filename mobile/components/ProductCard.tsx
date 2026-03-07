import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types/product';
import { theme } from '../theme';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  badge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, badge }) => {
  const formatPrice = (price: number) => `${product.currency} ${price.toLocaleString()}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name — fixed 2-line height so price always aligns */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price */}
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(product.price)}
        </Text>

        {/* Supplier / stats row */}
        <View style={styles.footer}>
          <Text style={styles.supplier} numberOfLines={1}>
            {product.supplier.verified ? '✔ ' : ''}{product.supplier.name}
          </Text>
          {product.reviewCount > 0 && (
            <Text style={styles.stats}>
              🔥 {product.reviewCount > 999
                ? `${(product.reviewCount / 1000).toFixed(1)}k`
                : product.reviewCount}+
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: 0,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3,
    borderTopRightRadius: theme.borderRadius.base,
    borderBottomRightRadius: theme.borderRadius.base,
  },
  badgeText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
  },
  content: {
    padding: theme.spacing.sm,
    gap: 4,
  },
  name: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    lineHeight: theme.lineHeights.normal,
  },
  price: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  supplier: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    flex: 1,
  },
  stats: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
});
