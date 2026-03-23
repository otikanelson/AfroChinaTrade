import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { userService, UserProfile } from '../services/UserService';
import { FormField } from '../components/admin/forms/FormField';
import { PhoneInput } from '../components/PhoneInput';
import { Button } from '../components/admin/Button';
import { Header } from '../components/Header';
import { Toast } from '../components/ui/Toast';
import { formatNigerianPhone, validateNigerianPhone } from '../utils/phoneUtils';

interface ProfileScreenProps {
  isAdmin?: boolean;
}

export default function ProfileScreen({ isAdmin = false }: ProfileScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, updateProfile: updateAuthProfile, isAdmin: userIsAdmin } = useAuth();
  const { colors, fonts, fontSizes, spacing } = useTheme();
  const toast = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();

  const isAdminUser = isAdmin || user?.role === 'admin' || user?.role === 'super_admin' || pathname?.includes('/(admin)/');
  const isAdminViewingCustomer = userIsAdmin && !pathname?.includes('/(admin)/');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Admin-specific header styles
    adminHeader: {
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
    adminHeaderTitle: {
      fontSize: fontSizes.xl,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    loadingText: {
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      backgroundColor: colors.surface,
      marginBottom: spacing.base,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: spacing.sm,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isAdminUser ? colors.primary : colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLoading: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarEditIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    avatarHint: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
    },
    formSection: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      marginBottom: spacing.base,
    },
    disabledField: {
      opacity: 0.6,
    },
    roleContainer: {
      marginTop: spacing.md,
    },
    roleLabel: {
      fontSize: fontSizes.sm,
      fontFamily: fonts.regular,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    roleValue: {
      fontSize: fontSizes.base,
      fontFamily: fonts.medium,
      color: colors.text,
    },
    // Admin-specific role styling
    adminRoleContainer: {
      marginTop: spacing.md,
    },
    adminRoleLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    adminRoleValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    adminRoleValue: {
      fontSize: fontSizes.base,
      color: colors.text,
      fontWeight: '600',
      marginLeft: spacing.sm,
    },
    statusContainer: {
      marginTop: spacing.md,
    },
    statusLabel: {
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    statusValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: spacing.sm,
    },
    statusValue: {
      fontSize: fontSizes.base,
      color: colors.text,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    sectionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    actionSection: {
      backgroundColor: colors.surface,
      marginBottom: spacing.base,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    actionButtonText: {
      flex: 1,
      fontSize: fontSizes.base,
      fontFamily: fonts.regular,
      color: colors.text,
      marginLeft: spacing.md,
    },
    saveSection: {
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
    },
    adminNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: spacing.base,
      marginBottom: spacing.md,
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.warning,
      gap: spacing.sm,
    },
    adminNoticeText: {
      flex: 1,
      fontSize: fontSizes.sm,
      fontFamily: fonts.medium,
      color: colors.warning,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
        setName(response.data.name);
        // Format phone number with +234 prefix
        setPhone(response.data.phone ? formatNigerianPhone(response.data.phone) : '+234');
        setAvatar(response.data.avatar);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    // Validate phone number if provided
    if (phone && phone !== '+234' && !validateNigerianPhone(phone)) {
      toast.error('Please enter a valid Nigerian phone number');
      return;
    }

    try {
      setSaving(true);
      const response = await userService.updateProfile({
        name: name.trim(),
        phone: phone && phone !== '+234' ? phone : undefined,
        avatar,
      });

      if (response.success && response.data) {
        setProfile(response.data);
        await updateAuthProfile({
          name: response.data.name,
          phone: response.data.phone,
          avatar: response.data.avatar,
        });
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPress = () => {
    toast.info('Choose an option', 2000);
    // Show action sheet or menu for camera/library/remove
    // For now, we'll use a simple approach with separate buttons
    // This would typically be handled by an action sheet library
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      const permissionResult = source === 'camera' 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        toast.error(`Camera ${source === 'camera' ? '' : 'roll '}access is required to update your profile photo.`);
        return;
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to select image');
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploadingAvatar(true);
      
      const imageFile = {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      };

      const response = await userService.uploadAvatar(imageFile);
      
      if (response.success && response.data) {
        // Backend returns 'url' field, but we need 'imageUrl' for consistency
        const imageUrl = response.data.imageUrl || (response.data as any).url;
        setAvatar(imageUrl);
      } else {
        throw new Error(response.error?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = () => {
    setAvatar(undefined);
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleManageAddresses = () => {
    router.push('/addresses');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {isAdminUser ? (
          <View style={styles.adminHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.adminHeaderTitle}>
              {profile?.role === 'super_admin' ? 'Super Admin Profile' : 'Admin Profile'}
            </Text>
          </View>
        ) : (
          <Header title="Profile" showBack={true} />
        )}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isAdminUser ? (
        <View style={styles.adminHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.adminHeaderTitle}>
            {profile?.role === 'super_admin' ? 'Super Admin Profile' : 'Admin Profile'}
          </Text>
        </View>
      ) : (
        <Header title="Profile" showBack={true} />
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Admin Viewing Notice */}
        {isAdminViewingCustomer && (
          <View style={styles.adminNotice}>
            <Ionicons name="eye" size={20} color={colors.warning} />
            <Text style={styles.adminNoticeText}>
              You are viewing as admin - profile editing is disabled
            </Text>
          </View>
        )}

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
            {uploadingAvatar ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons 
                  name={isAdminUser ? "shield" : "person"} 
                  size={40} 
                  color={isAdminUser ? colors.background : colors.textLight} 
                />
              </View>
            )}
            <View style={styles.avatarEditIcon}>
              <Ionicons name="camera" size={16} color={colors.background} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formSection}>
          {isAdminUser && (
            <Text style={styles.sectionTitle}>
              {profile?.role === 'super_admin' ? 'Super Administrator Information' : 'Administrator Information'}
            </Text>
          )}
          
          <FormField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            required={true}
          />

          <FormField
            label="Email"
            value={profile?.email || ''}
            onChangeText={() => {}} // No-op since it's disabled
            placeholder="Email address"
            disabled={true}
            style={styles.disabledField}
          />

          <PhoneInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            required={true}
          />

          {isAdminUser ? (
            <>
              <View style={styles.adminRoleContainer}>
                <Text style={styles.adminRoleLabel}>Administrator Level</Text>
                <View style={styles.adminRoleValueContainer}>
                  <Ionicons 
                    name={profile?.role === 'super_admin' ? 'shield-checkmark' : 'shield'} 
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={styles.adminRoleValue}>
                    {profile?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Account Status</Text>
                <View style={styles.statusValueContainer}>
                  <View style={[
                    styles.statusIndicator, 
                    { backgroundColor: profile?.status === 'active' ? colors.success : colors.error }
                  ]} />
                  <Text style={styles.statusValue}>
                    {profile?.status === 'active' ? 'Active' : profile?.status}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Account Type</Text>
              <Text style={styles.roleValue}>
                {profile?.role === 'admin' ? 'Administrator' : 
                 profile?.role === 'super_admin' ? 'Super Administrator' : 'Customer'}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isAdminUser && (
            <Text style={styles.sectionTitle}>Security & Settings</Text>
          )}
          
          <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          {isAdminUser ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/users')}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>Manage Users</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(admin)/(tabs)/products')}>
                <Ionicons name="cube-outline" size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>Manage Products</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handleManageAddresses}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Manage Addresses</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Button
            label="Save Changes"
            onPress={handleSave}
            loading={saving}
            disabled={!name.trim()}
            icon="checkmark-circle-outline"
          />
        </View>

        {/* Toast Component */}
        <Toast {...toast} />
      </ScrollView>
    </SafeAreaView>
  );
}