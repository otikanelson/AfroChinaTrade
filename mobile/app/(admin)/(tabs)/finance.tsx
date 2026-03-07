import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { Order } from '../../../../shared/src/types/entities';
import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { STORAGE_KEYS } from '../../../../shared/src/services/storage';
import { Card } from '../../../components/admin/Card';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/admin/Button';
import { mobileToastManager } from '../../../utils/toast';
import { theme } from '../../../theme';

const storage = new AsyncStorageAdapter();
export const REFUNDS_KEY = 'admin_refunds';

export interface Refund {
  id: string;
  orderId: string;
  type: 'full' | 'partial';
  amount: number;
  reason: string;
  createdAt: string;
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

function paymentStatusToBadge(status: Order['status']): StatusType {
  if (status === 'delivered') return 'completed';
  if (status === 'cancelled') return 'failed';
  if (status === 'pending') return 'pending';
  return 'accepted';
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string }
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Refund modal ─────────────────────────────────────────────────────────────

interface RefundModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (orderId: string, type: 'full' | 'partial', amount: number, reason: string) => void;
}

const RefundModal: React.FC<RefundModalProps> = ({ visible, order, onClose, onSubmit }) => {
  const [type, setType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const reset = () => { setType('full'); setAmount(''); setReason(''); };

  const handleSubmit = () => {
    if (!order) return;
    const refundAmount = type === 'full' ? order.totalAmount : parseFloat(amount);
    if (type === 'partial' && (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > order.totalAmount)) {
      Alert.alert('Invalid Amount', `Enter an amount between $0.01 and $${order.totalAmount.toFixed(2)}`);
      return;
    }
    onSubmit(order.id, type, refundAmount, reason.trim() || 'No reason provided');
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Process Refund</Text>
          {order && <Text style={styles.modalSub}>Order #{order.id.slice(-8).toUpperCase()} — ${order.totalAmount.toFixed(2)}</Text>}

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
              <Text style={styles.fieldLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textLight}
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
            placeholderTextColor={theme.colors.textLight}
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

// ─── CSV export ───────────────────────────────────────────────────────────────

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
  lines.push(['Order ID', 'Date', 'Status', 'Amount'].map(escapeCsv).join(','));
  for (const o of orders) {
    lines.push([
      o.id.slice(-8).toUpperCase(),
      formatDate(o.createdAt),
      o.status,
      o.totalAmount.toFixed(2),
    ].map(escapeCsv).join(','));
  }

  lines.push('');

  // Refunds section
  const periodRefunds = refunds.filter((r) => isWithinPeriod(r.createdAt, period));
  lines.push('REFUNDS');
  lines.push(['Refund ID', 'Order ID', 'Type', 'Amount', 'Reason', 'Date'].map(escapeCsv).join(','));
  for (const r of periodRefunds) {
    lines.push([
      r.id,
      r.orderId.slice(-8).toUpperCase(),
      r.type,
      r.amount.toFixed(2),
      r.reason,
      formatDate(r.createdAt),
    ].map(escapeCsv).join(','));
  }

  return lines.join('\n');
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FinanceScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [periodMenuVisible, setPeriodMenuVisible] = useState(false);
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      const [o, r] = await Promise.all([
        storage.get<Order[]>(STORAGE_KEYS.ORDERS),
        storage.get<Refund[]>(REFUNDS_KEY),
      ]);
      setOrders(o ?? []);
      setRefunds(r ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const periodOrders = useMemo(
    () => orders.filter((o) => isWithinPeriod(o.createdAt, period)),
    [orders, period],
  );

  const stats = useMemo(() => {
    const revenue = periodOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.totalAmount, 0);
    const pending = periodOrders
      .filter((o) => o.status === 'pending')
      .reduce((s, o) => s + o.totalAmount, 0);
    const refunded = refunds
      .filter((r) => isWithinPeriod(r.createdAt, period))
      .reduce((s, r) => s + r.amount, 0);
    return { revenue, pending, refunded };
  }, [periodOrders, refunds, period]);

  const recentOrders = useMemo(
    () => [...periodOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20),
    [periodOrders],
  );

  const handleRefundSubmit = useCallback(
    async (orderId: string, type: 'full' | 'partial', amount: number, reason: string) => {
      const newRefund: Refund = {
        id: `refund-${Date.now()}`,
        orderId,
        type,
        amount,
        reason,
        createdAt: new Date().toISOString(),
      };
      try {
        const existing = (await storage.get<Refund[]>(REFUNDS_KEY)) ?? [];
        await storage.set(REFUNDS_KEY, [newRefund, ...existing]);
        // Update order status to cancelled (refunded)
        const allOrders = (await storage.get<Order[]>(STORAGE_KEYS.ORDERS)) ?? [];
        const updated = allOrders.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : o,
        );
        await storage.set(STORAGE_KEYS.ORDERS, updated);
        setRefunds((prev) => [newRefund, ...prev]);
        setOrders(updated);
        setRefundModalOrder(null);
        mobileToastManager.success('Refund processed successfully', 'Refund');
      } catch {
        Alert.alert('Error', 'Failed to process refund.');
      }
    },
    [],
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
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExport}
            accessibilityRole="button"
            accessibilityLabel="Export financial report"
          >
            <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.periodBtn}
            onPress={() => setPeriodMenuVisible(true)}
            accessibilityRole="button"
          >
            <Text style={styles.periodBtnText}>{periodLabel}</Text>
            <Ionicons name="chevron-down" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon="cash-outline" color="#10b981" />
          <StatCard label="Pending" value={`$${stats.pending.toFixed(2)}`} icon="time-outline" color="#f59e0b" />
          <StatCard label="Refunded" value={`$${stats.refunded.toFixed(2)}`} icon="return-down-back-outline" color={theme.colors.error} />
        </ScrollView>

        {/* Refund history link */}
        <TouchableOpacity
          style={styles.refundHistoryBtn}
          onPress={() => router.push('/(admin)/finance/refunds')}
          accessibilityRole="button"
        >
          <Ionicons name="list-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.refundHistoryText}>View Refund History</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Recent orders */}
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {loading ? (
          <Text style={styles.emptyText}>Loading…</Text>
        ) : recentOrders.length === 0 ? (
          <Text style={styles.emptyText}>No orders in this period.</Text>
        ) : (
          recentOrders.map((order) => (
            <Card key={order.id} style={styles.orderCard}>
              <View style={styles.orderRow}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  <StatusBadge status={paymentStatusToBadge(order.status)} size="sm" />
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>${order.totalAmount.toFixed(2)}</Text>
                  {order.status === 'delivered' && (
                    <TouchableOpacity
                      style={styles.refundBtn}
                      onPress={() => setRefundModalOrder(order)}
                      accessibilityRole="button"
                      accessibilityLabel="Process refund"
                    >
                      <Text style={styles.refundBtnText}>Refund</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

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
                {period === p.value && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
  },
  headerTitle: { fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold as any, color: theme.colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  exportBtn: {
    padding: 6, borderRadius: theme.borderRadius.base,
    borderWidth: 1, borderColor: theme.colors.primary,
  },
  periodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: theme.spacing.sm, paddingVertical: 4,
    borderRadius: theme.borderRadius.base, borderWidth: 1, borderColor: theme.colors.primary,
  },
  periodBtnText: { fontSize: theme.fontSizes.sm, color: theme.colors.primary, fontWeight: theme.fontWeights.medium as any },
  content: { padding: theme.spacing.base, gap: theme.spacing.md, paddingBottom: theme.spacing['2xl'] },
  statsRow: { gap: theme.spacing.sm },
  statCard: {
    backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4, padding: theme.spacing.md, minWidth: 120, gap: 4,
    ...theme.shadows.base,
  },
  statValue: { fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold as any, color: theme.colors.text },
  statLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
  refundHistoryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.background, padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.primary + '40',
  },
  refundHistoryText: { flex: 1, fontSize: theme.fontSizes.base, color: theme.colors.primary, fontWeight: theme.fontWeights.medium as any },
  sectionTitle: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  emptyText: { fontSize: theme.fontSizes.base, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.xl },
  orderCard: { marginBottom: 0 },
  orderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  orderInfo: { gap: 4 },
  orderId: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold as any, color: theme.colors.text },
  orderDate: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
  orderRight: { alignItems: 'flex-end', gap: theme.spacing.xs },
  orderAmount: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold as any, color: theme.colors.primary },
  refundBtn: {
    paddingHorizontal: theme.spacing.sm, paddingVertical: 4,
    borderRadius: theme.borderRadius.base, borderWidth: 1, borderColor: theme.colors.error,
  },
  refundBtnText: { fontSize: theme.fontSizes.xs, color: theme.colors.error, fontWeight: theme.fontWeights.medium as any },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl, gap: theme.spacing.md,
  },
  modalTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  modalSub: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary, marginTop: -theme.spacing.sm },
  fieldLabel: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium as any, color: theme.colors.text },
  typeRow: { flexDirection: 'row', gap: theme.spacing.sm },
  typeBtn: {
    flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.base,
    borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center',
  },
  typeBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  typeBtnText: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary, fontWeight: theme.fontWeights.medium as any },
  typeBtnTextActive: { color: theme.colors.background },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md, fontSize: theme.fontSizes.base, color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: theme.spacing.sm },
  modalBtn: { flex: 1 },
  // Period menu
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 110, paddingRight: theme.spacing.base },
  periodMenu: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, ...theme.shadows.md, minWidth: 160, overflow: 'hidden' },
  periodItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
  },
  periodItemActive: { backgroundColor: theme.colors.surface },
  periodItemText: { fontSize: theme.fontSizes.base, color: theme.colors.text },
  periodItemTextActive: { color: theme.colors.primary, fontWeight: theme.fontWeights.semibold as any },
});
