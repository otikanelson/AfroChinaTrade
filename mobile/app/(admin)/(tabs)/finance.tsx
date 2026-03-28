import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Order, Refund } from '../../../types/product';
import { refundService } from '../../../services/RefundService';
import { orderService } from '../../../services/OrderService';
import { Button } from '../../../components/admin/Button';
import { mobileToastManager } from '../../../utils/toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';

interface RefundModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (orderId: string, type: 'full' | 'partial', amount: number, reason: string) => void;
}



type TimePeriod = 'today' | 'week' | 'month' | 'all';

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

function isWithinPeriod(iso: string, period: TimePeriod): boolean {
  if (period === 'all') return true;
  const diff = Date.now() - new Date(iso).getTime();
  if (period === 'today') return new Date(iso).toDateString() === new Date().toDateString();
  if (period === 'week') return diff <= 7 * 86400000;
  if (period === 'month') return diff <= 30 * 86400000;
  return true;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(orders: Order[], refunds: Refund[], period: TimePeriod): string {
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? 'All Time';
  const lines: string[] = [];

  lines.push(`Financial Report — ${periodLabel}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');

  // Orders section
  lines.push('ORDERS');
  lines.push(['Order ID', 'Customer', 'Date', 'Status', 'Amount'].map(escapeCsv).join(','));
  for (const o of orders) {
    const customerName = typeof o.userId === 'object' && o.userId.name ? o.userId.name : 'N/A';
    lines.push([
      o.orderId,
      customerName,
      formatDate(o.createdAt),
      o.status,
      o.totalAmount.toFixed(2),
    ].map(escapeCsv).join(','));
  }

  lines.push('');

  // Refunds section
  const refundsArray = Array.isArray(refunds) ? refunds : [];
  const periodRefunds = refundsArray.filter((r) => isWithinPeriod(r.createdAt, period));
  lines.push('REFUNDS');
  lines.push(['Refund ID', 'Order ID', 'Type', 'Amount', 'Reason', 'Date'].map(escapeCsv).join(','));
  for (const r of periodRefunds) {
    lines.push([
      r.id,
      r.orderId,
      r.type,
      (r.amount || 0).toFixed(2),
      r.reason,
      formatDate(r.createdAt),
    ].map(escapeCsv).join(','));
  }

  return lines.join('\n');
}

// ─── Compact Order Item ──────────────────────────────────────────────────────

interface CompactFinanceOrderProps {
  order: Order;
  onPress: () => void;
  onRefund: () => void;
}

const CompactFinanceOrder: React.FC<CompactFinanceOrderProps> = ({ order, onPress, onRefund }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginHorizontal: spacing.base,
        marginVertical: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeftWidth: 3,
        borderLeftColor: getStatusColor(order.status),
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.bold,
          color: colors.text,
          marginBottom: 2,
        }}>
          #{order.orderId}
        </Text>
        <Text style={{
          fontSize: fontSizes.xs,
          color: colors.textSecondary,
        }}>
          {formatDate(order.createdAt)}
        </Text>
        <View style={{
          backgroundColor: getStatusColor(order.status) + '20',
          paddingHorizontal: spacing.xs,
          paddingVertical: 2,
          borderRadius: borderRadius.sm,
          alignSelf: 'flex-start',
          marginTop: spacing.xs,
        }}>
          <Text style={{
            fontSize: fontSizes.xs,
            color: getStatusColor(order.status),
            fontWeight: fontWeights.semibold,
            textTransform: 'capitalize',
          }}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
        <Text style={{
          fontSize: fontSizes.base,
          fontWeight: fontWeights.bold,
          color: colors.primary,
        }}>
          ₦{order.totalAmount.toLocaleString()}
        </Text>
        {order.status === 'delivered' && (
          <TouchableOpacity
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 4,
              borderRadius: borderRadius.sm,
              borderWidth: 1,
              borderColor: colors.error,
            }}
            onPress={(e) => {
              e.stopPropagation();
              onRefund();
            }}
          >
            <Text style={{
              fontSize: fontSizes.xs,
              color: colors.error,
              fontWeight: fontWeights.medium,
            }}>
              Refund
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function FinanceScreen() {
  const router = useRouter();
  const { colors, fontSizes, spacing, borderRadius, fontWeights } = useTheme();
  
  const styles = StyleSheet.create({
    screen: { 
      flex: 1, 
      backgroundColor: colors.surface 
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    statCard: {
      flex: 1,
      borderLeftWidth: 1.5,
      borderRadius: 5,
      padding: spacing.sm,
      alignItems: 'center',
    },
    statValue: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    statLabel: {
      fontSize: 8,
      fontWeight: fontWeights.semibold,
      color: colors.textLight,
      textAlign: 'center',
    },
    actionRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.background,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary + '40',
    },
    actionButtonText: {
      fontSize: fontSizes.sm,
      color: colors.primary,
      fontWeight: fontWeights.medium,
    },
    periodButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: spacing.xs,
      paddingVertical: 4,
    },
    periodButtonText: {
      fontSize: fontSizes.xs,
      color: colors.primary,
      fontWeight: fontWeights.medium,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    // Modal styles
    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.4)', 
      justifyContent: 'flex-end' 
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
      fontWeight: fontWeights.semibold, 
      color: colors.text 
    },
    modalSub: { 
      fontSize: fontSizes.sm, 
      color: colors.textSecondary, 
      marginTop: -spacing.sm 
    },
    fieldLabel: { 
      fontSize: fontSizes.sm, 
      fontWeight: fontWeights.medium, 
      color: colors.text 
    },
    typeRow: { 
      flexDirection: 'row', 
      gap: spacing.sm 
    },
    typeBtn: {
      flex: 1, 
      paddingVertical: spacing.sm, 
      borderRadius: borderRadius.base,
      borderWidth: 1.5, 
      borderColor: colors.border, 
      alignItems: 'center',
    },
    typeBtnActive: { 
      borderColor: colors.primary, 
      backgroundColor: colors.primary 
    },
    typeBtnText: { 
      fontSize: fontSizes.sm, 
      color: colors.textSecondary, 
      fontWeight: fontWeights.medium 
    },
    typeBtnTextActive: { 
      color: colors.background 
    },
    input: {
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: borderRadius.base,
      padding: spacing.md, 
      fontSize: fontSizes.base, 
      color: colors.text,
      backgroundColor: colors.surface,
    },
    inputMulti: { 
      minHeight: 80, 
      textAlignVertical: 'top' 
    },
    modalActions: { 
      flexDirection: 'row', 
      gap: spacing.sm 
    },
    modalBtn: { 
      flex: 1 
    },
    // Period menu
    menuOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.3)', 
      justifyContent: 'flex-start', 
      alignItems: 'flex-end', 
      paddingTop: 110, 
      paddingRight: spacing.base 
    },
    periodMenu: { 
      backgroundColor: colors.background, 
      borderRadius: borderRadius.md, 
      minWidth: 160, 
      overflow: 'hidden' 
    },
    periodItem: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base, 
      paddingVertical: spacing.md,
      borderBottomWidth: 1, 
      borderBottomColor: colors.border,
    },
    periodItemActive: { 
      backgroundColor: colors.surface 
    },
    periodItemText: { 
      fontSize: fontSizes.base, 
      color: colors.text 
    },
    periodItemTextActive: { 
      color: colors.primary, 
      fontWeight: fontWeights.semibold 
    },
  });

  // RefundModal component
  const RefundModal: React.FC<RefundModalProps> = ({ visible, order, onClose, onSubmit }) => {
    const [type, setType] = useState<'full' | 'partial'>('full');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const reset = () => { setType('full'); setAmount(''); setReason(''); };

    const handleSubmit = () => {
      if (!order) return;
      const refundAmount = type === 'full' ? order.totalAmount : parseFloat(amount);
      if (type === 'partial' && (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > order.totalAmount)) {
        Alert.alert('Invalid Amount', `Enter an amount between ₦0.01 and ₦${order.totalAmount.toFixed(2)}`);
        return;
      }
      onSubmit(order._id, type, refundAmount, reason.trim() || 'No reason provided');
      reset();
    };

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Process Refund</Text>
            {order && <Text style={styles.modalSub}>Order #{order.orderId} — ₦{order.totalAmount.toFixed(2)}</Text>}

            <Text style={styles.fieldLabel}>Refund Type</Text>
            <View style={styles.typeRow}>
              {(['full', 'partial'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                    {t === 'full' ? 'Full Refund' : 'Partial Refund'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {type === 'partial' && (
              <>
                <Text style={styles.fieldLabel}>Amount (₦)</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="decimal-pad"
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Reason (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={reason}
              onChangeText={setReason}
              placeholder="Describe the reason for refund"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button label="Cancel" variant="secondary" onPress={() => { reset(); onClose(); }} style={styles.modalBtn} />
              <Button label="Process Refund" onPress={handleSubmit} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      const [ordersResponse, refundsResponse] = await Promise.all([
        orderService.getOrders({ page: 1, limit: 100 }),
        refundService.getRefunds({ page: 1, limit: 100 }),
      ]);
      
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data);
      } else {
        setOrders([]);
      }
      
      if (refundsResponse.success && refundsResponse.data) {
        setRefunds(refundsResponse.data);
      } else {
        setRefunds([]);
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
      setOrders([]);
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const periodOrders = useMemo(
    () => {
      const ordersArray = Array.isArray(orders) ? orders : [];
      return ordersArray.filter((o) => isWithinPeriod(o.createdAt, period));
    },
    [orders, period],
  );

  const stats = useMemo(() => {
    // Only count delivered orders as revenue
    const revenue = periodOrders
      .filter((o) => o.status === 'delivered')
      .reduce((s, o) => s + o.totalAmount, 0);
    const pending = periodOrders
      .filter((o) => o.status === 'pending')
      .reduce((s, o) => s + o.totalAmount, 0);
    
    // Ensure refunds is an array before filtering
    const refundsArray = Array.isArray(refunds) ? refunds : [];
    const periodRefunds = refundsArray.filter((r) => isWithinPeriod(r.createdAt, period));
    const refunded = periodRefunds.reduce((s, r) => s + (r.amount || 0), 0);
    
    // Refund statistics
    const pendingRefunds = periodRefunds.filter(r => r.status === 'pending').length;
    const processedRefunds = periodRefunds.filter(r => r.status === 'processed').length;
    const totalRefundRequests = periodRefunds.length;
    
    // Net revenue = delivered orders - refunds
    const netRevenue = revenue - refunded;
      
    return { 
      revenue: netRevenue, 
      pending, 
      refunded,
      pendingRefunds,
      processedRefunds,
      totalRefundRequests,
    };
  }, [periodOrders, refunds, period]);

  const recentOrders = useMemo(
    () => [...periodOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    [periodOrders],
  );

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => (
      <CompactFinanceOrder
        order={item}
        onPress={() => router.push({ pathname: '/(admin)/order/[id]', params: { id: item._id } })}
        onRefund={() => setRefundModalOrder(item)}
      />
    ),
    [router],
  );

  const keyExtractor = useCallback((item: Order) => item._id, []);

  const handleRefundSubmit = useCallback(
    async (orderId: string, type: 'full' | 'partial', amount: number, reason: string) => {
      try {
        const response = await refundService.createRefund({
          orderId,
          type,
          amount,
          reason,
        });
        
        if (response.success && response.data) {
          // Refresh the data to get updated lists
          await load();
          setRefundModalOrder(null);
          mobileToastManager.success('Refund processed successfully', 'Refund');
        } else {
          throw new Error(response.error?.message || 'Failed to process refund');
        }
      } catch (error) {
        console.error('Error processing refund:', error);
        Alert.alert('Error', 'Failed to process refund.');
      }
    },
    [load],
  );

  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? 'All Time';

  const handleExport = useCallback(async () => {
    try {
      const csv = buildCsv(periodOrders, refunds, period);
      const filename = `finance-report-${period}-${Date.now()}.csv`;
      const file = new File(Paths.cache, filename);
      file.write(csv);
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Your device does not support file sharing.');
        return;
      }
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export Financial Report' });
      mobileToastManager.success('Report exported successfully', 'Export');
    } catch {
      Alert.alert('Export Failed', 'Could not export the financial report. Please try again.');
    }
  }, [periodOrders, refunds, period]);

  return (
    <View style={styles.screen}>
      <Header 
        title="Finance"
        subtitle="Track revenue"
        rightAction={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: borderRadius.base, borderWidth: 1, borderColor: colors.primary, }}>
            <TouchableOpacity
              style={styles.periodButton}
              onPress={() => setPeriodMenuVisible(true)}
            >
              <Text style={styles.periodButtonText}>{periodLabel}</Text>
              <Ionicons name="chevron-down" size={10} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 2, borderRadius: borderRadius.base, borderWidth: 1, borderColor: colors.primary, margin: 2, }}
              onPress={handleExport}
            >
              <Ionicons name="download-outline" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Professional Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statLabel}>Net Revenue</Text>
          <Text style={styles.statValue}>₦{stats.revenue.toFixed(0)}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statLabel}>Pending Orders</Text>
          <Text style={styles.statValue}>₦{stats.pending.toFixed(0)}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.error }]}>
          <Text style={styles.statLabel}>Refunded</Text>
          <Text style={styles.statValue}>₦{stats.refunded.toFixed(0)}</Text>
        </View>
      </View>

      {/* Refund Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
          <Text style={styles.statLabel}>Pending Refunds</Text>
          <Text style={styles.statValue}>{stats.pendingRefunds}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#06b6d4' }]}>
          <Text style={styles.statLabel}>Processed</Text>
          <Text style={styles.statValue}>{stats.processedRefunds}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#64748b' }]}>
          <Text style={styles.statLabel}>Total Requests</Text>
          <Text style={styles.statValue}>{stats.totalRefundRequests}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/finance/refunds')}
        >
          <Ionicons name="list-outline" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>
            Refund History {stats.pendingRefunds > 0 && `(${stats.pendingRefunds} pending)`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/refunds')}
        >
          <Ionicons name="settings-outline" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>Manage Refunds</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(admin)/refunds/analytics')}
        >
          <Ionicons name="analytics-outline" size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>Refund Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={recentOrders}
        renderItem={renderOrder}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={load}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cash-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No orders in this period.</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />

      {/* Period menu */}
      <Modal visible={periodMenuVisible} transparent animationType="fade" onRequestClose={() => setPeriodMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setPeriodMenuVisible(false)}>
          <View style={styles.periodMenu}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.periodItem, period === p.value && styles.periodItemActive]}
                onPress={() => { setPeriod(p.value); setPeriodMenuVisible(false); }}
              >
                <Text style={[styles.periodItemText, period === p.value && styles.periodItemTextActive]}>{p.label}</Text>
                {period === p.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <RefundModal
        visible={!!refundModalOrder}
        order={refundModalOrder}
        onClose={() => setRefundModalOrder(null)}
        onSubmit={handleRefundSubmit}
      />
    </View>
  );
}


