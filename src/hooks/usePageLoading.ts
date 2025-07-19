import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UsePageLoadingOptions {
  delay?: number; // Minimum loading time in ms
  timeout?: number; // Maximum loading time in ms
}

export const usePageLoading = (options: UsePageLoadingOptions = {}) => {
  const { delay = 200, timeout = 5000 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;

    // Start loading
    setIsLoading(true);

    // Minimum delay to prevent flash
    delayTimer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    // Maximum timeout to prevent infinite loading
    timeoutTimer = setTimeout(() => {
      setIsLoading(false);
    }, timeout);

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);
    };
  }, [location.pathname, delay, timeout]);

  return { isLoading };
};

// Hook for managing async operation loading states
export const useAsyncLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;
  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
  };
};
