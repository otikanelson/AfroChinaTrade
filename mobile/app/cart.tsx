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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

export default function CartScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const { cart, loading, updateQuantity, removeFromCart, refreshCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, []);

  const handleQuantityChange = async (productId: string, newQuantity: number, selectedVariant?: any) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId, selectedVariant);
      return;
    }
    
    const success = await updateQuantity(productId, newQuantity, selectedVariant);
    if (!success) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string, selectedVariant?: any) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeFromCart(productId, selectedVariant);
            if (!success) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }
    router.push('/checkout');
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.sm,
    },
    headerTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      flex: 1,
    },
    cartCount: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
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
      paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    shopButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    shopButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    scrollView: {
      flex: 1,
    },
    cartItem: {
      flexDirection: 'row',
      padding: spacing.base,
      backgroundColor: colors.surface,
      marginHorizontal: spacing.base,
      marginVertical: spacing.xs,
      borderRadius: borderRadius.md,
      ...shadows.sm,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background,
    },
    itemDetails: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    itemName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    itemPrice: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    itemVariant: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
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
      backgroundColor: colors.background,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quantityText: {
      fontSize: fontSizes.base,
      color: colors.text,
      marginHorizontal: spacing.sm,
      minWidth: 30,
      textAlign: 'center',
    },
    removeButton: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      padding: spacing.xs,
    },
    summaryContainer: {
      backgroundColor: colors.surface,
      padding: spacing.base,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    summaryLabel: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: fontSizes.base,
      color: colors.text,
      fontWeight: fontWeights.medium,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginBottom: spacing.lg,
    },
    totalLabel: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    totalValue: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    checkoutButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    checkoutButtonText: {
      color: colors.textInverse,
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
          </Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.cartCount}>{cart.totalItems} items</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cart.items.map((item) => (
          <View key={`${item.productId._id}-${JSON.stringify(item.selectedVariant)}`} style={styles.cartItem}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.productId._id, item.selectedVariant)}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {item.productId.images && item.productId.images.length > 0 ? (
              <Image
                source={{ uri: item.productId.images[0] }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
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
                  onPress={() => handleQuantityChange(item.productId._id, item.quantity - 1, item.selectedVariant)}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.productId._id, item.quantity + 1, item.selectedVariant)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
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
    </SafeAreaView>
  );
}