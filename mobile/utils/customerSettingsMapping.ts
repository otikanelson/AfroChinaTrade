import { SettingsSection } from '../types/settings';

/**
 * Maps existing customer account menu items to unified settings sections
 * Only includes functional features
 */
export function createCustomerSettingsSections(): SettingsSection[] {
  return [
    // Profile & Account Section
    {
      id: 'profile-account',
      title: 'Profile & Account',
      icon: 'person-outline',
      order: 1,
      roles: ['customer'],
      items: [
        {
          id: 'edit-profile',
          title: 'Profile',
          subtitle: 'Edit your information',
          type: 'navigation',
          roles: ['customer'],
          iconName: 'person-outline',
        },
        {
          id: 'change-password',
          title: 'Change Password',
          subtitle: 'Update your account password',
          type: 'navigation',
          roles: ['customer'],
          iconName: 'lock-closed-outline',
        },
      ],
    },
    
    // Shopping Section
    {
      id: 'shopping',
      title: 'Shopping',
      icon: 'bag-outline',
      order: 2,
      roles: ['customer'],
      items: [
        {
          id: 'orders',
          title: 'Orders',
          subtitle: 'View order history',
          type: 'navigation',
          roles: ['customer'],
          iconName: 'receipt-outline',
        },
        {
          id: 'wishlist',
          title: 'Wishlist',
          subtitle: 'Saved products',
          type: 'navigation',
          roles: ['customer'],
          iconName: 'heart-outline',
        },
      ],
    },
    
    // App Settings Section
    {
      id: 'app-settings',
      title: 'App Settings',
      icon: 'cog-outline',
      order: 3,
      roles: ['customer'],
      items: [
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Toggle dark/light theme',
          type: 'toggle',
          value: false,
          roles: ['customer'],
          iconName: 'moon-outline',
        },
      ],
    },
    
    // Account Actions Section
    {
      id: 'account-actions',
      title: 'Account',
      icon: 'log-out-outline',
      order: 4,
      roles: ['customer'],
      items: [
        {
          id: 'logout',
          title: 'Logout',
          subtitle: 'Sign out of your account',
          type: 'action',
          roles: ['customer'],
          iconName: 'log-out-outline',
          iconColor: '#DC3545',
        },
      ],
    },
  ];
}

/**
 * Navigation mapping for customer settings
 */
export const customerNavigationMap: Record<string, string> = {
  'edit-profile': '/profile',
  'orders': '/orders',
  'wishlist': '/wishlist',
};