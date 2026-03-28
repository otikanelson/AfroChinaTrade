import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Order } from '../../../types/product';
import { orderService } from '../../../services/OrderService';
import { SearchBar } from '../../../components/admin/SearchBar';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type OrderStatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type TimePeriod = 'today' | 'week' | 'month' | 'all';

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



// ─── Compact Order Item ──────────────────────────────────────────────────────

interface CompactOrderItemProps {
  order: Order;
  onPress: () => void;
}

const CompactOrderItem: React.FC<CompactOrderItemProps> = ({ order, onPress }) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginHorizontal: spacing.base,
        marginVertical: spacing.xs,
        borderLeftWidth: 3,
        borderLeftColor: getStatusColor(order.status),
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.bold,
            color: colors.text,
            marginBottom: 2,
          }}>
            #{order.orderId.slice(-8).toUpperCase()}
          </Text>
          {typeof order.userId === 'object' && order.userId.name && (
            <Text style={{
              fontSize: fontSizes.xs,
              color: colors.text,
              marginBottom: 2,
            }}>
              {order.userId.name}
            </Text>
          )}
          <Text style={{
            fontSize: fontSizes.xs,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
          }}>
            {formatDate(order.createdAt)} • {order.items?.length || 0} items
          </Text>
          <View style={{
            backgroundColor: getStatusColor(order.status) + '20',
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            borderRadius: borderRadius.sm,
            alignSelf: 'flex-start',
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
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: fontSizes.base,
            fontWeight: fontWeights.bold,
            color: colors.primary,
            marginBottom: spacing.xs,
          }}>
            ₦{order.totalAmount.toLocaleString()}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </View>
      </View>
    </TouchableOpacity>
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
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

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
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      gap: spacing.xs,
    },
    statCard: {
      flex: 1,
      borderLeftWidth: 1.5,
      borderRadius: 5,
      padding: spacing.xs,
      alignItems: 'center',
      minWidth: 80,
    },
    statValue: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    statLabel: {
      fontSize: 8,
      fontWeight: fontWeights.semibold,
      color: colors.textLight,
      textAlign: 'center',
      lineHeight: 12,
    },
    filtersContainer: {
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      flexWrap: 'wrap',
    },
    filterChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    filterChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    filterChipText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      fontWeight: fontWeights.medium,
    },
    filterChipTextActive: {
      color: colors.background,
    },
    periodButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    periodButtonText: {
      fontSize: fontSizes.sm,
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
      minWidth: 160,
      overflow: 'hidden',
    },
    periodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    periodItemActive: {
      backgroundColor: colors.surface,
    },
    periodItemText: {
      fontSize: fontSizes.sm,
      color: colors.text,
    },
    periodItemTextActive: {
      color: colors.primary,
      fontWeight: fontWeights.semibold,
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
          o.orderId.toLowerCase().includes(q) ||
          (o.deliveryAddress?.street || '').toLowerCase().includes(q) ||
          (o.deliveryAddress?.city || '').toLowerCase().includes(q),
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
    
    // Pending revenue: orders that are pending, processing, or shipped (not yet delivered)
    const pendingRevenue = periodOrders
      .filter((o) => ['pending', 'processing', 'shipped'].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Net revenue: only delivered orders
    const netRevenue = periodOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    return { total, pending, pendingRevenue, netRevenue };
  }, [orders, timePeriod]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleOrderPress = useCallback(
    (order: Order) => {
      router.push({ pathname: '/(admin)/order/[id]', params: { id: order._id } });
    },
    [router],
  );

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => (
      <CompactOrderItem order={item} onPress={() => handleOrderPress(item)} />
    ),
    [handleOrderPress],
  );

  const keyExtractor = useCallback((item: Order) => item._id, []);

  const periodLabel = PERIODS.find((p) => p.value === timePeriod)?.label ?? 'All Time';

  // ── Error state ────────────────────────────────────────────────────────────

  if (error && !loading && orders.length === 0) {
    return (
      <View style={styles.screen}>
        <Header 
          title="Orders"
          subtitle="Track customer orders"
          rightAction={
            <TouchableOpacity
              style={styles.periodButton}
              onPress={() => setPeriodModalVisible(true)}
            >
              <Text style={styles.periodButtonText}>{periodLabel}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
          }
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <Header 
        title="Orders"
        subtitle="Track customer orders"
        rightAction={
          <TouchableOpacity
            style={styles.periodButton}
            onPress={() => setPeriodModalVisible(true)}
          >
            <Text style={styles.periodButtonText}>{periodLabel}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Professional Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>{stats.pending}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
          <Text style={styles.statLabel}>Pending Revenue</Text>
          <Text style={styles.statValue}>₦{stats.pendingRevenue.toLocaleString()}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statLabel}>Net Revenue</Text>
          <Text style={styles.statValue}>₦{stats.netRevenue.toLocaleString()}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search orders..."
        />
        
        <View style={styles.filterRow}>
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                statusFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(filter.value as OrderStatusFilter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
              <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter !== 'all'
                  ? 'No orders match your filters.'
                  : 'No orders yet.'}
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
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
