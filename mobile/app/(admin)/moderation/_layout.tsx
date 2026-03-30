import { Stack } from 'expo-router';

export default function ModerationStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="tickets" />
    </Stack>
  );
}
