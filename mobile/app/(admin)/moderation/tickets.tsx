import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ticketService, Ticket, TicketPriority, TicketStatus } from '../../../services/TicketService';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { Button } from '../../../components/admin/Button';
import { mobileToastManager } from '../../../utils/toast';
import { theme } from '../../../theme';



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
  switch (status) {
    case 'resolved': return 'resolved';
    case 'in_progress': return 'in_fulfillment';
    default: return 'pending';
  }
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
      const response = await ticketService.getTickets({
        page: 1,
        limit: 100, // Get all tickets for now
      });
      
      if (response.success && response.data) {
        setTickets(response.data);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = useCallback(async (id: string, status: TicketStatus) => {
    try {
      const response = await ticketService.updateTicketStatus(id, status);
      
      if (response.success && response.data) {
        setTickets(prev => prev.map(t => t.id === id ? response.data! : t));
        setSelected(null);
        mobileToastManager.success(`Ticket ${status === 'resolved' ? 'resolved' : 'updated'}`, 'Updated');
      } else {
        throw new Error(response.error?.message || 'Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      Alert.alert('Error', 'Failed to update ticket.');
    }
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
