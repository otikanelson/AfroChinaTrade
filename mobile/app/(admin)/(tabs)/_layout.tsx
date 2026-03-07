import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { Platform } from 'react-native';

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 0 : 5,
          borderTopColor: theme.colors.border,
          marginBottom: Platform.OS === 'ios' ? 10 : 0,
          paddingTop: 3,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSizes.xs,
          fontWeight: theme.fontWeights.medium,
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
            backgroundColor: theme.colors.badge,
            color: theme.colors.badgeText,
            fontSize: 10,
            fontWeight: theme.fontWeights.bold,
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
            backgroundColor: theme.colors.badge,
            color: theme.colors.badgeText,
            fontSize: 10,
            fontWeight: theme.fontWeights.bold,
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
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cash' : 'cash-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
