import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
export const REPORTS_KEY = 'admin_reports';

export interface Report {
  id: string;
  type: 'spam' | 'abuse' | 'fraud' | 'other';
  reportedContent: string;
  reporterName: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

function createMockReports(): Report[] {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id: 'r1', type: 'spam', reportedContent: 'Product: Fake iPhone 15', reporterName: 'Alice Johnson', description: 'This product listing appears to be counterfeit.', status: 'pending', createdAt: d(1) },
    { id: 'r2', type: 'abuse', reportedContent: 'Review by user Bob', reporterName: 'Carol White', description: 'This review contains offensive language.', status: 'pending', createdAt: d(2) },
    { id: 'r3', type: 'fraud', reportedContent: 'Seller: QuickShop', reporterName: 'David Kim', description: 'Seller never shipped my order and is not responding.', status: 'resolved', createdAt: d(5) },
    { id: 'r4', type: 'other', reportedContent: 'Product: Broken Charger', reporterName: 'Emma Davis', description: 'Product description is misleading.', status: 'dismissed', createdAt: d(7) },
  ];
}

function reportStatusToBadge(status: Report['status']): StatusType {
  if (status === 'resolved') return 'resolved';
  if (status === 'dismissed') return 'dismissed';
  return 'pending';
}

interface ReportDetailModalProps {
  report: Report | null;
  onClose: () => void;
  onAction: (id: string, action: 'resolved' | 'dismissed') => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose, onAction }) => (
  <Modal visible={!!report} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>
        {report && (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Detail</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{report.type.toUpperCase()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reported Content</Text>
                <Text style={styles.detailValue}>{report.reportedContent}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reporter</Text>
                <Text style={styles.detailValue}>{report.reporterName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{report.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <StatusBadge status={reportStatusToBadge(report.status)} size="sm" />
              </View>
            </ScrollView>
            {report.status === 'pending' && (
              <View style={styles.modalActions}>
                <Button label="Dismiss" variant="secondary" onPress={() => onAction(report.id, 'dismissed')} style={styles.modalBtn} />
                <Button label="Resolve" onPress={() => onAction(report.id, 'resolved')} style={styles.modalBtn} />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  </Modal>
);

interface Props { embedded?: boolean }

export default function ReportsScreen({ embedded }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Report | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      let data = await storage.get<Report[]>(REPORTS_KEY);
      if (!data || data.length === 0) {
        data = createMockReports();
        await storage.set(REPORTS_KEY, data);
      }
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(data);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = useCallback(async (id: string, action: 'resolved' | 'dismissed') => {
    try {
      const all = (await storage.get<Report[]>(REPORTS_KEY)) ?? [];
      const updated = all.map((r) => r.id === id ? { ...r, status: action } : r);
      await storage.set(REPORTS_KEY, updated);
      setReports(updated);
      setSelected(null);
      mobileToastManager.success(`Report ${action}`, 'Updated');
    } catch { Alert.alert('Error', 'Failed to update report.'); }
  }, []);

  const Wrapper = embedded ? View : SafeAreaView;

  return (
    <Wrapper style={styles.screen}>
      <DataList<Report>
        data={reports}
        renderItem={({ item }) => (
          <Card onPress={() => setSelected(item)} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.reportType}>{item.type.toUpperCase()}</Text>
                  <StatusBadge status={reportStatusToBadge(item.status)} size="sm" />
                </View>
                <Text style={styles.reportContent} numberOfLines={1}>{item.reportedContent}</Text>
                <Text style={styles.reportMeta}>By {item.reporterName} · {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
            </View>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        emptyMessage="No reports."
        contentContainerStyle={styles.listContent}
      />
      <ReportDetailModal report={selected} onClose={() => setSelected(null)} onAction={handleAction} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  listContent: { paddingBottom: theme.spacing['2xl'] },
  card: { marginHorizontal: theme.spacing.base, marginVertical: theme.spacing.xs },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1, gap: 4, marginRight: theme.spacing.sm },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reportType: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.bold as any, color: theme.colors.primary, letterSpacing: 0.5 },
  reportContent: { fontSize: theme.fontSizes.base, color: theme.colors.text, fontWeight: theme.fontWeights.medium as any },
  reportMeta: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
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
