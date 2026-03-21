import { useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to track user activity and update session
 * This should be used in the main app component to track all user interactions
 */
export const useActivityTracker = () => {
  const { updateActivity } = useSession();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Update activity when the hook is initialized
    updateActivity();
  }, [user, updateActivity]);
};

export default useActivityTracker;