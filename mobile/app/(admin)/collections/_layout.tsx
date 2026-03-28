import { Stack } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';

export default function CollectionsLayout() {
  const { colors, fontWeights } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Collections',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Collection',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Edit Collection',
          headerShown: false,
        }}
      />
    </Stack>
  );
}