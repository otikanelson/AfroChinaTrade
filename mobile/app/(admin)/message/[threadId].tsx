import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { messageService } from '../../../services/MessageService';
import { Message, MessageThread } from '../../../types/message';
import { useMessages } from '../../../contexts/MessagesContext';
import { theme } from '../../../theme';

// Helper function to format relative time
function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  // For older dates, show month and day
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}



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
  const { refreshUnreadCount } = useMessages();
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    try {
      const response = await messageService.getThreadMessages(threadId);
      
      if (response.success && response.data) {
        setThread(response.data.thread);
        setMessages(response.data.messages);
        
        // Mark messages as read
        const unreadMessages = response.data.messages.filter(
          (msg: Message) => !msg.isRead && msg.senderRole === 'customer'
        );
        
        for (const message of unreadMessages) {
          try {
            await messageService.markAsRead(message._id);
          } catch (error) {
            console.error('Error marking message as read:', error);
          }
        }
        
        // Refresh unread count after marking as read
        refreshUnreadCount();
      }
    } catch (error) {
      console.error('Error loading thread messages:', error);
    }
  }, [threadId, refreshUnreadCount]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !thread) return;
    setSending(true);
    
    try {
      const response = await messageService.sendMessage({
        threadId: thread.threadId,
        text,
      });
      
      if (response.success && response.data) {
        // Add the new message to the list
        setMessages(prev => [...prev, response.data!]);
        setInput('');
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        throw new Error(response.error?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // For now, just add the message locally as fallback
      const newMsg: Message = {
        _id: `msg-${Date.now()}`,
        threadId: thread.threadId,
        senderId: 'admin',
        senderName: 'Admin',
        senderRole: 'admin',
        text,
        createdAt: new Date().toISOString(),
        isRead: true,
      };
      setMessages(prev => [...prev, newMsg]);
      setInput('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  }, [input, thread]);

  if (!thread) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Loading conversation…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Bubble message={item} isAdmin={item.senderRole === 'admin'} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.threadHeader}>
            <Text style={styles.threadName}>{thread.customerName}</Text>
            <Text style={styles.threadSub}>Last active {formatRelativeTime(thread.lastMessageAt)}</Text>
            {thread.productName && (
              <Text style={styles.productInfo}>Product: {thread.productName}</Text>
            )}
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
    </View>
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
  productInfo: { fontSize: theme.fontSizes.xs, color: theme.colors.primary, marginTop: 4, fontStyle: 'italic' },
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
