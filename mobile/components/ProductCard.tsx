import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/product';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  badge?: string;
  showAddButton?: boolean; // New prop to control add button visibility
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, badge, showAddButton = false }) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    try {
      const formattedPrice = price.toLocaleString();
      return `₦${formattedPrice}`;
    } catch (error) {
      return `₦${price}`;
    }
  };

  const getDiscountedPrice = () => {
    if (product.discount && product.discount > 0) {
      const discountAmount = (product.price * product.discount) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  };

  const hasDiscount = product.discount && product.discount > 0;

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    
    if (product.stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock');
      return;
    }

    setAddingToCart(true);
    const success = await addToCart(product.id, 1);
    
    if (success) {
      Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
    } else {
      Alert.alert('Error', 'Failed to add product to cart');
    }
    
    setAddingToCart(false);
  };

  const handleToggleWishlist = async (e: any) => {
    e.stopPropagation();
    
    setTogglingWishlist(true);
    
    let success;
    if (inWishlist) {
      success = await removeFromWishlist(product.id);
    } else {
      success = await addToWishlist(product.id);
    }
    
    if (!success) {
      Alert.alert('Error', `Failed to ${inWishlist ? 'remove from' : 'add to'} wishlist`);
    }
    
    setTogglingWishlist(false);
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.background, borderRadius: borderRadius.md, ...shadows.sm }]} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <Image
            source={{ uri: product.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: colors.surface }]}>
            <Text style={[styles.placeholderText, { fontSize: fontSizes.sm, color: colors.textLight }]}>No Image</Text>
          </View>
        )}
        
        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleToggleWishlist}
          disabled={togglingWishlist}
        >
          <Ionicons
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={20}
            color={inWishlist ? '#FF3B30' : '#666'}
          />
        </TouchableOpacity>

        {badge && !hasDiscount && (
          <View style={[styles.badge, { backgroundColor: colors.primary, paddingHorizontal: spacing.md, borderTopRightRadius: borderRadius.base, borderBottomRightRadius: borderRadius.base }]}>
            <Text style={[styles.badgeText, { color: colors.textInverse, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }]}>{String(badge)}</Text>
          </View>
        )}

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}% OFF</Text>
          </View>
        )}

        {product.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={[styles.content, { padding: spacing.sm }]}>
        {/* Name — fixed 2-line height so price always aligns */}
        <Text style={[styles.name, { fontSize: fontSizes.sm, color: colors.text }]} numberOfLines={2}>
          {product.name || 'Unnamed Product'}
        </Text>

        {/* Price and Add to Cart */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={[styles.originalPrice, { fontSize: fontSizes.sm, color: colors.textSecondary }]} numberOfLines={1}>
                  {formatPrice(product.price || 0)}
                </Text>
                <Text style={[styles.discountedPrice, { fontSize: fontSizes.base, fontWeight: fontWeights.bold }]} numberOfLines={1}>
                  {formatPrice(getDiscountedPrice())}
                </Text>
              </>
            ) : (
              <Text style={[styles.price, { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.text }]} numberOfLines={1}>
                {formatPrice(product.price || 0)}
              </Text>
            )}
          </View>
          {showAddButton && (
            <TouchableOpacity
              style={[
                styles.addButton,
                (product.stock === 0 || addingToCart) && styles.disabledButton
              ]}
              onPress={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              <Ionicons
                name={addingToCart ? 'hourglass-outline' : 'add'}
                size={16}
                color={product.stock === 0 ? '#999' : '#007AFF'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Supplier / stats row */}
        <View style={styles.footer}>
          {product.supplier && product.supplier.name && (
            <Text style={[styles.supplier, { fontSize: fontSizes.xs, color: colors.primary }]} numberOfLines={1}>
              {product.supplier.verified ? 'Verified ' : ''}{product.supplier.name}
            </Text>
          )}
          {product.reviewCount > 0 && (
            <Text style={[styles.stats, { fontSize: fontSizes.xs, color: colors.textSecondary }]}>
              {product.reviewCount > 999
                ? `${(product.reviewCount / 1000).toFixed(1)}k+`
                : `${product.reviewCount}+`}
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
    overflow: 'hidden',
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
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    paddingVertical: 3,
  },
  badgeText: {
    // Styles applied inline
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    gap: 4,
  },
  name: {
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    // Styles applied inline
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    color: '#FF3B30',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  supplier: {
    flex: 1,
  },
  stats: {
    marginLeft: 4,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    // Styles applied inline
  },
});
