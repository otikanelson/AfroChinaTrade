import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Order } from '../../../types/product';
import { orderService } from '../../../services/OrderService';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/admin/Button';
import { Card } from '../../../components/admin/Card';
import { mobileToastManager } from '../../../utils/toast';
import { theme } from '../../../theme';



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

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

interface ShippingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (tracking: string) => void;
}

const ShippingModal: React.FC<ShippingModalProps> = ({ visible, onClose, onConfirm }) => {
  const [tracking, setTracking] = useState('');
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
            placeholderTextColor={theme.colors.textLight}
            autoCapitalize="characters"
            accessibilityLabel="Tracking number"
          />
          <View style={styles.modalActions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.modalBtn} />
            <Button
              label="Mark as Shipped"
              onPress={() => { onConfirm(tracking.trim()); setTracking(''); }}
              disabled={!tracking.trim()}
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

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);

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

  const handleDeliver = () =>
    Alert.alert('Mark Delivered', 'Mark this order as delivered?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateStatus('delivered') },
    ]);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
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
  const isShipped    = order.status === 'shipped';
  const isDelivered  = order.status === 'delivered';
  const isCancelled  = order.status === 'cancelled';
  const trackingNumber = (order as any).trackingNumber;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          #{order.orderId}
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
            {isShipped && (
              <Button
                label="Mark as Delivered"
                icon="checkmark-done-outline"
                onPress={handleDeliver}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  backBtn: {
    minWidth: 44, minHeight: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text,
  },

  content: {
    padding: theme.spacing.base,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
  },
  card: { marginBottom: 0 },

  sectionTitle: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  label: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary },
  value: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeights.medium as any,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.primary,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  itemInfo: { flex: 1, marginRight: theme.spacing.sm },
  itemName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeights.medium as any,
  },
  itemMeta: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text,
  },

  addressLine: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    lineHeight: 22,
  },

  actions: { gap: theme.spacing.sm },
  actionBtn: { width: '100%' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text,
  },
  trackingInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  modalActions: { flexDirection: 'row', gap: theme.spacing.sm },
  modalBtn: { flex: 1 },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
});
