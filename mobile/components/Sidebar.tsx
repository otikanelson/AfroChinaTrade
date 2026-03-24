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

const { width, height } = Dimensions.get('window');

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
  requiresAuth?: boolean;
  adminOnly?: boolean;
  customerOnly?: boolean;
}

const menuItems: MenuItem[] = [
  // Customer-only items
  { id: 'profile', title: 'Profile', icon: 'person-outline', route: '/profile', requiresAuth: true, customerOnly: true },
  { id: 'orders', title: 'My Orders', icon: 'bag-outline', route: '/orders', requiresAuth: true, customerOnly: true },
  { id: 'wishlist', title: 'Wishlist', icon: 'heart-outline', route: '/wishlist', requiresAuth: false, customerOnly: true },
  { id: 'addresses', title: 'Addresses', icon: 'location-outline', route: '/addresses', requiresAuth: true, customerOnly: true },
  { id: 'payment', title: 'Payment Methods', icon: 'card-outline', route: '/payment-methods', requiresAuth: true, customerOnly: true },
  { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', route: '/notifications', requiresAuth: true, customerOnly: true },
  
  // Admin-only items
  { id: 'admin-dashboard', title: 'Dashboard', icon: 'speedometer-outline', route: '/(admin)/(tabs)/products', requiresAuth: true, adminOnly: true },
  { id: 'admin-orders', title: 'Orders', icon: 'receipt-outline', route: '/(admin)/(tabs)/orders', requiresAuth: true, adminOnly: true },
  { id: 'admin-users', title: 'Users', icon: 'people-outline', route: '/(admin)/users', requiresAuth: true, adminOnly: true },
  { id: 'admin-messages', title: 'Messages', icon: 'chatbubbles-outline', route: '/(admin)/(tabs)/messages', requiresAuth: true, adminOnly: true },
  { id: 'admin-finance', title: 'Finance', icon: 'analytics-outline', route: '/(admin)/(tabs)/finance', requiresAuth: true, adminOnly: true },
  { id: 'admin-account', title: 'Settings', icon: 'settings-outline', route: '/(admin)/(tabs)/account', requiresAuth: true, adminOnly: true },
];

const settingsItems: MenuItem[] = [
  { 
    id: 'theme', 
    title: 'Theme', 
    icon: 'color-palette-outline', 
    action: () => {}
  },
  { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', route: '/help-support' },
  { id: 'about', title: 'About', icon: 'information-circle-outline', route: '/settings/about' },
];

export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { colors, fontSizes, fontWeights } = useTheme();
  const { isAuthenticated, isGuestMode, isAdmin, user } = useAuth();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin) {
      return item.adminOnly === true;
    }
    return item.customerOnly === true;
  });

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
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      flexDirection: 'row',
    },
    sidebar: {
      width: Math.min(320, width * 0.85),
      height: '100%',
      backgroundColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userAvatarText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      color: colors.text,
    },
    userRole: {
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    content: {
      flex: 1,
    },
    section: {
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: colors.textSecondary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 12,
      marginVertical: 2,
    },
    menuItemActive: {
      backgroundColor: colors.surface,
    },
    menuItemDisabled: {
      opacity: 0.5,
    },
    menuIcon: {
      marginRight: 16,
      width: 24,
      alignItems: 'center',
    },
    menuText: {
      flex: 1,
      fontSize: fontSizes.base,
      fontWeight: '500',
      color: colors.text,
    },
    menuTextDisabled: {
      color: colors.textLight,
    },
    menuTextPrimary: {
      color: colors.primary,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    badgeText: {
      color: colors.textInverse,
      fontSize: fontSizes.xs,
      fontWeight: '600',
    },
    chevron: {
      marginLeft: 8,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: 24,
    },
    signInItem: {
      backgroundColor: colors.primary + '10',
      borderWidth: 1,
      borderColor: colors.primary + '20',
    },
    quickSwitchItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary + '20',
    },
  });

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderUserSection = () => {
    if (isGuestMode) {
      return (
        <TouchableOpacity
          style={[styles.menuItem, styles.signInItem]}
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
          <Text style={[styles.menuText, styles.menuTextPrimary]}>Sign In</Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.primary}
            style={styles.chevron}
          />
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {getUserInitials(user?.name)}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userRole}>
            {isAdmin ? 'Administrator' : 'Customer'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <SafeAreaView style={styles.safeArea}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTop}>
                </View>
                {renderUserSection()}
              </View>
              
              {/* Content */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Main Menu */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {isAdmin ? 'Admin Panel' : 'Account'}
                  </Text>
                  {filteredMenuItems.map((item) => {
                    const isDisabled = item.requiresAuth && !isAuthenticated;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.menuItem,
                          isDisabled && styles.menuItemDisabled
                        ]}
                        onPress={() => handleItemPress(item)}
                        disabled={isDisabled}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={item.icon} 
                          size={22} 
                          color={isDisabled ? colors.textLight : colors.textSecondary} 
                          style={styles.menuIcon}
                        />
                        <Text style={[
                          styles.menuText,
                          isDisabled && styles.menuTextDisabled
                        ]}>
                          {item.title}
                        </Text>
                        {item.badge && item.badge > 0 && !isDisabled && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {item.badge > 99 ? '99+' : item.badge}
                            </Text>
                          </View>
                        )}
                        <Ionicons 
                          name="chevron-forward" 
                          size={18} 
                          color={isDisabled ? colors.textLight : colors.textSecondary}
                          style={styles.chevron}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Admin Quick Switch */}
                {isAdmin && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Quick Actions</Text>
                      <TouchableOpacity
                        style={[styles.menuItem, styles.quickSwitchItem]}
                        onPress={() => {
                          onClose();
                          router.push('/(tabs)/home');
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="storefront-outline" 
                          size={22} 
                          color={colors.primary} 
                          style={styles.menuIcon}
                        />
                        <Text style={[styles.menuText, styles.menuTextPrimary]}>
                          Customer View
                        </Text>
                        <Ionicons 
                          name="chevron-forward" 
                          size={18} 
                          color={colors.primary}
                          style={styles.chevron}
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <View style={styles.divider} />

                {/* Settings */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Settings</Text>
                  {settingsItemsWithActions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => handleItemPress(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={item.icon} 
                        size={22} 
                        color={colors.textSecondary} 
                        style={styles.menuIcon}
                      />
                      <Text style={styles.menuText}>{item.title}</Text>
                      <Ionicons 
                        name="chevron-forward" 
                        size={18} 
                        color={colors.textSecondary}
                        style={styles.chevron}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
              </ScrollView>
            </SafeAreaView>
            
            <ThemeModal
              visible={themeModalVisible}
              onClose={() => setThemeModalVisible(false)}
            />
          </View>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </View>
    </Modal>
  );
  };