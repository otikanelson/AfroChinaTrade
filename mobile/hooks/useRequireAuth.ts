import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useAlertContext } from '../contexts/AlertContext';
import { useRedirect } from '../contexts/RedirectContext';

export const useRequireAuth = (message?: string) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const alert = useAlertContext();
  const { setPendingRedirect } = useRedirect();
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Clear any pending redirect timer when auth state changes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Only redirect when loading is fully done AND user is definitively not authenticated
    // user being null confirms it's not just a tokenManager timing issue
    if (!isLoading && !isAuthenticated && !user) {
      setPendingRedirect(pathname);

      alert.showInfo(
        'Sign In Required',
        message || 'Please sign in to access this feature',
        3000
      );

      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          router.push('/auth/login');
        }
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, pathname]);

  return { isAuthenticated, isLoading };
};
