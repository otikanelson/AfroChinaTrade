import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Header } from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRedirect } from '../contexts/RedirectContext';
import { useTheme } from '../contexts/ThemeContext';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';

interface PaymentMethod {
  _id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'paypal';
  isDefault: boolean;
  cardDetails?: {
    last4: string;
    brand: string;
    holderName: string;
  };
  mobileMoneyDetails?: {
    provider: string;
    phoneNumber: string;
    accountName: string;
  };
}

interface DeliveryAddress {
  _id?: string;
  id?: string;
  type?: 'home' | 'work' | 'other';
  isDefault: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  street?: string;
  landmark?: string;
}

export default function CheckoutScreen() {
  const { cart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { setPendingRedirect } = useRedirect();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Always load checkout data, but only fetch payment/address data if authenticated
    fetchCheckoutData();
  }, [isAuthenticated]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCheckoutData();
    }, [isAuthenticated])
  );

  const fetchCheckoutData = async () => {
    setLoading(true);
    
    // If not authenticated, just finish loading (guest checkout)
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const token = await tokenManager.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [paymentResponse, addressResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/payment-methods`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const paymentData = await paymentResponse.json();
      const addressData = await addressResponse.json();

      if (paymentData.success && paymentData.data) {
        setPaymentMethods(paymentData.data);
        const defaultPayment = paymentData.data.find((p: PaymentMethod) => p.isDefault);
        if (defaultPayment) setSelectedPayment(defaultPayment._id);
      }

      if (addressData.status === 'success' && addressData.data) {
        setAddresses(addressData.data);
        const defaultAddress = addressData.data.find((a: DeliveryAddress) => a.isDefault);
        if (defaultAddress) setSelectedAddress(defaultAddress._id || defaultAddress.id || '');
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOrder = async () => {
    // Check if user is authenticated, if not redirect to login
    if (!isAuthenticated) {
      setPendingRedirect('/checkout');
      Alert.alert(
        'Sign In Required',
        'Please sign in to complete your purchase',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }

    if (!selectedPayment || !selectedAddress || !cart) {
      Alert.alert('Error', 'Please select payment method and delivery address');
      return;
    }

    const token = await tokenManager.getAccessToken();
    if (!token) return;

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryAddressId: selectedAddress,
          paymentMethodId: selectedPayment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await clearCart();
        Alert.alert(
          'Order Placed!',
          'Your order has been placed successfully. You will receive a confirmation email shortly.',
          [
            {
              text: 'View Orders',
              onPress: () => router.replace('/orders'),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      Alert.alert('Error', 'Failed to process order');
    } finally {
      setProcessing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.background,
      marginTop: spacing.sm,
      padding: spacing.base,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    manageLink: {
      color: colors.primary,
      fontSize: fontSizes.sm,
    },
    orderItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemName: {
      flex: 1,
      fontSize: fontSizes.sm,
      color: colors.text,
    },
    itemDetails: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginHorizontal: spacing.xs,
    },
    itemTotal: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.base,
      marginTop: spacing.xs,
      borderTopWidth: 2,
      borderTopColor: colors.border,
    },
    totalLabel: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
    },
    totalAmount: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    optionCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      marginBottom: spacing.xs,
    },
    selectedCard: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    optionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionTitle: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      flex: 1,
    },
    optionSubtitle: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 4,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      borderRadius: borderRadius.base,
      padding: spacing.base,
    },
    addButtonText: {
      color: colors.primary,
      fontSize: fontSizes.sm,
      marginLeft: spacing.xs,
    },
    footer: {
      padding: spacing.base,
      backgroundColor: colors.background,
      marginTop: spacing.sm,
    },
    placeOrderButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      paddingVertical: spacing.base,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: colors.textSecondary,
    },
    placeOrderText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginTop: spacing.base,
      marginBottom: spacing.lg,
    },
    shopButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    shopButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    guestNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    guestNoticeText: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 20,
    },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title="Checkout"
          showBack={true}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Checkout"
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Checkout"
        showBack={true}
      />
      <ScrollView style={styles.scrollView}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.items.map((item, index) => (
            <View key={`${item.productId._id}-${JSON.stringify(item.selectedVariant || {})}-${index}`} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.productId.name}</Text>
              <Text style={styles.itemDetails}>
                Qty: {item.quantity} × ₦{item.price.toLocaleString()}
              </Text>
              <Text style={styles.itemTotal}>₦{(item.quantity * item.price).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total ({cart.totalItems} items)</Text>
            <Text style={styles.totalAmount}>₦{cart.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Delivery Address - Only show for authenticated users */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={() => router.push('/addresses')}>
                <Text style={styles.manageLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            {addresses.length === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/addresses/new-address')}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Delivery Address</Text>
              </TouchableOpacity>
            ) : (
              <>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address._id || address.id}
                    style={[
                      styles.optionCard,
                      (selectedAddress === address._id || selectedAddress === address.id) && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedAddress(address._id || address.id || '')}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionTitle}>
                        {address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : 'Address'}
                      </Text>
                      <View style={styles.radioButton}>
                        {(selectedAddress === address._id || selectedAddress === address.id) && (
                          <View style={styles.radioSelected} />
                        )}
                      </View>
                    </View>
                    <Text style={styles.optionSubtitle}>
                      {address.addressLine1 || address.street}, {address.city}, {address.state}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push('/addresses/new-address')}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <Text style={styles.addButtonText}>Add Another Address</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Payment Method - Only show for authenticated users */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <TouchableOpacity onPress={() => router.push('/payment-methods')}>
                <Text style={styles.manageLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            {paymentMethods.length === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/payment-methods/new')}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            ) : (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method._id}
                  style={[
                    styles.optionCard,
                    selectedPayment === method._id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedPayment(method._id)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>
                      {method.type === 'card' && method.cardDetails
                        ? `${method.cardDetails.brand} •••• ${method.cardDetails.last4}`
                        : method.type === 'mobile_money' && method.mobileMoneyDetails
                        ? `${method.mobileMoneyDetails.provider} - ${method.mobileMoneyDetails.phoneNumber}`
                        : method.type.replace('_', ' ').toUpperCase()}
                    </Text>
                    <View style={styles.radioButton}>
                      {selectedPayment === method._id && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Guest Notice - Only show for guests */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.guestNotice}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.guestNoticeText}>
                You'll be asked to sign in or create an account to complete your purchase
              </Text>
            </View>
          </View>
        )}

        {/* Place Order Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              (isAuthenticated && (!selectedPayment || !selectedAddress)) && styles.disabledButton,
              processing && styles.disabledButton,
            ]}
            onPress={processOrder}
            disabled={processing || (isAuthenticated && (!selectedPayment || !selectedAddress))}
          >
            {processing ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.placeOrderText}>
                {isAuthenticated ? 'Place Order' : 'Continue to Sign In'} - ₦{cart.totalAmount.toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}