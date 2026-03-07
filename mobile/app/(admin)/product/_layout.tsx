import { Stack } from 'expo-router';
import { theme } from '../../../theme';

export default function ProductStackLayout() {
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
        name="new"
        options={{
          title: 'Add Product',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Edit Product',
        }}
      />
    </Stack>
  );
}
