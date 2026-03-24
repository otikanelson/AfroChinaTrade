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
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
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

  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState(prefilledMessage || '');
  const [displayProductImage, setDisplayProductImage] = useState(productImage);
  const [displayProductName, setDisplayProductName] = useState(productName);
  const flatListRef = useRef<FlatList>(null);
  const isNewThread = isNewProductThread === 'true';

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
      paddingHorizontal: themeSpacing.base,
    },
    messageItem: {
      marginVertical: themeSpacing.xs,
      maxWidth: '80%',
    },
    myMessage: {
      alignSelf: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
    },
    messageBubble: {
      paddingHorizontal: themeSpacing.sm,
      paddingVertical: themeSpacing.xs,
      borderRadius: borderRadius.base,
    },
    myMessageBubble: {
      backgroundColor: themeColors.primary,
    },
    otherMessageBubble: {
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    messageText: {
      fontSize: fontSizes.base,
      lineHeight: 20,
    },
    myMessageText: {
      color: themeColors.textInverse,
    },
    otherMessageText: {
      color: themeColors.text,
    },
    messageInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: themeSpacing.xs,
      paddingHorizontal: themeSpacing.xs,
    },
    senderName: {
      fontSize: fontSizes.xs,
      color: themeColors.textSecondary,
      fontWeight: fontWeights.medium,
    },
    messageTime: {
      fontSize: fontSizes.xs,
      color: themeColors.textSecondary,
    },
    productPreview: {
      flexDirection: 'row',
      padding: themeSpacing.base,
      backgroundColor: themeColors.primaryLight,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      alignItems: 'center',
      gap: themeSpacing.sm,
    },
    productPreviewImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.sm,
    },
    productPreviewText: {
      flex: 1,
      fontSize: fontSizes.sm,
      color: themeColors.text,
      fontWeight: fontWeights.medium,
    },
    productInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: themeSpacing.sm,
      marginBottom: themeSpacing.sm,
      paddingBottom: themeSpacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.textSecondary + '30',
    },
    messageProductImage: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: themeSpacing.base,
      paddingBottom: Platform.OS === 'android' ? themeSpacing.base : themeSpacing.base,
      backgroundColor: themeColors.surface,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      alignItems: 'flex-end',
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
      maxHeight: 100,
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
    if (threadId && !isNewThread) {
      loadThread();
    } else if (isNewThread) {
      setLoading(false);
    }
  }, [threadId, isNewThread]);

  const loadThread = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await messageService.getThreadMessages(threadId);
      if (response.success) {
        setThread(response.data.thread);
        setMessages(response.data.messages);
        // Mark messages as read
        markMessagesAsRead(response.data.messages);
      } else {
        if (!showRefreshIndicator) {
          toast.error('Failed to load messages');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading thread:', error);
      if (!showRefreshIndicator) {
        toast.error('Failed to load messages');
        router.back();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadThread(true);
  };

  const markMessagesAsRead = async (messages: Message[]) => {
    const unreadMessages = messages.filter(
      msg => !msg.isRead && msg.senderId !== user?.id
    );
    
    for (const message of unreadMessages) {
      try {
        await messageService.markAsRead(message._id);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !threadId) return;

    try {
      setSending(true);
      console.log('Sending message to thread:', threadId, 'Message:', newMessage.trim());
      
      // If this is a new product thread, create it first
      if (isNewThread && productId) {
        const createResponse = await messageService.createProductThread(
          productId,
          newMessage.trim(),
          (threadType as 'product_inquiry' | 'quote_request') || 'product_inquiry'
        );
        
        console.log('Create product thread response:', createResponse);
        
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
          console.error('Failed to create thread:', createResponse.error);
          toast.error(createResponse.error?.message || 'Failed to start conversation');
          setSending(false);
          return;
        }
      }
      
      // Send message to existing thread
      const response = await messageService.sendMessage({
        threadId,
        text: newMessage.trim(),
        productImage: displayProductImage,
        productName: displayProductName,
      });

      console.log('Send message response:', response);

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        // Clear product preview after sending
        setDisplayProductImage(undefined);
        setDisplayProductName(undefined);
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        console.error('Failed to send message:', response.error);
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

  const getThreadTypeLabel = (type: string) => {
    switch (type) {
      case 'product_inquiry':
        return 'Product Inquiry';
      case 'quote_request':
        return 'Quote Request';
      default:
        return 'General Support';
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.id;
    
    return (
      <View style={[
        styles.messageItem,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {item.productImage && item.productName && (
            <View style={styles.productInfoContainer}>
              <Image
                source={{ uri: item.productImage }}
                style={styles.messageProductImage}
                resizeMode="cover"
              />
              <Text style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
                { fontWeight: fontWeights.semibold as any }
              ]}>
                {item.productName}
              </Text>
            </View>
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
            item.productImage && item.productName && { marginTop: themeSpacing.sm }
          ]}>
            {item.text}
          </Text>
        </View>
        <View style={styles.messageInfo}>
          <Text style={styles.senderName}>
            {isMyMessage ? 'You' : item.senderName}
          </Text>
          <Text style={styles.messageTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
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
    <View style={styles.container}>
      <Header 
        title={isNewThread ? 'New Message' : (user?.role === 'admin' ? (thread?.customerName || 'Customer') : 'Support')} 
        showBack={true} 
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
          contentContainerStyle={{ paddingVertical: themeSpacing.base }}
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
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />
      )}

      {displayProductImage && (
        <View style={styles.productPreview}>
          <Image
            source={{ uri: displayProductImage }}
            style={styles.productPreviewImage}
            resizeMode="cover"
          />
          <Text style={styles.productPreviewText}>
            {displayProductName || 'Product'}
          </Text>
        </View>
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
    </View>
  );
}