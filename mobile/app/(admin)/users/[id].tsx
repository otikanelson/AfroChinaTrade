import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Order } from '../../../types/product';
import { userService, UserProfile } from '../../../services/UserService';
import { orderService } from '../../../services/OrderService';
import { Card } from '../../../components/admin/Card';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/admin/Button';
import { Header } from '../../../components/Header';
import { mobileToastManager } from '../../../utils/toast';
import { theme } from '../../../theme';



interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  reason?: string;
  adminNote?: string;
  createdAt: string;
}

interface SuspendModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string, duration: string) => void;
}

const SuspendModal: React.FC<SuspendModalProps> = ({ visible, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('7');

  const handleConfirm = () => {
    if (!reason.trim()) { Alert.alert('Required', 'Please provide a reason.'); return; }
    onConfirm(reason.trim(), duration);
    setReason('');
    setDuration('7');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Suspend Account</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldLabel}>Reason</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for suspension…"
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={styles.fieldLabel}>Duration (days)</Text>
          <TextInput
            style={[styles.input, styles.inputSingle]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="7"
            placeholderTextColor={theme.colors.textLight}
          />
          <View style={styles.modalActions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.modalBtn} />
            <Button label="Suspend" onPress={handleConfirm} style={styles.modalBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

function userStatusToBadge(status: UserProfile['status']): StatusType {
  switch (status) {
    case 'active': return 'active';
    case 'suspended': return 'pending';
    case 'blocked': return 'blocked';
    default: return 'active';
  }
}

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspendVisible, setSuspendVisible] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userResponse, ordersResponse] = await Promise.all([
        userService.getUserById(id),
        orderService.getOrders({ customerId: id }),
      ]);
      
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      } else {
        setUser(null);
      }
      
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data);
      } else {
        setOrders([]);
      }
      
      // For now, we'll skip audit log since it's not implemented in the backend
      setAuditLog([]);
    } catch (error) {
      console.error('Error loading user details:', error);
      setUser(null);
      setOrders([]);
      setAuditLog([]);
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateUserStatus = useCallback(async (newStatus: UserProfile['status'], auditAction: string, reason?: string) => {
    if (!user) return;
    try {
      const response = await userService.updateUserStatus(id, { status: newStatus });
      
      if (response.success && response.data) {
        setUser(response.data);
        
        // Create audit entry locally for now
        const entry: AuditEntry = {
          id: `audit-${Date.now()}`,
          userId: id,
          action: auditAction,
          reason,
          createdAt: new Date().toISOString(),
        };
        setAuditLog((prev) => [entry, ...prev]);
        
        mobileToastManager.success(`Account ${auditAction.toLowerCase()}`, 'Done');
      } else {
        throw new Error(response.error?.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update account.');
    }
  }, [user, id]);

  const handleSuspend = useCallback(async (reason: string, duration: string) => {
    setSuspendVisible(false);
    await updateUserStatus('blocked', `Suspended for ${duration} days`, reason);
  }, [updateUserStatus]);

  const handleBlock = useCallback(() => {
    Alert.alert(
      'Block Account',
      'This will permanently block the user. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => updateUserStatus('blocked', 'Account blocked') },
      ],
    );
  }, [updateUserStatus]);

  const handleReactivate = useCallback(() => {
    Alert.alert(
      'Reactivate Account',
      'Restore this user\'s access?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reactivate', onPress: () => updateUserStatus('active', 'Account reactivated') },
      ],
    );
  }, [updateUserStatus]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header 
          title="User Details"
          subtitle="Loading..."
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.screen}>
        <Header 
          title="User Details"
          subtitle="Not found"
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>User not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header 
        title={user.name}
        subtitle={user.email}
        showBack
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phone && <Text style={styles.userMeta}>{user.phone}</Text>}
            </View>
            <StatusBadge status={userStatusToBadge(user.status)} />
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Joined</Text>
              <Text style={styles.metaValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Orders</Text>
              <Text style={styles.metaValue}>{orders.length}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Total Spent</Text>
              <Text style={styles.metaValue}>₦{orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        {/* Account actions */}
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <Card style={styles.actionsCard}>
          {user.status === 'active' ? (
            <View style={styles.actionButtons}>
              <Button label="Suspend" variant="secondary" onPress={() => setSuspendVisible(true)} style={styles.actionBtn} />
              <Button label="Block" variant="destructive" onPress={handleBlock} style={styles.actionBtn} />
            </View>
          ) : (
            <Button label="Reactivate Account" onPress={handleReactivate} />
          )}
        </Card>

        {/* Order history */}
        <Text style={styles.sectionTitle}>Order History ({orders.length})</Text>
        {orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No orders yet.</Text>
          </Card>
        ) : (
          <View>
            {orders.slice(0, 10).map((order) => (
              <Card key={order._id} style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <View>
                    <Text style={styles.orderId}>#{order.orderId}</Text>
                    <Text style={styles.orderMeta}>{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderAmount}>₦{order.totalAmount.toLocaleString()}</Text>
                    <StatusBadge status={order.status as StatusType} size="sm" />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Audit log */}
        {auditLog.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Audit Log</Text>
            {auditLog.map((entry) => (
              <Card key={entry.id} style={styles.auditCard}>
                <Text style={styles.auditAction}>{entry.action}</Text>
                {entry.reason && <Text style={styles.auditReason}>{entry.reason}</Text>}
                <Text style={styles.auditDate}>{new Date(entry.createdAt).toLocaleString()}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <SuspendModal
        visible={suspendVisible}
        onClose={() => setSuspendVisible(false)}
        onConfirm={handleSuspend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  navHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
  },
  navTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: theme.fontSizes.base, color: theme.colors.textSecondary },
  scrollContent: { padding: theme.spacing.base, gap: theme.spacing.sm, paddingBottom: theme.spacing['4xl'] },
  profileCard: { marginBottom: theme.spacing.xs },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold as any, color: theme.colors.primary },
  profileInfo: { flex: 1, gap: 2 },
  userName: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold as any, color: theme.colors.text },
  userEmail: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary },
  userMeta: { fontSize: theme.fontSizes.sm, color: theme.colors.textLight },
  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: theme.spacing.md },
  metaRow: { flexDirection: 'row', justifyContent: 'space-around' },
  metaItem: { alignItems: 'center', gap: 2 },
  metaLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  sectionTitle: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs },
  actionsCard: {},
  actionButtons: { flexDirection: 'row', gap: theme.spacing.sm },
  actionBtn: { flex: 1 },
  emptyCard: {},
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center' },
  orderCard: { marginBottom: theme.spacing.xs },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  orderMeta: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary, marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: theme.spacing.xs },
  orderAmount: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold as any, color: theme.colors.text },
  auditCard: { marginBottom: theme.spacing.xs },
  auditAction: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  auditReason: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary, marginTop: 2 },
  auditDate: { fontSize: theme.fontSizes.xs, color: theme.colors.textLight, marginTop: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl, gap: theme.spacing.md,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  fieldLabel: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium as any, color: theme.colors.textSecondary },
  input: {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md, fontSize: theme.fontSizes.base, color: theme.colors.text,
    backgroundColor: theme.colors.surface, minHeight: 80,
  },
  inputSingle: { minHeight: 0 },
  modalActions: { flexDirection: 'row', gap: theme.spacing.sm },
  modalBtn: { flex: 1 },
});
