import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useMessages } from '../../contexts/MessagesContext';
import { Header } from '../../components/Header';
import { ChatBackground } from '../../components/ChatBackground';
import { Toast } from '../../components/ui/Toast';
import { messageService } from '../../services/MessageService';
import { Message, MessageThread } from '../../types/message';

export default function MessageThreadScreen() {
  const {
    threadId, productImage, productName,
  } = useLocalSearchParams<{
    threadId: string; productImage?: string;
    productName?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const { decrementUnreadCount, refreshUnreadCount, markThreadAsRead } = useMessages();

  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!threadId) { setLoading(false); return; }
    
    // If it's a new thread that was just created, give it a moment to be available
    const isNewThread = threadId.includes('_') && threadId.split('_').length === 3;
    if (isNewThread && !silent) {
      // Small delay to ensure the thread was created on the backend
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!silent) setLoading(true);
    try {
      const res = await messageService.getThreadMessages(threadId);
      if (res.success && res.data) {
        setThread(res.data.thread);
        setMessages(res.data.messages);
        // mark unread
        const unread = res.data.messages.filter(m => !m.isRead && m.senderId !== user?.id);
        if (unread.length) {
          // Instantly update the thread badge in the messages list — no API call needed
          markThreadAsRead(threadId);
          unread.forEach(m => messageService.markAsRead(m._id).catch(() => {}));
        }
      }
    } catch (error) {
      console.error('Error loading thread:', error);
    }
    finally { setLoading(false); }
  }, [threadId, user?.id]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(useCallback(() => {
    load();
    pollRef.current = setInterval(() => load(true), 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]));

  // ─── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    setText('');
    try {
      const res = await messageService.sendMessage({ threadId, text: msg });
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data!]);
      } else {
        toast.error(res.error?.message || 'Failed to send');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  // ─── Render message ────────────────────────────────────────────────────────
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const mine = item.senderId === user?.id;
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
        <View style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
          <View style={[
            s.bubble,
            {
              backgroundColor: mine ? colors.primary : colors.background,
              borderRadius: borderRadius.lg,
              borderBottomRightRadius: mine ? 4 : borderRadius.lg,
              borderBottomLeftRadius: mine ? borderRadius.lg : 4,
              maxWidth: '80%',
            }
          ]}>
            <Text style={{ color: mine ? colors.textInverse : colors.text, fontSize: fontSizes.base, lineHeight: 20 }}>
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
    bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    inputRow: {
      flexDirection: 'row', 
      alignItems: 'flex-end',
      paddingHorizontal: spacing.sm, 
      paddingTop: spacing.sm,
      paddingBottom: Math.max(spacing.sm, insets.bottom),
      backgroundColor: colors.background,
      borderTopWidth: StyleSheet.hairlineWidth, 
      borderTopColor: colors.border,
      gap: spacing.xs,
      minHeight: 56,
    },
    input: {
      flex: 1, 
      minHeight: 40, 
      maxHeight: 120,
      backgroundColor: colors.surface,
      borderWidth: 1, 
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: spacing.md, 
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      fontSize: fontSizes.base, 
      color: colors.text,
      textAlignVertical: Platform.OS === 'android' ? 'top' : 'center',
      includeFontPadding: false,
    },
    sendBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: colors.textSecondary, fontSize: fontSizes.base, textAlign: 'center' },
  });

  if (loading) return (
    <View style={s.screen}>
      <Header title="Messages" showBack />
      <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>
    </View>
  );

  const title = user?.role === 'admin' ? (thread?.customerName || 'Customer') : 'AfroVendor';

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Header title={title} showBack />

      {/* Background pattern */}
      <View style={[s.list, { position: 'relative' }]}>
        <ChatBackground color="#8B0000" opacity={0.055} />
        {messages.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
            <Text style={[s.emptyText, { marginTop: spacing.md }]}>
              No messages yet
            </Text>
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

      {/* Input bar */}
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

      <Toast {...toast} />
    </KeyboardAvoidingView>
  );
}
