import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

import { userService } from '../services/UserService';
import { FormField } from '../components/admin/forms/FormField';
import { Button } from '../components/admin/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface ChangePasswordScreenProps {
  isAdmin?: boolean;
}

export default function ChangePasswordScreen({ isAdmin = false }: ChangePasswordScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdminUser = isAdmin || user?.role === 'admin' || user?.role === 'super_admin' || pathname?.includes('/(admin)/');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    backButton: {
      marginRight: spacing.md,
    },
    headerTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    formSection: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      marginBottom: spacing.base,
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    securityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    warningBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#FFF3CD',
      padding: spacing.md,
      borderRadius: borderRadius.base,
      marginTop: spacing.md,
    },
    warningText: {
      fontSize: fontSizes.sm,
      color: '#856404',
      marginLeft: spacing.sm,
      flex: 1,
    },
    sectionDescription: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    passwordStrength: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },
    strengthLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    strengthValue: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    requirements: {
      marginTop: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: borderRadius.base,
    },
    requirementsTitle: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    requirement: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    requirementText: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
    },
    saveSection: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
    },
  });

  const validateForm = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Current password is required');
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'New password is required');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const response = await userService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          isAdminUser ? 'Administrator password changed successfully' : 'Password changed successfully',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        throw new Error(response.error?.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: colors.error };
    if (strength <= 3) return { label: 'Fair', color: '#FF9500' };
    if (strength <= 4) return { label: 'Good', color: '#34C759' };
    return { label: 'Strong', color: '#34C759' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAdminUser ? 'Change Admin Password' : 'Change Password'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          {isAdminUser && (
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
              <Text style={styles.sectionTitle}>Administrator Security</Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>
            {isAdminUser ? '' : 'Security'}
          </Text>
          <Text style={styles.sectionDescription}>
            {isAdminUser 
              ? 'As an administrator, use a strong password to protect sensitive system access'
              : 'Choose a strong password to keep your account secure'
            }
          </Text>

          <FormField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter your current password"
            secureTextEntry={true}
            required
          />

          <FormField
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter your new password"
            secureTextEntry={true}
            required
          />

          {newPassword.length > 0 && (
            <View style={styles.passwordStrength}>
              <Text style={styles.strengthLabel}>Password Strength: </Text>
              <Text style={[styles.strengthValue, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          )}

          <FormField
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your new password"
            secureTextEntry={true}
            required
          />

          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>
              {isAdminUser ? 'Security Requirements:' : 'Password Requirements:'}
            </Text>
            <View style={styles.requirement}>
              <Ionicons 
                name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={newPassword.length >= 8 ? colors.success : colors.textLight} 
              />
              <Text style={styles.requirementText}>At least 8 characters</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons 
                name={/[a-z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[a-z]/.test(newPassword) ? colors.success : colors.textLight} 
              />
              <Text style={styles.requirementText}>One lowercase letter</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons 
                name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[A-Z]/.test(newPassword) ? colors.success : colors.textLight} 
              />
              <Text style={styles.requirementText}>One uppercase letter</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons 
                name={/\d/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/\d/.test(newPassword) ? colors.success : colors.textLight} 
              />
              <Text style={styles.requirementText}>One number</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons 
                name={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? colors.success : colors.textLight} 
              />
              <Text style={styles.requirementText}>One special character</Text>
            </View>
          </View>

          {isAdminUser && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <Text style={styles.warningText}>
                Changing your password will log you out of all other devices for security.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.saveSection}>
          <Button
            label={isAdminUser ? "Update Admin Password" : "Change Password"}
            onPress={handleSave}
            loading={saving}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            icon="shield-checkmark-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}