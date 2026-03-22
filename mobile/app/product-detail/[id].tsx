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
import { Ionicons } from '@expo/vector-icons';

import { Product } from '../../types/product';
import { productService } from '../../services/ProductService';
import { messageService } from '../../services/MessageService';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/Header';
import { ViewTracker } from '../../components/ViewTracker';
import { ChatOptionsModal } from '../../components/ChatOptionsModal';
import { tokenManager } from '../../services/api/tokenManager';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const router = useRouter();
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showChatModal, setShowChatModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.background,
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      height: screenWidth,
      backgroundColor: themeColors.surface,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    imageNavigation: {
      position: 'absolute',
      bottom: themeSpacing.base,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: themeSpacing.xs,
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
      color: themeColors.text,
      marginBottom: themeSpacing.xs,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: themeSpacing.sm,
    },
    price: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: themeColors.primary,
    },
    originalPrice: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: themeSpacing.sm,
    },
    discountBadge: {
      backgroundColor: themeColors.error,
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.sm,
      marginLeft: themeSpacing.sm,
    },
    discountText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
    },
    supplierContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: themeSpacing.base,
      padding: themeSpacing.sm,
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
    },
    supplierInfo: {
      flex: 1,
    },
    supplierName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: themeColors.text,
    },
    supplierLocation: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
      marginTop: 2,
    },
    section: {
      marginBottom: themeSpacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
      marginTop: themeSpacing['3xl'],
      marginBottom: themeSpacing.md,
    },
    description: {
      fontSize: fontSizes.base,
      color: themeColors.text,
      lineHeight: 24,
    },
    specRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: themeSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    specLabel: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      flex: 1,
    },
    specValue: {
      fontSize: fontSizes.base,
      color: themeColors.text,
      fontWeight: fontWeights.medium,
      flex: 1,
      textAlign: 'right',
    },
    stockInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: themeSpacing.base,
    },
    stockText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      marginRight: themeSpacing.sm,
    },
    stockCount: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: themeColors.success,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: themeSpacing.xs,
    },
    quantityLabel: {
      fontSize: fontSizes.sm,
      color: themeColors.text,
      marginRight: themeSpacing.sm,
      fontWeight: fontWeights.medium,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: borderRadius.base,
    },
    quantityButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.sm,
    },
    quantityButtonText: {
      fontSize: fontSizes.lg,
      color: themeColors.text,
    },
    quantityInput: {
      width: 60,
      height: 40,
      textAlign: 'center',
      fontSize: fontSizes.base,
      color: themeColors.text,
      backgroundColor: themeColors.background,
    },
    bottomContainer: {
      flexDirection: 'row',
      padding: themeSpacing.base,
      backgroundColor: themeColors.background,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      gap: themeSpacing.sm,
      ...shadows.md,
    },
    addToCartButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: themeSpacing.sm,
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: themeColors.primary,
      gap: themeSpacing.xs,
    },
    addToCartText: {
      fontSize: fontSizes.base,
      color: themeColors.primary,
      fontWeight: fontWeights.medium,
    },
    buyNowButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: themeSpacing.sm,
      backgroundColor: themeColors.primary,
      borderRadius: borderRadius.base,
    },
    buyNowText: {
      fontSize: fontSizes.base,
      color: themeColors.textInverse,
      fontWeight: fontWeights.medium,
    },
    // Additional missing styles
    loadingText: {
      marginTop: themeSpacing.sm,
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: themeSpacing.xl,
    },
    errorText: {
      fontSize: fontSizes.base,
      color: themeColors.error,
      textAlign: 'center',
    },
    imageIndicator: {
      position: 'absolute',
      top: themeSpacing.base,
      right: themeSpacing.base,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.base,
    },
    imageIndicatorText: {
      color: 'white',
      fontSize: fontSizes.xs,
    },
    placeholderImage: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
    },
    placeholderText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
    },
    productInfo: {
      padding: themeSpacing.base,
    },
    discountedPrice: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: themeColors.error,
    },
    discountBadgeText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
    },
    productPrice: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: themeColors.primary,
    },
    metaInfo: {
      flexDirection: 'row',
      marginTop: themeSpacing.sm,
      gap: themeSpacing.base,
    },
    metaItem: {
      alignItems: 'center',
    },
    metaText: {
      fontSize: fontSizes.xs,
      color: themeColors.textSecondary,
      marginTop: 2,
    },
    supplierDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: themeSpacing.base,
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
      marginVertical: themeSpacing.base,
    },
    supplierMeta: {
      flex: 1,
      marginLeft: themeSpacing.sm,
      alignItems: 'flex-end',
    },
    supplierRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    specKey: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
      flex: 1,
    },
    bottomActions: {
      flexDirection: 'column',
      padding: themeSpacing.base,
      backgroundColor: themeColors.background,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      gap: themeSpacing.sm,
    },
    quantityText: {
      fontSize: fontSizes.base,
      color: themeColors.text,
      marginHorizontal: themeSpacing.sm,
      fontWeight: fontWeights.medium,
      minWidth: 30,
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: themeSpacing.sm,
    },
    chatButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: themeColors.primary,
    },
    adminModeIndicator: {
      // Styles applied inline
    },
    adminModeText: {
      // Styles applied inline
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
    
    if (isAdmin) {
      return;
    }
    
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
      if (!success) {
        Alert.alert('Error', 'Failed to add item to cart. Please try again.');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please check your connection and try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    if (isAdmin) {
      return;
    }
    
    // Add to cart first, then navigate to checkout
    await handleAddToCart();
    router.push('/checkout');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    if (isAdmin) {
      return;
    }
    
    const productId = product.id;
    const inWishlist = isInWishlist(productId);
    
    if (inWishlist) {
      const success = await removeFromWishlist(productId);
      if (!success) {
        Alert.alert('Error', 'Failed to remove from wishlist');
      }
    } else {
      const success = await addToWishlist(productId);
      if (!success) {
        Alert.alert('Error', 'Failed to add to wishlist');
      }
    }
  };

  const handleContactSupplier = () => {
    if (!product) return;
    
    // Check if user is authenticated first
    const checkAuthAndShowModal = async () => {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        Alert.alert(
          'Login Required', 
          'Please log in to contact support.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/auth/login') }
          ]
        );
        return;
      }
      
      setShowChatModal(true);
    };
    
    checkAuthAndShowModal();
  };

  const createProductThread = async (threadType: 'product_inquiry' | 'quote_request') => {
    if (!product) return;
    
    const prefilledMessage = threadType === 'quote_request' 
      ? `I'm interested in getting a quote for ${product.name}. Please provide pricing details and availability information.`
      : `I have a question about ${product.name}. Can you help me with more information?`;
    
    try {
      console.log('Creating product thread:', { productId: product.id, threadType });
      
      const response = await messageService.createProductThread(
        product.id,
        prefilledMessage,
        threadType
      );
      
      console.log('Product thread response:', response);
      
      if (response.success && response.data) {
        // Navigate to the thread with the pre-filled message
        router.push({
          pathname: `/message-thread/${response.data.thread.threadId}`,
          params: {
            prefilledMessage: prefilledMessage,
            isNewThread: response.data.isExisting ? 'false' : 'true',
            productImage: product.images?.[0] || '',
            productName: product.name
          }
        });
      } else {
        console.error('Failed to create thread:', response.error);
        Alert.alert('Error', response.error?.message || 'Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error creating product thread:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Product Details"
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Header
          title="Product Details"
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ViewTracker component for analytics - invisible component that tracks product views */}
      {product && (
        <ViewTracker
          productId={product.id}
          onViewTracked={(newViewCount) => {
            console.log('Product view tracked, new count:', newViewCount);
            // Update the product's view count in the local state
            setProduct(prev => prev ? { ...prev, viewCount: newViewCount } : null);
          }}
          source={source || 'product_detail'}
        />
      )}
      
      <Header
        title="Product Details"
        showBack={true}
      />

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
                          <Ionicons name="image-outline" size={64} color={themeColors.textSecondary} />
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
              <Ionicons name="image-outline" size={64} color={themeColors.textSecondary} />
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
              <Ionicons name="cube-outline" size={16} color={themeColors.textSecondary} />
              <Text style={styles.metaText}>{product.stock} in stock</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color={themeColors.textSecondary} />
              <Text style={styles.metaText}>{product.category}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {(product.supplier || product.supplierId) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supplier</Text>
              <View style={styles.supplierInfo}>
                <View style={styles.supplierDetails}>
                  <Text style={styles.supplierName}>
                    {(product.supplier?.name || (product.supplierId as any)?.name) || 'Unknown Supplier'}
                  </Text>
                  <View style={styles.supplierMeta}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.supplierRating}>
                      {(product.supplier?.rating || (product.supplierId as any)?.rating)?.toFixed(1) || '0.0'}
                    </Text>
                    <Text style={styles.supplierLocation}>
                      {(product.supplier?.location || (product.supplierId as any)?.location) || 'Location not specified'}
                    </Text>
                  </View>
                </View>
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
        {!isAdmin && (
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
                color={quantity <= 1 ? themeColors.textSecondary : themeColors.text}
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
                color={quantity >= (product.stock || 1) ? themeColors.textSecondary : themeColors.text}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtons}>
          {!isAdmin && (
            <TouchableOpacity style={styles.chatButton} onPress={handleContactSupplier}>
              <Ionicons name="chatbubble-outline" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          )}
          {!isAdmin && (
            <>
              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Ionicons name="cart-outline" size={20} color={themeColors.primary} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
            </>
          )}
          {isAdmin && (
            <View style={[styles.adminModeIndicator, { backgroundColor: themeColors.surface, padding: themeSpacing.sm, borderRadius: borderRadius.base, flex: 1, alignItems: 'center' }]}>
              <Text style={[styles.adminModeText, { color: themeColors.textSecondary, fontSize: fontSizes.sm }]}>
                Admin View Mode - Shopping Disabled
              </Text>
            </View>
          )}
        </View>
      </View>

      <ChatOptionsModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        onAskQuestion={() => createProductThread('product_inquiry')}
        onRequestQuote={() => createProductThread('quote_request')}
        productName={product?.name}
      />
    </View>
  );
}