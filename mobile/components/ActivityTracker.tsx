import React, { useEffect } from 'react';
import { View, PanResponder } from 'react-native';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';

interface ActivityTrackerProps {
  children: React.ReactNode;
}

/**
 * Component that wraps the app and tracks user activity
 * Updates session activity on any touch interaction
 */
export const ActivityTracker: React.FC<ActivityTrackerProps> = ({ children }) => {
  const { updateActivity } = useSession();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Just update activity when user changes, no cleanup needed
    updateActivity();
  }, [user, updateActivity]);

  // If no user is logged in, just render children without tracking
  if (!user) {
    return <>{children}</>;
  }

  // Create PanResponder for the current render
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      updateActivity();
      return false;
    },
    onMoveShouldSetPanResponder: () => {
      updateActivity();
      return false;
    },
  });

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

export default ActivityTracker;