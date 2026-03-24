import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { UserProfile } from '../../../services/UserService';
import { userService } from '../../../services/UserService';
import { Card } from '../../../components/admin/Card';
import { DataList } from '../../../components/admin/DataList';
import { StatusBadge, StatusType } from '../../../components/admin/StatusBadge';
import { SearchBar } from '../../../components/admin/SearchBar';
import { Header } from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';

type StatusFilter = 'all' | 'active' | 'suspended' | 'blocked';



function userStatusToBadge(status: UserProfile['status']): StatusType {
  switch (status) {
    case 'active': return 'active';
    case 'suspended': return 'pending';
    case 'blocked': return 'blocked';
    default: return 'active';
  }
}

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'blocked', label: 'Blocked' },
];

export default function UserListScreen() {
  const router = useRouter();
  const { colors, spacing, borderRadius, fontSizes, fontWeights } = useTheme();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    filterRow: { flexDirection: 'row', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm },
    chip: {
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
      borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
    chipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: fontWeights.medium as any },
    chipTextActive: { color: colors.background },
    listContent: { paddingBottom: spacing['2xl'] },
    card: { marginHorizontal: spacing.base, marginVertical: spacing.xs },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    avatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.primary + '20',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.primary },
    cardInfo: { flex: 1, gap: 2 },
    name: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold as any, color: colors.text },
    email: { fontSize: fontSizes.sm, color: colors.textSecondary },
    meta: { fontSize: fontSizes.xs, color: colors.textLight },
    cardRight: { alignItems: 'flex-end', gap: spacing.xs },
  });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const response = await userService.getUsers({
        page: 1,
        limit: 100, // Get all users for now
      });
      
      if (response.success && response.data) {
        setUsers(response.data.users || []);
      } else {
        throw new Error(response.error?.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // For now, just set empty array on error
      setUsers([]);
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const usersArray = Array.isArray(users) ? users : [];
    let result = usersArray;
    if (filter !== 'all') result = result.filter((u) => u.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return result;
  }, [users, filter, search]);

  return (
    <View style={styles.screen}>
      <Header 
        title="User Management"
        subtitle="Manage customer accounts"
      />
      
      <SearchBar style={{margin: 10}} value={search} onChangeText={setSearch} placeholder="Search by name or email…" />

      <View style={styles.filterRow}>
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
      </View>

      <DataList<UserProfile>
        data={filtered}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(admin)/users/${item._id}` as any)} style={styles.card}>
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
                <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
              </View>
            </View>
          </Card>
        )}
        keyExtractor={(item) => item._id}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        emptyMessage="No users found."
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}