import { Stack } from 'expo-router';
import { theme } from '../../../theme';

export default function UsersStackLayout() {
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
          title: 'User Management',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'User Details',
        }}
      />
    </Stack>
  );
}
