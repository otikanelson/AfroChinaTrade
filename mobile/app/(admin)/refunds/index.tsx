import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { refundService } from '../../../services/RefundService';
import { Refund } from '../../../types/product';
import { Card } from '../../../components/admin/Card';
import { SearchBar } from '../../../components/admin/SearchBar';
import { Button } from '../../../components/admin/Button';
import { Header } from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { mobileToastManager } from '../../../utils/toast';
import { useManageRefundBadge } from '../../../hooks/useRefundBadge';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  processed: '#10b981',
  rejected: '#ef4444',
};

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'processed'];

export default function RefundsManagementScreen() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { markManageSeen } = useManageRefundBadge();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<Refund['status']>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    // Stats
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
      gap: spacing.xs,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderLeftWidth: 3,
    },
    statValue: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.text },
    statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
    // Filters
    filtersRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 12, color: colors.textSecondary, textTransform: 'capitalize', lineHeight: 14 },
    chipTextActive: { color: colors.background },
    // Search
    searchWrap: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs },
    // List
    listContent: { paddingBottom: spacing['2xl'] },
    emptyWrap: { paddingTop: spacing.xl, alignItems: 'center' },
    emptyText: { fontSize: fontSizes.base, color: colors.textSecondary },
    // Card
    card: { marginHorizontal: spacing.base, marginVertical: spacing.xs },
    cardContent: { padding: spacing.base },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
    cardInfo: { flex: 1, gap: 4, marginRight: spacing.md },
    orderId: { fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: colors.text },
    reason: { fontSize: fontSizes.sm, color: colors.textSecondary },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    date: { fontSize: fontSizes.xs, color: colors.textLight },
    typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    typeBadgeText: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold as any, color: colors.text },
    processedBy: { fontSize: fontSizes.xs, color: colors.textLight, fontStyle: 'italic' },
    cardRight: { alignItems: 'flex-end', gap: spacing.xs },
    amount: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.error },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.base },
    statusText: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold as any, color: 'white', textTransform: 'capitalize' },
    actionButtons: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
    actionBtn: { flex: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.base, borderWidth: 1, alignItems: 'center' },
    actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
    actionBtnSecondary: { backgroundColor: 'transparent', borderColor: colors.border },
    actionBtnText: { fontSize: fontSizes.xs, fontWeight: fontWeights.medium as any },
    actionBtnTextPrimary: { color: colors.background },
    actionBtnTextSecondary: { color: colors.textSecondary },
    // Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.base },
    modalBox: { backgroundColor: colors.background, borderRadius: borderRadius.lg, padding: spacing.lg, width: '100%', maxWidth: 400, maxHeight: '80%' },
    modalTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.text, marginBottom: spacing.base },
    modalSection: { marginBottom: spacing.base },
    modalLabel: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.text, marginBottom: spacing.xs },
    modalValue: { fontSize: fontSizes.base, color: colors.textSecondary, marginBottom: spacing.xs },
    statusBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    statusBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.base, borderWidth: 1, borderColor: colors.border },
    statusBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    statusBtnText: { fontSize: fontSizes.xs, color: colors.textSecondary, textTransform: 'capitalize' },
    statusBtnTextActive: { color: colors.background },
    textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.base, padding: spacing.sm, fontSize: fontSizes.sm, color: colors.text, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.base },
    modalBtn: { flex: 1 },
  });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await refundService.getRefunds({
        page: 1, limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setRefunds(response.success && response.data ? response.data : []);
    } catch {
      setRefunds([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Mark all pending refunds as seen at manage level — clears both badges
  useEffect(() => { markManageSeen(); }, [markManageSeen]);

  const filtered = useMemo(() => {
    const arr = Array.isArray(refunds) ? refunds : [];
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter(r => {
      const orderRef = typeof r.orderId === 'object' ? r.orderId.orderId : r.orderId;
      return (orderRef || '').toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
    });
  }, [refunds, search]);

  const stats = useMemo(() => {
    const arr = Array.isArray(refunds) ? refunds : [];
    return {
      pending: arr.filter(r => r.status === 'pending').length,
      approved: arr.filter(r => r.status === 'approved').length,
      processed: arr.filter(r => r.status === 'processed').length,
      rejected: arr.filter(r => r.status === 'rejected').length,
    };
  }, [refunds]);

  const handleStatusUpdate = (refund: Refund) => {
    setSelectedRefund(refund);
    setNewStatus(refund.status);
    setAdminNotes('');
    setStatusModalVisible(true);
  };

  const handleViewDetails = (refund: Refund) => {
    setSelectedRefund(refund);
    setDetailsModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRefund) return;
    try {
      setUpdating(true);
      const response = await refundService.updateRefundStatus(selectedRefund.id, newStatus, adminNotes.trim() || undefined);
      if (response.success) {
        mobileToastManager.success('Refund status updated successfully');
        setStatusModalVisible(false);
        setSelectedRefund(null);
        load();
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to update refund status');
      }
    } catch {
      Alert.alert('Error', 'Failed to update refund status');
    } finally {
      setUpdating(false);
    }
  };

  const renderRefund = ({ item }: { item: Refund }) => (
    <Card style={s.card}>
      <View style={s.cardContent}>
        <View style={s.cardHeader}>
          <View style={s.cardInfo}>
            <Text style={s.orderId}>Order #{typeof item.orderId === 'object' ? item.orderId.orderId : String(item.orderId).slice(-8).toUpperCase()}</Text>
            <Text style={s.reason} numberOfLines={2}>{item.reason}</Text>
            <View style={s.metaRow}>
              <Text style={s.date}>{formatDate(item.createdAt)}</Text>
              <View style={[s.typeBadge, { backgroundColor: item.type === 'full' ? '#fee2e2' : '#fef3c7' }]}>
                <Text style={s.typeBadgeText}>{item.type === 'full' ? 'Full' : 'Partial'}</Text>
              </View>
            </View>
            {item.processedBy && <Text style={s.processedBy}>Processed by: {item.processedBy.name}</Text>}
          </View>
          <View style={s.cardRight}>
            <Text style={s.amount}>₦{item.amount.toFixed(2)}</Text>
            <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[item.status] ?? '#999' }]}>
              <Text style={s.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
        <View style={s.actionButtons}>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnSecondary]} onPress={() => handleViewDetails(item)}>
            <Text style={[s.actionBtnText, s.actionBtnTextSecondary]}>View Details</Text>
          </TouchableOpacity>
          {(item.status === 'pending' || item.status === 'approved') && (
            <TouchableOpacity style={[s.actionBtn, s.actionBtnPrimary]} onPress={() => handleStatusUpdate(item)}>
              <Text style={[s.actionBtnText, s.actionBtnTextPrimary]}>Update Status</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={s.screen}>
      <Header title="Refund Management" subtitle="Manage refund requests" showBack />

      <View style={s.statsRow}>
        {[
          { label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { label: 'Approved', value: stats.approved, color: '#3b82f6' },
          { label: 'Processed', value: stats.processed, color: '#10b981' },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <View key={label} style={[s.statCard, { borderLeftColor: color }]}>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={s.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, statusFilter === f && s.chipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[s.chipText, statusFilter === f && s.chipTextActive]}>
              {f === 'all' ? 'All' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by order ID or reason..." />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderRefund}
          keyExtractor={item => item.id}
          contentContainerStyle={[s.listContent, filtered.length === 0 && s.emptyWrap]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} colors={[colors.primary]} />}
          ListEmptyComponent={<Text style={s.emptyText}>{search ? 'No refunds match your search.' : 'No refunds yet.'}</Text>}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={statusModalVisible} transparent animationType="fade" onRequestClose={() => setStatusModalVisible(false)}>
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Update Refund Status</Text>
            {selectedRefund && (
              <View style={s.modalSection}>
                <Text style={s.modalLabel}>Order #{typeof selectedRefund.orderId === 'object' ? selectedRefund.orderId.orderId : String(selectedRefund.orderId).slice(-8).toUpperCase()}</Text>
                <Text style={s.modalValue}>Amount: ₦{selectedRefund.amount.toFixed(2)} ({selectedRefund.type})</Text>
              </View>
            )}
            <View style={s.modalSection}>
              <Text style={s.modalLabel}>Status</Text>
              <View style={s.statusBtns}>
                {(['pending', 'approved', 'rejected', 'processed'] as const).map(status => (
                  <TouchableOpacity key={status} style={[s.statusBtn, newStatus === status && s.statusBtnActive]} onPress={() => setNewStatus(status)}>
                    <Text style={[s.statusBtnText, newStatus === status && s.statusBtnTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={s.modalSection}>
              <Text style={s.modalLabel}>Admin Notes (Optional)</Text>
              <TextInput style={s.textInput} value={adminNotes} onChangeText={setAdminNotes} placeholder="Add notes about this status update..." placeholderTextColor={colors.textLight} multiline />
            </View>
            <View style={s.modalActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setStatusModalVisible(false)} style={s.modalBtn} />
              <Button label={updating ? 'Updating...' : 'Update'} onPress={handleUpdateStatus} disabled={updating} style={s.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal visible={detailsModalVisible} transparent animationType="fade" onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={s.overlay}>
          <ScrollView style={s.modalBox} showsVerticalScrollIndicator={false}>
            <Text style={s.modalTitle}>Refund Details</Text>
            {selectedRefund && (
              <>
                {[
                  { label: 'Order ID', value: `#${typeof selectedRefund.orderId === 'object' ? selectedRefund.orderId.orderId : selectedRefund.orderId}` },
                  { label: 'Refund Type', value: selectedRefund.type.charAt(0).toUpperCase() + selectedRefund.type.slice(1) },
                  { label: 'Amount', value: `₦${selectedRefund.amount.toFixed(2)}` },
                  { label: 'Status', value: selectedRefund.status },
                  { label: 'Reason', value: selectedRefund.reason },
                  { label: 'Created At', value: formatDate(selectedRefund.createdAt) },
                  ...(selectedRefund.processedBy ? [{ label: 'Processed By', value: selectedRefund.processedBy.name }] : []),
                  ...(selectedRefund.processedAt ? [{ label: 'Processed At', value: formatDate(selectedRefund.processedAt) }] : []),
                  ...(selectedRefund.adminNotes ? [{ label: 'Admin Notes', value: selectedRefund.adminNotes }] : []),
                ].map(({ label, value }) => (
                  <View key={label} style={s.modalSection}>
                    <Text style={s.modalLabel}>{label}</Text>
                    <Text style={s.modalValue}>{value}</Text>
                  </View>
                ))}
              </>
            )}
            <View style={s.modalActions}>
              <Button label="Close" variant="secondary" onPress={() => setDetailsModalVisible(false)} style={s.modalBtn} />
              {(selectedRefund?.status === 'pending' || selectedRefund?.status === 'approved') && (
                <Button label="Update Status" onPress={() => { setDetailsModalVisible(false); handleStatusUpdate(selectedRefund!); }} style={s.modalBtn} />
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
