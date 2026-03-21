import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useMessages } from '../../contexts/MessagesContext';
import { useTheme } from '../../contexts/ThemeContext';

function MessagesTabIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
  );
}

export default function TabLayout() {
  const { unreadCount } = useMessages();
  const { colors, fontSizes, fontWeights } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 0 : 5,
          borderTopColor: colors.border,
          marginBottom: Platform.OS === 'ios' ? 10 : 0,
          paddingTop: 3,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontWeight: fontWeights.medium,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buy-now"
        options={{
          title: 'Buy Now',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error, // Using error color for badge
            color: colors.textInverse,
            fontSize: 10,
            fontWeight: fontWeights.bold,
          },
          tabBarIcon: MessagesTabIcon,
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
