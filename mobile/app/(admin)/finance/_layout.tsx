import { Stack } from 'expo-router';
import { theme } from '../../../theme';

export default function FinanceStackLayout() {
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
        name="refunds"
        options={{
          title: 'Refund History',
        }}
      />
    </Stack>
  );
}
