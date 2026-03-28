import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { refundService } from '../../../services/RefundService';
import { Refund } from '../../../types/product';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { Button } from '../../../components/admin/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { mobileToastManager } from '../../../utils/toast';



function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const StatusBadge: React.FC<{ status: Refund['status']; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const { colors, spacing, borderRadius, fontSizes, fontWeights } = useTheme();
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#f59e0b', bg: '#fef3c7', text: 'Pending' };
      case 'approved':
        return { color: '#3b82f6', bg: '#dbeafe', text: 'Approved' };
      case 'processed':
        return { color: colors.success, bg: '#d1fae5', text: 'Processed' };
      case 'rejected':
        return { color: colors.error, bg: '#fee2e2', text: 'Rejected' };
      default:
        return { color: colors.textSecondary, bg: colors.borderLight, text: status };
    }
  };

  const config = getStatusConfig(status);
  const isSmall = size === 'sm';

  return (
    <View style={{
      backgroundColor: config.bg,
      paddingHorizontal: isSmall ? spacing.xs : spacing.sm,
      paddingVertical: isSmall ? 2 : 4,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: config.color + '40',
    }}>
      <Text style={{
        color: config.color,
        fontSize: isSmall ? fontSizes.xs : fontSizes.sm,
        fontWeight: fontWeights.semibold as any,
        textTransform: 'capitalize',
      }}>
        {config.text}
      </Text>
    </View>
  );
};

const RefundCard: React.FC<{ refund: Refund; onStatusUpdate: (refund: Refund) => void; onViewDetails: (refund: Refund) => void }> = ({ 
  refund, 
  onStatusUpdate, 
  onViewDetails 
}) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  const styles = StyleSheet.create({
    card: { 
      marginHorizontal: spacing.base, 
      marginVertical: spacing.xs,
    },
    cardContent: {
      padding: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    headerLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    orderId: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
      marginBottom: 2,
    },
    customerInfo: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    amount: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    typeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    typeText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium as any,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    reasonSection: {
      marginBottom: spacing.sm,
    },
    reasonLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold as any,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    reasonText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    footerLeft: {
      flex: 1,
    },
    dateText: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      marginBottom: 2,
    },
    processedInfo: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    actionButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
    },
    primaryAction: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondaryAction: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    actionText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium as any,
    },
    primaryActionText: {
      color: colors.textInverse,
    },
    secondaryActionText: {
      color: colors.textSecondary,
    },
  });

  const canUpdate = refund.status === 'pending' || refund.status === 'approved';

  return (
    <Card style={styles.card} contentStyle={styles.cardContent}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>#{refund.orderId.slice(-8).toUpperCase()}</Text>
          <Text style={styles.customerInfo}>Customer ID: {refund.orderId.slice(0, 8)}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.amount}>{formatCurrency(refund.amount)}</Text>
          <View style={styles.typeIndicator}>
            <Ionicons 
              name={refund.type === 'full' ? 'refresh-circle' : 'refresh-circle-outline'} 
              size={14} 
              color={refund.type === 'full' ? colors.error : colors.warning} 
            />
            <Text style={styles.typeText}>{refund.type === 'full' ? 'Full Refund' : 'Partial Refund'}</Text>
          </View>
          <StatusBadge status={refund.status} />
        </View>
      </View>

      <View style={styles.reasonSection}>
        <Text style={styles.reasonLabel}>Reason</Text>
        <Text style={styles.reasonText} numberOfLines={2}>{refund.reason}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.dateText}>Requested: {formatDate(refund.createdAt)}</Text>
          {refund.processedAt && (
            <Text style={styles.processedInfo}>
              Processed: {formatDate(refund.processedAt)}
              {refund.processedBy && ` by ${refund.processedBy.name}`}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => onViewDetails(refund)}
          >
            <Text style={[styles.actionText, styles.secondaryActionText]}>Details</Text>
          </TouchableOpacity>
          {canUpdate && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => onStatusUpdate(refund)}
            >
              <Text style={[styles.actionText, styles.primaryActionText]}>Update</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
};

export default function RefundsScreen() {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<Refund['status']>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    headerContainer: {
      backgroundColor: colors.background,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    backButton: {
      marginRight: spacing.md,
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
      flex: 1,
    },
    header: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.base,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    filterScrollView: {
      flexGrow: 0,
    },
    filterButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      fontWeight: fontWeights.medium as any,
    },
    filterButtonTextActive: {
      color: colors.textInverse,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    statsItem: {
      alignItems: 'center',
      flex: 1,
    },
    statsValue: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    statsLabel: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
    listContent: { paddingBottom: spacing['2xl'] },
    // Modal styles
    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.base,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    modalTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold as any,
      color: colors.text,
    },
    closeButton: {
      padding: spacing.xs,
    },
    modalSection: {
      marginBottom: spacing.lg,
    },
    modalLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold as any,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    modalValue: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    statusButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statusButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    statusButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusButtonText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textTransform: 'capitalize',
      fontWeight: fontWeights.medium as any,
    },
    statusButtonTextActive: {
      color: colors.textInverse,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.surface,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    modalButton: {
      flex: 1,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    detailLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      fontWeight: fontWeights.medium as any,
    },
    detailValue: {
      fontSize: fontSizes.sm,
      color: colors.text,
      fontWeight: fontWeights.medium as any,
      textAlign: 'right',
      flex: 1,
      marginLeft: spacing.md,
    },
  });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await refundService.getRefunds({
        page: 1,
        limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      if (response.success && response.data) {
        setRefunds(response.data);
      } else {
        setRefunds([]);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setRefunds([]);
    } finally {
      setLoading(false); 
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const refundsArray = Array.isArray(refunds) ? refunds : [];
    if (!search.trim()) return refundsArray;
    const q = search.toLowerCase();
    return refundsArray.filter((r) => 
      r.orderId.toLowerCase().includes(q) || 
      r.reason.toLowerCase().includes(q) ||
      (r.processedBy?.name.toLowerCase().includes(q))
    );
  }, [refunds, search]);

  const stats = useMemo(() => {
    const refundsArray = Array.isArray(refunds) ? refunds : [];
    return {
      total: refundsArray.length,
      pending: refundsArray.filter(r => r.status === 'pending').length,
      processed: refundsArray.filter(r => r.status === 'processed').length,
      totalAmount: refundsArray.reduce((sum, r) => sum + r.amount, 0),
    };
  }, [refunds]);

  const handleStatusUpdate = (refund: Refund) => {
    setSelectedRefund(refund);
    setNewStatus(refund.status);
    setAdminNotes(refund.adminNotes || '');
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
      const response = await refundService.updateRefundStatus(
        selectedRefund.id,
        newStatus,
        adminNotes.trim() || undefined
      );

      if (response.success) {
        mobileToastManager.success('Refund status updated successfully');
        setStatusModalVisible(false);
        setSelectedRefund(null);
        load(); // Refresh the list
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to update refund status');
      }
    } catch (error) {
      console.error('Error updating refund status:', error);
      Alert.alert('Error', 'Failed to update refund status');
    } finally {
      setUpdating(false);
    }
  };

  const FilterButton: React.FC<{ status: string; label: string; count?: number }> = ({ status, label, count }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        statusFilter === status && styles.filterButtonActive,
      ]}
      onPress={() => setStatusFilter(status)}
    >
      <Text
        style={[
          styles.filterButtonText,
          statusFilter === status && styles.filterButtonTextActive,
        ]}
      >
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const DetailsModal = () => (
    <Modal
      visible={detailsModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Refund Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {selectedRefund && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID</Text>
                <Text style={styles.detailValue}>#{selectedRefund.orderId.slice(-8).toUpperCase()}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>{formatCurrency(selectedRefund.amount)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{selectedRefund.type === 'full' ? 'Full Refund' : 'Partial Refund'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <StatusBadge status={selectedRefund.status} size="sm" />
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Requested</Text>
                <Text style={styles.detailValue}>{formatDate(selectedRefund.createdAt)}</Text>
              </View>
              
              {selectedRefund.processedAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Processed</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedRefund.processedAt)}</Text>
                </View>
              )}
              
              {selectedRefund.processedBy && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Processed By</Text>
                  <Text style={styles.detailValue}>{selectedRefund.processedBy.name}</Text>
                </View>
              )}
              
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Reason</Text>
                <Text style={styles.modalValue}>{selectedRefund.reason}</Text>
              </View>
              
              {selectedRefund.adminNotes && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Admin Notes</Text>
                  <Text style={styles.modalValue}>{selectedRefund.adminNotes}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const StatusUpdateModal = () => (
    <Modal
      visible={statusModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setStatusModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {selectedRefund && (
            <>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Order #{selectedRefund.orderId.slice(-8).toUpperCase()}</Text>
                <Text style={styles.modalValue}>
                  {formatCurrency(selectedRefund.amount)} ({selectedRefund.type} refund)
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>New Status</Text>
                <View style={styles.statusButtons}>
                  {(['pending', 'approved', 'rejected', 'processed'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        newStatus === status && styles.statusButtonActive,
                      ]}
                      onPress={() => setNewStatus(status)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          newStatus === status && styles.statusButtonTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Admin Notes</Text>
                <TextInput
                  style={styles.textInput}
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  placeholder="Add notes about this status update..."
                  placeholderTextColor={colors.textLight}
                  multiline
                />
              </View>

              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={() => setStatusModalVisible(false)}
                  style={styles.modalButton}
                />
                <Button
                  label={updating ? 'Updating...' : 'Update Status'}
                  onPress={handleUpdateStatus}
                  disabled={updating}
                  style={styles.modalButton}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refund Management</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{stats.total}</Text>
            <Text style={styles.statsLabel}>Total</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={[styles.statsValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
            <Text style={styles.statsLabel}>Pending</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={[styles.statsValue, { color: colors.success }]}>{stats.processed}</Text>
            <Text style={styles.statsLabel}>Processed</Text>
          </View>
          <View style={styles.statsItem}>
            <Text style={[styles.statsValue, { color: colors.primary, fontSize: fontSizes.base }]}>{formatCurrency(stats.totalAmount)}</Text>
            <Text style={styles.statsLabel}>Total Amount</Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterRow}
          contentContainerStyle={styles.filterScrollView}
        >
          <FilterButton status="all" label="All" count={stats.total} />
          <FilterButton status="pending" label="Pending" count={stats.pending} />
          <FilterButton status="approved" label="Approved" />
          <FilterButton status="processed" label="Processed" count={stats.processed} />
          <FilterButton status="rejected" label="Rejected" />
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.xs }}>
          <SearchBar 
            value={search} 
            onChangeText={setSearch} 
            placeholder="Search by order ID, reason, or admin..." 
          />
        </View>
      </View>

      <DataList<Refund>
        data={filtered}
        renderItem={({ item }) => (
          <RefundCard 
            refund={item} 
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={handleViewDetails}
          />
        )}
        keyExtractor={(item) => item.id}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        emptyMessage={search ? 'No refunds match your search.' : statusFilter === 'all' ? 'No refunds yet.' : `No ${statusFilter} refunds.`}
        contentContainerStyle={styles.listContent}
      />
      
      <StatusUpdateModal />
      <DetailsModal />
    </SafeAreaView>
  );
}
