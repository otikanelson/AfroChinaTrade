import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Redirect non-admin users to home (allow guest mode)
    if (!isAuthenticated) {
      console.log('🔐 Admin access denied: Not authenticated, redirecting to home');
      router.replace('/(tabs)/home');
    } else if (!isAdmin) {
      console.log('🔐 Admin access denied: Not admin user, redirecting to home');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isAdmin, router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    text: {
      marginTop: spacing.md,
      fontSize: fontSizes.base,
      color: colors.textSecondary,
    },
  });

  // Show loading while checking authentication
  if (!isAuthenticated || !isAdmin) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>Checking admin access...</Text>
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
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.background,
            headerTitleStyle: {
              fontWeight: fontWeights.semibold,
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
          name="collections"
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
          name="suppliers"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ticket"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="refunds"
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


