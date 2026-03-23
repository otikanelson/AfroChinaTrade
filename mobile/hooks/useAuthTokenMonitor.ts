import { useEffect, useRef } from 'react';
import { useAlertContext } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { tokenManager } from '../services/api/tokenManager';
import { apiClient } from '../services/api/apiClient';

export const useAuthTokenMonitor = () => {
  const { logout } = useAuth();
  const alert = useAlertContext();
  const warningShownRef = useRef(false);
  const expiredHandledRef = useRef(false);

  useEffect(() => {
    // Setup token expiry warning
    tokenManager.onExpiryWarning((secondsRemaining) => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        const minutes = Math.ceil(secondsRemaining / 60);
        
        alert.showWarning(
          'Session Expiring Soon',
          `Your session will expire in ${minutes} minute${minutes > 1 ? 's' : ''}.`
        );
        
        // Reset warning flag after 2 minutes to allow re-warning if needed
        setTimeout(() => {
          warningShownRef.current = false;
        }, 120000);
      }
    });

    // Setup token expired callback
    apiClient.setOnTokenExpired(() => {
      if (!expiredHandledRef.current) {
        expiredHandledRef.current = true;
        warningShownRef.current = false;
        
        alert.showInfo(
          'Session Expired',
          'Your session has expired. You can continue browsing as a guest.'
        );
        
        // Log out silently and switch to guest mode
        logout().finally(() => {
          expiredHandledRef.current = false;
        });
      }
    });

    return () => {
      warningShownRef.current = false;
      expiredHandledRef.current = false;
    };
  }, [logout, alert]);
};
