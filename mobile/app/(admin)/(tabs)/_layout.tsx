import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { useRefundNotifications } from '../../../hooks/useRefundNotifications';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminTabLayout() {
  const { colors, fontSizes, fontWeights } = useTheme();
  const { user } = useAuth();
  const { pendingRefunds } = useRefundNotifications();
  const insets = useSafeAreaInsets();

  // Only show notifications for admin users
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          height: 70 + insets.bottom,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontWeight: fontWeights.medium,
        },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarBadge: undefined, // Will be set dynamically for pending orders
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.background,
            fontSize: 10,
            fontWeight: fontWeights.bold,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarBadge: undefined, // Will be set dynamically for unread messages
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.background,
            fontSize: 10,
            fontWeight: fontWeights.bold,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          tabBarBadge: isAdmin && pendingRefunds > 0 ? pendingRefunds : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            color: colors.background,
            fontSize: 10,
            fontWeight: fontWeights.bold,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cash' : 'cash-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
