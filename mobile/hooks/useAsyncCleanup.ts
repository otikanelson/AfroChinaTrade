import { useEffect, useRef } from 'react';

/**
 * Hook to manage async operations and prevent memory leaks
 */
export const useAsyncCleanup = () => {
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    return () => {
      // Component is unmounting
      isMountedRef.current = false;
      
      // Clear all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
      
      // Clear all intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
      
      // Abort all ongoing requests
      abortControllersRef.current.forEach(controller => {
        try {
          controller.abort();
        } catch (error) {
          // Ignore abort errors
        }
      });
      abortControllersRef.current.clear();
    };
  }, []);

  const isMounted = () => isMountedRef.current;

  const safeSetTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        callback();
      }
      timeoutsRef.current.delete(timeout);
    }, delay);
    
    timeoutsRef.current.add(timeout);
    return timeout;
  };

  const safeSetInterval = (callback: () => void, delay: number): NodeJS.Timeout => {
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        callback();
      } else {
        clearInterval(interval);
        intervalsRef.current.delete(interval);
      }
    }, delay);
    
    intervalsRef.current.add(interval);
    return interval;
  };

  const createAbortController = (): AbortController => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    
    // Auto-cleanup when signal is aborted
    controller.signal.addEventListener('abort', () => {
      abortControllersRef.current.delete(controller);
    });
    
    return controller;
  };

  const safeClearTimeout = (timeout: NodeJS.Timeout) => {
    clearTimeout(timeout);
    timeoutsRef.current.delete(timeout);
  };

  const safeClearInterval = (interval: NodeJS.Timeout) => {
    clearInterval(interval);
    intervalsRef.current.delete(interval);
  };

  return {
    isMounted,
    safeSetTimeout,
    safeSetInterval,
    safeClearTimeout,
    safeClearInterval,
    createAbortController,
  };
};