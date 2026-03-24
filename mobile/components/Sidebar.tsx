import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeModal } from './ThemeModal';

const { width } = Dimensions.get('window');

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  action?: () => void;
  badge?: number;
  requiresAuth?: boolean; // New property to mark items that need authentication
}

const menuItems: MenuItem[] = [
  { id: 'profile', title: 'Profile', icon: 'person-outline', route: '/account', requiresAuth: true },
  { id: 'orders', title: 'My Orders', icon: 'bag-outline', route: '/orders', requiresAuth: true },
  { id: 'wishlist', title: 'Wishlist', icon: 'heart-outline', route: '/wishlist', requiresAuth: false },
  { id: 'addresses', title: 'Addresses', icon: 'location-outline', route: '/addresses', requiresAuth: true },
  { id: 'payment', title: 'Payment Methods', icon: 'card-outline', route: '/payment-methods', requiresAuth: true },
  { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', route: '/notifications', requiresAuth: true },
];

const settingsItems: MenuItem[] = [
  { 
    id: 'theme', 
    title: 'Theme Settings', 
    icon: 'color-palette-outline', 
    action: () => {} // This will be set in the component
  },
  { id: 'privacy', title: 'Privacy', icon: 'shield-outline', route: '/settings/privacy' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', route: '/help-support' },
  { id: 'about', title: 'About', icon: 'information-circle-outline', route: '/settings/about' },
];

export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { isAuthenticated, isGuestMode } = useAuth();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // Create settings items with the theme action
  const settingsItemsWithActions: MenuItem[] = settingsItems.map(item => {
    if (item.id === 'theme') {
      return {
        ...item,
        action: () => setThemeModalVisible(true)
      };
    }
    return item;
  });


  const handleItemPress = (item: MenuItem) => {
    // If item requires auth and user is not authenticated, redirect to login
    if (item.requiresAuth && !isAuthenticated) {
      onClose();
      router.push('/auth/login');
      return;
    }
    
    if (item.action) {
      item.action();
    } else if (item.route) {
      onClose();
      router.push(item.route as any);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
      width: width * 0.8,
      maxWidth: 300,
      backgroundColor: colors.background,
      height: '100%',
    },
    header: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      color: colors.text,
    },
    closeButton: {
      padding: spacing.sm,
    },
    content: {
      flex: 1,
    },
    section: {
      paddingVertical: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: colors.textSecondary,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    menuItemDisabled: {
      opacity: 0.5,
    },
    menuIcon: {
      marginRight: spacing.md,
      width: 24,
    },
    menuText: {
      flex: 1,
      fontSize: fontSizes.base,
      color: colors.text,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    badgeText: {
      color: colors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginVertical: spacing.sm,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <SafeAreaView style={styles.sidebar}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Menu</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                {isGuestMode && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onClose();
                      router.push('/auth/login');
                    }}
                  >
                    <Ionicons 
                      name="log-in-outline" 
                      size={24} 
                      color={colors.primary} 
                      style={styles.menuIcon}
                    />
                    <Text style={[styles.menuText, { color: colors.primary }]}>Sign In</Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                )}
                {menuItems.map((item) => {
                  const isDisabled = item.requiresAuth && !isAuthenticated;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.menuItem, isDisabled && styles.menuItemDisabled]}
                      onPress={() => handleItemPress(item)}
                      disabled={isDisabled}
                    >
                      <Ionicons 
                        name={item.icon} 
                        size={24} 
                        color={isDisabled ? colors.textLight : colors.textSecondary} 
                        style={styles.menuIcon}
                      />
                      <Text style={[styles.menuText, isDisabled && { color: colors.textLight }]}>
                        {item.title}
                        {isDisabled && ' (Sign in required)'}
                      </Text>
                      {item.badge && item.badge > 0 && !isDisabled && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={isDisabled ? colors.textLight : colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                {settingsItemsWithActions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleItemPress(item)}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={24} 
                      color={colors.textSecondary} 
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuText}>{item.title}</Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <ThemeModal
              visible={themeModalVisible}
              onClose={() => setThemeModalVisible(false)}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};