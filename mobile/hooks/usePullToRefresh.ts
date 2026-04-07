import { useRef, useState } from 'react';
import { PanResponder, Animated } from 'react-native';

interface UsePullToRefreshProps {
  onRefresh: () => void;
  refreshThreshold?: number;
  autoRefreshInterval?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  refreshThreshold = 80,
  autoRefreshInterval = 30000, // 30 seconds
}: UsePullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const lastRefreshTime = useRef(Date.now());
  const autoRefreshTimer = useRef<NodeJS.Timeout>();

  // Auto refresh functionality
  const startAutoRefresh = () => {
    if (autoRefreshTimer.current) {
      clearInterval(autoRefreshTimer.current);
    }
    
    autoRefreshTimer.current = setInterval(() => {
      const now = Date.now();
      if (now - lastRefreshTime.current >= autoRefreshInterval) {
        triggerRefresh();
      }
    }, autoRefreshInterval);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshTimer.current) {
      clearInterval(autoRefreshTimer.current);
      autoRefreshTimer.current = undefined;
    }
  };

  const triggerRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    lastRefreshTime.current = Date.now();
    
    // Animate to refresh position
    Animated.timing(translateY, {
      toValue: refreshThreshold,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      await onRefresh();
    } finally {
      // Animate back to original position
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsRefreshing(false);
      });
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderGrant: () => {
      translateY.setOffset(translateY._value);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(Math.min(gestureState.dy, refreshThreshold * 1.5));
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      translateY.flattenOffset();
      
      if (gestureState.dy >= refreshThreshold && !isRefreshing) {
        triggerRefresh();
      } else {
        // Animate back to original position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const getRefreshProgress = () => {
    return translateY._value / refreshThreshold;
  };

  return {
    isRefreshing,
    translateY,
    panResponder,
    triggerRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    getRefreshProgress,
  };
};