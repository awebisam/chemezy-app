import { useState, useCallback, useRef, useEffect } from 'react';
import { ErrorService } from '@/services/error.service';
import type { APIError } from '@/types/api.types';

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  lastUpdated: Date | null;
}

export interface AsyncOperationOptions {
  retryConfig?: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
  };
  showErrorToast?: boolean;
  logErrors?: boolean;
  resetOnNewOperation?: boolean;
}

export interface AsyncOperationResult<T> extends AsyncOperationState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  isStale: (maxAge: number) => boolean;
}

/**
 * Hook for managing async operations with loading states, error handling, and retry logic
 */
export function useAsyncOperation<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: AsyncOperationOptions = {}
): AsyncOperationResult<T> {
  const {
    retryConfig,
    showErrorToast = true,
    logErrors = true,
    resetOnNewOperation = true,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const lastArgsRef = useRef<Args | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Store args for retry functionality
    lastArgsRef.current = args;

    // Reset error if starting new operation
    if (resetOnNewOperation) {
      setState(prev => ({ ...prev, error: null }));
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const wrappedFunction = ErrorService.createApiWrapper(
        asyncFunction,
        'useAsyncOperation',
        {
          retryConfig,
          showToast: showErrorToast,
          logError: logErrors,
        }
      );

      const result = await wrappedFunction(...args);

      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });

      return result;
    } catch (error) {
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const apiError = error as APIError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));

      return null;
    }
  }, [asyncFunction, retryConfig, showErrorToast, logErrors, resetOnNewOperation]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastArgsRef.current) {
      return execute(...lastArgsRef.current);
    }
    return null;
  }, [execute]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null,
    });
    lastArgsRef.current = null;
  }, []);

  const isStale = useCallback((maxAge: number): boolean => {
    if (!state.lastUpdated) return true;
    return Date.now() - state.lastUpdated.getTime() > maxAge;
  }, [state.lastUpdated]);

  return {
    ...state,
    execute,
    retry,
    reset,
    isStale,
  };
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncOperations<T extends Record<string, any>>(
  operations: {
    [K in keyof T]: (...args: any[]) => Promise<T[K]>;
  },
  options: AsyncOperationOptions = {}
) {
  const results = {} as {
    [K in keyof T]: AsyncOperationResult<T[K]>;
  };

  for (const key in operations) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key] = useAsyncOperation(operations[key], options);
  }

  const isAnyLoading = Object.values(results).some(result => result.loading);
  const hasAnyError = Object.values(results).some(result => result.error);
  const allHaveData = Object.values(results).every(result => result.data !== null);

  return {
    operations: results,
    isAnyLoading,
    hasAnyError,
    allHaveData,
    resetAll: () => {
      Object.values(results).forEach(result => result.reset());
    },
  };
}