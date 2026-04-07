import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

interface FloatingCartButtonProps {
  bottom?: number;
  right?: number;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  bottom = 20,
  right = 20,
}) => {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { cartCount } = useCart();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const previousCartCount = useRef(cartCount);

  // Animate when cart count changes
  useEffect(() => {
    if (cartCount > previousCartCount.current) {
      // Bounce animation when items are added
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    previousCartCount.current = cartCount;
  }, [cartCount, scaleAnim]);

  // Don't show the button if cart is empty
  if (cartCount === 0) {
    return null;
  }

  const handlePress = () => {
    router.push('/cart');
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom,
      right,
      zIndex: 1000,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 30,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      minWidth: 60,
      justifyContent: 'center',
    },
    iconContainer: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.accent,
      borderRadius: 12,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    badgeText: {
      color: colors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      lineHeight: 16,
    },
    cartText: {
      color: colors.textInverse,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="cart" size={24} color={colors.textInverse} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          </View>
          <Text style={styles.cartText}>Cart</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};