import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const CartSidebar: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Only show cart button on specific customer shopping pages
  const allowedPages = [
    '/(tabs)/home',
    '/(tabs)/buy-now', 
    '/product-detail',
    '/checkout',
    '/wishlist',
    '/search'
  ];
  
  const shouldShowCart = allowedPages.some(page => pathname.startsWith(page)) || 
                        pathname.includes('/product-detail/');

  // On checkout page, show back arrow instead of cart
  const isCheckoutPage = pathname === '/checkout';

  const handleCartButtonPress = () => {
    router.push('/cart');
  };

  // Don't render if not on customer pages or if user is admin
  if (!shouldShowCart || isAdmin) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.floatingButton, { backgroundColor: colors.primary }]}
      onPress={handleCartButtonPress}
    >
      <Ionicons 
        name={isCheckoutPage ? "arrow-back" : "cart"} 
        size={24} 
        color="white" 
      />
      {cart && cart.totalItems > 0 && !isCheckoutPage && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text style={styles.badgeText}>{cart.totalItems}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});