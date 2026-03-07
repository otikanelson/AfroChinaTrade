import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Refund, REFUNDS_KEY } from '../(tabs)/finance';
import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { theme } from '../../../theme';

const storage = new AsyncStorageAdapter();

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const RefundCard: React.FC<{ refund: Refund }> = ({ refund }) => (
  <Card style={styles.card}>
    <View style={styles.cardRow}>
      <View style={styles.cardInfo}>
        <Text style={styles.orderId}>Order #{refund.orderId.slice(-8).toUpperCase()}</Text>
        <Text style={styles.reason} numberOfLines={2}>{refund.reason}</Text>
        <Text style={styles.date}>{formatDate(refund.createdAt)}</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amount}>${refund.amount.toFixed(2)}</Text>
        <View style={[styles.typeBadge, refund.type === 'full' ? styles.typeFull : styles.typePartial]}>
          <Text style={styles.typeBadgeText}>{refund.type === 'full' ? 'Full' : 'Partial'}</Text>
        </View>
      </View>
    </View>
  </Card>
);

export default function RefundsScreen() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = (await storage.get<Refund[]>(REFUNDS_KEY)) ?? [];
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRefunds(data);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return refunds;
    const q = search.toLowerCase();
    return refunds.filter((r) => r.orderId.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q));
  }, [refunds, search]);

  return (
    <SafeAreaView style={styles.screen}>
      <DataList<Refund>
        data={filtered}
        renderItem={({ item }) => <RefundCard refund={item} />}
        keyExtractor={(item) => item.id}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        emptyMessage={search ? 'No refunds match your search.' : 'No refunds yet.'}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search by order ID…" />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  listHeader: { padding: theme.spacing.base, paddingBottom: theme.spacing.sm },
  listContent: { paddingBottom: theme.spacing['2xl'] },
  card: { marginHorizontal: theme.spacing.base, marginVertical: theme.spacing.xs },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, gap: 4, marginRight: theme.spacing.md },
  orderId: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold as any, color: theme.colors.text },
  reason: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary },
  date: { fontSize: theme.fontSizes.xs, color: theme.colors.textLight },
  cardRight: { alignItems: 'flex-end', gap: theme.spacing.xs },
  amount: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold as any, color: theme.colors.error },
  typeBadge: { paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: theme.borderRadius.full },
  typeFull: { backgroundColor: '#fee2e2' },
  typePartial: { backgroundColor: '#fef3c7' },
  typeBadgeText: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
});
