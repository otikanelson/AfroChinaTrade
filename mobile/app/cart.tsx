import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';

export default function CartScreen() {
  const router = useRouter();
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const { cart, loading, updateQuantity, removeFromCart, clearCart, refreshCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshCart();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  };

  const handleQuantityChange = async (productId: string, newQuantity: number, selectedVariant?: any) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId, selectedVariant);
      return;
    }
    
    console.log('Cart - Attempting to update quantity:', { productId, newQuantity, selectedVariant });
    const success = await updateQuantity(productId, newQuantity, selectedVariant);
    console.log('Cart - Update quantity result:', success);
    if (!success) {
      Alert.alert('Error', 'Failed to update quantity. Please check your connection and try again.');
    }
  };

  const handleRemoveItem = async (productId: string, selectedVariant?: any) => {
    console.log('Cart - Attempting to remove item:', { productId, selectedVariant });
    const success = await removeFromCart(productId, selectedVariant);
    console.log('Cart - Remove result:', success);
    if (!success) {
      Alert.alert('Error', 'Failed to remove item. Please check your connection and try again.');
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }
    router.push('/checkout');
  };

  const handleClearCart = async () => {
    console.log('Attempting to clear cart');
    const success = await clearCart();
    if (!success) {
      Alert.alert('Error', 'Failed to clear cart. Please check your connection and try again.');
    }
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: themeSpacing.xl,
    },
    emptyIcon: {
      marginBottom: themeSpacing.lg,
    },
    emptyTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: themeColors.text,
      marginBottom: themeSpacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginBottom: themeSpacing.xl,
    },
    shopButton: {
      backgroundColor: themeColors.primary,
      paddingHorizontal: themeSpacing.xl,
      paddingVertical: themeSpacing.md,
      borderRadius: borderRadius.md,
    },
    shopButtonText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    scrollView: {
      flex: 1,
    },
    cartItem: {
      flexDirection: 'row',
      padding: themeSpacing.base,
      backgroundColor: themeColors.surface,
      marginHorizontal: themeSpacing.base,
      marginVertical: themeSpacing.xs,
      borderRadius: borderRadius.md,
      ...shadows.sm,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.sm,
      backgroundColor: themeColors.background,
    },
    itemDetails: {
      flex: 1,
      marginLeft: themeSpacing.sm,
    },
    itemName: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      color: themeColors.text,
      marginBottom: themeSpacing.xs,
    },
    itemPrice: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: themeColors.primary,
      marginBottom: themeSpacing.xs,
    },
    itemVariant: {
      fontSize: fontSizes.sm,
      color: themeColors.textSecondary,
      marginBottom: themeSpacing.sm,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors.background,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    quantityText: {
      fontSize: fontSizes.base,
      color: themeColors.text,
      marginHorizontal: themeSpacing.sm,
      minWidth: 30,
      textAlign: 'center',
    },
    removeButton: {
      position: 'absolute',
      top: themeSpacing.sm,
      right: themeSpacing.sm,
      padding: themeSpacing.xs,
    },
    summaryContainer: {
      backgroundColor: themeColors.surface,
      padding: themeSpacing.base,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: themeSpacing.sm,
    },
    summaryLabel: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
    },
    summaryValue: {
      fontSize: fontSizes.base,
      color: themeColors.text,
      fontWeight: fontWeights.medium,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: themeSpacing.sm,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      marginBottom: themeSpacing.lg,
    },
    totalLabel: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: themeColors.text,
    },
    totalValue: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: themeColors.primary,
    },
    checkoutButton: {
      backgroundColor: themeColors.primary,
      paddingVertical: themeSpacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    placeholderImage: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Shopping Cart"
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title="Shopping Cart"
          showBack={true}
        />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={64} color={themeColors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
          </Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Shopping Cart"
        showBack={true}
        rightAction={
          cart && cart.items.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: themeSpacing.sm }}>
              <TouchableOpacity onPress={refreshCart}>
                <Ionicons name="refresh" size={20} color={themeColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearCart}>
                <Text style={{ color: themeColors.error, fontSize: fontSizes.sm }}>Clear All</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={refreshCart}>
              <Ionicons name="refresh" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
      >
        {cart.items.map((item, index) => (
          <View key={`${item.productId._id}-${JSON.stringify(item.selectedVariant || {})}-${index}`} style={styles.cartItem}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.productId._id, item.selectedVariant)}
            >
              <Ionicons name="trash-outline" size={20} color={themeColors.error} />
            </TouchableOpacity>

            {item.productId.images && item.productId.images.length > 0 ? (
              <Image
                source={{ uri: item.productId.images[0] }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={32} color={themeColors.textSecondary} />
              </View>
            )}

            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.productId.name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price)}
              </Text>
              {item.selectedVariant && (
                <Text style={styles.itemVariant}>
                  {Object.entries(item.selectedVariant)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </Text>
              )}
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => {
                    if (item.quantity <= 1) {
                      handleRemoveItem(item.productId._id, item.selectedVariant);
                    } else {
                      handleQuantityChange(item.productId._id, item.quantity - 1, item.selectedVariant);
                    }
                  }}
                >
                  <Ionicons 
                    name={item.quantity <= 1 ? "trash-outline" : "remove"} 
                    size={16} 
                    color={item.quantity <= 1 ? themeColors.error : themeColors.text} 
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.productId._id, item.quantity + 1, item.selectedVariant)}
                >
                  <Ionicons name="add" size={16} color={themeColors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({cart.totalItems} items)</Text>
          <Text style={styles.summaryValue}>{formatPrice(cart.totalAmount)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(cart.totalAmount)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}