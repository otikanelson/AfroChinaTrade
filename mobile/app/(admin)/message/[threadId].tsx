import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useMessages } from '../../../contexts/MessagesContext';
import { Header } from '../../../components/Header';
import { ChatBackground } from '../../../components/ChatBackground';
import { messageService } from '../../../services/MessageService';
import { Message, MessageThread } from '../../../types/message';

export default function AdminMessageThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const insets = useSafeAreaInsets();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { decrementUnreadCount, refreshUnreadCount } = useMessages();

  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!threadId) return;
    if (!silent) setLoading(true);
    try {
      const res = await messageService.getThreadMessages(threadId);
      if (res.success && res.data) {
        setThread(res.data.thread);
        setMessages(res.data.messages);
        const unread = res.data.messages.filter(m => !m.isRead && m.senderRole === 'customer');
        if (unread.length) {
          decrementUnreadCount(unread.length);
          unread.forEach(m => messageService.markAsRead(m._id).catch(() => {}));
          setTimeout(refreshUnreadCount, 600);
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, [threadId]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(useCallback(() => {
    load();
    pollRef.current = setInterval(() => load(true), 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]));

  // ─── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || sending || !thread) return;
    setSending(true);
    setText('');
    try {
      const res = await messageService.sendMessage({ threadId: thread.threadId, text: msg });
      if (res.success && res.data) setMessages(prev => [...prev, res.data!]);
    } catch {}
    finally { setSending(false); }
  };

  // ─── Render message ────────────────────────────────────────────────────────
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isAdmin = item.senderRole === 'admin';
    const showProduct = index === 0 && item.productImage && item.productName;
    const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={{ marginVertical: 3, paddingHorizontal: spacing.base }}>
        {showProduct && (
          <View style={[s.productBanner, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.md }]}>
            <Image source={{ uri: item.productImage }} style={[s.productImg, { borderRadius: borderRadius.sm }]} resizeMode="cover" />
            <Text style={[s.productText, { color: colors.text, fontSize: fontSizes.sm }]} numberOfLines={2}>{item.productName}</Text>
          </View>
        )}
        <View style={{ alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
          {!isAdmin && (
            <View style={[s.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={{ fontSize: fontSizes.xs, fontWeight: fontWeights.bold as any, color: colors.primary }}>
                {item.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[
            s.bubble,
            {
              backgroundColor: isAdmin ? colors.primary : colors.background,
              borderRadius: borderRadius.lg,
              borderBottomRightRadius: isAdmin ? 4 : borderRadius.lg,
              borderBottomLeftRadius: isAdmin ? borderRadius.lg : 4,
              maxWidth: '80%',
            }
          ]}>
            <Text style={{ color: isAdmin ? colors.textInverse : colors.text, fontSize: fontSizes.base, lineHeight: 20 }}>
              {item.text}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 2, marginHorizontal: 4 }}>{time}</Text>
        </View>
      </View>
    );
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    list: { flex: 1 },
    productBanner: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, marginBottom: spacing.xs, gap: spacing.sm },
    productImg: { width: 44, height: 44 },
    productText: { flex: 1, fontWeight: fontWeights.medium as any },
    avatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
    bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    inputRow: {
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
      paddingBottom: spacing.sm + insets.bottom,
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
      gap: spacing.xs,
    },
    input: {
      flex: 1, minHeight: 40, maxHeight: 120,
      backgroundColor: colors.surface,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: spacing.md, paddingVertical: 8,
      fontSize: fontSizes.base, color: colors.text,
      textAlignVertical: 'center',
    },
    sendBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

  if (loading) return (
    <View style={s.screen}>
      <Header title="Conversation" showBack />
      <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={thread?.customerName || 'Customer'} showBack />

      <View style={[s.list, { position: 'relative' }]}>
        <ChatBackground color="#8B0000" opacity={0.055} />
        {messages.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.base, marginTop: spacing.md }}>No messages yet</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m._id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}
      </View>

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[s.sendBtn, { opacity: text.trim() && !sending ? 1 : 0.45 }]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color={colors.textInverse} />
            : <Ionicons name="send" size={18} color={colors.textInverse} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
