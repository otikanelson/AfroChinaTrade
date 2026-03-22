import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/Header';
import { messageService } from '../services/MessageService';

export default function NewMessageScreen() {
  const router = useRouter();
  const { colors: themeColors, spacing: themeSpacing, fontSizes, fontWeights, borderRadius } = useTheme();

  const [messageType, setMessageType] = useState<'general' | 'quote_request'>('general');
  const [message, setMessage] = useState('');
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
  });

  const messageTypes = [
    {
      id: 'general' as const,
      icon: 'chatbubble-outline',
      title: 'General Support',
      description: 'Ask questions or get help',
    },
    {
      id: 'quote_request' as const,
      icon: 'document-text-outline',
      title: 'Request Quote',
      description: 'Get pricing for bulk orders',
    },
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      
      // For new general messages, we'll use a different approach
      // Generate a unique thread ID
      const threadId = `general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Creating new general message thread:', { threadId, messageType, messageLength: message.trim().length });
      
      // We need to find an admin user to send the message to
      // For now, let's use the sendMessage with a special flag or create a separate endpoint
      const response = await messageService.sendMessage({
        threadId,
        text: message.trim(),
        threadType: messageType,
        // We'll let the backend handle finding an admin user
      });

      console.log('New message response:', response);

      if (response.success) {
        Alert.alert(
          'Message Sent',
          'Your message has been sent successfully. Our support team will respond soon.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)/messages');
              },
            },
          ]
        );
      } else {
        console.error('Failed to send message:', response.error);
        Alert.alert('Error', response.error?.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const canSend = message.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <Header title="New Message" showBack={true} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Send a message to our support team. We'll respond as soon as possible to help you with your inquiry.
          </Text>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Message</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder={
              messageType === 'quote_request'
                ? 'Please describe the products you need, quantities, and any specific requirements...'
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
            <Text style={styles.sendButtonText}>Send Message</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}