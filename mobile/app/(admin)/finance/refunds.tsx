import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { refundService } from '../../../services/RefundService';
import { Refund } from '../../../types/product';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { SearchBar } from '../../../components/admin/SearchBar';
import { useTheme } from '../../../contexts/ThemeContext';



function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const RefundCard: React.FC<{ refund: Refund }> = ({ refund }) => {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  const styles = StyleSheet.create({
    card: { marginHorizontal: spacing.base, marginVertical: spacing.xs },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardInfo: { flex: 1, gap: 4, marginRight: spacing.md },
    orderId: { fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: colors.text },
    reason: { fontSize: fontSizes.sm, color: colors.textSecondary },
    date: { fontSize: fontSizes.xs, color: colors.textLight },
    cardRight: { alignItems: 'flex-end', gap: spacing.xs },
    amount: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.error },
    typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    typeFull: { backgroundColor: '#fee2e2' },
    typePartial: { backgroundColor: '#fef3c7' },
    typeBadgeText: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold as any, color: colors.text },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardInfo}>
          <Text style={styles.orderId}>Order #{refund.orderId.slice(-8).toUpperCase()}</Text>
          <Text style={styles.reason} numberOfLines={2}>{refund.reason}</Text>
          <Text style={styles.date}>{formatDate(refund.createdAt)}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>₦{refund.amount.toFixed(2)}</Text>
          <View style={[styles.typeBadge, refund.type === 'full' ? styles.typeFull : styles.typePartial]}>
            <Text style={styles.typeBadgeText}>{refund.type === 'full' ? 'Full' : 'Partial'}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

export default function RefundsScreen() {
  const { colors, spacing } = useTheme();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    listHeader: { padding: spacing.base, paddingBottom: spacing.sm },
    listContent: { paddingBottom: spacing['2xl'] },
  });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await refundService.getRefunds({
        page: 1,
        limit: 100, // Get all refunds for now
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
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const refundsArray = Array.isArray(refunds) ? refunds : [];
    if (!search.trim()) return refundsArray;
    const q = search.toLowerCase();
    return refundsArray.filter((r) => r.orderId.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q));
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
