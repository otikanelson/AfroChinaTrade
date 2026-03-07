import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  Message,
  MessageThread,
  MESSAGE_THREADS_KEY,
  formatRelativeTime,
} from '../(tabs)/messages';
import { AsyncStorageAdapter } from '../../../../shared/src/services/storage/AsyncStorageAdapter';
import { theme } from '../../../theme';

const storage = new AsyncStorageAdapter();

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

interface BubbleProps {
  message: Message;
  isAdmin: boolean;
}

const Bubble: React.FC<BubbleProps> = ({ message, isAdmin }) => (
  <View style={[styles.bubbleRow, isAdmin && styles.bubbleRowAdmin]}>
    {!isAdmin && (
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{message.senderName.charAt(0).toUpperCase()}</Text>
      </View>
    )}
    <View style={[styles.bubble, isAdmin ? styles.bubbleAdmin : styles.bubbleCustomer]}>
      <Text style={[styles.bubbleText, isAdmin && styles.bubbleTextAdmin]}>{message.text}</Text>
      <Text style={[styles.bubbleTime, isAdmin && styles.bubbleTimeAdmin]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  </View>
);

export default function MessageThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    const threads = await storage.get<MessageThread[]>(MESSAGE_THREADS_KEY);
    const found = (threads ?? []).find((t) => t.id === threadId) ?? null;
    if (found) {
      setThread(found);
      setMessages(found.messages);
      // Mark all as read
      const updated = (threads ?? []).map((t) =>
        t.id === threadId
          ? { ...t, unreadCount: 0, messages: t.messages.map((m) => ({ ...m, isRead: true })) }
          : t,
      );
      await storage.set(MESSAGE_THREADS_KEY, updated);
    }
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !thread) return;
    setSending(true);
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      threadId: thread.id,
      senderId: 'admin',
      senderName: 'Admin',
      text,
      createdAt: new Date().toISOString(),
      isRead: true,
    };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const threads = (await storage.get<MessageThread[]>(MESSAGE_THREADS_KEY)) ?? [];
      const updated = threads.map((t) =>
        t.id === thread.id
          ? { ...t, messages: updatedMessages, lastMessage: text, lastMessageAt: newMsg.createdAt }
          : t,
      );
      await storage.set(MESSAGE_THREADS_KEY, updated);
    } finally {
      setSending(false);
    }
  }, [input, thread, messages]);

  if (!thread) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Loading conversation…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Bubble message={item} isAdmin={item.senderId === 'admin'} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.threadHeader}>
            <Text style={styles.threadName}>{thread.customerName}</Text>
            <Text style={styles.threadSub}>Last active {formatRelativeTime(thread.lastMessageAt)}</Text>
          </View>
        }
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
          placeholderTextColor={theme.colors.textLight}
          multiline
          maxLength={1000}
          returnKeyType="default"
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons name="send" size={20} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: theme.fontSizes.base, color: theme.colors.textSecondary },
  listContent: { padding: theme.spacing.base, paddingBottom: theme.spacing.md, gap: theme.spacing.sm },
  threadHeader: {
    alignItems: 'center', paddingVertical: theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
    marginBottom: theme.spacing.md,
  },
  threadName: { fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.semibold as any, color: theme.colors.text },
  threadSub: { fontSize: theme.fontSizes.xs, color: theme.colors.textLight, marginTop: 2 },
  // Bubbles
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm, marginBottom: theme.spacing.xs },
  bubbleRowAdmin: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.bold as any, color: theme.colors.primary },
  bubble: {
    maxWidth: '75%', borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    gap: 2,
  },
  bubbleCustomer: {
    backgroundColor: theme.colors.background,
    borderBottomLeftRadius: 2,
    ...theme.shadows.sm,
  },
  bubbleAdmin: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleText: { fontSize: theme.fontSizes.base, color: theme.colors.text, lineHeight: 20 },
  bubbleTextAdmin: { color: theme.colors.background },
  bubbleTime: { fontSize: 10, color: theme.colors.textLight, alignSelf: 'flex-end' },
  bubbleTimeAdmin: { color: 'rgba(255,255,255,0.7)' },
  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.sm,
    borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    borderWidth: 1.5, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.base, color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: theme.colors.borderLight },
});
