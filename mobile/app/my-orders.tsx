import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { tokenManager } from '../services/api/tokenManager';
import { API_BASE_URL } from '../constants/config';
import { useTheme } from '../contexts/ThemeContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { DateDivider, createListWithDateDividers } from '../components/DateDivider';

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
  createdAt: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export default function OrdersScreen() {
  
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      paddingHorizontal: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginTop: spacing.base,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
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
      color: colors.background,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    ordersList: {
      flex: 1,
      paddingHorizontal: spacing.base,
      paddingTop: spacing.base,
    },
    orderCard: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    orderDate: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
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
      fontSize: fontSizes.xs,
      color: 'white',
      fontWeight: fontWeights.bold,
    },
    orderItems: {
      marginBottom: spacing.sm,
    },
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    itemImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.base,
      marginRight: spacing.sm,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.text,
      marginBottom: 2,
    },
    itemDetails: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    moreItems: {
      fontSize: fontSizes.sm,
      color: colors.primary,
      fontWeight: fontWeights.medium,
      marginTop: spacing.xs,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    deliveryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: spacing.sm,
    },
    deliveryText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    orderTotal: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: colors.primary,
    },
    dateDivider: {
      paddingHorizontal: spacing.xs,
      paddingTop: spacing.base,
      paddingBottom: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dateDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderLight,
    },
    dateDividerText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  const fetchOrders = React.useCallback(async (isRefresh: boolean = false) => {
    const token = await tokenManager.getAccessToken();
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/orders?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.status === 'success') {
        setOrders(data.data || []);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching orders:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Refresh orders when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders(false);
    }, [fetchOrders])
  );

  const onRefresh = React.useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

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
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateDivider = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  type ListItem =
    | { type: 'divider'; label: string; key: string }
    | { type: 'order'; data: Order; key: string };

  const listItems: ListItem[] = React.useMemo(() => {
    const items: ListItem[] = [];
    let lastDateKey = '';
    for (const order of orders) {
      const dateKey = new Date(order.createdAt).toDateString();
      if (dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        items.push({ type: 'divider', label: formatDateDivider(order.createdAt), key: `divider_${dateKey}` });
      }
      items.push({ type: 'order', data: order, key: order._id });
    }
    return items;
  }, [orders]);

  const handleOrderPress = React.useCallback((orderId: string) => {
    router.push(`/order-detail/${orderId}`);
  }, [router]);

  const renderItem = React.useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'divider') {
      return (
        <View style={styles.dateDivider}>
          <View style={styles.dateDividerLine} />
          <Text style={styles.dateDividerText}>{item.label}</Text>
          <View style={styles.dateDividerLine} />
        </View>
      );
    }

    const order = item.data;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(order._id)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{order.orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Ionicons name={getStatusIcon(order.status) as any} size={14} color="white" />
            <Text style={styles.statusText}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {order.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={{ uri: item.productImage || 'https://via.placeholder.com/50' }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.itemDetails}>
                  Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.deliveryText} numberOfLines={1}>
              {order.deliveryAddress.city}, {order.deliveryAddress.state}
            </Text>
          </View>
          <Text style={styles.orderTotal}>₦{order.totalAmount.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, handleOrderPress]);

  const keyExtractor = React.useCallback((item: Order) => item._id, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            When you place orders, they'll appear here
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listItems}
          renderItem={renderItem}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}