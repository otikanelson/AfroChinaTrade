import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReviewsScreen from './reviews';
import TicketsScreen from './tickets';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';

type Tab = 'reports' | 'reviews' | 'tickets';

const TABS: { value: Tab; label: string }[] = [
  { value: 'reviews', label: 'Reviews' },
  { value: 'tickets', label: 'Tickets' },
];

export default function ModerationDashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('reports');
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    tab: {
      flex: 1, paddingVertical: spacing.md, alignItems: 'center',
      borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium as any, color: colors.textSecondary },
    tabTextActive: { color: colors.primary, fontWeight: fontWeights.semibold as any },
    content: { flex: 1 },
  });

  return (
    <View style={styles.screen}>
      <Header title="Moderation" subtitle="Reviews & support tickets" showBack={true} />
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.value }}
          >
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'reviews' && <ReviewsScreen embedded />}
        {activeTab === 'tickets' && <TicketsScreen embedded />}
      </View>
    </View>
  );
}
