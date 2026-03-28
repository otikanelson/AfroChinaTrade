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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { refundService } from '../../../services/RefundService';
import { Refund } from '../../../types/product';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { Button } from '../../../components/admin/Button';
import { Header } from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { mobileToastManager } from '../../../utils/toast';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const RefundCard: React.FC<{ 
  refund: Refund; 
  onStatusUpdate: (refund: Refund) => void;
  onViewDetails: (refund: Refund) => void;
}> = ({ refund, onStatusUpdate, onViewDetails }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#3b82f6';
      case 'processed': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return colors.textSecondary;
    }
  };
  
  const styles = StyleSheet.create({
    card: { 
      marginHorizontal: spacing.base, 
      marginVertical: spacing.xs,
    },
    cardContent: {
      padding: spacing.base,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    cardInfo: { 
      flex: 1, 
      gap: 4, 
      marginRight: spacing.md,
    },
    orderId: { 
      fontSize: fontSizes.base, 
      fontWeight: fontWeights.bold as any, 
      color: colors.text,
    },
    reason: { 
      fontSize: fontSizes.sm, 
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    date: { 
      fontSize: fontSizes.xs, 
      color: colors.textLight,
    },
    cardRight: { 
      alignItems: 'flex-end', 
      gap: spacing.xs,
    },
    amount: { 
      fontSize: fontSizes.lg, 
      fontWeight: fontWeights.bold as any, 
      color: colors.error,
    },
    typeBadge: { 
      paddingHorizontal: spacing.sm, 
      paddingVertical: 2, 
      borderRadius: borderRadius.full,
    },
    typeFull: { backgroundColor: '#fee2e2' },
    typePartial: { backgroundColor: '#fef3c7' },
    typeBadgeText: { 
      fontSize: fontSizes.xs, 
      fontWeight: fontWeights.semibold as any, 
      color: colors.text,
    },
    statusBadge: { 
      paddingHorizontal: spacing.sm, 
      paddingVertical: 4, 
      borderRadius: borderRadius.base,
      marginTop: spacing.xs,
    },
    statusText: { 
      fontSize: fontSizes.xs, 
      fontWeight: fontWeights.semibold as any, 
      color: 'white',
      textTransform: 'capitalize',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    actionButton: {
      flex: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      alignItems: 'center',
    },
    primaryAction: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondaryAction: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    actionButtonText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium as any,
    },
    primaryActionText: {
      color: colors.background,
    },
    secondaryActionText: {
      color: colors.textSecondary,
    },
    processedBy: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      fontStyle: 'italic',
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.orderId}>
              Order #{refund.orderId.slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.reason} numberOfLines={2}>
              {refund.reason}
            </Text>
            <View style={styles.metaInfo}>
              <Text style={styles.date}>{formatDate(refund.createdAt)}</Text>
              <View style={[styles.typeBadge, refund.type === 'full' ? styles.typeFull : styles.typePartial]}>
                <Text style={styles.typeBadgeText}>
                  {refund.type === 'full' ? 'Full' : 'Partial'}
                </Text>
              </View>
            </View>
            {refund.processedBy && (
              <Text style={styles.processedBy}>
                Processed by: {refund.processedBy.name}
              </Text>
            )}
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.amount}>₦{refund.amount.toFixed(2)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refund.status) }]}>
              <Text style={styles.statusText}>{refund.status}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => onViewDetails(refund)}
          >
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
              View Details
            </Text>
          </TouchableOpacity>
          {refund.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => onStatusUpdate(refund)}
            >
              <Text style={[styles.actionButtonText, styles.primaryActionText]}>
                Update Status
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
};

export default function RefundsManagementScreen() {
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
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    filterButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    filterButtonTextActive: {
      color: colors.background,
    },
    listHeader: { 
      paddingHorizontal: spacing.base, 
      paddingBottom: spacing.sm,
    },
    listContent: { 
      paddingBottom: spacing['2xl'],
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
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
    statValue: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    statLabel: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
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
      padding: spacing.lg,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.base,
    },
    modalSection: {
      marginBottom: spacing.base,
    },
    modalLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    modalValue: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    statusButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    statusButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusButtonText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    statusButtonTextActive: {
      color: colors.background,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      fontSize: fontSizes.sm,
      color: colors.text,
      backgroundColor: colors.surface,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.base,
    },
    modalButton: {
      flex: 1,
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
      r.reason.toLowerCase().includes(q)
    );
  }, [refunds, search]);

  const stats = useMemo(() => {
    const refundsArray = Array.isArray(refunds) ? refunds : [];
    return {
      pending: refundsArray.filter(r => r.status === 'pending').length,
      approved: refundsArray.filter(r => r.status === 'approved').length,
      processed: refundsArray.filter(r => r.status === 'processed').length,
      rejected: refundsArray.filter(r => r.status === 'rejected').length,
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

  const StatusUpdateModal = () => (
    <Modal
      visible={statusModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setStatusModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Refund Status</Text>
          
          {selectedRefund && (
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>
                Order #{selectedRefund.orderId.slice(-8).toUpperCase()}
              </Text>
              <Text style={styles.modalValue}>
                Amount: ₦{selectedRefund.amount.toFixed(2)} ({selectedRefund.type})
              </Text>
            </View>
          )}

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Status</Text>
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
            <Text style={styles.modalLabel}>Admin Notes (Optional)</Text>
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
              label={updating ? 'Updating...' : 'Update'}
              onPress={handleUpdateStatus}
              disabled={updating}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const DetailsModal = () => (
    <Modal
      visible={detailsModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalTitle}>Refund Details</Text>
          
          {selectedRefund && (
            <>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Order ID</Text>
                <Text style={styles.modalValue}>#{selectedRefund.orderId}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Refund Type</Text>
                <Text style={styles.modalValue}>
                  {selectedRefund.type.charAt(0).toUpperCase() + selectedRefund.type.slice(1)}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Amount</Text>
                <Text style={styles.modalValue}>₦{selectedRefund.amount.toFixed(2)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Status</Text>
                <Text style={[styles.modalValue, { textTransform: 'capitalize' }]}>
                  {selectedRefund.status}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Reason</Text>
                <Text style={styles.modalValue}>{selectedRefund.reason}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Created At</Text>
                <Text style={styles.modalValue}>{formatDate(selectedRefund.createdAt)}</Text>
              </View>

              {selectedRefund.processedBy && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Processed By</Text>
                  <Text style={styles.modalValue}>{selectedRefund.processedBy.name}</Text>
                </View>
              )}

              {selectedRefund.processedAt && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Processed At</Text>
                  <Text style={styles.modalValue}>{formatDate(selectedRefund.processedAt)}</Text>
                </View>
              )}

              {selectedRefund.adminNotes && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Admin Notes</Text>
                  <Text style={styles.modalValue}>{selectedRefund.adminNotes}</Text>
                </View>
              )}
            </>
          )}

          <View style={styles.modalActions}>
            <Button
              label="Close"
              variant="secondary"
              onPress={() => setDetailsModalVisible(false)}
              style={styles.modalButton}
            />
            {selectedRefund?.status === 'pending' && (
              <Button
                label="Update Status"
                onPress={() => {
                  setDetailsModalVisible(false);
                  handleStatusUpdate(selectedRefund);
                }}
                style={styles.modalButton}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <Header 
        title="Refund Management"
        subtitle="Manage refund requests"
        showBack
      />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
          <Text style={styles.statValue}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statValue}>{stats.processed}</Text>
          <Text style={styles.statLabel}>Processed</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
          <Text style={styles.statValue}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'pending', 'approved', 'rejected', 'processed'].map((status) => (
          <TouchableOpacity
            key={status}
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
              {status === 'all' ? 'All' : status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        emptyMessage={search ? 'No refunds match your search.' : 'No refunds yet.'}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SearchBar 
              value={search} 
              onChangeText={setSearch} 
              placeholder="Search by order ID or reason..." 
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <StatusUpdateModal />
      <DetailsModal />
    </SafeAreaView>
  );
}