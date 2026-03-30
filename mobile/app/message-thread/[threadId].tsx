import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useMessages } from '../../contexts/MessagesContext';
import { Header } from '../../components/Header';
import { Toast } from '../../components/ui/Toast';
import { messageService } from '../../services/MessageService';
import { Message, MessageThread } from '../../types/message';

export default function MessageThreadScreen() {
  const { threadId, prefilledMessage, productImage, productName, productId, threadType, isNewProductThread } = useLocalSearchParams<{ 
    threadId: string
    prefilledMessage?: string
    productImage?: string
    productName?: string
    productId?: string
    threadType?: 'product_inquiry' | 'quote_request';
    isNewProductThread?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const { decrementUnreadCount, refreshUnreadCount } = useMessages();

  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState(prefilledMessage || '');
  const [displayProductImage, setDisplayProductImage] = useState(productImage);
  const [displayProductName, setDisplayProductName] = useState(productName);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isNewThread = isNewProductThread === 'true' || threadId.startsWith('temp_');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    threadInfo: {
      padding: themeSpacing.base,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    threadTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
      marginBottom: themeSpacing.xs,
    },
    threadMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeSpacing.sm,
    },
    threadType: {
      fontSize: fontSizes.xs,
      color: themeColors.primary,
      backgroundColor: themeColors.primaryLight,
      paddingHorizontal: themeSpacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    productName: {
      fontSize: fontSizes.xs,
      color: themeColors.textSecondary,
      fontStyle: 'italic',
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.sm,
      marginTop: themeSpacing.sm,
    },
    messagesContainer: {
      flex: 1,
    },
    messageItem: {
      marginVertical: 4,
      maxWidth: '85%',
      paddingHorizontal: themeSpacing.base,
    },
    myMessage: {
      alignSelf: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.primaryLight,
      padding: themeSpacing.sm,
      borderRadius: borderRadius.base,
      marginBottom: themeSpacing.xs,
      gap: themeSpacing.sm,
    },
    productHeaderImage: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
    },
    productHeaderText: {
      flex: 1,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: themeColors.text,
    },
    messageBubble: {
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.lg,
      marginBottom: 2,
      flexShrink: 1,
    },
    myMessageBubble: {
      backgroundColor: themeColors.primary,
      borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: fontSizes.base,
      lineHeight: 20,
      flexWrap: 'wrap',
    },
    myMessageText: {
      color: themeColors.textInverse,
    },
    otherMessageText: {
      color: themeColors.text,
    },
    messageTime: {
      fontSize: fontSizes.xs,
      color: themeColors.textSecondary,
      marginTop: 2,
    },
    myMessageTime: {
      textAlign: 'right',
    },
    otherMessageTime: {
      textAlign: 'left',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: themeSpacing.base,
      paddingBottom: Platform.OS === 'android' ? themeSpacing.base + insets.bottom : themeSpacing.base + insets.bottom,
      backgroundColor: themeColors.surface,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      alignItems: 'flex-end',
      minHeight: 60,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: borderRadius.base,
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: themeSpacing.xs,
      fontSize: fontSizes.base,
      color: themeColors.text,
      backgroundColor: themeColors.background,
      maxHeight: 120,
      textAlignVertical: 'top',
    },
    sendButton: {
      marginLeft: themeSpacing.sm,
      padding: themeSpacing.sm,
      backgroundColor: themeColors.primary,
      borderRadius: borderRadius.base,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: themeColors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: themeSpacing.xl,
    },
    emptyText: {
      fontSize: fontSizes.base,
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginTop: themeSpacing.base,
    },
  });

  useEffect(() => {
    if (threadId && !isNewThread && !threadId.startsWith('temp_')) {
      loadThread(false, 0);
      // Auto-refresh will be started after messages are loaded
    } else if (isNewThread || threadId.startsWith('temp_')) {
      setLoading(false);
    }

    // Cleanup auto-refresh on unmount
    return () => {
      stopAutoRefresh();
    };
  }, [threadId, isNewThread]);

  const startAutoRefresh = () => {
    // Clear any existing interval first
    stopAutoRefresh();
    
    // Don't start auto-refresh for new threads or empty threads
    if (isNewThread || threadId.startsWith('temp_') || messages.length === 0) {
      return;
    }
    
    // Don't start if already active
    if (isAutoRefreshActive) {
      return;
    }
    
    // Set up auto-refresh every 30 seconds (reduced from 10 seconds)
    const interval = setInterval(() => {
      if (!refreshing && !sending && !loading) {
        loadThread(false, 0, true); // Silent refresh
      }
    }, 30000); // Changed from 10000 to 30000
    
    setAutoRefreshInterval(interval);
    setIsAutoRefreshActive(true);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
    setIsAutoRefreshActive(false);
  };

  // Mark messages as read when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (messages.length > 0) {
        markMessagesAsRead(messages);
      }
      // Resume auto-refresh when screen is focused (only if there are messages)
      if (threadId && !isNewThread && !threadId.startsWith('temp_') && messages.length > 0) {
        startAutoRefresh();
      }
      
      // Pause auto-refresh when screen loses focus
      return () => {
        stopAutoRefresh();
      };
    }, [threadId, isNewThread, messages.length]) // Added messages.length to dependency array
  );

  const loadThread = async (showRefreshIndicator = false, retryCount = 0, silentRefresh = false) => {
    if (!threadId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else if (!silentRefresh) {
        setLoading(true);
      }
      
      const response = await messageService.getThreadMessages(threadId);
      if (response.success && response.data) {
        setThread(response.data.thread);
        
        // Only update messages if there are new ones (to prevent unnecessary re-renders)
        const newMessages = response.data.messages;
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
          // Mark new messages as read
          markMessagesAsRead(newMessages);
          
          // Auto-scroll to bottom if there are new messages
          if (newMessages.length > messages.length) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
          
          // Start auto-refresh after messages are loaded (only for initial load)
          if (!silentRefresh && !showRefreshIndicator && newMessages.length > 0 && !isAutoRefreshActive) {
            setTimeout(() => {
              startAutoRefresh();
            }, 1000);
          }
        }
      } else {
        // If this is a newly created thread, retry a few times
        if (retryCount < 3 && !showRefreshIndicator && !silentRefresh) {
          setTimeout(() => {
            loadThread(false, retryCount + 1);
          }, 1000);
          return;
        }
        
        if (!showRefreshIndicator && !silentRefresh) {
          toast.error('Failed to load messages');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading thread:', error);
      
      // If this is a newly created thread, retry a few times
      if (retryCount < 3 && !showRefreshIndicator && !silentRefresh) {
        setTimeout(() => {
          loadThread(false, retryCount + 1);
        }, 1000);
        return;
      }
      
      if (!showRefreshIndicator && !silentRefresh) {
        toast.error('Failed to load messages');
        router.back();
      }
    } finally {
      if (!silentRefresh) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadThread(true, 0);
  };

  const markMessagesAsRead = async (messages: Message[]) => {
    const unreadMessages = messages.filter(
      msg => !msg.isRead && msg.senderId !== user?.id
    );
    
    if (unreadMessages.length > 0) {
      // Immediately decrement the unread count for instant UI feedback
      decrementUnreadCount(unreadMessages.length);
      
      // Then mark messages as read on the server
      for (const message of unreadMessages) {
        try {
          await messageService.markAsRead(message._id);
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
      
      // Refresh the global unread count to ensure consistency
      setTimeout(() => {
        refreshUnreadCount();
      }, 500);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !threadId) return;

    try {
      setSending(true);
      
      // If this is a new product thread, create it first
      if ((isNewThread && productId) || threadId.startsWith('temp_')) {
        if (!productId) {
          toast.error('Product information is missing');
          setSending(false);
          return;
        }
        
        const createResponse = await messageService.createProductThread(
          productId,
          newMessage.trim(),
          (threadType as 'product_inquiry' | 'quote_request') || 'product_inquiry'
        );
        
        if (createResponse.success && createResponse.data) {
          // Thread created successfully, navigate to the real thread
          router.replace({
            pathname: `/message-thread/${createResponse.data.thread.threadId}`,
            params: {
              productImage: displayProductImage || '',
              productName: displayProductName || ''
            }
          });
          return;
        } else {
          toast.error(createResponse.error?.message || 'Failed to start conversation');
          setSending(false);
          return;
        }
      }
      
      // Send message to existing thread
      const response = await messageService.sendMessage({
        threadId,
        text: newMessage.trim(),
        // Only include product info for the very first message in new threads
        productImage: messages.length === 0 ? displayProductImage : undefined,
        productName: messages.length === 0 ? displayProductName : undefined,
      });

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        setNewMessage('');
        // Clear product preview after first message
        if (messages.length === 0) {
          setDisplayProductImage(undefined);
          setDisplayProductName(undefined);
        }
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        toast.error(response.error?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === user?.id;
    const showProductInfo = index === 0 && item.productImage && item.productName;
    
    return (
      <View style={[
        styles.messageItem,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {showProductInfo && (
          <View style={styles.productHeader}>
            <Image
              source={{ uri: item.productImage }}
              style={styles.productHeaderImage}
              resizeMode="cover"
            />
            <Text style={styles.productHeaderText} numberOfLines={2}>
              {item.productName}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isMyMessage ? styles.myMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Messages" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </View>
    );
  }

  if (!thread && !isNewThread) {
    return (
      <View style={styles.container}>
        <Header title="Messages" showBack={true} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Thread not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Header 
        title={isNewThread ? 'New Message' : (user?.role === 'admin' ? (thread?.customerName || 'Customer') : 'AfroVendor')} 
        showBack={true}
        rightAction={
          isAutoRefreshActive ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ 
                width: 6, 
                height: 6, 
                borderRadius: 3, 
                backgroundColor: themeColors.success || '#4CAF50' 
              }} />
              <Text style={{ 
                fontSize: fontSizes.xs, 
                color: themeColors.textSecondary 
              }}>Live</Text>
            </View>
          ) : undefined
        }
      />
      
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isNewThread ? 'Start the conversation!' : 'No messages yet.\nStart the conversation!'}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesContainer}
          contentContainerStyle={{ 
            paddingTop: themeSpacing.sm,
            paddingBottom: themeSpacing.sm,
            flexGrow: 1
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
            />
          }
          onContentSizeChange={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          onLayout={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={themeColors.textSecondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={themeColors.textInverse} />
          ) : (
            <Ionicons name="send" size={20} color={themeColors.textInverse} />
          )}
        </TouchableOpacity>
      </View>

      {/* Toast Component */}
      <Toast {...toast} />
    </KeyboardAvoidingView>
  );
}