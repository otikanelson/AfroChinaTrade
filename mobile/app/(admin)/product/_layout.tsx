import { Stack } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ProductStackLayout() {
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
