import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { messageService } from '../../../services/MessageService';
import { Message, MessageThread } from '../../../types/message';
import { useMessages } from '../../../contexts/MessagesContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Header } from '../../../components/Header';

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

export default function MessageThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(false);
  const { refreshUnreadCount, decrementUnreadCount } = useMessages();
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } = useTheme();
  const listRef = useRef<FlatList>(null);

  interface BubbleProps {
    message: Message;
    isAdmin: boolean;
    showProductInfo?: boolean;
  }

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: fontSizes.base, color: colors.textSecondary },
    listContent: { 
      padding: spacing.base, 
      paddingBottom: spacing.md, 
      flexGrow: 1 
    },
    // Message container
    messageContainer: {
      marginVertical: 4,
      maxWidth: '85%',
      alignSelf: 'flex-start',
    },
    messageContainerAdmin: {
      alignSelf: 'flex-end',
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    productHeaderImage: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
    },
    productHeaderText: {
      flex: 1,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium as any,
      color: colors.text,
    },
    // Bubbles
    bubbleRow: { 
      flexDirection: 'row', 
      alignItems: 'flex-end', 
      gap: spacing.sm, 
      marginBottom: 2,
    },
    bubbleRowAdmin: { flexDirection: 'row-reverse' },
    avatar: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.primaryLight,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    avatarText: { 
      fontSize: fontSizes.sm, 
      fontWeight: fontWeights.bold as any, 
      color: colors.primary 
    },
    bubble: {
      maxWidth: '75%', 
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md, 
      paddingVertical: spacing.sm,
      flexShrink: 1,
    },
    bubbleCustomer: {
      backgroundColor: colors.background,
      borderBottomLeftRadius: 4,
      ...shadows.sm,
    },
    bubbleAdmin: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleText: { 
      fontSize: fontSizes.base, 
      color: colors.text, 
      lineHeight: 20,
      flexWrap: 'wrap',
    },
    bubbleTextAdmin: { color: colors.textInverse },
    messageTime: { 
      fontSize: fontSizes.xs, 
      color: colors.textSecondary, 
      marginTop: 2,
      textAlign: 'left',
    },
    messageTimeAdmin: { 
      textAlign: 'right',
    },
    // Input bar
    inputBar: {
      flexDirection: 'row', 
      alignItems: 'flex-end', 
      gap: spacing.sm,
      paddingHorizontal: spacing.base, 
      paddingVertical: spacing.sm,
      borderTopWidth: 1, 
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1, 
      minHeight: 44, 
      maxHeight: 120,
      borderWidth: 1.5, 
      borderColor: colors.border,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.md, 
      paddingVertical: spacing.sm,
      fontSize: fontSizes.base, 
      color: colors.text,
      backgroundColor: colors.surface,
      textAlignVertical: 'top',
    },
    sendBtn: {
      width: 44, 
      height: 44, 
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center', 
      justifyContent: 'center',
    },
    sendBtnDisabled: { backgroundColor: colors.textSecondary },
  });

  const Bubble: React.FC<BubbleProps> = ({ message, isAdmin, showProductInfo }) => (
    <View style={[styles.messageContainer, isAdmin && styles.messageContainerAdmin]}>
      {showProductInfo && message.productImage && message.productName && (
        <View style={styles.productHeader}>
          <Image
            source={{ uri: message.productImage }}
            style={styles.productHeaderImage}
            resizeMode="cover"
          />
          <Text style={styles.productHeaderText} numberOfLines={2}>
            {message.productName}
          </Text>
        </View>
      )}
      <View style={[styles.bubbleRow, isAdmin && styles.bubbleRowAdmin]}>
        {!isAdmin && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{message.senderName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.bubble, isAdmin ? styles.bubbleAdmin : styles.bubbleCustomer]}>
          <Text style={[styles.bubbleText, isAdmin && styles.bubbleTextAdmin]}>{message.text}</Text>
        </View>
      </View>
      <Text style={[styles.messageTime, isAdmin && styles.messageTimeAdmin]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );

  const load = useCallback(async (silentRefresh = false) => {
    try {
      const response = await messageService.getThreadMessages(threadId);
      
      if (response.success && response.data) {
        setThread(response.data.thread);
        
        // Only update messages if there are new ones (to prevent unnecessary re-renders)
        const newMessages = response.data.messages;
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
          setHasMarkedAsRead(false); // Reset flag when new messages are loaded
          
          // Mark messages as read
          const unreadMessages = newMessages.filter(
            (msg: Message) => !msg.isRead && msg.senderRole === 'customer'
          );
          
          if (unreadMessages.length > 0) {
            // Immediately decrement the unread count for instant UI feedback
            decrementUnreadCount(unreadMessages.length);
            
            // Then mark messages as read on the server
            for (const message of unreadMessages) {
              try {
                await messageService.markAsRead(message._id);
              } catch (error) {
                // Silently handle error
              }
            }
            
            // Refresh unread count after marking as read (for sync)
            setTimeout(() => {
              refreshUnreadCount();
            }, 500);
          }
          
          // Auto-scroll to bottom if there are new messages
          if (newMessages.length > messages.length) {
            setTimeout(() => {
              listRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      }
    } catch (error) {
      // Silently handle error
    }
  }, [threadId, refreshUnreadCount, decrementUnreadCount, messages]);

  const startAutoRefresh = useCallback(() => {
    // Clear any existing interval
    stopAutoRefresh();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!sending) {
        load(true); // Silent refresh
      }
    }, 30000);
    
    setAutoRefreshInterval(interval);
    setIsAutoRefreshActive(true);
  }, [load, sending]);

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
    setIsAutoRefreshActive(false);
  }, [autoRefreshInterval]);

  useEffect(() => {
    load();
    // Start auto-refresh
    startAutoRefresh();
    
    // Cleanup auto-refresh on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [load, startAutoRefresh, stopAutoRefresh]);

  // Mark messages as read when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (messages.length > 0 && !hasMarkedAsRead) {
        const unreadMessages = messages.filter(
          (msg: Message) => !msg.isRead && msg.senderRole === 'customer'
        );
        
        if (unreadMessages.length > 0) {
          setHasMarkedAsRead(true);
          // Immediately decrement the unread count for instant UI feedback
          decrementUnreadCount(unreadMessages.length);
          
          // Then mark messages as read on the server
          unreadMessages.forEach(async (message) => {
            try {
              await messageService.markAsRead(message._id);
            } catch (error) {
              // Silently handle error
            }
          });
          
          // Refresh the global unread count to ensure consistency
          setTimeout(() => {
            refreshUnreadCount();
          }, 500);
        }
      }
      
      // Resume auto-refresh when screen is focused
      startAutoRefresh();
      
      // Pause auto-refresh when screen loses focus
      return () => {
        stopAutoRefresh();
      };
    }, [messages, hasMarkedAsRead, decrementUnreadCount, startAutoRefresh, stopAutoRefresh])
  );

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
    <KeyboardAvoidingView 
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Header 
        title={thread?.customerName || 'Customer'} 
        showBack={true}
        rightAction={
          isAutoRefreshActive ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ 
                width: 6, 
                height: 6, 
                borderRadius: 3, 
                backgroundColor: colors.success || '#4CAF50' 
              }} />
              <Text style={{ 
                fontSize: fontSizes.xs, 
                color: colors.textSecondary 
              }}>Live</Text>
            </View>
          ) : undefined
        }
      />
      
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <Bubble 
            message={item} 
            isAdmin={item.senderRole === 'admin'} 
            showProductInfo={index === 0}
          />
        )}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => {
          setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        onLayout={() => {
          setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
          placeholderTextColor={colors.textSecondary}
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
          <Ionicons name="send" size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
