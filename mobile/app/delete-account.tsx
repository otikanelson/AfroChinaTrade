import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/UserService';
import { Header } from '../components/Header';
import { Toast } from '../components/ui/Toast';

const DELETION_REASONS = [
  'Not using the app anymore',
  'Privacy concerns',
  'Found a better alternative',
  'Too many notifications',
  'Difficult to use',
  'Other',
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { colors, fontSizes, fonts, spacing } = useTheme();
  const { logout } = useAuth();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    console.log('🔍 Delete Account: handleDeleteAccount called');
    
    if (!password.trim()) {
      console.log('❌ Delete Account: Password validation failed');
      toast.error('Password is required');
      console.log('🍞 Delete Account: After toast.error, toast state:', {
        visible: toast.visible,
        message: toast.message,
        type: toast.type,
      });
      return;
    }

    if (!selectedReason) {
      console.log('❌ Delete Account: Reason validation failed');
      toast.error('Please select a reason for deletion');
      console.log('🍞 Delete Account: After toast.error, toast state:', {
        visible: toast.visible,
        message: toast.message,
        type: toast.type,
      });
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      console.log('❌ Delete Account: Custom reason validation failed');
      toast.error('Please provide a reason');
      console.log('🍞 Delete Account: After toast.error, toast state:', {
        visible: toast.visible,
        message: toast.message,
        type: toast.type,
      });
      return;
    }

    try {
      setLoading(true);
      const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
      
      console.log('📤 Delete Account: Calling deleteAccount API');
      const response = await userService.deleteAccount({ password, reason: finalReason });
      console.log('📥 Delete Account: API response:', response);

      if (response.success) {
        console.log('✅ Delete Account: Success');
        
        // Disable loading
        setLoading(false);
        
        // Show success alert
        Alert.alert(
          'Success',
          'Your account has been deleted successfully. You can recover it by requesting assistance',
          [
            {
              text: 'OK',
              onPress: async () => {
                console.log('✅ Delete Account: User acknowledged, logging out');
                await logout();
                router.replace('/(tabs)/home');
              },
            },
          ],
          { cancelable: false }
        );
        
        // Don't set loading to false in finally block
        return;
      } else {
        console.log('❌ Delete Account: API returned error');
        toast.error(response.error?.message || 'Failed to delete account');
        console.log('🍞 Delete Account: After toast.error, toast state:', {
          visible: toast.visible,
          message: toast.message,
          type: toast.type,
        });
      }
    } catch (error: any) {
      console.error('❌ Delete Account: Exception caught:', error);
      toast.error(error.message || 'Failed to delete account');
      console.log('🍞 Delete Account: After toast.error (catch), toast state:', {
        visible: toast.visible,
        message: toast.message,
        type: toast.type,
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    warningSection: {
      backgroundColor: colors.error + '10',
      borderBottomWidth: 1,
      borderBottomColor: colors.error + '30',
      padding: spacing.lg,
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    warningIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.error + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    warningTitle: {
      fontSize: fontSizes.lg,
      fontWeight: '700',
      color: colors.error,
      flex: 1,
    },
    warningText: {
      fontSize: fontSizes.base,
      color: colors.error,
      lineHeight: 22,
      fontFamily: fonts.regular,
    },
    formSection: {
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    label: {
      fontSize: fontSizes.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    reasonOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.base,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
    },
    reasonOptionSelected: {
      borderColor: colors.error,
      backgroundColor: colors.error + '10',
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioOuterSelected: {
      borderColor: colors.error,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.error,
    },
    reasonText: {
      fontSize: fontSizes.base,
      color: colors.text,
      flex: 1,
      fontFamily: fonts.regular,
    },
    reasonTextSelected: {
      fontWeight: '600',
      color: colors.error,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.surface,
      fontFamily: fonts.regular,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: 12,
      top: 12,
      padding: 4,
    },
    infoBox: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.base,
      marginTop: spacing.sm,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      flex: 1,
      marginLeft: spacing.sm,
      fontFamily: fonts.regular,
      lineHeight: 20,
    },
    actions: {
      padding: spacing.lg,
      gap: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    button: {
      paddingVertical: spacing.base,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: fontSizes.base,
      fontWeight: '600',
      fontFamily: fonts.medium,
    },
    cancelButtonText: {
      color: colors.text,
    },
    deleteButtonText: {
      color: '#fff',
      marginLeft: spacing.sm,
    },
    consequences: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.base,
      marginBottom: spacing.base,
    },
    consequenceItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    consequenceText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      flex: 1,
      marginLeft: spacing.sm,
      fontFamily: fonts.regular,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Delete Account" showBack={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Warning Section */}
        <View style={styles.warningSection}>
          <View style={styles.warningHeader}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={24} color={colors.error} />
            </View>
            <Text style={styles.warningTitle}>Permanent Action</Text>
          </View>
          <Text style={styles.warningText}>
            Your account will be permanently deactivated and you will lose access to all your data.
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* What You'll Lose */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What you'll lose:</Text>
            <View style={styles.consequences}>
              <View style={styles.consequenceItem}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={styles.consequenceText}>
                  All your order history and tracking information
                </Text>
              </View>
              <View style={styles.consequenceItem}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={styles.consequenceText}>
                  Saved addresses and payment methods
                </Text>
              </View>
              <View style={styles.consequenceItem}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={styles.consequenceText}>
                  Wishlist items and favorites
                </Text>
              </View>
              <View style={styles.consequenceItem}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={styles.consequenceText}>
                  Account preferences and settings
                </Text>
              </View>
              <View style={styles.consequenceItem}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={styles.consequenceText}>
                  Access to ongoing orders and support
                </Text>
              </View>
            </View>
          </View>

          {/* Reason Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Why are you leaving? *</Text>
            {DELETION_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selectedReason === reason && styles.radioOuterSelected,
                  ]}
                >
                  {selectedReason === reason && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Reason */}
          {selectedReason === 'Other' && (
            <View style={styles.section}>
              <Text style={styles.label}>Please tell us more</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Tell us why you're leaving..."
                placeholderTextColor={colors.textLight}
                multiline
                maxLength={200}
              />
            </View>
          )}

          {/* Password Confirmation */}
          <View style={styles.section}>
            <Text style={styles.label}>Confirm your password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                We need to verify your identity to ensure account security.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.deleteButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleDeleteAccount}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={[styles.buttonText, styles.deleteButtonText]}>
                Delete My Account
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>

      {/* Toast Component */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        autoClose={toast.autoClose}
        onClose={toast.hideToast}
      />
    </View>
  );
}
