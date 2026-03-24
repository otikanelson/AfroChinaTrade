import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';
import { useRedirect } from '../contexts/RedirectContext';

/**
 * Hook to require authentication for a screen
 * Redirects to login if user is not authenticated
 * Shows a message explaining why login is needed
 */
export const useRequireAuth = (message?: string) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const alert = useAlertContext();
  const { setPendingRedirect } = useRedirect();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store current path for redirect after login
      setPendingRedirect(pathname);
      
      alert.showInfo(
        'Sign In Required',
        message || 'Please sign in to access this feature',
        3000
      );
      
      // Small delay to show the message before redirecting
      setTimeout(() => {
        router.push('/auth/login');
      }, 500);
    }
  }, [isAuthenticated, isLoading, pathname]);

  return { isAuthenticated, isLoading };
};
