import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';

export default function AdminLayout() {
  const { isAuthenticated, isSeller, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // In development, allow access without seller account for testing
    // Remove this bypass in production
    if (__DEV__) return;
    if (!isAuthenticated || !isSeller) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isSeller]);

  // In dev mode, skip the auth check entirely
  if (__DEV__) {
    return (
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ title: 'Admin Dashboard', headerShown: true, headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: theme.colors.background, headerTitleStyle: { fontWeight: theme.fontWeights.semibold } }} />
          <Stack.Screen name="product" options={{ headerShown: false }} />
          <Stack.Screen name="order" options={{ headerShown: false }} />
          <Stack.Screen name="message" options={{ headerShown: false }} />
          <Stack.Screen name="moderation" options={{ headerShown: false }} />
          <Stack.Screen name="users" options={{ headerShown: false }} />
          <Stack.Screen name="finance" options={{ headerShown: false }} />
        </Stack>
      </NotificationProvider>
    );
  }

  // Show loading state while checking authentication
  if (!isAuthenticated || !isSeller) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.text}>Checking access...</Text>
      </View>
    );
  }

  return (
    <NotificationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: 'Admin Dashboard',
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.background,
            headerTitleStyle: {
              fontWeight: theme.fontWeights.semibold,
            },
          }}
        />
        <Stack.Screen
          name="product"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="order"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="message"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="moderation"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="users"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="finance"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  text: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
  },
});
