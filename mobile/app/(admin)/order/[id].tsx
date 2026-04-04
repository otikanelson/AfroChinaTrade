import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order } from '../../../types/product';
import { orderService } from '../../../services/OrderService';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/admin/Button';
import { Card } from '../../../components/admin/Card';
import { mobileToastManager } from '../../../utils/toast';
import { useTheme } from '../../../contexts/ThemeContext';



function orderStatusToBadge(status: Order['status']): StatusType {
  const map: Record<string, StatusType> = {
    pending: 'pending', processing: 'accepted',
    shipped: 'shipped', delivered: 'delivered', cancelled: 'failed',
  };
  return map[status] ?? 'pending';
}

function statusLabel(status: Order['status']): string {
  const map: Record<string, string> = {
    pending: 'Pending', processing: 'Accepted',
    shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
  };
  return map[status] ?? status;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
  const { colors, fontSizes, fontWeights, spacing } = useTheme();
  
  const sectionTitleStyle = {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  };
  
  return <Text style={sectionTitleStyle}>{title}</Text>;
};

interface ShippingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (tracking: string) => void;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ visible, onClose, onConfirm }) => {
  const [tracking, setTracking] = useState('');
  const { colors, fontSizes, spacing, borderRadius } = useTheme();
  
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.xl,
      gap: spacing.md,
    },
    modalTitle: {
      fontSize: fontSizes.lg,
      fontWeight: '600',
      color: colors.text,
    },
    trackingInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.md,
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    trackingHint: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: -spacing.xs,
    },
    modalActions: { flexDirection: 'row', gap: spacing.sm },
    modalBtn: { flex: 1 },
  });
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Enter Tracking Number</Text>
          <TextInput
            style={styles.trackingInput}
            value={tracking}
            onChangeText={setTracking}
            placeholder="e.g. 1Z999AA10123456784"
            placeholderTextColor={colors.textLight}
            autoCapitalize="characters"
            maxLength={40}
            accessibilityLabel="Tracking number"
          />
          <Text style={styles.trackingHint}>
            {tracking.trim().length > 0 && tracking.trim().length < 8
              ? 'Tracking number must be at least 8 characters'
              : `${tracking.trim().length}/40`}
          </Text>
          <View style={styles.modalActions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.modalBtn} />
            <Button
              label="Mark as Shipped"
              onPress={() => { onConfirm(tracking.trim()); setTracking(''); }}
              disabled={tracking.trim().length < 8}
              style={styles.modalBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.background,
      gap: spacing.sm,
    },
    backBtn: {
      minWidth: 44, minHeight: 44,
      alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    content: {
      padding: spacing.base,
      gap: spacing.md,
      paddingBottom: spacing['2xl'],
    },
    card: { marginBottom: 0 },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: colors.text,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    label: { fontSize: fontSizes.sm, color: colors.textSecondary },
    value: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontWeight: fontWeights.medium as any,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
    },
    totalLabel: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: colors.text,
    },
    totalValue: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
    },
    itemDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    itemInfo: { flex: 1, marginRight: spacing.sm },
    itemName: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontWeight: fontWeights.medium as any,
    },
    itemMeta: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    itemTotal: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold as any,
      color: colors.text,
    },
    addressLine: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 22,
    },
    actions: { gap: spacing.sm },
    actionBtn: { width: '100%' },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await orderService.getOrderById(id);
        if (!cancelled) {
          if (response.success && response.data) {
            setOrder(response.data);
          } else {
            setOrder(null);
          }
        }
      } catch (error) {
        console.error('Error loading order:', error);
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const updateStatus = useCallback(
    async (newStatus: Order['status'], extra?: Record<string, unknown>) => {
      if (!order) return;
      setActionLoading(true);
      try {
        let response;
        if (newStatus === 'shipped' && extra?.trackingNumber) {
          response = await orderService.updateTrackingNumber(id, {
            trackingNumber: extra.trackingNumber as string,
          });
        } else {
          response = await orderService.updateOrderStatus(id, {
            status: newStatus,
          });
        }

        if (response.success && response.data) {
          setOrder(response.data);
          mobileToastManager.success(`Order ${statusLabel(newStatus).toLowerCase()}`, 'Updated');
        } else {
          throw new Error(response.error?.message || 'Failed to update order');
        }
      } catch (error) {
        console.error('Error updating order:', error);
        Alert.alert('Error', 'Failed to update order. Please try again.');
      } finally {
        setActionLoading(false);
      }
    },
    [order, id],
  );

  const handleAccept = () =>
    Alert.alert('Accept Order', 'Accept this order and notify the customer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => updateStatus('processing') },
    ]);

  const handleShipped = (tracking: string) => {
    setShippingModalVisible(false);
    updateStatus('shipped', { trackingNumber: tracking });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading order…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Order not found.</Text>
          <Button label="Go Back" onPress={() => router.back()} variant="secondary" style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const isPending    = order.status === 'pending';
  const isProcessing = order.status === 'processing';
  const isDelivered  = order.status === 'delivered';
  const isCancelled  = order.status === 'cancelled';
  const trackingNumber = (order as any).trackingNumber;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Order Details
        </Text>
        <StatusBadge
          status={orderStatusToBadge(order.status)}
          label={statusLabel(order.status)}
          size="sm"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary */}
        <Card style={styles.card}>
          <SectionTitle title="Order Summary" />
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>#{order.orderId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <StatusBadge
              status={orderStatusToBadge(order.status)}
              label={statusLabel(order.status)}
              size="sm"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={[styles.value, styles.totalValue]}>₦{order.totalAmount.toFixed(2)}</Text>
          </View>
          {trackingNumber ? (
            <View style={styles.row}>
              <Text style={styles.label}>Tracking</Text>
              <Text style={styles.value}>{trackingNumber}</Text>
            </View>
          ) : null}
        </Card>

        {/* Customer Information */}
        {typeof order.userId === 'object' && order.userId.name && (
          <Card style={styles.card}>
            <SectionTitle title="Customer Information" />
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{order.userId.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{order.userId.email}</Text>
            </View>
            {order.userId.phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{order.userId.phone}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Items */}
        <Card style={styles.card}>
          <SectionTitle title="Items" />
          {order.items.map((item, i) => (
            <View
              key={item.productId || `item-${i}`}
              style={[styles.itemRow, i < order.items.length - 1 && styles.itemDivider]}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemMeta}>
                  Qty: {item.quantity} × ₦{item.price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                ₦{item.subtotal.toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{order.totalAmount.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Shipping address */}
        <Card style={styles.card}>
          <SectionTitle title="Shipping Address" />
          <Text style={styles.addressLine}>{order.deliveryAddress?.street}</Text>
          <Text style={styles.addressLine}>
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
            {order.deliveryAddress?.postalCode}
          </Text>
          <Text style={styles.addressLine}>{order.deliveryAddress?.country}</Text>
        </Card>

        {/* Actions */}
        {!isCancelled && !isDelivered && (
          <View style={styles.actions}>
            {isPending && (
              <Button
                label="Accept Order"
                icon="checkmark-circle-outline"
                onPress={handleAccept}
                loading={actionLoading}
                size="lg"
                style={styles.actionBtn}
              />
            )}
            {isProcessing && (
              <Button
                label="Mark as Shipped"
                icon="airplane-outline"
                onPress={() => setShippingModalVisible(true)}
                loading={actionLoading}
                size="lg"
                style={styles.actionBtn}
              />
            )}
          </View>
        )}
      </ScrollView>

      <ShippingModal
        visible={shippingModalVisible}
        onClose={() => setShippingModalVisible(false)}
        onConfirm={handleShipped}
      />
    </SafeAreaView>
  );
}
