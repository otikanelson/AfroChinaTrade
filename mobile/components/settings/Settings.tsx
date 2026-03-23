import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsSection, SettingsItem, UserRole } from '../../types/settings';
import { SettingsSectionComponent } from './SettingsSection';
import { filterSettingsByRole, createDefaultSettingsSections } from '../../utils/settingsConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../ui/Toast';
import { spacing } from '../../theme/spacing';

interface SettingsProps {
  userRole?: UserRole;
  customSections?: SettingsSection[];
  onSettingChange?: (itemId: string, value: any) => void;
  onNavigate?: (route: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  userRole,
  customSections,
  onSettingChange,
  onNavigate,
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();
  const [settings, setSettings] = useState<Record<string, any>>({});

  // Determine user role
  const effectiveUserRole = userRole || (user?.role as UserRole) || 'customer';

  // Get settings sections
  const allSections = customSections || createDefaultSettingsSections();
  
  // Filter sections based on user role
  const filteredSections = useMemo(() => {
    return filterSettingsByRole(allSections, effectiveUserRole);
  }, [allSections, effectiveUserRole]);

  // Load saved settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from AsyncStorage or API
      // For now, use default values
      const defaultSettings: Record<string, any> = {
        'push-notifications': true,
        'email-notifications': true,
        'order-updates': true,
        'promotions': false,
        'profile-visibility': 'public',
        'data-sharing': false,
        'location-tracking': false,
        'theme': 'system',
        'language': 'en',
      };
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      // Save to AsyncStorage or API
      setSettings(prev => ({ ...prev, [key]: value }));
      
      if (onSettingChange) {
        onSettingChange(key, value);
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      toast.error('Failed to save setting. Please try again.');
    }
  };

  const handleItemPress = (item: SettingsItem) => {
    switch (item.id) {
      case 'edit-profile':
        if (onNavigate) {
          onNavigate('/profile');
        } else {
          router.push('/profile');
        }
        break;
      
      case 'change-password':
        if (onNavigate) {
          onNavigate('/change-password');
        } else {
          router.push('/change-password');
        }
        break;
      
      case 'user-management':
        if (onNavigate) {
          onNavigate('/(admin)/users');
        } else {
          router.push('/(admin)/users');
        }
        break;
      
      case 'content-moderation':
        if (onNavigate) {
          onNavigate('/(admin)/moderation/reports');
        } else {
          router.push('/(admin)/moderation/reports');
        }
        break;
      
      case 'analytics':
        toast.info('Analytics dashboard coming soon!');
        break;
      
      case 'help-center':
        toast.info('Help center coming soon!');
        break;
      
      case 'contact-support':
        toast.info('Support chat coming soon!');
        break;
      
      case 'report-issue':
        toast.info('Issue reporting coming soon!');
        break;
      
      case 'customer-view':
        if (onNavigate) {
          onNavigate('/(tabs)/home');
        } else {
          router.push('/(tabs)/home');
        }
        break;
      
      case 'logout':
        handleLogout();
        break;
      
      default:
        if (item.onPress) {
          item.onPress();
        }
        break;
    }
  };

  const handleToggle = (item: SettingsItem, value: boolean) => {
    // Handle theme toggle specifically
    if (item.id === 'theme') {
      if (onSettingChange) {
        onSettingChange(item.id, value);
      }
    } else {
      saveSettings(item.id, value);
    }
  };

  const handlePickerChange = (item: SettingsItem, value: any) => {
    // For picker items, we might want to show a picker modal
    // For now, just cycle through options
    if (item.options && item.options.length > 0) {
      const currentIndex = item.options.findIndex(opt => opt.value === settings[item.id]);
      const nextIndex = (currentIndex + 1) % item.options.length;
      const nextValue = item.options[nextIndex].value;
      saveSettings(item.id, nextValue);
    }
  };

  const handleLogout = () => {
    toast.warning('Logging out...', 2000);
    setTimeout(async () => {
      try {
        await logout();
        router.replace('/auth/login');
      } catch (error) {
        toast.error('Failed to logout');
      }
    }, 500);
  };

  // Update sections with current setting values
  const sectionsWithValues = useMemo(() => {
    return filteredSections.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        value: settings[item.id] !== undefined ? settings[item.id] : item.value,
      })),
    }));
  }, [filteredSections, settings]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sectionsWithValues.map(section => (
          <SettingsSectionComponent
            key={section.id}
            section={section}
            onItemPress={handleItemPress}
            onToggle={handleToggle}
            onPickerChange={handlePickerChange}
          />
        ))}
      </ScrollView>
      
      {/* Toast Component */}
      <Toast {...toast} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
});