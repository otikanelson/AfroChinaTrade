export type UserRole = 'customer' | 'admin' | 'super_admin';

export type SettingType = 'navigation' | 'toggle' | 'picker' | 'action';

export interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: SettingType;
  value?: any;
  onPress?: () => void;
  onChange?: (value: any) => void;
  roles: UserRole[];
  iconName?: string;
  iconColor?: string;
  options?: { label: string; value: any }[]; // For picker type
  disabled?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  icon?: string;
  items: SettingsItem[];
  roles: UserRole[];
  order: number;
}

export interface SettingsConfig {
  sections: SettingsSection[];
  userRole: UserRole;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  marketing: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  dataSharing: boolean;
  analytics: boolean;
  locationTracking: boolean;
}