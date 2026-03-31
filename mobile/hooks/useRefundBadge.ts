import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refundService } from '../services/RefundService';

const TAB_SEEN_KEY = '@refund_badge:tab_seen_ids';
const MANAGE_SEEN_KEY = '@refund_badge:manage_seen_ids';

async function getSeenIds(key: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

async function saveSeenIds(key: string, ids: Set<string>) {
  await AsyncStorage.setItem(key, JSON.stringify([...ids]));
}

// Returns count of pending refunds not yet seen at the given level
async function countUnseen(key: string): Promise<{ count: number; ids: string[] }> {
  const response = await refundService.getRefunds({ page: 1, limit: 100, status: 'pending' });
  const pending = response.success && response.data ? response.data : [];
  const ids = pending.map(r => r.id);
  const seen = await getSeenIds(key);
  const unseen = ids.filter(id => !seen.has(id));
  return { count: unseen.length, ids };
}

// ── Tab-level badge ──────────────────────────────────────────────────────────
// Shows count of pending refunds not yet seen at tab level.
// Call markTabSeen() when the finance tab comes into focus.
export function useTabRefundBadge() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const { count } = await countUnseen(TAB_SEEN_KEY);
    setCount(count);
  }, []);

  const markTabSeen = useCallback(async () => {
    // Fetch all current pending IDs and mark them seen at tab level
    const response = await refundService.getRefunds({ page: 1, limit: 100, status: 'pending' });
    const pending = response.success && response.data ? response.data : [];
    const ids = pending.map(r => r.id);
    const seen = await getSeenIds(TAB_SEEN_KEY);
    ids.forEach(id => seen.add(id));
    await saveSeenIds(TAB_SEEN_KEY, seen);
    setCount(0);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { tabBadgeCount: count, markTabSeen, refreshTabBadge: refresh };
}

// ── Manage-level badge ───────────────────────────────────────────────────────
// Shows count of pending refunds seen at tab level but not yet seen at manage level.
// Call markManageSeen() when the refunds management screen mounts.
export function useManageRefundBadge() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const response = await refundService.getRefunds({ page: 1, limit: 100, status: 'pending' });
    const pending = response.success && response.data ? response.data : [];
    const ids = pending.map(r => r.id);
    const tabSeen = await getSeenIds(TAB_SEEN_KEY);
    const manageSeen = await getSeenIds(MANAGE_SEEN_KEY);
    // Count IDs that were seen at tab level but not yet at manage level
    const unseenAtManage = ids.filter(id => tabSeen.has(id) && !manageSeen.has(id));
    setCount(unseenAtManage.length);
  }, []);

  const markManageSeen = useCallback(async () => {
    const response = await refundService.getRefunds({ page: 1, limit: 100, status: 'pending' });
    const pending = response.success && response.data ? response.data : [];
    const ids = pending.map(r => r.id);
    const seen = await getSeenIds(MANAGE_SEEN_KEY);
    ids.forEach(id => seen.add(id));
    await saveSeenIds(MANAGE_SEEN_KEY, seen);
    setCount(0);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { manageBadgeCount: count, markManageSeen, refreshManageBadge: refresh };
}
