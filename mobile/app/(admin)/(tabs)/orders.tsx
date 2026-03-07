import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Order } from '../../../../shared/src/types/entities';
import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { STORAGE_KEYS } from '../../../../shared/src/services/storage';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { theme } from '../../../theme';

// ─── Storage ──────────────────────────────────────────────────────────────────

const storage = new AsyncStorageAdapter();

// ─── Helpers ──────────────────────────────────────────────────────────────────

type OrderStatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type TimePeriod = 'today' | 'week' | 'month' | 'all';

/** Map Order.status → StatusBadge StatusType */
function orderStatusToBadge(status: Order['status']): StatusType {
  switch (status) {
    case 'pending':     return 'pending';
    case 'processing':  return 'accepted';
    case 'shipped':     return 'shipped';
    case 'delivered':   return 'delivered';
    case 'cancelled':   return 'failed';
    default:            return 'pending';
  }
}

/** Human-readable label for each status */
function statusLabel(status: Order['status']): string {
  switch (status) {
    case 'pending':     return 'Pending';
    case 'processing':  return 'Accepted';
    case 'shipped':     return 'Shipped';
    case 'delivered':   return 'Delivered';
    case 'cancelled':   return 'Cancelled';
    default:            return status;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isWithinPeriod(iso: string, period: TimePeriod): boolean {
  if (period === 'all') return true;
  const now = new Date();
  const date = new Date(iso);
  if (period === 'today') {
    return date.toDateString() === now.toDateString();
  }
  const msAgo = now.getTime() - date.getTime();
  if (period === 'week')  return msAgo <= 7  * 24 * 60 * 60 * 1000;
  if (period === 'month') return msAgo <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<ChipProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Stats card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => (
  <View style={[styles.statsCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={22} color={color} style={styles.statsIcon} />
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{label}</Text>
  </View>
);

// ─── Order card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => (
  <Card onPress={onPress} style={styles.card}>
    <View style={styles.cardRow}>
      <View style={styles.cardInfo}>
        <View style={styles.cardTopRow}>
          <Text style={styles.orderId} numberOfLines={1}>
            #{order.id.slice(-8).toUpperCase()}
          </Text>
          <StatusBadge
            status={orderStatusToBadge(order.status)}
            label={statusLabel(order.status)}
            size="sm"
          />
        </View>
        <Text style={styles.customerName} numberOfLines={1}>
          {order.deliveryAddress.fullName}
        </Text>
        <View style={styles.cardBottomRow}>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.orderTotal}>${order.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.textLight}
        style={styles.chevron}
      />
    </View>
  </Card>
);

// ─── Period selector modal ────────────────────────────────────────────────────

interface PeriodSelectorProps {
  visible: boolean;
  selected: TimePeriod;
  onSelect: (p: TimePeriod) => void;
  onClose: () => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week',  label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all',   label: 'All Time' },
];

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ visible, selected, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.periodMenu}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodItem, selected === p.value && styles.periodItemActive]}
            onPress={() => { onSelect(p.value); onClose(); }}
          >
            <Text style={[styles.periodItemText, selected === p.value && styles.periodItemTextActive]}>
              {p.label}
            </Text>
            {selected === p.value && (
              <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [periodModalVisible, setPeriodModalVisible] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = (await storage.get<Order[]>(STORAGE_KEYS.ORDERS)) ?? [];
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(data);
    } catch {
      setError('Failed to load orders. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleRefresh = useCallback(() => fetchOrders(true), [fetchOrders]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.deliveryAddress.fullName.toLowerCase().includes(q) ||
          o.userId.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    return result;
  }, [orders, searchQuery, statusFilter]);

  // ── Stats (scoped to time period) ─────────────────────────────────────────

  const stats = useMemo(() => {
    const periodOrders = orders.filter((o) => isWithinPeriod(o.createdAt, timePeriod));
    const total = periodOrders.length;
    const pending = periodOrders.filter((o) => o.status === 'pending').length;
    const revenue = periodOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { total, pending, revenue };
  }, [orders, timePeriod]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleOrderPress = useCallback(
    (order: Order) => {
      router.push({ pathname: '/(admin)/order/[id]', params: { id: order.id } });
    },
    [router],
  );

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard order={item} onPress={() => handleOrderPress(item)} />
    ),
    [handleOrderPress],
  );

  const keyExtractor = useCallback((item: Order) => item.id, []);

  const periodLabel = PERIODS.find((p) => p.value === timePeriod)?.label ?? 'All Time';

  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Stats section */}
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Overview</Text>
        <TouchableOpacity
          style={styles.periodButton}
          onPress={() => setPeriodModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Select time period"
        >
          <Text style={styles.periodButtonText}>{periodLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}
      >
        <StatsCard
          label="Total Orders"
          value={String(stats.total)}
          icon="receipt-outline"
          color={theme.colors.primary}
        />
        <StatsCard
          label="Pending"
          value={String(stats.pending)}
          icon="time-outline"
          color="#f59e0b"
        />
        <StatsCard
          label="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon="cash-outline"
          color="#10b981"
        />
      </ScrollView>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by order ID or customer…"
        style={styles.searchBar}
        testID="orders-search"
      />

      {/* Status filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(
          [
            { value: 'all',        label: 'All' },
            { value: 'pending',    label: 'Pending' },
            { value: 'processing', label: 'Accepted' },
            { value: 'shipped',    label: 'Shipped' },
            { value: 'delivered',  label: 'Delivered' },
            { value: 'cancelled',  label: 'Cancelled' },
          ] as { value: OrderStatusFilter; label: string }[]
        ).map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={statusFilter === f.value}
            onPress={() => setStatusFilter(f.value)}
          />
        ))}
      </ScrollView>
    </View>
  );

  // ── Error state ────────────────────────────────────────────────────────────

  if (error && !loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchOrders()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <DataList<Order>
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={keyExtractor}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyMessage={
          searchQuery || statusFilter !== 'all'
            ? 'No orders match your filters.'
            : 'No orders yet.'
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        skeletonCount={6}
      />

      <PeriodSelector
        visible={periodModalVisible}
        selected={timePeriod}
        onSelect={setTimePeriod}
        onClose={() => setPeriodModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text,
  },

  // List
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  listHeader: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },

  // Stats
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.xs,
  },
  statsTitle: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.text,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.medium as any,
  },
  statsRow: {
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  statsCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    padding: theme.spacing.md,
    minWidth: 110,
    ...theme.shadows.base,
  },
  statsIcon: {
    marginBottom: theme.spacing.xs,
  },
  statsValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text,
  },
  statsLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Search & filters
  searchBar: {
    marginHorizontal: theme.spacing.base,
  },
  filterRow: {
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
  },

  // Filter chips
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium as any,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.background,
  },

  // Order card
  card: {
    marginHorizontal: theme.spacing.base,
    marginVertical: theme.spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.bold as any,
    color: theme.colors.text,
  },
  customerName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textLight,
  },
  orderTotal: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.primary,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
    flexShrink: 0,
  },

  // Error state
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  retryText: {
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold as any,
    color: theme.colors.background,
  },

  // Period modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingRight: theme.spacing.base,
  },
  periodMenu: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
    minWidth: 160,
    overflow: 'hidden',
  },
  periodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  periodItemActive: {
    backgroundColor: theme.colors.surface,
  },
  periodItemText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
  },
  periodItemTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.semibold as any,
  },
});
