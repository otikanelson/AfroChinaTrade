import React, { useState, useEffect, useRef } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useRedirect } from '../../contexts/RedirectContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ShakeField } from '../../components/animations/ShakeField';

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
    passwordInputContainer: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: spacing.md,
      top: '50%',
      transform: [{ translateY: -12 }],
      padding: spacing.xs,
    },
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const { login } = useAuth();
  const { handlePendingRedirect } = useRedirect();
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

    console.log('🚀 Login screen: Starting login process');
    setIsLoading(true);
    
    try {
      console.log('📞 Login screen: Calling login with credentials');
      
      const authResponse = await login({ email: email.trim(), password });
      
      console.log('✅ Login screen: Login completed successfully, authResponse:', {
        userId: authResponse?.userId,
        role: authResponse?.role,
      });
      
      // Handle post-login redirect
      const redirectPath = await handlePendingRedirect();
      
      console.log('🔀 Login screen: Redirect path:', redirectPath);
      console.log('👤 Login screen: Auth response role:', authResponse?.role);
      
      if (redirectPath) {
        router.replace(redirectPath as any);
      } else if (authResponse?.role === 'admin' || authResponse?.role === 'super_admin') {
        router.replace('/(admin)/(tabs)/products');
      } else {
        router.replace('/(tabs)/home');
      }
      
      console.log('✅ Login screen: Navigation completed');
    } catch (error: any) {
      console.error('❌ Login screen: Error caught:', error);
      console.error('❌ Login screen: Error type:', typeof error);
      console.error('❌ Login screen: Error constructor:', error?.constructor?.name);
      
      // Log the error structure for debugging
      console.log('🔍 Login screen: Error structure:', {
        code: error?.code,
        message: error?.message,
        data: error?.data,
        name: error?.name,
        hasOwnProperty_code: error?.hasOwnProperty('code'),
        hasOwnProperty_data: error?.hasOwnProperty('data'),
      });
      
      if (error?.code === 'NETWORK_ERROR') {
        setErrors({ general: 'Unable to connect to server. Please check your internet connection.' });
      } else if (error?.code === 'ACCOUNT_BLOCKED') {
        console.log('🚫 Login screen: ACCOUNT_BLOCKED detected');
        setErrors({ general: 'Your account has been blocked. Please contact support for assistance.' });
      } else if (error?.code === 'ACCOUNT_SUSPENDED') {
        console.log('🚫 Login screen: ACCOUNT_SUSPENDED detected');
        // Get suspension details if available
        const reason = error?.data?.reason || 'Terms of service violation';
        const duration = error?.data?.suspensionDuration || 'indefinitely';
        setErrors({ general: `Your account has been suspended ${duration}. Reason: ${reason}` });
      } else if (error?.code === 'INVALID_CREDENTIALS' || error?.message?.includes('Invalid')) {
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
        console.log('⚠️ Login screen: Using generic error message');
        setErrors({ general: error?.message || 'An error occurred during login. Please try again.' });
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 Login screen: Login process finished');
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/Logo.png')} 
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
              <ShakeField hasError={!!errors.email}>
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
              </ShakeField>
              {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <ShakeField hasError={!!errors.password}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'password' && styles.inputFocused,
                      errors.password && styles.inputError,
                      { paddingRight: 50 }
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
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </ShakeField>
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

          {/* <View style={styles.divider}>
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
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}