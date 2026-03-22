import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Order } from '../../../types/product';
import { orderService } from '../../../services/OrderService';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';

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

const FilterChip: React.FC<ChipProps> = ({ label, active, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.full,
          borderWidth: 1.5,
          borderColor: colors.border,
          backgroundColor: colors.background,
          ...shadows.sm,
        },
        active && {
          borderColor: colors.primary,
          backgroundColor: colors.primary,
          ...shadows.md,
        }
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[
        {
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.semibold as any,
          color: colors.textSecondary,
        },
        active && { color: colors.background }
      ]}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Stats card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  
  return (
    <View style={[
      {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
        padding: spacing.md,
        gap: 4,
        ...shadows.base,
      },
      { borderLeftColor: color }
    ]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={{
        fontSize: fontSizes.xl,
        fontWeight: fontWeights.bold as any,
        color: colors.text,
      }}>{value}</Text>
      <Text style={{
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
      }}>{label}</Text>
    </View>
  );
};

// ─── Order card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  
  return (
    <Card onPress={onPress} style={{ marginHorizontal: spacing.base, marginVertical: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
            <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.text }} numberOfLines={1}>
              #{order.id.slice(-8).toUpperCase()}
            </Text>
            <StatusBadge
              status={orderStatusToBadge(order.status)}
              label={statusLabel(order.status)}
              size="sm"
            />
          </View>
          <Text style={{ fontSize: fontSizes.base, color: colors.textSecondary, fontWeight: fontWeights.medium as any }} numberOfLines={1}>
            {order.shippingAddress.street}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs }}>
            <Text style={{ fontSize: fontSizes.sm, color: colors.textLight }}>{formatDate(order.createdAt)}</Text>
            <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.primary }}>₦{order.total.toFixed(2)}</Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textLight}
          style={{ marginLeft: spacing.md, flexShrink: 0, opacity: 0.6 }}
        />
      </View>
    </Card>
  );
};

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

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ visible, selected, onSelect, onClose }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 120, paddingRight: spacing.base }} activeOpacity={1} onPress={onClose}>
        <View style={{ backgroundColor: colors.background, borderRadius: borderRadius.lg, ...shadows.lg, minWidth: 180, overflow: 'hidden', elevation: 8 }}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                selected === p.value && { backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => { onSelect(p.value); onClose(); }}
            >
              <Text style={[
                { fontSize: fontSizes.base, color: colors.text, fontWeight: fontWeights.medium as any },
                selected === p.value && { color: colors.primary, fontWeight: fontWeights.bold as any }
              ]}>
                {p.label}
              </Text>
              {selected === p.value && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [periodModalVisible, setPeriodModalVisible] = useState(false);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },

    // List
    listContent: {
      paddingBottom: spacing['2xl'],
    },
    listHeader: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.md,
      backgroundColor: colors.surface,
    },

    // Stats
    statsTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
      paddingHorizontal: spacing.base,
      marginBottom: spacing.sm,
    },
    periodButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.background,
      ...shadows.sm,
    },
    periodButtonText: {
      fontSize: fontSizes.sm,
      color: colors.primary,
      fontWeight: fontWeights.semibold as any,
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    statsCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      padding: spacing.md,
      gap: 4,
      ...shadows.base,
    },
    statsValue: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    statsLabel: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },

    // Search & filters
    searchBar: {
      marginHorizontal: spacing.base,
      marginBottom: spacing.xs,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
      flexWrap: 'wrap',
    },

    // Filter chips
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
      ...shadows.sm,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
      ...shadows.md,
    },
    chipText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold as any,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.background,
    },

    // Order card
    card: {
      marginHorizontal: spacing.base,
      marginVertical: spacing.sm,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.md,
      elevation: 2,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardInfo: {
      flex: 1,
      gap: spacing.sm,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    orderId: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    customerName: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      fontWeight: fontWeights.medium as any,
    },
    cardBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    orderDate: {
      fontSize: fontSizes.sm,
      color: colors.textLight,
    },
    orderTotal: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
    },
    chevron: {
      marginLeft: spacing.md,
      flexShrink: 0,
      opacity: 0.6,
    },

    // Error state
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing['2xl'],
      gap: spacing.lg,
    },
    errorText: {
      fontSize: fontSizes.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    retryButton: {
      paddingHorizontal: spacing['2xl'],
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primary,
      ...shadows.md,
    },
    retryText: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold as any,
      color: colors.background,
    },

    // Period modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 120,
      paddingRight: spacing.base,
    },
    periodMenu: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      ...shadows.lg,
      minWidth: 180,
      overflow: 'hidden',
      elevation: 8,
    },
    periodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    periodItemActive: {
      backgroundColor: colors.primary + '10',
    },
    periodItemText: {
      fontSize: fontSizes.base,
      color: colors.text,
      fontWeight: fontWeights.medium as any,
    },
    periodItemTextActive: {
      color: colors.primary,
      fontWeight: fontWeights.bold as any,
    },
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const response = await orderService.getOrders({
        page: 1,
        limit: 100, // Get all orders for now
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
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
    const ordersArray = Array.isArray(orders) ? orders : [];
    let result = ordersArray;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.shippingAddress.street.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    return result;
  }, [orders, searchQuery, statusFilter]);

  // ── Stats (scoped to time period) ─────────────────────────────────────────

  const stats = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : [];
    const periodOrders = ordersArray.filter((o) => isWithinPeriod(o.createdAt, timePeriod));
    const total = periodOrders.length;
    const pending = periodOrders.filter((o) => o.status === 'pending').length;
    const revenue = periodOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
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
      <View
        style={styles.statsRow}
      >
        <StatsCard
          label="Total Orders"
          value={String(stats.total)}
          icon="receipt-outline"
          color={colors.primary}
        />
        <StatsCard
          label="Pending"
          value={String(stats.pending)}
          icon="time-outline"
          color="#f59e0b"
        />
        <StatsCard
          label="Revenue"
          value={`₦${stats.revenue.toFixed(2)}`}
          icon="cash-outline"
          color="#10b981"
        />
      </View>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by order ID or customer…"
        style={styles.searchBar}
        testID="orders-search"
      />

      {/* Status filter chips */}
      <View
        style={styles.filterRow}
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
      </View>
    </View>
  );

  // ── Error state ────────────────────────────────────────────────────────────

  if (error && !loading && orders.length === 0) {
    return (
      <View style={styles.screen}>
        <Header 
          title="Orders"
          subtitle="Track sales and fulfillment"
          rightAction={
            <TouchableOpacity
              style={styles.periodButton}
              onPress={() => setPeriodModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Select time period"
            >
              <Text style={styles.periodButtonText}>{periodLabel}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
          }
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchOrders()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <Header 
        title="Orders"
        subtitle="Track sales and fulfillment"
        rightAction={
          <TouchableOpacity
            style={styles.periodButton}
            onPress={() => setPeriodModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Select time period"
          >
            <Text style={styles.periodButtonText}>{periodLabel}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        }
      />

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
    </View>
  );
}
