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
import ticketService from '../../../services/TicketService';
import { Card } from '../../../components/admin/Card';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/admin/Button';
import { Header } from '../../../components/Header';
import { mobileToastManager } from '../../../utils/toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { tokenManager } from '../../../services/api/tokenManager';



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

interface BlockModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const BlockModal: React.FC<BlockModalProps> = ({ visible, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const handleConfirm = () => {
    if (!reason.trim()) { Alert.alert('Required', 'Please provide a reason.'); return; }
    onConfirm(reason.trim());
    setReason('');
  };

  const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
      padding: spacing.xl, gap: spacing.md,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold as any, color: colors.text },
    fieldLabel: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any, color: colors.textSecondary },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.base,
      padding: spacing.md, fontSize: fontSizes.base, color: colors.text,
      backgroundColor: colors.surface, minHeight: 80,
    },
    modalActions: { flexDirection: 'row', gap: spacing.sm },
    modalBtn: { flex: 1 },
    warningText: {
      fontSize: fontSizes.sm,
      color: colors.error,
      backgroundColor: colors.error + '20',
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.md,
      lineHeight: 18,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Block Account</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.warningText}>
            Blocking will restrict all account access, including guest features. This is a serious action.
          </Text>
          <Text style={styles.fieldLabel}>Reason</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for blocking…"
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <Button label="Cancel" variant="secondary" onPress={onClose} style={styles.modalBtn} />
            <Button label="Block" variant="destructive" onPress={handleConfirm} style={styles.modalBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SuspendModal: React.FC<SuspendModalProps> = ({ visible, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('7');
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const handleConfirm = () => {
    if (!reason.trim()) { Alert.alert('Required', 'Please provide a reason.'); return; }
    onConfirm(reason.trim(), duration);
    setReason('');
    setDuration('7');
  };

  const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
      padding: spacing.xl, gap: spacing.md,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold as any, color: colors.text },
    fieldLabel: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any, color: colors.textSecondary },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.base,
      padding: spacing.md, fontSize: fontSizes.base, color: colors.text,
      backgroundColor: colors.surface, minHeight: 80,
    },
    inputSingle: { minHeight: 0 },
    modalActions: { flexDirection: 'row', gap: spacing.sm },
    modalBtn: { flex: 1 },
    infoText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
      lineHeight: 18,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Suspend Account</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>
            Suspension restricts account usage but allows guest features. User can submit appeals.
          </Text>
          <Text style={styles.fieldLabel}>Reason</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for suspension…"
            placeholderTextColor={colors.textLight}
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
            placeholderTextColor={colors.textLight}
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
  const { user: currentUser } = useAuth();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [suspensionAppeals, setSuspensionAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspendVisible, setSuspendVisible] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userResponse, ordersResponse] = await Promise.all([
        userService.getUserById(id),
        orderService.getOrders({ customerId: id }),
      ]);
      
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
        
        // Load suspension appeals if user is suspended
        if (userResponse.data.status === 'suspended') {
          try {
            const token = await tokenManager.getAccessToken();
            const appealsResponse = await ticketService.getUserSuspensionAppeals(token || '', id);
            if (appealsResponse.success && appealsResponse.data) {
              setSuspensionAppeals(appealsResponse.data);
            }
          } catch (error) {
            console.warn('Failed to load suspension appeals:', error);
          }
        }
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

  const updateUserStatus = useCallback(async (newStatus: UserProfile['status'], auditAction: string, reason?: string, duration?: string) => {
    if (!user) return;
    try {
      const updateData: any = { status: newStatus };
      if (reason) updateData.reason = reason;
      if (duration && newStatus === 'suspended') {
        const durationDate = new Date();
        durationDate.setDate(durationDate.getDate() + parseInt(duration));
        updateData.suspensionDuration = durationDate.toISOString();
      }

      const response = await userService.updateUserStatus(id, updateData);
      
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
        
        // Reload to get updated appeals if needed
        if (newStatus === 'suspended' || user.status === 'suspended') {
          setTimeout(load, 500);
        }
      } else {
        throw new Error(response.error?.message || 'Failed to update user status');
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', error.message || 'Failed to update account.');
    }
  }, [user, id, load]);

  const handleSuspend = useCallback(async (reason: string, duration: string) => {
    setSuspendVisible(false);
    await updateUserStatus('suspended', `Suspended for ${duration} days`, reason, duration);
  }, [updateUserStatus]);

  const handleBlock = useCallback(async (reason: string) => {
    setBlockVisible(false);
    await updateUserStatus('blocked', 'Account blocked', reason);
  }, [updateUserStatus]);

  const handleBlockConfirm = useCallback(() => {
    Alert.alert(
      'Block Account',
      'This will permanently block the user from all features. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: () => setBlockVisible(true) },
      ],
    );
  }, []);

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

  // Check admin restrictions
  const canManageUser = useCallback(() => {
    if (!currentUser || !user) return false;
    
    // Admin cannot manage their own account
    if (currentUser.id === user._id) return false;
    
    return true;
  }, [currentUser, user]);

  const canBlockUser = useCallback(() => {
    if (!currentUser || !user) return false;
    
    // Only super_admin can block admin accounts
    if (user.role === 'admin' && currentUser.role !== 'super_admin') return false;
    
    return canManageUser();
  }, [currentUser, user, canManageUser]);

  // Styles with dynamic theme
  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    navHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.base, paddingVertical: spacing.md,
      borderBottomWidth: 1, borderBottomColor: colors.borderLight,
      backgroundColor: colors.background,
    },
    navTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold as any, color: colors.text },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: fontSizes.base, color: colors.textSecondary },
    scrollContent: { padding: spacing.base, gap: spacing.sm, paddingBottom: spacing['4xl'] },
    profileCard: { marginBottom: spacing.xs },
    profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    avatar: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: colors.primary + '20',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold as any, color: colors.primary },
    profileInfo: { flex: 1, gap: 2 },
    userName: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.text },
    userEmail: { fontSize: fontSizes.sm, color: colors.textSecondary },
    userMeta: { fontSize: fontSizes.sm, color: colors.textLight },
    divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
    metaRow: { flexDirection: 'row', justifyContent: 'space-around' },
    metaItem: { alignItems: 'center', gap: 2 },
    metaLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    metaValue: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold as any, color: colors.text },
    sectionTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.xs },
    actionsCard: {},
    actionButtons: { flexDirection: 'row', gap: spacing.sm },
    actionBtn: { flex: 1 },
    emptyCard: {},
    emptyText: { color: colors.textSecondary, textAlign: 'center' },
    orderCard: { marginBottom: spacing.xs },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderId: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold as any, color: colors.text },
    orderMeta: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
    orderRight: { alignItems: 'flex-end', gap: spacing.xs },
    orderAmount: { fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: colors.text },
    auditCard: { marginBottom: spacing.xs },
    auditAction: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold as any, color: colors.text },
    auditReason: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
    auditDate: { fontSize: fontSizes.xs, color: colors.textLight, marginTop: 4 },
    restrictionNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.warning + '20',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    restrictionText: {
      flex: 1,
      fontSize: fontSizes.sm,
      color: colors.warning,
      lineHeight: 18,
    },
    disabledActionContainer: {
      flex: 1,
      alignItems: 'center',
    },
    disabledActionText: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    appealCard: { marginBottom: spacing.xs },
    appealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    appealTitle: {
      flex: 1,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold as any,
      color: colors.text,
      marginRight: spacing.sm,
    },
    appealReason: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: spacing.xs,
    },
    appealDate: {
      fontSize: fontSizes.xs,
      color: colors.textLight,
      marginBottom: spacing.sm,
    },
    appealResponse: {
      backgroundColor: colors.surface,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    appealResponseLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold as any,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    appealResponseText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 18,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl,
      padding: spacing.xl, gap: spacing.md,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold as any, color: colors.text },
    fieldLabel: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any, color: colors.textSecondary },
    input: {
      borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.base,
      padding: spacing.md, fontSize: fontSizes.base, color: colors.text,
      backgroundColor: colors.surface, minHeight: 80,
    },
    inputSingle: { minHeight: 0 },
    modalActions: { flexDirection: 'row', gap: spacing.sm },
    modalBtn: { flex: 1 },
    infoText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md,
      lineHeight: 18,
    },
    warningText: {
      fontSize: fontSizes.sm,
      color: colors.error,
      backgroundColor: colors.error + '20',
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.md,
      lineHeight: 18,
    },
  });

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
          {!canManageUser() ? (
            <View style={styles.restrictionNotice}>
              <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
              <Text style={styles.restrictionText}>
                {currentUser?.id === user._id 
                  ? "You cannot manage your own account" 
                  : "You can view this admin's information but cannot modify their account"}
              </Text>
            </View>
          ) : user.status === 'active' ? (
            <View style={styles.actionButtons}>
              <Button label="Suspend" variant="secondary" onPress={() => setSuspendVisible(true)} style={styles.actionBtn} />
              {canBlockUser() ? (
                <Button label="Block" variant="destructive" onPress={handleBlockConfirm} style={styles.actionBtn} />
              ) : (
                <View style={styles.disabledActionContainer}>
                  <Button label="Block" variant="destructive" disabled onPress={() => {}} style={styles.actionBtn} />
                  <Text style={styles.disabledActionText}>Only super admins can block admin accounts</Text>
                </View>
              )}
            </View>
          ) : (
            <Button label="Reactivate Account" onPress={handleReactivate} />
          )}
        </Card>

        {/* Suspension Appeals */}
        {user.status === 'suspended' && suspensionAppeals.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Suspension Appeals ({suspensionAppeals.length})</Text>
            {suspensionAppeals.map((appeal) => (
              <Card key={appeal._id} style={styles.appealCard}>
                <View style={styles.appealHeader}>
                  <Text style={styles.appealTitle}>{appeal.subject}</Text>
                  <StatusBadge status={appeal.status as StatusType} size="sm" />
                </View>
                <Text style={styles.appealReason}>{appeal.appealReason}</Text>
                <Text style={styles.appealDate}>
                  Submitted {new Date(appeal.createdAt).toLocaleDateString()}
                </Text>
                {appeal.adminResponse && (
                  <View style={styles.appealResponse}>
                    <Text style={styles.appealResponseLabel}>Admin Response:</Text>
                    <Text style={styles.appealResponseText}>{appeal.adminResponse}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

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
      
      <BlockModal
        visible={blockVisible}
        onClose={() => setBlockVisible(false)}
        onConfirm={handleBlock}
      />
    </View>
  );
}
