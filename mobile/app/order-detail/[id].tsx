import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { tokenManager } from '../../services/api/tokenManager';
import { API_BASE_URL } from '../../constants/config';
import { useTheme } from '../../contexts/ThemeContext';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    const token = await tokenManager.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching order details:', `${API_BASE_URL}/orders/${id}`);
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('Order detail response:', JSON.stringify(data, null, 2));
      
      if (data.status === 'success') {
        setOrder(data.data);
      } else {
        console.error('Failed to fetch order:', data.message);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'cog-outline';
      case 'shipped':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    placeholder: {
      width: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.background,
      marginTop: spacing.sm,
      padding: spacing.base,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.base,
    },
    orderNumber: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      gap: 4,
    },
    statusText: {
      fontSize: fontSizes.sm,
      color: 'white',
      fontWeight: fontWeights.bold,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    infoLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontWeight: fontWeights.medium,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    orderItem: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.base,
      marginRight: spacing.sm,
    },
    itemInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    itemName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    itemPrice: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    itemSubtotal: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.primary,
      textAlign: 'right',
    },
    addressText: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 24,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    totalLabel: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    totalValue: {
      fontSize: fontSizes.base,
      color: colors.text,
      fontWeight: fontWeights.medium,
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
      marginTop: spacing.sm,
      borderTopWidth: 2,
      borderTopColor: colors.border,
    },
    grandTotalLabel: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    grandTotalValue: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    trackingContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    trackingText: {
      fontSize: fontSizes.base,
      color: colors.text,
      flex: 1,
    },
    notesText: {
      fontSize: fontSizes.base,
      color: colors.text,
      lineHeight: 22,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.infoLabel}>Order not found</Text>
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
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>#{order.orderId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons 
                name={getStatusIcon(order.status) as any} 
                size={16} 
                color="white" 
              />
              <Text style={styles.statusText}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status</Text>
            <Text style={styles.infoValue}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </Text>
          </View>

          {order.trackingNumber && (
            <>
              <View style={styles.divider} />
              <View style={styles.trackingContainer}>
                <Ionicons name="cube-outline" size={20} color={colors.primary} />
                <Text style={styles.trackingText}>
                  Tracking: {order.trackingNumber}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={{ uri: item.productImage || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemPrice}>
                  ₦{item.price.toLocaleString()} × {item.quantity}
                </Text>
                <Text style={styles.itemSubtotal}>
                  ₦{item.subtotal.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ₦{order.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₦{order.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress.street}
          </Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress.city}, {order.deliveryAddress.state}
          </Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress.country} {order.deliveryAddress.postalCode}
          </Text>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
