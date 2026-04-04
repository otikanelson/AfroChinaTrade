import React, { useCallback, useEffect, useState } from 'react';
import {
  Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { refundService, RefundStats } from '../../../services/RefundService';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/admin/Card';
import { StatCard } from '../../../components/admin/StatCard';
import { useTheme } from '../../../contexts/ThemeContext';

type TimePeriod = 'today' | 'week' | 'month' | 'all';

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'all', label: 'All Time' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  processed: '#10b981',
  rejected: '#ef4444',
};

const { width: SCREEN_W } = Dimensions.get('window');
const BAR_CHART_W = SCREEN_W - 48; // 24px padding each side

// ─── Bar chart (pure RN, no library) ──────────────────────────────────────
function RefundRateChart({ stats }: { stats: RefundStats }) {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const total = stats.total.totalRefunds;
  const bars = Object.entries(stats.byStatus).map(([status, data]) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    count: data.count,
    pct: total > 0 ? (data.count / total) * 100 : 0,
    color: STATUS_COLORS[status] || colors.textSecondary,
  }));

  const maxPct = Math.max(...bars.map(b => b.pct), 1);
  const CHART_H = 100;

  return (
    <Card style={{ marginHorizontal: spacing.base, marginBottom: spacing.base }}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text, marginBottom: spacing.md }}>
          Refund Rate by Status
        </Text>

        {/* Bars */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: spacing.sm, marginBottom: spacing.sm }}>
          {bars.map(bar => (
            <View key={bar.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H }}>
              {/* Percentage label above bar */}
              <Text style={{ fontSize: 9, color: colors.textSecondary, marginBottom: 2 }}>
                {bar.pct.toFixed(0)}%
              </Text>
              {/* Bar */}
              <View style={{
                width: '100%',
                height: Math.max((bar.pct / maxPct) * (CHART_H - 20), 4),
                backgroundColor: bar.color,
                borderRadius: borderRadius.sm,
                opacity: 0.9,
              }} />
            </View>
          ))}
        </View>

        {/* X-axis labels */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {bars.map(bar => (
            <View key={bar.label} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: bar.color, marginBottom: 2 }} />
              <Text style={{ fontSize: 9, color: colors.textSecondary, textAlign: 'center' }}>{bar.label}</Text>
              <Text style={{ fontSize: 9, fontWeight: fontWeights.semibold as any, color: colors.text }}>{bar.count}</Text>
            </View>
          ))}
        </View>

        {/* Approval vs rejection summary */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          marginTop: spacing.md, paddingTop: spacing.sm,
          borderTopWidth: 1, borderTopColor: colors.borderLight,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Approval Rate</Text>
            <Text style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: '#10b981' }}>
              {total > 0 ? Math.round(((stats.byStatus.approved?.count || 0) + (stats.byStatus.processed?.count || 0)) / total * 100) : 0}%
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Pending</Text>
            <Text style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: '#f59e0b' }}>
              {stats.byStatus.pending?.count || 0}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: fontSizes.xs, color: colors.textSecondary }}>Rejection Rate</Text>
            <Text style={{ fontSize: fontSizes.base, fontWeight: fontWeights.bold as any, color: '#ef4444' }}>
              {total > 0 ? Math.round((stats.byStatus.rejected?.count || 0) / total * 100) : 0}%
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
export default function RefundAnalyticsScreen() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('month');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await refundService.getRefundStats(period);
      setStats(res.success && res.data ? res.data : null);
    } catch { setStats(null); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const periodLabel = PERIODS.find(p => p.value === period)?.label || 'Month';

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header title="Refund Analytics" subtitle="Performance insights" showBack />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, fontSize: fontSizes.sm }}>Loading…</Text>
      </View>
    </View>
  );

  if (!stats) return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header title="Refund Analytics" subtitle="Performance insights" showBack />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Ionicons name="analytics-outline" size={56} color={colors.textLight} />
        <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, fontSize: fontSizes.sm, textAlign: 'center' }}>No data available</Text>
      </View>
    </View>
  );

  const approvalRate = stats.total.totalRefunds > 0
    ? Math.round(((stats.byStatus.approved?.count || 0) + (stats.byStatus.processed?.count || 0)) / stats.total.totalRefunds * 100)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Header title="Refund Analytics" subtitle={`${periodLabel} insights`} showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.xs }}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.value}
              style={{
                paddingHorizontal: spacing.md, paddingVertical: 5,
                borderRadius: borderRadius.full, borderWidth: 1.5,
                borderColor: period === p.value ? colors.primary : colors.border,
                backgroundColor: period === p.value ? colors.primary : colors.background,
              }}
              onPress={() => setPeriod(p.value)}
            >
              <Text style={{
                fontSize: fontSizes.xs,
                color: period === p.value ? colors.textInverse : colors.textSecondary,
                fontWeight: fontWeights.medium as any,
              }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stat cards 2×2 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.base, gap: spacing.sm, marginBottom: spacing.md }}>
          <StatCard label="Total Refunds" value={String(stats.total.totalRefunds)} accent="#64748b" icon="receipt-outline" />
          <StatCard label="Total Amount" value={`₦${(stats.total.totalAmount / 1000).toFixed(1)}k`} accent="#ef4444" icon="cash-outline" />
          <StatCard label="Avg Amount" value={`₦${stats.total.avgAmount.toFixed(0)}`} accent="#8b5cf6" icon="trending-up-outline" />
          <StatCard label="Approval Rate" value={`${approvalRate}%`} accent="#10b981" icon="checkmark-circle-outline" />
        </View>

        {/* Bar chart */}
        <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text, marginHorizontal: spacing.base, marginBottom: spacing.sm }}>
          Refund Rate
        </Text>
        <RefundRateChart stats={stats} />

        {/* Status breakdown list */}
        <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text, marginHorizontal: spacing.base, marginBottom: spacing.sm }}>
          Status Breakdown
        </Text>
        <Card style={{ marginHorizontal: spacing.base, marginBottom: spacing.xl }}>
          {Object.entries(stats.byStatus).map(([status, data], idx, arr) => (
            <View key={status} style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
              borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
              borderBottomColor: colors.borderLight,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: STATUS_COLORS[status] || colors.textSecondary }} />
                <Text style={{ fontSize: fontSizes.sm, color: colors.text, textTransform: 'capitalize' }}>{status}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: fontSizes.sm, fontWeight: fontWeights.semibold as any, color: colors.text }}>{data.count}</Text>
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>₦{data.totalAmount.toFixed(0)}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
