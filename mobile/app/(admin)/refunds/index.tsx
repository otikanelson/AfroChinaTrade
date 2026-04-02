import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Animated,
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

  // ── Drag-to-dismiss for details sheet ─────────────────────────────────────
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  // Animate in when modal opens
  useEffect(() => {
    if (detailsModalVisible) {
      sheetTranslateY.setValue(700);
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    }
  }, [detailsModalVisible]);

  const closeDetailsSheet = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    Animated.timing(sheetTranslateY, {
      toValue: 700,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      sheetTranslateY.setValue(0);
      isClosing.current = false;
      setDetailsModalVisible(false);
    });
  };

  const handleSheetScrollEnd = (e: any) => {
    // If user scrolled up past the top (negative offset = overscroll down on iOS,
    // or we detect a downward drag via contentOffset.y < -40)
    if (e.nativeEvent.contentOffset.y < -40) {
      closeDetailsSheet();
    }
  };

  const renderRefund = ({ item }: { item: Refund }) => {
    const statusColor = STATUS_COLORS[item.status] ?? '#999';
    const orderId = typeof item.orderId === 'object' ? item.orderId.orderId : String(item.orderId).slice(-8).toUpperCase();
    return (
      <TouchableOpacity
        style={{
          marginHorizontal: spacing.base,
          marginVertical: spacing.xs,
          backgroundColor: colors.background,
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}
        activeOpacity={0.85}
        onPress={() => handleViewDetails(item)}
      >
        {/* Colored top strip */}
        <View style={{ height: 4, backgroundColor: statusColor }} />

        <View style={{ padding: spacing.md }}>
          {/* Top row: order id + amount */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 2 }}>Order</Text>
              <Text style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: colors.text }}>
                #{orderId}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold as any, color: statusColor }}>
                ₦{item.amount.toFixed(0)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <View style={{ backgroundColor: statusColor + '20', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: fontWeights.semibold as any, color: statusColor, textTransform: 'capitalize' }}>
                    {item.status}
                  </Text>
                </View>
                <View style={{ backgroundColor: item.type === 'full' ? '#fee2e2' : '#fef3c7', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: colors.text, textTransform: 'capitalize' }}>{item.type}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reason */}
          <Text style={{ fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.sm }} numberOfLines={2}>
            {item.reason}
          </Text>

          {/* Footer: date + action */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: fontSizes.xs, color: colors.textLight }}>{formatDate(item.createdAt)}</Text>
            {(item.status === 'pending' || item.status === 'approved') && (
              <TouchableOpacity
                style={{ backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}
                onPress={(e) => { e.stopPropagation(); handleStatusUpdate(item); }}
              >
                <Text style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.semibold as any, color: colors.textInverse }}>
                  Update Status
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

      {/* Details Modal — bottom sheet */}
      <Modal visible={detailsModalVisible} transparent animationType="none" onRequestClose={closeDetailsSheet}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Backdrop — tap to close */}
          <TouchableOpacity
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' }}
            activeOpacity={1}
            onPress={closeDetailsSheet}
          />
          <Animated.View style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: '85%',
            overflow: 'hidden',
            transform: [{ translateY: sheetTranslateY }],
          }}>
            {selectedRefund && (
              <>
                {/* Drag handle — visual only, drag via ScrollView overscroll */}
                <View style={{ paddingTop: spacing.md, paddingBottom: spacing.sm, alignItems: 'center' }}>
                  <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
                </View>

                {/* Colored status header */}
                <View style={{
                  backgroundColor: STATUS_COLORS[selectedRefund.status] ?? colors.textSecondary,
                  paddingHorizontal: spacing.lg,
                  paddingBottom: spacing.xl,
                  paddingTop: spacing.sm,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>Refund Request</Text>
                      <Text style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.bold as any, color: '#fff' }}>
                        ₦{selectedRefund.amount.toFixed(2)}
                      </Text>
                      <Text style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                        Order #{typeof selectedRefund.orderId === 'object' ? selectedRefund.orderId.orderId : String(selectedRefund.orderId).slice(-8).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: borderRadius.full,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                    }}>
                      <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.bold as any, color: '#fff', textTransform: 'capitalize' }}>
                        {selectedRefund.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Content */}
                <ScrollView style={{ paddingHorizontal: spacing.lg }} showsVerticalScrollIndicator={false}
                  bounces={true}
                  onScrollEndDrag={handleSheetScrollEnd}
                >
                  {/* Type + Date row */}
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.base }}>
                    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center' }}>
                      <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 }}>Type</Text>
                      <View style={{ backgroundColor: selectedRefund.type === 'full' ? '#fee2e2' : '#fef3c7', borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
                        <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text, textTransform: 'capitalize' }}>
                          {selectedRefund.type}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 2, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md }}>
                      <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 }}>Requested</Text>
                      <Text style={{ fontSize: fontSizes.sm, color: colors.text, fontWeight: fontWeights.medium as any }}>
                        {formatDate(selectedRefund.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Reason */}
                  <View style={{ backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm }}>
                    <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 }}>Reason</Text>
                    <Text style={{ fontSize: fontSizes.base, color: colors.text, lineHeight: 22 }}>{selectedRefund.reason}</Text>
                  </View>

                  {/* Processed info */}
                  {(selectedRefund.processedBy || selectedRefund.processedAt || selectedRefund.adminNotes) && (
                    <View style={{ backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: STATUS_COLORS[selectedRefund.status] ?? colors.primary }}>
                      {selectedRefund.processedBy && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                          <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Processed by</Text>
                          <Text style={{ fontSize: fontSizes.sm, color: colors.text, fontWeight: fontWeights.medium as any }}>{selectedRefund.processedBy.name}</Text>
                        </View>
                      )}
                      {selectedRefund.processedAt && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                          <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Processed at</Text>
                          <Text style={{ fontSize: fontSizes.sm, color: colors.text }}>{formatDate(selectedRefund.processedAt)}</Text>
                        </View>
                      )}
                      {selectedRefund.adminNotes && (
                        <>
                          <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 }}>Admin notes</Text>
                          <Text style={{ fontSize: fontSizes.sm, color: colors.text, fontStyle: 'italic' }}>{selectedRefund.adminNotes}</Text>
                        </>
                      )}
                    </View>
                  )}

                  <View style={{ height: spacing.xl }} />
                </ScrollView>

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
                  <Button label="Close" variant="secondary" onPress={closeDetailsSheet} style={{ flex: 1 }} />
                  {(selectedRefund.status === 'pending' || selectedRefund.status === 'approved') && (
                    <Button
                      label="Update Status"
                      onPress={() => { closeDetailsSheet(); setTimeout(() => handleStatusUpdate(selectedRefund!), 250); }}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
