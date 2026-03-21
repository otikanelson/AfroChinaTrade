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
import { router } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
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
  _id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
}

export default function CheckoutScreen() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) return;

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

      if (paymentData.success) {
        setPaymentMethods(paymentData.data);
        const defaultPayment = paymentData.data.find((p: PaymentMethod) => p.isDefault);
        if (defaultPayment) setSelectedPayment(defaultPayment._id);
      }

      if (addressData.success) {
        setAddresses(addressData.data);
        const defaultAddress = addressData.data.find((a: DeliveryAddress) => a.isDefault);
        if (defaultAddress) setSelectedAddress(defaultAddress._id);
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processOrder = async () => {
    if (!selectedPayment || !selectedAddress) {
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
          paymentMethodId: selectedPayment,
          deliveryAddressId: selectedAddress,
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

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.items.map((item) => (
          <View key={`${item.productId._id}-${JSON.stringify(item.selectedVariant)}`} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.productId.name}</Text>
            <Text style={styles.itemDetails}>
              Qty: {item.quantity} × ${item.price.toFixed(2)}
            </Text>
            <Text style={styles.itemTotal}>${(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total ({cart.totalItems} items)</Text>
          <Text style={styles.totalAmount}>${cart.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Delivery Address */}
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
            onPress={() => router.push('/addresses/new')}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Delivery Address</Text>
          </TouchableOpacity>
        ) : (
          addresses.map((address) => (
            <TouchableOpacity
              key={address._id}
              style={[
                styles.optionCard,
                selectedAddress === address._id && styles.selectedCard,
              ]}
              onPress={() => setSelectedAddress(address._id)}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>{address.fullName}</Text>
                <View style={styles.radioButton}>
                  {selectedAddress === address._id && (
                    <View style={styles.radioSelected} />
                  )}
                </View>
              </View>
              <Text style={styles.optionSubtitle}>
                {address.addressLine1}, {address.city}, {address.state}
              </Text>
              <Text style={styles.optionSubtitle}>{address.phoneNumber}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Payment Method */}
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
            <Ionicons name="add" size={20} color="#007AFF" />
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

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!selectedPayment || !selectedAddress || processing) && styles.disabledButton,
          ]}
          onPress={processOrder}
          disabled={!selectedPayment || !selectedAddress || processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>
              Place Order - ${cart.totalAmount.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  manageLink: {
    color: '#007AFF',
    fontSize: 14,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});