import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/admin/Button';
import { mobileToastManager } from '../../../utils/toast';
import { theme } from '../../../theme';

const storage = new AsyncStorageAdapter();
export const TICKETS_KEY = 'admin_tickets';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  userName: string;
  userEmail: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
}

function createMockTickets(): Ticket[] {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id: 't1', subject: 'Order not delivered', description: 'My order #ORD-001 was marked delivered but I never received it.', userName: 'Alice Johnson', userEmail: 'alice@example.com', priority: 'urgent', status: 'open', createdAt: d(0) },
    { id: 't2', subject: 'Wrong item received', description: 'I ordered a blue shirt but received a red one.', userName: 'Bob Smith', userEmail: 'bob@example.com', priority: 'high', status: 'in_progress', createdAt: d(1) },
    { id: 't3', subject: 'Refund not processed', description: 'It has been 10 days since my return was approved but no refund yet.', userName: 'Carol White', userEmail: 'carol@example.com', priority: 'high', status: 'open', createdAt: d(2) },
    { id: 't4', subject: 'App crashes on checkout', description: 'Every time I try to complete payment the app crashes.', userName: 'David Kim', userEmail: 'david@example.com', priority: 'medium', status: 'open', createdAt: d(3) },
    { id: 't5', subject: 'Cannot update address', description: 'The save button on the address form does nothing.', userName: 'Emma Davis', userEmail: 'emma@example.com', priority: 'low', status: 'resolved', createdAt: d(7) },
  ];
}

const PRIORITY_COLORS: Record<TicketPriority, { bg: string; text: string }> = {
  low:    { bg: '#E2E3E5', text: '#383D41' },
  medium: { bg: '#FFF3CD', text: '#856404' },
  high:   { bg: '#FFE5B4', text: '#7D4E00' },
  urgent: { bg: '#F8D7DA', text: '#721C24' },
};

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const c = PRIORITY_COLORS[priority];
  return (
    <View style={[styles.priorityBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.priorityText, { color: c.text }]}>{priority.toUpperCase()}</Text>
    </View>
  );
}

function ticketStatusToBadge(status: TicketStatus): StatusType {
  if (status === 'resolved') return 'resolved';
  if (status === 'in_progress') return 'in_fulfillment';
  return 'pending';
}

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onAction: (id: string, status: TicketStatus) => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onAction }) => (
  <Modal visible={!!ticket} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>
        {ticket && (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket Detail</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subject</Text>
                <Text style={styles.detailValue}>{ticket.subject}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{ticket.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User</Text>
                <Text style={styles.detailValue}>{ticket.userName} · {ticket.userEmail}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Priority</Text>
                <PriorityBadge priority={ticket.priority} />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <StatusBadge status={ticketStatusToBadge(ticket.status)} size="sm" />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>{new Date(ticket.createdAt).toLocaleString()}</Text>
              </View>
            </ScrollView>
            {ticket.status !== 'resolved' && (
              <View style={styles.modalActions}>
                {ticket.status === 'open' && (
                  <Button label="Start Working" variant="secondary" onPress={() => onAction(ticket.id, 'in_progress')} style={styles.modalBtn} />
                )}
                <Button label="Resolve" onPress={() => onAction(ticket.id, 'resolved')} style={styles.modalBtn} />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  </Modal>
);

interface Props { embedded?: boolean }

export default function TicketsScreen({ embedded }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      let data = await storage.get<Ticket[]>(TICKETS_KEY);
      if (!data || data.length === 0) {
        data = createMockTickets();
        await storage.set(TICKETS_KEY, data);
      }
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTickets(data);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = useCallback(async (id: string, status: TicketStatus) => {
    try {
      const all = (await storage.get<Ticket[]>(TICKETS_KEY)) ?? [];
      const updated = all.map((t) => t.id === id ? { ...t, status } : t);
      await storage.set(TICKETS_KEY, updated);
      setTickets(updated);
      setSelected(null);
      mobileToastManager.success(`Ticket ${status === 'resolved' ? 'resolved' : 'updated'}`, 'Updated');
    } catch { Alert.alert('Error', 'Failed to update ticket.'); }
  }, []);

  const Wrapper = embedded ? View : SafeAreaView;

  return (
    <Wrapper style={styles.screen}>
      <DataList<Ticket>
        data={tickets}
        renderItem={({ item }) => (
          <Card onPress={() => setSelected(item)} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={ticketStatusToBadge(item.status)} size="sm" />
                </View>
                <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                <Text style={styles.meta}>{item.userName} · {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
            </View>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        emptyMessage="No tickets."
        contentContainerStyle={styles.listContent}
      />
      <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} onAction={handleAction} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  listContent: { paddingBottom: theme.spacing['2xl'] },
  card: { marginHorizontal: theme.spacing.base, marginVertical: theme.spacing.xs },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, gap: 4, marginRight: theme.spacing.sm },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  subject: { fontSize: theme.fontSizes.base, color: theme.colors.text, fontWeight: theme.fontWeights.medium as any },
  meta: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
  priorityBadge: { paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: theme.borderRadius.full },
  priorityText: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.bold as any, letterSpacing: 0.5 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.background, maxHeight: '80%',
    borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl, gap: theme.spacing.md,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  detailRow: { paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, gap: 4 },
  detailLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: theme.fontSizes.base, color: theme.colors.text },
  modalActions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  modalBtn: { flex: 1 },
});
