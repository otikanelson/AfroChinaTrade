import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';

/**
 * Hook to require authentication for a screen
 * Redirects to login if user is not authenticated
 * Shows a message explaining why login is needed
 */
export const useRequireAuth = (message?: string) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const alert = useAlertContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};
