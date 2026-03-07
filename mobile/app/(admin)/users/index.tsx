import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { User } from '../../../../shared/src/types/entities';
import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { STORAGE_KEYS } from '../../../../shared/src/services/storage';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { SearchBar } from '../../../components/admin/SearchBar';
import { theme } from '../../../theme';

const storage = new AsyncStorageAdapter();

type StatusFilter = 'all' | 'active' | 'blocked';

function createMockUsers(): User[] {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  return [
    { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', password: '', phone: '+1 555-0101', status: 'active', createdAt: d(30), updatedAt: d(1) },
    { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', password: '', phone: '+1 555-0102', status: 'active', createdAt: d(25), updatedAt: d(2) },
    { id: 'u3', name: 'Carol White', email: 'carol@example.com', password: '', status: 'blocked', createdAt: d(20), updatedAt: d(5) },
    { id: 'u4', name: 'David Kim', email: 'david@example.com', password: '', phone: '+1 555-0104', status: 'active', createdAt: d(15), updatedAt: d(3) },
    { id: 'u5', name: 'Emma Davis', email: 'emma@example.com', password: '', status: 'active', createdAt: d(10), updatedAt: d(1) },
  ];
}

function userStatusToBadge(status: User['status']): StatusType {
  return status === 'blocked' ? 'blocked' : 'active';
}

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

export default function UserListScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      let data = await storage.get<User[]>(STORAGE_KEYS.USERS);
      if (!data || data.length === 0) {
        data = createMockUsers();
        await storage.set(STORAGE_KEYS.USERS, data);
      }
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(data);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = users;
    if (filter !== 'all') result = result.filter((u) => u.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return result;
  }, [users, filter, search]);

  return (
    <SafeAreaView style={styles.screen}>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or email…" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f.value }}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <DataList<User>
        data={filtered}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(admin)/users/${item.id}` as any)} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.meta}>Joined {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.cardRight}>
                <StatusBadge status={userStatusToBadge(item.status)} size="sm" />
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
              </View>
            </View>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        emptyMessage="No users found."
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  filterRow: { paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.sm, gap: theme.spacing.sm },
  chip: {
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  chipText: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary, fontWeight: theme.fontWeights.medium as any },
  chipTextActive: { color: theme.colors.background },
  listContent: { paddingBottom: theme.spacing['2xl'] },
  card: { marginHorizontal: theme.spacing.base, marginVertical: theme.spacing.xs },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold as any, color: theme.colors.primary },
  cardInfo: { flex: 1, gap: 2 },
  name: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  email: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary },
  meta: { fontSize: theme.fontSizes.xs, color: theme.colors.textLight },
  cardRight: { alignItems: 'flex-end', gap: theme.spacing.xs },
});
