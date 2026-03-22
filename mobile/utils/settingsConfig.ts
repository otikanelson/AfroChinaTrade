import { SettingsSection, SettingsItem, UserRole } from '../types/settings';

/**
 * Filter settings sections and items based on user role
 */
export function filterSettingsByRole(
  sections: SettingsSection[], 
  userRole: UserRole
): SettingsSection[] {
  const filteredSections: SettingsSection[] = [];
  
  for (const section of sections) {
    // Check if user role is allowed for this section
    if (!section.roles.includes(userRole)) {
      continue;
    }
    
    // Filter items within the section
    const filteredItems: SettingsItem[] = [];
    for (const item of section.items) {
      if (item.roles.includes(userRole)) {
        filteredItems.push(item);
      }
    }
    
    // Only include section if it has items after filtering
    if (filteredItems.length > 0) {
      const newSection: SettingsSection = {
        ...section,
        items: filteredItems
      };
      filteredSections.push(newSection);
    }
  }
  
  // Sort sections by order
  return filteredSections.sort((a, b) => a.order - b.order);
}

/**
 * Validate settings configuration
 */
export function validateSettingsConfig(sections: SettingsSection[]): boolean {
  // Check for duplicate section IDs
  const sectionIds = new Set<string>();
  for (const section of sections) {
    if (sectionIds.has(section.id)) {
      console.error(`Duplicate section ID: ${section.id}`);
      return false;
    }
    sectionIds.add(section.id);
    
    // Check for duplicate item IDs within section
    const itemIds = new Set<string>();
    for (const item of section.items) {
      if (itemIds.has(item.id)) {
        console.error(`Duplicate item ID in section ${section.id}: ${item.id}`);
        return false;
      }
      itemIds.add(item.id);
      
      // Validate item configuration
      if (item.type === 'picker' && !item.options) {
        console.error(`Picker item ${item.id} missing options`);
        return false;
      }
      
      if (item.type === 'toggle' && typeof item.value !== 'boolean') {
        console.error(`Toggle item ${item.id} value must be boolean`);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Create default settings sections
 */
export function createDefaultSettingsSections(): SettingsSection[] {
  return [
    // Profile Section
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      order: 1,
      roles: ['customer', 'admin', 'super_admin'],
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          type: 'navigation',
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'person-outline',
        },
        {
          id: 'change-password',
          title: 'Change Password',
          subtitle: 'Update your account password',
          type: 'navigation',
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'lock-closed-outline',
        },
      ],
    },
    
    // Notifications Section
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      order: 2,
      roles: ['customer', 'admin', 'super_admin'],
      items: [
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          type: 'toggle',
          value: true,
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'notifications-outline',
        },
        {
          id: 'email-notifications',
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          type: 'toggle',
          value: true,
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'mail-outline',
        },
        {
          id: 'order-updates',
          title: 'Order Updates',
          subtitle: 'Get notified about order status changes',
          type: 'toggle',
          value: true,
          roles: ['customer'],
          iconName: 'bag-outline',
        },
        {
          id: 'promotions',
          title: 'Promotions & Offers',
          subtitle: 'Receive promotional notifications',
          type: 'toggle',
          value: false,
          roles: ['customer'],
          iconName: 'pricetag-outline',
        },
      ],
    },
    
    // Privacy Section
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      order: 3,
      roles: ['customer', 'admin', 'super_admin'],
      items: [
        {
          id: 'profile-visibility',
          title: 'Profile Visibility',
          subtitle: 'Control who can see your profile',
          type: 'picker',
          value: 'public',
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' },
          ],
          roles: ['customer'],
          iconName: 'eye-outline',
        },
        {
          id: 'data-sharing',
          title: 'Data Sharing',
          subtitle: 'Allow sharing data for better experience',
          type: 'toggle',
          value: false,
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'share-outline',
        },
        {
          id: 'location-tracking',
          title: 'Location Tracking',
          subtitle: 'Allow location-based features',
          type: 'toggle',
          value: false,
          roles: ['customer'],
          iconName: 'location-outline',
        },
      ],
    },
    
    // Admin Management Section
    {
      id: 'admin-management',
      title: 'Management',
      icon: 'settings-outline',
      order: 4,
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
          title: 'Content Moderation',
          subtitle: 'Review and moderate content',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'shield-checkmark-outline',
        },
        {
          id: 'analytics',
          title: 'Analytics',
          subtitle: 'View reports and statistics',
          type: 'navigation',
          roles: ['admin', 'super_admin'],
          iconName: 'analytics-outline',
        },
      ],
    },
    
    // App Settings Section
    {
      id: 'app-settings',
      title: 'App Settings',
      icon: 'cog-outline',
      order: 5,
      roles: ['customer', 'admin', 'super_admin'],
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
          roles: ['customer', 'admin', 'super_admin'],
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
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'language-outline',
        },
      ],
    },
    
    // Support Section
    {
      id: 'support',
      title: 'Support',
      icon: 'help-circle-outline',
      order: 6,
      roles: ['customer', 'admin', 'super_admin'],
      items: [
        {
          id: 'help-center',
          title: 'Help Center',
          subtitle: 'Find answers to common questions',
          type: 'navigation',
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'help-circle-outline',
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          subtitle: 'Get help from our support team',
          type: 'navigation',
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'chatbubble-outline',
        },
        {
          id: 'report-issue',
          title: 'Report an Issue',
          subtitle: 'Report bugs or problems',
          type: 'navigation',
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'bug-outline',
        },
      ],
    },
    
    // Account Actions Section
    {
      id: 'account-actions',
      title: 'Account',
      icon: 'log-out-outline',
      order: 7,
      roles: ['customer', 'admin', 'super_admin'],
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
          roles: ['customer', 'admin', 'super_admin'],
          iconName: 'log-out-outline',
          iconColor: '#DC3545',
        },
      ],
    },
  ];
}