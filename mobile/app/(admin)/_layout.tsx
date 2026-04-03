import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { TourGuideProvider } from '../../contexts/TourGuideContext';
import { TourOverlay } from '../../components/tour/TourOverlay';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminLayout() {
  console.log('🔧 AdminLayout component loaded');
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();

  console.log('🔧 AdminLayout - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'segments:', segments);

  useEffect(() => {
    // Wait until the root navigator is fully mounted before redirecting
    if (!navState?.key) return;

    console.log('🔧 AdminLayout useEffect - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);
    if (!isAuthenticated || !isAdmin) {
      console.log('🔐 Admin access denied, redirecting to home');
      // Small delay to let the current render cycle finish
      const t = setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, isAdmin, navState?.key]);

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
    <TourGuideProvider>
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
        <Stack.Screen name="moderation" options={{ headerShown: false }} />
        <Stack.Screen name="users/index" options={{ headerShown: false }} />
        <Stack.Screen name="users/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="suppliers/index" options={{ headerShown: false }} />
        <Stack.Screen name="suppliers/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="ticket/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="refunds/index" options={{ headerShown: false }} />
        <Stack.Screen name="refunds/analytics" options={{ headerShown: false }} />
        <Stack.Screen name="categories/index" options={{ headerShown: false }} />
        <Stack.Screen name="ads/index" options={{ headerShown: false }} />
        <Stack.Screen name="ads/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="finance" options={{ headerShown: false }} />
        <Stack.Screen name="reviews" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
      <TourOverlay />
    </NotificationProvider>
    </TourGuideProvider>
  );
}


