import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReviewsScreen from './reviews';
import TicketsScreen from './tickets';
import { theme } from '../../../theme';

type Tab = 'reports' | 'reviews' | 'tickets';

const TABS: { value: Tab; label: string }[] = [
  { value: 'reviews', label: 'Reviews' },
  { value: 'tickets', label: 'Tickets' },
];

export default function ModerationDashboardScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('reports');

  return (
    <View style={styles.screen}>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tab: {
    flex: 1, paddingVertical: theme.spacing.md, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium as any, color: theme.colors.textSecondary },
  tabTextActive: { color: theme.colors.primary, fontWeight: theme.fontWeights.semibold as any },
  content: { flex: 1 },
});
