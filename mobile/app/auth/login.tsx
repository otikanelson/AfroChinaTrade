import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginScreen() {
  const { colors, fonts, fontSizes, spacing, borderRadius } = useTheme();
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing['3xl'],
      paddingBottom: spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    logo: {
      width: 100,
      height: 100,
    },
    title: {
      fontSize: fontSizes['2xl'],
      fontFamily: fonts.bold,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSizes.base,
      color: colors.textSecondary,
      fontFamily: fonts.regular,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#FEE2E2',
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginBottom: spacing.lg,
    },
    errorIcon: {
      marginRight: spacing.sm,
      marginTop: 2,
    },
    errorText: {
      color: '#991B1B',
      fontSize: fontSizes.sm,
      flex: 1,
      fontFamily: fonts.medium,
    },
    form: {
      marginBottom: spacing.lg,
    },
    inputContainer: {
      marginBottom: spacing.base,
    },
    label: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      fontSize: fontSizes.base,
      color: colors.text,
      fontFamily: fonts.regular,
      minHeight: 48,
    },
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    inputError: {
      borderColor: colors.error,
    },
    fieldErrorText: {
      color: colors.error,
      fontSize: fontSizes.xs,
      marginTop: spacing.xs,
      fontFamily: fonts.regular,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.base,
      minHeight: 48,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: fontSizes.base,
      fontFamily: fonts.bold,
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    linkButton: {
      paddingVertical: spacing.sm,
    },
    linkText: {
      color: colors.primary,
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: spacing.base,
      color: colors.textSecondary,
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
    },
    demoSection: {
      gap: spacing.sm,
    },
    demoButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.base,
      padding: spacing.sm,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
    },
    demoButtonText: {
      color: colors.text,
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
    },
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setErrors({});
    
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
      
      if (authResponse?.role === 'admin' || authResponse?.role === 'super_admin') {
        router.replace('/(admin)/(tabs)/products');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error?.code === 'NETWORK_ERROR') {
        setErrors({ general: 'Unable to connect to server. Please check your internet connection.' });
      } else if (error?.code === 'INVALID_CREDENTIALS' || error?.status === 401) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (error?.code === 'VALIDATION_ERROR' && error?.details) {
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
    setErrors({});
  };

  const loginAsCustomer = () => {
    setEmail('customer@example.com');
    setPassword('Customer123!');
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/Logo_bg.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {errors.general && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#991B1B" style={styles.errorIcon} />
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused,
                  errors.email && styles.inputError
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'password' && styles.inputFocused,
                  errors.password && styles.inputError
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.password && <Text style={styles.fieldErrorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.linkButton} onPress={navigateToRegister} activeOpacity={0.7}>
              <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Quick Demo Access</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoSection}>
            <TouchableOpacity style={styles.demoButton} onPress={loginAsAdmin} activeOpacity={0.7}>
              <Text style={styles.demoButtonText}>Demo Admin Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.demoButton} onPress={loginAsCustomer} activeOpacity={0.7}>
              <Text style={styles.demoButtonText}>Demo Customer Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}