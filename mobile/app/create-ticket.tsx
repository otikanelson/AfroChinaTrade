import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';
import { tokenManager } from '../services/api/tokenManager';
import { Header } from '../components/Header';
import { spacing } from '../theme/spacing';
import TicketService, { CreateTicketData } from '../services/TicketService';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../types/ticket';

interface TicketFormData {
  subject: string;
  category: string;
  priority: string;
  description: string;
}

export default function CreateTicketScreen() {
  const router = useRouter();
  const { colors, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  const { showError, showSuccess } = useAlertContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    subject: '',
    category: 'other',
    priority: 'medium',
    description: '',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
      padding: spacing.base,
    },
    formGroup: {
      marginBottom: spacing.base,
    },
    label: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    pickerContainer: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.base,
    },
    pickerText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    pickerOptions: {
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    pickerOption: {
      padding: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerOptionText: {
      fontSize: fontSizes.base,
      color: colors.text,
    },
    selectedOption: {
      backgroundColor: colors.primaryLight,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.base,
      alignItems: 'center',
      marginTop: spacing.base,
    },
    submitButtonDisabled: {
      backgroundColor: colors.textLight,
    },
    submitButtonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
    },
    infoCard: {
      backgroundColor: colors.primaryLight,
      padding: spacing.base,
      borderRadius: borderRadius.md,
      marginBottom: spacing.base,
    },
    infoText: {
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: 20,
    },
  });

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        showError('Authentication required');
        return;
      }

      const ticketData: CreateTicketData = {
        subject: formData.subject.trim(),
        category: formData.category,
        priority: formData.priority,
        description: formData.description.trim(),
      };

      await TicketService.createTicket(token, ticketData);
      showSuccess('Support ticket created successfully!');
      router.replace('/my-tickets');
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      showError(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.subject.trim() && formData.description.trim();

  return (
    <View style={styles.container}>
      <Header 
        title="Create Support Ticket" 
        showBack={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Please provide detailed information about your issue. Our support team will review your ticket and respond as soon as possible.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            value={formData.subject}
            onChangeText={(value) => handleInputChange('subject', value)}
            placeholder="Brief description of your issue"
            placeholderTextColor={colors.textLight}
            maxLength={200}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.pickerText}>
                {TICKET_CATEGORIES.find(c => c.value === formData.category)?.label}
              </Text>
              <Ionicons 
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {TICKET_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.pickerOption,
                      formData.category === category.value && styles.selectedOption
                    ]}
                    onPress={() => {
                      handleInputChange('category', category.value);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{category.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowPriorityPicker(!showPriorityPicker)}
            >
              <Text style={styles.pickerText}>
                {TICKET_PRIORITIES.find(p => p.value === formData.priority)?.label}
              </Text>
              <Ionicons 
                name={showPriorityPicker ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
            {showPriorityPicker && (
              <View style={styles.pickerOptions}>
                {TICKET_PRIORITIES.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.pickerOption,
                      formData.priority === priority.value && styles.selectedOption
                    ]}
                    onPress={() => {
                      handleInputChange('priority', priority.value);
                      setShowPriorityPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{priority.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Please provide detailed information about your issue..."
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={2000}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid || loading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitButtonText}>Create Ticket</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}