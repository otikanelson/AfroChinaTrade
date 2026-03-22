import { SettingsSection } from '../types/settings';

/**
 * Maps existing admin account menu items to unified settings sections
 */
export function createAdminSettingsSections(): SettingsSection[] {
  return [
    // Profile & Account Section
    {
      id: 'profile-account',
      title: 'Profile & Account',
      icon: 'person-outline',
      order: 1,
      roles: ['admin', 'super_admin'],
      items: [
        {
          id: 'edit-profile',
          title: 'Profile',
          subtitle: 'Edit admin information',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'person-outline',
        },
        {
          id: 'change-password',
          title: 'Change Password',
          subtitle: 'Update your account password',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'lock-closed-outline',
        },
      ],
    },
    
    // Admin Management Section
    {
      id: 'admin-management',
      title: 'Management',
      icon: 'settings-outline',
      order: 2,
      roles: ['admin', 'super_admin'],
      items: [
        {
          id: 'user-management',
          title: 'User Management',
          subtitle: 'Manage users and permissions',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'people-outline',
        },
        {
          id: 'content-moderation',
          title: 'Moderation',
          subtitle: 'Content moderation',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'shield-checkmark-outline',
        },
        {
          id: 'analytics',
          title: 'Analytics',
          subtitle: 'View reports and stats',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'analytics-outline',
        },
        {
          id: 'admin-settings',
          title: 'Settings',
          subtitle: 'App preferences',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'cog-outline',
        },
      ],
    },
    
    // Notifications Section
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      order: 3,
      roles: ['admin', 'super_admin'],
      items: [
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          subtitle: 'Receive admin notifications on your device',
          type: 'toggle',
          value: true,
          roles: ['admin', 'super_admin'],
          iconName: 'notifications-outline',
        },
        {
          id: 'email-notifications',
          title: 'Email Notifications',
          subtitle: 'Receive admin notifications via email',
          type: 'toggle',
          value: true,
          roles: ['admin', 'super_admin'],
          iconName: 'mail-outline',
        },
        {
          id: 'system-alerts',
          title: 'System Alerts',
          subtitle: 'Get notified about system issues',
          type: 'toggle',
          value: true,
          roles: ['admin', 'super_admin'],
          iconName: 'warning-outline',
        },
        {
          id: 'user-activity',
          title: 'User Activity Alerts',
          subtitle: 'Notifications for user actions',
          type: 'toggle',
          value: false,
          roles: ['admin', 'super_admin'],
          iconName: 'people-outline',
        },
      ],
    },
    
    // App Settings Section
    {
      id: 'app-settings',
      title: 'App Settings',
      icon: 'cog-outline',
      order: 4,
      roles: ['admin', 'super_admin'],
      items: [
        {
          id: 'theme',
          title: 'Theme',
          subtitle: 'Choose your preferred theme',
          type: 'picker',
          value: 'system',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'System', value: 'system' },
          ],
          roles: ['admin', 'super_admin'],
          iconName: 'color-palette-outline',
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'Select your preferred language',
          type: 'picker',
          value: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'French', value: 'fr' },
            { label: 'Spanish', value: 'es' },
          ],
          roles: ['admin', 'super_admin'],
          iconName: 'language-outline',
        },
        {
          id: 'auto-refresh',
          title: 'Auto Refresh',
          subtitle: 'Automatically refresh admin data',
          type: 'toggle',
          value: true,
          roles: ['admin', 'super_admin'],
          iconName: 'refresh-outline',
        },
      ],
    },
    
    // Privacy & Security Section
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      order: 5,
      roles: ['admin', 'super_admin'],
      items: [
        {
          id: 'session-timeout',
          title: 'Session Timeout',
          subtitle: 'Automatic logout after inactivity',
          type: 'picker',
          value: '30',
          options: [
            { label: '15 minutes', value: '15' },
            { label: '30 minutes', value: '30' },
            { label: '1 hour', value: '60' },
            { label: '2 hours', value: '120' },
          ],
          roles: ['admin', 'super_admin'],
          iconName: 'time-outline',
        },
        {
          id: 'audit-logging',
          title: 'Audit Logging',
          subtitle: 'Log admin actions for security',
          type: 'toggle',
          value: true,
          roles: ['super_admin'],
          iconName: 'document-text-outline',
        },
        {
          id: 'two-factor-auth',
          title: 'Two-Factor Authentication',
          subtitle: 'Enable 2FA for enhanced security',
          type: 'toggle',
          value: false,
          roles: ['admin', 'super_admin'],
          iconName: 'shield-checkmark-outline',
        },
      ],
    },
    
    // Support Section
    {
      id: 'support',
      title: 'Support',
      icon: 'help-circle-outline',
      order: 6,
      roles: ['admin', 'super_admin'],
      items: [
        {
          id: 'admin-help',
          title: 'Admin Help',
          subtitle: 'Admin-specific help and documentation',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'help-circle-outline',
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          subtitle: 'Get help from our support team',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'chatbubble-outline',
        },
        {
          id: 'system-status',
          title: 'System Status',
          subtitle: 'Check system health and status',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'pulse-outline',
        },
      ],
    },
    
    // Account Actions Section
    {
      id: 'account-actions',
      title: 'Account',
      icon: 'log-out-outline',
      order: 7,
      roles: ['admin', 'super_admin'],
      items: [
        {
          id: 'customer-view',
          title: 'View Customer App',
          subtitle: 'Switch to customer interface',
          type: 'action',
          roles: ['admin', 'super_admin'],
          iconName: 'storefront-outline',
        },
        {
          id: 'logout',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          type: 'action',
          roles: ['admin', 'super_admin'],
          iconName: 'log-out-outline',
          iconColor: '#DC3545',
        },
      ],
    },
  ];
}

/**
 * Navigation mapping for admin settings
 */
export const adminNavigationMap: Record<string, string> = {
  'edit-profile': '/profile',
  'user-management': '/(admin)/users',
  'content-moderation': '/(admin)/moderation/reports',
  'analytics': '/(admin)/analytics',
  'admin-settings': '/(admin)/settings',
  'admin-help': '/(admin)/help',
  'system-status': '/(admin)/system-status',
};