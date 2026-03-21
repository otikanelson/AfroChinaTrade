import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, useSegments } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

interface CartItemProps {
  item: any;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemCard: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();
  const product = item.productId;
  
  return (
    <View style={[styles.cartItem, { 
      backgroundColor: colors.background, 
      borderRadius: borderRadius.md, 
      padding: spacing.base, 
      marginBottom: spacing.sm,
      ...shadows.sm 
    }]}>
      <Image 
        source={{ uri: product.images[0] || 'https://via.placeholder.com/60' }} 
        style={[styles.itemImage, { borderRadius: borderRadius.base, marginRight: spacing.md }]}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { 
          fontSize: fontSizes.base, 
          fontWeight: fontWeights.medium, 
          color: colors.text, 
          marginBottom: spacing.xs 
        }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.itemPrice, { 
          fontSize: fontSizes.base, 
          fontWeight: fontWeights.bold, 
          color: colors.primary, 
          marginBottom: spacing.sm 
        }]}>₦{item.price.toLocaleString()}</Text>
        
        <View style={[styles.quantityContainer, { 
          backgroundColor: colors.surface, 
          borderRadius: borderRadius.base, 
          paddingHorizontal: spacing.xs 
        }]}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(product._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Ionicons 
              name="remove" 
              size={16} 
              color={item.quantity <= 1 ? colors.textLight : colors.text}
            />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { 
            fontSize: fontSizes.base, 
            fontWeight: fontWeights.medium, 
            color: colors.text, 
            marginHorizontal: spacing.sm 
          }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(product._id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.removeButton, { padding: spacing.sm, marginLeft: spacing.sm }]}
        onPress={() => onRemove(product._id)}
      >
        <Ionicons name="trash-outline" size={16} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

export const CartSidebar: React.FC = () => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [visible, setVisible] = useState(false);

  // Only show cart button on specific customer shopping pages
  const allowedPages = [
    '/(tabs)/home',
    '/(tabs)/buy-now', 
    '/product-detail',
    '/checkout',
    '/wishlist'
  ];
  
  const shouldShowCart = allowedPages.some(page => pathname.startsWith(page)) || 
                        pathname.includes('/product-detail/');

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const success = await updateQuantity(productId, quantity);
    if (!success) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const success = await removeFromCart(productId);
    if (!success) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const success = await clearCart();
            if (!success) {
              Alert.alert('Error', 'Failed to clear cart');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    setVisible(false);
    router.push('/checkout');
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleContinueShopping = () => {
    setVisible(false);
    router.push('/(tabs)/home');
  };

  // Don't render if not on customer pages
  if (!shouldShowCart) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={() => setVisible(true)}
      >
        <Ionicons name="cart" size={24} color="white" />
        {cart && cart.totalItems > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>{cart.totalItems}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Cart Sidebar Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { 
            paddingHorizontal: spacing.base, 
            paddingVertical: spacing.md, 
            backgroundColor: colors.background, 
            borderBottomWidth: 1, 
            borderBottomColor: colors.border 
          }]}>
            <View>
              <Text style={[styles.headerTitle, { 
                fontSize: fontSizes.xl, 
                fontWeight: fontWeights.bold, 
                color: colors.text 
              }]}>Shopping Cart</Text>
              <Text style={[styles.headerSubtitle, { 
                fontSize: fontSizes.sm, 
                color: colors.textSecondary 
              }]}>
                {cart?.totalItems || 0} {cart?.totalItems === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { padding: spacing.xs }]}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {!cart || cart.items.length === 0 ? (
            <View style={[styles.emptyContainer, { paddingHorizontal: spacing.xl }]}>
              <Ionicons name="cart-outline" size={64} color={colors.textLight} />
              <Text style={[styles.emptyTitle, { 
                fontSize: fontSizes.xl, 
                fontWeight: fontWeights.bold, 
                color: colors.text, 
                marginTop: spacing.md, 
                marginBottom: spacing.sm 
              }]}>Your cart is empty</Text>
              <Text style={[styles.emptySubtitle, { 
                fontSize: fontSizes.base, 
                color: colors.textSecondary, 
                marginBottom: spacing.xl 
              }]}>
                Add some products to get started
              </Text>
              <TouchableOpacity
                style={[styles.shopButton, { 
                  backgroundColor: colors.primary, 
                  paddingHorizontal: spacing.xl, 
                  paddingVertical: spacing.md, 
                  borderRadius: borderRadius.md 
                }]}
                onPress={handleContinueShopping}
              >
                <Text style={[styles.shopButtonText, { 
                  color: colors.background, 
                  fontSize: fontSizes.base, 
                  fontWeight: fontWeights.semibold 
                }]}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Cart Items */}
              <ScrollView style={[styles.itemsList, { paddingHorizontal: spacing.base }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.itemsHeader, { paddingVertical: spacing.md }]}>
                  <Text style={[styles.itemsCount, { 
                    fontSize: fontSizes.base, 
                    fontWeight: fontWeights.medium, 
                    color: colors.text 
                  }]}>
                    {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
                  </Text>
                  <TouchableOpacity onPress={handleClearCart}>
                    <Text style={[styles.clearText, { 
                      fontSize: fontSizes.sm, 
                      color: colors.error, 
                      fontWeight: fontWeights.medium 
                    }]}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item._id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </ScrollView>

              {/* Footer */}
              <View style={[styles.footer, { 
                backgroundColor: colors.background, 
                paddingHorizontal: spacing.base, 
                paddingVertical: spacing.md, 
                borderTopWidth: 1, 
                borderTopColor: colors.border 
              }]}>
                <View style={[styles.totalContainer, { marginBottom: spacing.md }]}>
                  <Text style={[styles.totalLabel, { 
                    fontSize: fontSizes.lg, 
                    fontWeight: fontWeights.medium, 
                    color: colors.text 
                  }]}>Total:</Text>
                  <Text style={[styles.totalAmount, { 
                    fontSize: fontSizes.xl, 
                    fontWeight: fontWeights.bold, 
                    color: colors.primary 
                  }]}>₦{cart.totalAmount.toLocaleString()}</Text>
                </View>
                
                <View style={[styles.footerButtons, { gap: spacing.sm }]}>
                  <TouchableOpacity
                    style={[styles.continueButton, { 
                      backgroundColor: colors.surface, 
                      paddingVertical: spacing.md, 
                      borderRadius: borderRadius.md, 
                      borderWidth: 1, 
                      borderColor: colors.border 
                    }]}
                    onPress={handleContinueShopping}
                  >
                    <Text style={[styles.continueButtonText, { 
                      color: colors.text, 
                      fontSize: fontSizes.base, 
                      fontWeight: fontWeights.medium 
                    }]}>Continue Shopping</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.checkoutButton, { 
                      backgroundColor: colors.primary, 
                      paddingVertical: spacing.md, 
                      borderRadius: borderRadius.md 
                    }]}
                    onPress={handleCheckout}
                  >
                    <Text style={[styles.checkoutButtonText, { 
                      color: colors.background, 
                      fontSize: fontSizes.base, 
                      fontWeight: fontWeights.semibold 
                    }]}>Checkout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    // Styles applied inline
  },
  headerSubtitle: {
    marginTop: 2,
  },
  closeButton: {
    // Styles applied inline
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  shopButton: {
    // Styles applied inline
  },
  shopButtonText: {
    // Styles applied inline
  },
  itemsList: {
    flex: 1,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsCount: {
    // Styles applied inline
  },
  clearText: {
    // Styles applied inline
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    // Styles applied inline
  },
  itemPrice: {
    // Styles applied inline
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    // Styles applied inline
  },
  footer: {
    // Styles applied inline
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    // Styles applied inline
  },
  totalAmount: {
    // Styles applied inline
  },
  footerButtons: {
    flexDirection: 'row',
  },
  continueButton: {
    flex: 1,
    alignItems: 'center',
  },
  continueButtonText: {
    // Styles applied inline
  },
  checkoutButton: {
    flex: 1,
    alignItems: 'center',
  },
  checkoutButtonText: {
    // Styles applied inline
  },
});