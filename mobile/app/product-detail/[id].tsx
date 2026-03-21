import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Product } from '../../types/product';
import { productService } from '../../services/ProductService';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { tokenManager } from '../../services/api/tokenManager';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    favoriteButton: {
      padding: spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      height: screenWidth,
      backgroundColor: colors.surface,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    imageNavigation: {
      position: 'absolute',
      bottom: spacing.base,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    imageDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeDot: {
      backgroundColor: 'white',
    },
    contentContainer: {
      padding: spacing.base,
    },
    productName: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    price: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    originalPrice: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: spacing.sm,
    },
    discountBadge: {
      backgroundColor: colors.error,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.sm,
    },
    discountText: {
      color: 'white',
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
    },
    supplierContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.base,
      padding: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
    },
    supplierInfo: {
      flex: 1,
    },
    supplierName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    supplierLocation: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    contactButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.base,
    },
    contactButtonText: {
      color: 'white',
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 24,
    },
    specRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    specLabel: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      flex: 1,
    },
    specValue: {
      fontSize: fontSizes.base,
      color: colors.text,
      fontWeight: fontWeights.medium,
      flex: 1,
      textAlign: 'right',
    },
    stockInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    stockText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      marginRight: spacing.sm,
    },
    stockCount: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.success,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    quantityLabel: {
      fontSize: fontSizes.sm,
      color: colors.text,
      marginRight: spacing.sm,
      fontWeight: fontWeights.medium,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
    },
    quantityButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.sm,
    },
    quantityButtonText: {
      fontSize: fontSizes.lg,
      color: colors.text,
    },
    quantityInput: {
      width: 60,
      height: 40,
      textAlign: 'center',
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.background,
    },
    bottomContainer: {
      flexDirection: 'row',
      padding: spacing.base,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
      ...shadows.md,
    },
    addToCartButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.primary,
      gap: spacing.xs,
    },
    addToCartText: {
      fontSize: fontSizes.base,
      color: colors.primary,
      fontWeight: fontWeights.medium,
    },
    buyNowButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
    },
    buyNowText: {
      fontSize: fontSizes.base,
      color: 'white',
      fontWeight: fontWeights.medium,
    },
    // Additional missing styles
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: colors.error,
      textAlign: 'center',
    },
    imageIndicator: {
      position: 'absolute',
      top: spacing.base,
      right: spacing.base,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
    },
    imageIndicatorText: {
      color: 'white',
      fontSize: fontSizes.xs,
    },
    placeholderImage: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    placeholderText: {
      fontSize: fontSizes.base,
      color: colors.textLight,
    },
    productInfo: {
      padding: spacing.base,
    },
    discountedPrice: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.error,
    },
    discountBadgeText: {
      color: 'white',
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
    },
    productPrice: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    metaInfo: {
      flexDirection: 'row',
      marginTop: spacing.sm,
      gap: spacing.base,
    },
    metaItem: {
      alignItems: 'center',
    },
    metaText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    supplierDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      marginVertical: spacing.base,
    },
    supplierMeta: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    supplierRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    specKey: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      flex: 1,
    },
    bottomActions: {
      flexDirection: 'column',
      padding: spacing.base,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    quantityText: {
      fontSize: fontSizes.base,
      color: colors.text,
      marginHorizontal: spacing.sm,
      fontWeight: fontWeights.medium,
      minWidth: 30,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    chatButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.primary,
    },
  });

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('Loading product with ID:', id);
      const response = await productService.getProductById(id);
      
      console.log('Product API response:', response);
      
      if (response.success && response.data) {
        console.log('Product loaded:', {
          id: response.data.id,
          name: response.data.name,
          images: response.data.images,
          imagesCount: response.data.images?.length || 0
        });
        setProduct(response.data);
      } else {
        console.error('Product not found or API error:', response.error);
        Alert.alert('Error', 'Product not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      console.log('Adding to cart:', { productId: product.id, quantity });
      
      // Check if user is authenticated
      const token = await tokenManager.getAccessToken();
      if (!token) {
        Alert.alert(
          'Login Required', 
          'Please log in to add items to your cart.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/auth/login') }
          ]
        );
        return;
      }
      
      const success = await addToCart(product.id, quantity);
      if (success) {
        Alert.alert('Success', `Added ${quantity} item(s) to cart`);
      } else {
        Alert.alert('Error', 'Failed to add item to cart. Please try again.');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please check your connection and try again.');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Add to cart first, then navigate to checkout
    handleAddToCart().then(() => {
      router.push('/checkout');
    });
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    const productId = product.id;
    const inWishlist = isInWishlist(productId);
    
    if (inWishlist) {
      const success = await removeFromWishlist(productId);
      if (success) {
        Alert.alert('Removed', 'Product removed from wishlist');
      } else {
        Alert.alert('Error', 'Failed to remove from wishlist');
      }
    } else {
      const success = await addToWishlist(productId);
      if (success) {
        Alert.alert('Added', 'Product added to wishlist');
      } else {
        Alert.alert('Error', 'Failed to add to wishlist');
      }
    }
  };

  const handleContactSupplier = () => {
    Alert.alert('Contact Supplier', 'Opening chat with supplier...');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleWishlist}>
          <Ionicons 
            name={product && isInWishlist(product.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={product && isInWishlist(product.id) ? colors.error : colors.text} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                  setCurrentImageIndex(index);
                }}
              >
                {product.images.map((image, index) => {
                  // Check if image URL is valid
                  const isValidUrl = image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('file://'));
                  
                  return (
                    <View key={index} style={{ width: screenWidth }}>
                      {isValidUrl ? (
                        <Image
                          source={{ uri: image }}
                          style={styles.productImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('Image load error:', error.nativeEvent.error);
                            console.log('Image URL:', image);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', image);
                          }}
                        />
                      ) : (
                        <View style={[styles.productImage, styles.placeholderImage]}>
                          <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
                          <Text style={styles.placeholderText}>Invalid Image URL</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
              {product.images.length > 1 && (
                <>
                  <View style={styles.imageIndicator}>
                    <Text style={styles.imageIndicatorText}>
                      {currentImageIndex + 1}/{product.images.length}
                    </Text>
                  </View>
                  <View style={styles.imageNavigation}>
                    {product.images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.imageDot,
                          index === currentImageIndex && styles.activeDot
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {product.discount && product.discount > 0 ? (
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>
                ₦{product.price.toLocaleString()}
              </Text>
              <Text style={styles.discountedPrice}>
                ₦{Math.round(product.price * (1 - product.discount / 100)).toLocaleString()}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{product.discount}% OFF</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.productPrice}>
              ₦{product.price.toLocaleString()}
            </Text>
          )}

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.metaText}>
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{product.stock} in stock</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{product.category}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {product.supplier && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supplier</Text>
              <View style={styles.supplierInfo}>
                <View style={styles.supplierDetails}>
                  <Text style={styles.supplierName}>{product.supplier.name || 'Unknown Supplier'}</Text>
                  <View style={styles.supplierMeta}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.supplierRating}>
                      {product.supplier.rating ? product.supplier.rating.toFixed(1) : '0.0'}
                    </Text>
                    <Text style={styles.supplierLocation}>
                      {product.supplier.location || 'Location not specified'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.contactButton} onPress={handleContactSupplier}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                  <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}:</Text>
                  <Text style={styles.specValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Qty:</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            <Ionicons 
              name="remove" 
              size={20} 
              color={quantity <= 1 ? colors.textSecondary : colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(1)}
            disabled={quantity >= (product.stock || 1)}
          >
            <Ionicons 
              name="add" 
              size={20} 
              color={quantity >= (product.stock || 1) ? colors.textSecondary : colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.chatButton} onPress={handleContactSupplier}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart-outline" size={20} color={colors.primary} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}