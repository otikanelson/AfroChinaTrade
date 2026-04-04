import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, UIManager, LogBox, AppState } from 'react-native';
import Constants from 'expo-constants';

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
import { adService, Ad } from '../services/AdService';
import { SplashAdModal } from '../components/SplashAdModal';

// Ignore expo-notifications warnings in Expo Go
LogBox.ignoreLogs([
  'expo-notifications',
  'Android Push notifications',
  'remote notifications',
]);

// Suppress console errors for expo-notifications in Expo Go
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('expo-notifications') || 
     args[0].includes('Android Push notifications'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

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
  const [splashAd, setSplashAd] = useState<Ad | null>(null);
  const [showSplashAd, setShowSplashAd] = useState(false);

  // Monitor token expiry and handle user feedback
  useAuthTokenMonitor();

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
        
        // Start preloading essential data in background
        preloadService.preloadEssentialData();
        
        // Load splash ad
        try {
          const response = await adService.getSplashAd();
          if (response.success && response.data) {
            setSplashAd(response.data);
            setShowSplashAd(true);
            
            // Mark as seen for analytics
            adService.markSplashAdSeen(response.data._id);
          }
        } catch (e) {
          console.warn('Error loading splash ad:', e);
        }
      }
    }
    
    prepare();
  }, [fontsLoaded]);

  // Handle app state changes for session-based splash ads
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground - reset session flag for splash ads
        adService.resetSessionFlag();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Setup notification listeners (only if not in Expo Go)
  useEffect(() => {
    // Skip notification setup in Expo Go to avoid errors
    if (isExpoGo) {
      return;
    }

    // Dynamically import notifications only when not in Expo Go
    let receivedSubscription: any;
    let responseSubscription: any;

    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        
        // Set notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          }),
        });

        // Foreground notification listener - shows in-app toast
        receivedSubscription = Notifications.addNotificationReceivedListener(
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
        responseSubscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const { data } = response.notification.request.content;
            if (data) {
              handleNotificationDeepLink(data as Record<string, any>, router);
            }
          }
        );
      } catch (error) {
        // Silently ignore notification listener errors
      }
    })();

    // Cleanup listeners on unmount
    return () => {
      if (receivedSubscription) {
        receivedSubscription.remove();
      }
      if (responseSubscription) {
        responseSubscription.remove();
      }
    };
  }, [router]);

  if (!fontsLoaded) {
    return null;
  }

  const handleCloseSplashAd = () => {
    setShowSplashAd(false);
    setSplashAd(null);
  };

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
      
      {/* Splash Ad Modal */}
      {showSplashAd && splashAd && (
        <SplashAdModal ad={splashAd} onClose={handleCloseSplashAd} />
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
