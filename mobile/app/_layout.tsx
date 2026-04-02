import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, UIManager } from 'react-native';
import * as Notifications from 'expo-notifications';

import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { MessagesProvider } from '../contexts/MessagesContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';
import { AlertProvider } from '../contexts/AlertContext';
import { RedirectProvider } from '../contexts/RedirectContext';
import { CartSidebar } from '../components/CartSidebar';
import { useAuthTokenMonitor } from '../hooks/useAuthTokenMonitor';
import { preloadService } from '../services/PreloadService';
import { SessionProvider } from '../contexts/SessionContext';
import { ActivityTracker } from '../components/ActivityTracker';
import { InAppToast } from '../components/InAppToast';
import { handleNotificationDeepLink } from '../utils/notificationDeepLink';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notification handler to suppress OS banner in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

interface ToastState {
  title: string;
  body: string;
  data?: Record<string, any>;
}

function RootLayoutContent() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-VariableFont_wdth,wght.ttf'),
    'Roboto-Italic': require('../assets/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf'),
  });

  const [toastState, setToastState] = useState<ToastState | null>(null);

  // Monitor token expiry and handle user feedback
  useAuthTokenMonitor();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      // Start preloading essential data in background
      preloadService.preloadEssentialData();
    }
  }, [fontsLoaded]);

  // Setup notification listeners
  useEffect(() => {
    // Foreground notification listener - shows in-app toast
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;
        setToastState({
          title: title || 'Notification',
          body: body || '',
          data: data as Record<string, any> | undefined,
        });
      }
    );

    // Background/killed state notification tap listener - handles deep linking
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        if (data) {
          handleNotificationDeepLink(data as Record<string, any>, router);
        }
      }
    );

    // Cleanup listeners on unmount
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      </Stack>

      {/* Render in-app toast when notification received in foreground */}
      {toastState && (
        <InAppToast
          title={toastState.title}
          body={toastState.body}
          data={toastState.data}
          onDismiss={() => setToastState(null)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SessionProvider>
            <RedirectProvider>
              <CartProvider>
                <WishlistProvider>
                  <MessagesProvider>
                    <AlertProvider>
                      <ActivityTracker>
                        <RootLayoutContent />
                        <CartSidebar />
                      </ActivityTracker>
                    </AlertProvider>
                  </MessagesProvider>
                </WishlistProvider>
              </CartProvider>
            </RedirectProvider>
          </SessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
