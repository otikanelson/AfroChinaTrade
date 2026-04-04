import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { Header } from '../components/Header';
import { Toast } from '../components/ui/Toast';
import { messageService } from '../services/MessageService';
import { NavigationSource } from '../types/navigation';

export default function NewMessageScreen() {
  const router = useRouter();
  const { 
    productId, 
    productName, 
    productImage, 
    prefilledMessage, 
    threadType, 
    isProductMessage 
  } = useLocalSearchParams<{
    productId?: string;
    productName?: string;
    productImage?: string;
    prefilledMessage?: string;
    threadType?: string;
    isProductMessage?: string;
  }>();
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const toast = useToast();

  const [messageType, setMessageType] = useState<'inquiry' | 'quotation'>(
    threadType === 'quote_request' ? 'quotation' : 'inquiry'
  );
  const [message, setMessage] = useState(prefilledMessage || '');
  const [sending, setSending] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    content: {
      flex: 1,
      padding: themeSpacing.base,
    },
    section: {
      marginBottom: themeSpacing.lg,
    },
    sectionTitle: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
      marginBottom: themeSpacing.sm,
    },
    typeContainer: {
      flexDirection: 'row',
      gap: themeSpacing.sm,
    },
    typeButton: {
      flex: 1,
      padding: themeSpacing.sm,
      borderRadius: borderRadius.base,
      borderWidth: 1,
      borderColor: themeColors.border,
      backgroundColor: themeColors.surface,
      alignItems: 'center',
    },
    typeButtonActive: {
      borderColor: themeColors.primary,
      backgroundColor: themeColors.primaryLight,
    },
    typeButtonText: {
      fontSize: fontSizes.sm,
      color: themeColors.text,
      fontWeight: fontWeights.medium,
      marginTop: themeSpacing.xs,
    },
    typeButtonTextActive: {
      color: themeColors.textInverse,
    },
    messageInput: {
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: borderRadius.base,
      padding: themeSpacing.sm,
      fontSize: fontSizes.base,
      color: themeColors.text,
      backgroundColor: themeColors.surface,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    characterCount: {
      fontSize: fontSizes.xs,
      color: themeColors.textSecondary,
      textAlign: 'right',
      marginTop: themeSpacing.xs,
    },
    sendButton: {
      backgroundColor: themeColors.primary,
      padding: themeSpacing.sm,
      borderRadius: borderRadius.base,
      alignItems: 'center',
      marginTop: themeSpacing.base,
    },
    sendButtonDisabled: {
      backgroundColor: themeColors.textSecondary,
    },
    sendButtonText: {
      color: themeColors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
    },
    infoBox: {
      backgroundColor: themeColors.primaryLight,
      padding: themeSpacing.md,
      borderRadius: borderRadius.base,
      marginBottom: themeSpacing.base,
    },
    infoText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
      lineHeight: 20,
    },
    taggedProductContainer: {
      backgroundColor: themeColors.surface,
      borderRadius: borderRadius.base,
      padding: themeSpacing.sm,
      marginBottom: themeSpacing.base,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.primary,
    },
    productImage: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.base,
      marginRight: themeSpacing.sm,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: themeColors.text,
    },
    removeTagButton: {
      padding: themeSpacing.xs,
    },
    tagProductButton: {
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.primary,
      borderStyle: 'dashed',
      borderRadius: borderRadius.base,
      padding: themeSpacing.base,
      alignItems: 'center',
      marginBottom: themeSpacing.base,
    },
    tagProductText: {
      fontSize: fontSizes.sm,
      color: themeColors.primary,
      fontWeight: fontWeights.medium,
      marginTop: themeSpacing.xs,
    },
  });

  const messageTypes = [
    {
      id: 'inquiry' as const,
      icon: 'help-circle-outline',
      title: 'Inquiry',
      description: 'Ask questions or get information',
    },
    {
      id: 'quotation' as const,
      icon: 'document-text-outline',
      title: 'Quotation',
      description: 'Request pricing for bulk orders',
    },
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      
      // Generate a unique thread ID based on message type
      const threadId = `${messageType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      console.log('Creating new message thread:', { 
        threadId, 
        messageType, 
        messageLength: message.trim().length,
        hasProduct: !!productId 
      });

      // Send message with product info if available
      const response = await messageService.sendMessage({
        threadId,
        text: message.trim(),
        threadType: messageType === 'inquiry' ? 'product_inquiry' : 'quote_request',
        productId: productId || undefined,
        productName: productName || undefined,
        productImage: productImage || undefined,
      });

      console.log('New message response:', response);

      if (response.success) {
        toast.success('Message sent successfully!');
        
        // Navigate to the chat conversation instead of messages list
        setTimeout(() => {
          router.replace({
            pathname: `/message-thread/${threadId}`,
            params: {
              productImage: productImage || '',
              productName: productName || '',
              productId: productId || '',
              threadType: messageType === 'inquiry' ? 'product_inquiry' : 'quote_request',
            }
          });
        }, 800);
      } else {
        console.error('Failed to send message:', response.error);
        toast.error(response.error?.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTagProduct = () => {
    router.push({
      pathname: '/products',
      params: {
        source: NavigationSource.MESSAGE_TAGGING,
        collectionType: 'all',
        title: 'Select Product to Tag',
        returnTo: '/new-message',
        messageType: messageType,
      }
    });
  };

  const handleRemoveTag = () => {
    router.setParams({
      productId: undefined,
      productName: undefined,
      productImage: undefined,
    });
  };

  const canSend = message.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <Header 
        title={isProductMessage === 'true' ? 'Contact Supplier' : 'New Message'} 
        showBack={true} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {messageType === 'inquiry' 
              ? 'Send an inquiry to get information about products or services. Our support team will respond as soon as possible.'
              : 'Request a quotation for bulk orders or custom pricing. Include details about quantities and specific requirements.'
            }
          </Text>
        </View>

        {isProductMessage !== 'true' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message Type</Text>
            <View style={styles.typeContainer}>
              {messageTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    messageType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setMessageType(type.id)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={messageType === type.id ? themeColors.primary : themeColors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      messageType === type.id && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tagged Product Display */}
        {productId && productName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tagged Product</Text>
            <View style={styles.taggedProductContainer}>
              {productImage && (
                <Image
                  source={{ uri: productImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {productName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeTagButton}
                onPress={handleRemoveTag}
              >
                <Ionicons name="close-circle" size={24} color={themeColors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tag Product Button */}
        {!productId && isProductMessage !== 'true' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tag a Product (Optional)</Text>
            <TouchableOpacity
              style={styles.tagProductButton}
              onPress={handleTagProduct}
            >
              <Ionicons name="pricetag-outline" size={24} color={themeColors.primary} />
              <Text style={styles.tagProductText}>
                Select a product to tag in your {messageType}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Message</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder={
              messageType === 'quotation'
                ? productId 
                  ? `I'm interested in getting a quote for ${productName}. Please provide pricing details and availability information...`
                  : 'Please describe the products you need, quantities, and any specific requirements...'
                : productId
                  ? `I have a question about ${productName}. Can you help me with more information?`
                  : 'How can we help you today?'
            }
            placeholderTextColor={themeColors.textSecondary}
            multiline
            maxLength={1000}
          />
          <Text style={styles.characterCount}>
            {message.length}/1000 characters
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!canSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color={themeColors.textInverse} />
          ) : (
            <Text style={styles.sendButtonText}>Send & Open Chat</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Toast Component */}
      <Toast {...toast} />
    </View>
  );
}