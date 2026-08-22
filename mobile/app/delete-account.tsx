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
  { id: '1', label: 'Not using the app anymore', icon: 'time-outline' },
  { id: '2', label: 'Privacy concerns', icon: 'shield-outline' },
  { id: '3', label: 'Found a better alternative', icon: 'swap-horizontal-outline' },
  { id: '4', label: 'Too many notifications', icon: 'notifications-off-outline' },
  { id: '5', label: 'Difficult to use', icon: 'help-circle-outline' },
  { id: '6', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const CONSEQUENCES = [
  {
    icon: 'cart-outline',
    title: 'Order History',
    description: 'All your past orders and tracking information',
  },
  {
    icon: 'location-outline',
    title: 'Saved Addresses',
    description: 'Delivery addresses and payment methods',
  },
  {
    icon: 'heart-outline',
    title: 'Wishlist & Favorites',
    description: 'All saved items and collections',
  },
  {
    icon: 'settings-outline',
    title: 'Preferences',
    description: 'Account settings and customizations',
  },
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { colors, fontSizes, fonts, spacing, borderRadius } = useTheme();
  const { logout } = useAuth();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Reasons, Step 2: Password

  const handleNext = () => {
    if (!selectedReason) {
      toast.error('Please select a reason for deletion');
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setStep(2);
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }

    try {
      setLoading(true);
      const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
      
      const response = await userService.deleteAccount({ password, reason: finalReason });

      if (response.success) {
        setLoading(false);
        
        Alert.alert(
          'Account Deleted',
          'Your account has been permanently deleted. All your data has been removed from our system.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await logout();
                router.replace('/(tabs)/home');
              },
            },
          ],
          { cancelable: false }
        );
        
        return;
      } else {
        toast.error(response.error?.message || 'Failed to delete account');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
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
    scrollContent: {
      paddingBottom: 100,
    },
    // Step Indicator
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    stepDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
      marginHorizontal: spacing.xs,
    },
    stepDotActive: {
      width: 32,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.error,
    },
    stepLine: {
      width: 40,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: spacing.xs,
    },
    stepLineActive: {
      backgroundColor: colors.error,
    },
    // Warning Banner
    warningBanner: {
      margin: spacing.lg,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      backgroundColor: colors.error,
    },
    warningContent: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    warningIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    warningContentText: {
      flex: 1,
    },
    warningTitle: {
      fontSize: fontSizes.lg,
      fontWeight: '700',
      color: '#fff',
      marginBottom: spacing.xs,
    },
    warningText: {
      fontSize: fontSizes.sm,
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: 20,
    },
    // Main Content
    section: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSizes.xl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    // Reason Cards
    reasonCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.border,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
    },
    reasonCardSelected: {
      borderColor: colors.error,
      backgroundColor: colors.error + '08',
    },
    reasonIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    reasonIconContainerSelected: {
      backgroundColor: colors.error + '15',
    },
    reasonText: {
      flex: 1,
      fontSize: fontSizes.base,
      color: colors.text,
      fontWeight: '500',
    },
    reasonTextSelected: {
      color: colors.error,
      fontWeight: '600',
    },
    checkIcon: {
      marginLeft: spacing.sm,
    },
    // Custom Reason Input
    customReasonContainer: {
      marginTop: spacing.md,
    },
    input: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.surface,
      fontFamily: fonts.regular,
    },
    inputFocused: {
      borderColor: colors.error,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    characterCount: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: spacing.xs,
    },
    // Consequences Grid
    consequencesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.xs,
    },
    consequenceCard: {
      width: '50%',
      padding: spacing.xs,
    },
    consequenceCardInner: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    consequenceIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.error + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    consequenceTitle: {
      fontSize: fontSizes.sm,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    consequenceDescription: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    // Password Section
    passwordSection: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    passwordLabel: {
      fontSize: fontSizes.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    passwordInputContainer: {
      position: 'relative',
    },
    passwordInput: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      paddingRight: 50,
      fontSize: fontSizes.base,
      color: colors.text,
      backgroundColor: colors.surface,
      fontFamily: fonts.regular,
    },
    passwordToggle: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    infoText: {
      flex: 1,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
      lineHeight: 20,
    },
    // Actions
    actionsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      padding: spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    button: {
      flex: 1,
      paddingVertical: spacing.base,
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    backButton: {
      flex: 0.4,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    nextButton: {
      backgroundColor: colors.error,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    cancelButton: {
      flex: 0.4,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: fontSizes.base,
      fontWeight: '600',
      marginLeft: spacing.xs,
    },
    backButtonText: {
      color: colors.text,
    },
    nextButtonText: {
      color: '#fff',
    },
    deleteButtonText: {
      color: '#fff',
    },
    cancelButtonText: {
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Delete Account" showBack={true} />

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={step === 1 ? styles.stepDotActive : styles.stepDot} />
        <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
        <View style={step === 2 ? styles.stepDotActive : styles.stepDot} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <View style={styles.warningContent}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="alert-circle" size={28} color="#fff" />
              </View>
              <View style={styles.warningContentText}>
                <Text style={styles.warningTitle}>Permanent Deletion</Text>
                <Text style={styles.warningText}>
                  This action cannot be undone. All your data will be permanently removed.
                </Text>
              </View>
            </View>
          </View>

          {step === 1 ? (
            <>
              {/* Reason Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Why are you leaving?</Text>
                  <Text style={styles.sectionSubtitle}>
                    Help us improve by sharing your reason
                  </Text>
                </View>

                {DELETION_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonCard,
                      selectedReason === reason.label && styles.reasonCardSelected,
                    ]}
                    onPress={() => setSelectedReason(reason.label)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.reasonIconContainer,
                        selectedReason === reason.label && styles.reasonIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={reason.icon as any}
                        size={20}
                        color={selectedReason === reason.label ? colors.error : colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.reasonText,
                        selectedReason === reason.label && styles.reasonTextSelected,
                      ]}
                    >
                      {reason.label}
                    </Text>
                    {selectedReason === reason.label && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.error}
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))}

                {selectedReason === 'Other' && (
                  <View style={styles.customReasonContainer}>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={customReason}
                      onChangeText={setCustomReason}
                      placeholder="Please tell us more..."
                      placeholderTextColor={colors.textLight}
                      multiline
                      maxLength={200}
                    />
                    <Text style={styles.characterCount}>
                      {customReason.length}/200
                    </Text>
                  </View>
                )}
              </View>

              {/* What You'll Lose */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>What you'll lose</Text>
                  <Text style={styles.sectionSubtitle}>
                    All of the following will be permanently deleted
                  </Text>
                </View>

                <View style={styles.consequencesGrid}>
                  {CONSEQUENCES.map((item, index) => (
                    <View key={index} style={styles.consequenceCard}>
                      <View style={styles.consequenceCardInner}>
                        <View style={styles.consequenceIcon}>
                          <Ionicons
                            name={item.icon as any}
                            size={24}
                            color={colors.error}
                          />
                        </View>
                        <Text style={styles.consequenceTitle}>{item.title}</Text>
                        <Text style={styles.consequenceDescription}>
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Password Confirmation */}
              <View style={styles.passwordSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Confirm your identity</Text>
                  <Text style={styles.sectionSubtitle}>
                    Enter your password to verify it's really you
                  </Text>
                </View>

                <Text style={styles.passwordLabel}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                  <Text style={styles.infoText}>
                    We need to verify your identity for security purposes. Your account will be
                    permanently deleted after confirmation.
                  </Text>
                </View>
              </View>

              {/* Review Selected Reason */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your reason</Text>
                </View>
                <View style={styles.infoBox}>
                  <Ionicons name="chatbox-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {selectedReason === 'Other' ? customReason : selectedReason}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionsRow}>
            {step === 2 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={() => setStep(1)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
                <Text style={[styles.buttonText, styles.backButtonText]}>Back</Text>
              </TouchableOpacity>
            )}

            {step === 1 ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.nextButton,
                    (!selectedReason || (selectedReason === 'Other' && !customReason.trim())) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, styles.nextButtonText]}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
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
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={[styles.buttonText, styles.deleteButtonText]}>
                      Delete My Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
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
