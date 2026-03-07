import { Stack } from 'expo-router';
import { theme } from '../../../theme';

export default function ModerationStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.background,
        headerTitleStyle: {
          fontWeight: theme.fontWeights.semibold,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Moderation',
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: 'Customer Reports',
        }}
      />
      <Stack.Screen
        name="reviews"
        options={{
          title: 'Product Reviews',
        }}
      />
      <Stack.Screen
        name="tickets"
        options={{
          title: 'Support Tickets',
        }}
      />
    </Stack>
  );
}
