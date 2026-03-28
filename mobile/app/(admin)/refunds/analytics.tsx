import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { refundService, RefundStats } from '../../../services/RefundService';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/admin/Card';
import { useTheme } from '../../../contexts/ThemeContext';

type TimePeriod = 'today' | 'week' | 'month' | 'all';

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

export default function RefundAnalyticsScreen() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('month');

  const styles = StyleSheet.create({
    screen: { 
      flex: 1, 
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    periodSelector: {
      flexDirection: 'row',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    periodButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodButtonText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
    },
    periodButtonTextActive: {
      color: colors.background,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.base,
      gap: spacing.sm,
    },
    statCard: {
      width: '48%',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      alignItems: 'center',
      borderLeftWidth: 4,
    },
    statValue: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginHorizontal: spacing.base,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    statusBreakdown: {
      marginHorizontal: spacing.base,
      marginBottom: spacing.base,
    },
    statusItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    statusInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    statusName: {
      fontSize: fontSizes.base,
      color: colors.text,
      textTransform: 'capitalize',
    },
    statusStats: {
      alignItems: 'flex-end',
    },
    statusCount: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    statusAmount: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await refundService.getRefundStats(period);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching refund stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#3b82f6';
      case 'processed': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <Header 
          title="Refund Analytics"
          subtitle="Performance insights"
          showBack
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.screen}>
        <Header 
          title="Refund Analytics"
          subtitle="Performance insights"
          showBack
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>No analytics data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const periodLabel = PERIODS.find(p => p.value === period)?.label || 'This Month';

  return (
    <SafeAreaView style={styles.screen}>
      <Header 
        title="Refund Analytics"
        subtitle={`${periodLabel} insights`}
        showBack
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.periodSelector}
        >
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.periodButton,
                period === p.value && styles.periodButtonActive,
              ]}
              onPress={() => setPeriod(p.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === p.value && styles.periodButtonTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#64748b' }]}>
            <Text style={styles.statValue}>{stats.total.totalRefunds}</Text>
            <Text style={styles.statLabel}>Total Refunds</Text>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
            <Text style={styles.statValue}>
              ₦{stats.total.totalAmount.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
            <Text style={styles.statValue}>
              ₦{stats.total.avgAmount.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Average Amount</Text>
          </View>
          
          <View style={[styles.statCard, { borderLeftColor: '#06b6d4' }]}>
            <Text style={styles.statValue}>
              {stats.total.totalRefunds > 0 
                ? Math.round((Object.values(stats.byStatus).reduce((sum, s) => sum + (s.count || 0), 0) / stats.total.totalRefunds) * 100)
                : 0}%
            </Text>
            <Text style={styles.statLabel}>Processing Rate</Text>
          </View>
        </View>

        {/* Status Breakdown */}
        <Text style={styles.sectionTitle}>Status Breakdown</Text>
        <Card style={styles.statusBreakdown}>
          {Object.entries(stats.byStatus).map(([status, data]) => (
            <View key={status} style={styles.statusItem}>
              <View style={styles.statusInfo}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(status) }
                  ]} 
                />
                <Text style={styles.statusName}>{status}</Text>
              </View>
              <View style={styles.statusStats}>
                <Text style={styles.statusCount}>{data.count}</Text>
                <Text style={styles.statusAmount}>
                  ₦{data.totalAmount.toFixed(0)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Additional Insights */}
        <Text style={styles.sectionTitle}>Insights</Text>
        <Card style={{ marginHorizontal: spacing.base, marginBottom: spacing.xl }}>
          <View style={{ padding: spacing.base }}>
            <View style={styles.statusItem}>
              <Text style={styles.statusName}>Pending Requests</Text>
              <Text style={styles.statusCount}>
                {stats.byStatus.pending?.count || 0}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusName}>Approval Rate</Text>
              <Text style={styles.statusCount}>
                {stats.total.totalRefunds > 0 
                  ? Math.round(((stats.byStatus.approved?.count || 0) + (stats.byStatus.processed?.count || 0)) / stats.total.totalRefunds * 100)
                  : 0}%
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusName}>Rejection Rate</Text>
              <Text style={styles.statusCount}>
                {stats.total.totalRefunds > 0 
                  ? Math.round((stats.byStatus.rejected?.count || 0) / stats.total.totalRefunds * 100)
                  : 0}%
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}