import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginScreen() {
  const { colors, fonts, fontSizes, spacing, borderRadius } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    content: {
      padding: spacing.lg,
    },
    title: {
      fontSize: fontSizes['3xl'],
      fontFamily: fonts.bold,
      textAlign: 'center',
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSizes.lg,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: spacing['2xl'],
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fee2e2',
      borderColor: '#fca5a5',
      borderWidth: 1,
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      marginBottom: spacing.lg,
    },
    errorIcon: {
      marginRight: spacing.xs,
    },
    errorText: {
      color: '#dc2626',
      fontSize: fontSizes.sm,
      flex: 1,
    },
    form: {
      marginBottom: spacing.xl,
    },
    inputContainer: {
      marginBottom: spacing.base,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    inputError: {
      borderColor: colors.error,
      backgroundColor: colors.surface,
    },
    fieldErrorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    fieldErrorIcon: {
      marginRight: spacing.xs,
    },
    fieldErrorText: {
      color: colors.error,
      fontSize: fontSizes.xs,
      flex: 1,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      alignItems: 'center',
      marginBottom: spacing.base,
      marginTop: spacing.xs,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontFamily: fonts.bold,
    },
    linkButton: {
      alignItems: 'center',
    },
    linkText: {
      color: colors.primary,
      fontSize: fontSizes.base,
    },
    demoSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.lg,
    },
    demoTitle: {
      fontSize: fontSizes.lg,
      fontFamily: fonts.bold,
      textAlign: 'center',
      marginBottom: spacing.base,
      color: colors.text,
    },
    demoButton: {
      backgroundColor: '#007AFF',
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    demoButtonText: {
      color: '#fff',
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
    },
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});
    
    // Basic validation
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const authResponse = await login({ email: email.trim(), password });
      
      // Navigate based on user role immediately after login
      if (authResponse?.role === 'admin' || authResponse?.role === 'super_admin') {
        router.replace('/(admin)/(tabs)/products');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error?.code === 'NETWORK_ERROR') {
        setErrors({ general: 'Unable to connect to server. Please check your internet connection and try again.' });
      } else if (error?.code === 'INVALID_CREDENTIALS' || error?.status === 401) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (error?.code === 'VALIDATION_ERROR' && error?.details) {
        // Handle field-specific validation errors
        const fieldErrors: typeof errors = {};
        Object.entries(error.details).forEach(([field, message]) => {
          if (field === 'email' || field === 'password') {
            fieldErrors[field] = message as string;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error?.message || 'An error occurred during login. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  const loginAsAdmin = () => {
    setEmail('admin@afrochinatrade.com');
    setPassword('Admin123!@#');
    setErrors({}); // Clear any existing errors
  };

  const loginAsCustomer = () => {
    setEmail('customer@example.com');
    setPassword('Customer123!');
    setErrors({}); // Clear any existing errors
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>AfroChinaTrade</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>

          {/* General Error Display */}
          {errors.general && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#dc2626" style={styles.errorIcon} />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <View style={styles.fieldErrorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#dc2626" style={styles.fieldErrorIcon} />
                  <Text style={styles.fieldErrorText}>{errors.email}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.password && (
                <View style={styles.fieldErrorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#dc2626" style={styles.fieldErrorIcon} />
                  <Text style={styles.fieldErrorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={navigateToRegister}>
              <Text style={styles.linkText}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <TouchableOpacity style={styles.demoButton} onPress={loginAsAdmin}>
              <Text style={styles.demoButtonText}>Login as Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoButton} onPress={loginAsCustomer}>
              <Text style={styles.demoButtonText}>Login as Customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}