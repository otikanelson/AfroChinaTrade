import { Stack } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';

export default function UsersStackLayout() {
  const { colors, fontWeights } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.background,
        headerTitleStyle: {
          fontWeight: fontWeights.semibold,
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
