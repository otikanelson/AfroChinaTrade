import React, { useState, useCallback } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';
import { useAlertContext } from '../../contexts/AlertContext';
import { validateNigerianPhone } from '../../utils/phoneUtils';

export default function RegisterScreen() {
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
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,

    },
    logoText: {
      fontSize: 32,
      fontFamily: fonts.bold,
      color: colors.textInverse,
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
      padding: spacing.md,
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
    phoneInputContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    countryCodeInput: {
      width: 80,
    },
    phoneInput: {
      flex: 1,
    },
    helperText: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      fontFamily: fonts.regular,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.base,
      padding: spacing.base,
      marginTop: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
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
    },
    linkText: {
      color: colors.primary,
      fontSize: fontSizes.base,
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
    passwordRequirements: {
      marginTop: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    requirementTitle: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    requirement: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    requirementText: {
      fontSize: fontSizes.xs,
      fontFamily: fonts.regular,
      marginLeft: spacing.xs,
    },
    requirementMet: {
      color: colors.success,
    },
    requirementNotMet: {
      color: colors.textSecondary,
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const alert = useAlertContext();
  const router = useRouter();

  const updateFormData = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Password validation function
  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const isValid = Object.values(requirements).every(req => req);
    return { isValid, requirements };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = formData;
    
    if (!name.trim()) {
      alert.showError('Validation Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      alert.showError('Validation Error', 'Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert.showError('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (!phone.trim()) {
      alert.showError('Validation Error', 'Please enter your phone number');
      return;
    }

    const fullPhone = phone.startsWith('+234') ? phone : `+234${phone.replace(/^0/, '')}`;
    if (!validateNigerianPhone(fullPhone)) {
      alert.showError('Validation Error', 'Please enter a valid Nigerian phone number (starts with 7, 8, or 9)');
      return;
    }

    if (!password) {
      alert.showError('Validation Error', 'Please enter a password');
      return;
    }

    const { isValid, requirements } = validatePassword(password);
    if (!isValid) {
      const missingRequirements = [];
      if (!requirements.minLength) missingRequirements.push('at least 8 characters');
      if (!requirements.hasUppercase) missingRequirements.push('one uppercase letter');
      if (!requirements.hasLowercase) missingRequirements.push('one lowercase letter');
      if (!requirements.hasNumber) missingRequirements.push('one number');
      if (!requirements.hasSpecialChar) missingRequirements.push('one special character');
      
      alert.showError(
        'Password Requirements', 
        `Password must contain ${missingRequirements.join(', ')}`
      );
      return;
    }

    if (password !== confirmPassword) {
      alert.showError('Validation Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const authResponse = await register({ 
        name: name.trim(), 
        email: email.trim(), 
        phone: fullPhone, 
        password 
      });
      
      alert.showSuccess('Success', 'Account created successfully!');
      
      if (authResponse?.role === 'admin' || authResponse?.role === 'super_admin') {
        router.replace('/(admin)/(tabs)/products');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      alert.showError('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join AfroChinaTrade today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'name' && styles.inputFocused
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textLight}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={[styles.input, styles.countryCodeInput]}
                  value="+234"
                  editable={false}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.phoneInput,
                    focusedField === 'phone' && styles.inputFocused
                  ]}
                  placeholder="8012345678"
                  placeholderTextColor={colors.textLight}
                  value={formData.phone}
                  onChangeText={(value) => {
                    const digits = value.replace(/\D/g, '').substring(0, 10);
                    updateFormData('phone', digits);
                  }}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <Text style={styles.helperText}>Enter Phone number</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'password' && styles.inputFocused,
                    { paddingRight: 50 }
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textLight}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
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
              
              {formData.password.length > 0 && (
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementTitle}>Password Requirements:</Text>
                  
                  <View style={styles.requirement}>
                    <Ionicons
                      name={passwordValidation.requirements.minLength ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.requirements.minLength ? colors.success : colors.textSecondary}
                    />
                    <Text style={[
                      styles.requirementText,
                      passwordValidation.requirements.minLength ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      At least 8 characters
                    </Text>
                  </View>
                  
                  <View style={styles.requirement}>
                    <Ionicons
                      name={passwordValidation.requirements.hasUppercase ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.requirements.hasUppercase ? colors.success : colors.textSecondary}
                    />
                    <Text style={[
                      styles.requirementText,
                      passwordValidation.requirements.hasUppercase ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      One uppercase letter (A-Z)
                    </Text>
                  </View>
                  
                  <View style={styles.requirement}>
                    <Ionicons
                      name={passwordValidation.requirements.hasLowercase ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.requirements.hasLowercase ? colors.success : colors.textSecondary}
                    />
                    <Text style={[
                      styles.requirementText,
                      passwordValidation.requirements.hasLowercase ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      One lowercase letter (a-z)
                    </Text>
                  </View>
                  
                  <View style={styles.requirement}>
                    <Ionicons
                      name={passwordValidation.requirements.hasNumber ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.requirements.hasNumber ? colors.success : colors.textSecondary}
                    />
                    <Text style={[
                      styles.requirementText,
                      passwordValidation.requirements.hasNumber ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      One number (0-9)
                    </Text>
                  </View>
                  
                  <View style={styles.requirement}>
                    <Ionicons
                      name={passwordValidation.requirements.hasSpecialChar ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.requirements.hasSpecialChar ? colors.success : colors.textSecondary}
                    />
                    <Text style={[
                      styles.requirementText,
                      passwordValidation.requirements.hasSpecialChar ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      One special character (!@#$%^&*)
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'confirmPassword' && styles.inputFocused,
                    { paddingRight: 50 }
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textLight}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              
              {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                <Text style={[styles.helperText, { color: colors.error }]}>
                  Passwords do not match
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
              <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}