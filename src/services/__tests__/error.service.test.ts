import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorService,
  withRetry,
  handleError,
  getUserFriendlyMessage,
} from '../error.service';
import type { APIError } from '@/types/api.types';

// Mock window for event dispatching
const mockWindow = {
  dispatchEvent: vi.fn(),
};
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('ErrorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly message for API errors', () => {
      const apiError: APIError = {
        message: 'Validation failed',
        status: 400,
      };

      const result = getUserFriendlyMessage(apiError);
      expect(result).toBe('Validation failed');
    });

    it('should return default message for 401 errors', () => {
      const apiError: APIError = {
        message: 'Unauthorized',
        status: 401,
      };

      const result = getUserFriendlyMessage(apiError);
      expect(result).toBe('Your session has expired. Please log in again.');
    });

    it('should return default message for 500 errors', () => {
      const apiError: APIError = {
        message: 'Internal server error',
        status: 500,
      };

      const result = getUserFriendlyMessage(apiError);
      expect(result).toBe('Server error. Please try again later.');
    });

    it('should handle network errors', () => {
      const networkError = new Error('Network Error');
      const result = getUserFriendlyMessage(networkError);
      expect(result).toBe(
        'Network connection error. Please check your internet connection and try again.'
      );
    });

    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      const result = getUserFriendlyMessage(timeoutError);
      expect(result).toBe('Request timed out. Please try again.');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for server errors', () => {
      const serverError: APIError = { message: 'Server error', status: 500 };
      expect(ErrorService.isRetryableError(serverError)).toBe(true);
    });

    it('should return true for rate limiting', () => {
      const rateLimitError: APIError = {
        message: 'Too many requests',
        status: 429,
      };
      expect(ErrorService.isRetryableError(rateLimitError)).toBe(true);
    });

    it('should return false for client errors', () => {
      const clientError: APIError = { message: 'Bad request', status: 400 };
      expect(ErrorService.isRetryableError(clientError)).toBe(false);
    });

    it('should return true for network errors', () => {
      const networkError = new Error('Network Error');
      expect(ErrorService.isRetryableError(networkError)).toBe(true);
    });
  });

  describe('calculateDelay', () => {
    it('should calculate exponential backoff delay', () => {
      const config = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      };

      expect(ErrorService.calculateDelay(1, config)).toBe(1000);
      expect(ErrorService.calculateDelay(2, config)).toBe(2000);
      expect(ErrorService.calculateDelay(3, config)).toBe(4000);
    });

    it('should cap delay at maxDelay', () => {
      const config = {
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 3000,
        backoffFactor: 2,
      };

      expect(ErrorService.calculateDelay(4, config)).toBe(3000);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue('success');

      const result = await withRetry(mockFn, { maxRetries: 2, baseDelay: 10 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const apiError: APIError = { message: 'Bad request', status: 400 };
      const mockFn = vi.fn().mockRejectedValue(apiError);

      await expect(withRetry(mockFn)).rejects.toEqual(apiError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const networkError = new Error('Network Error');
      const mockFn = vi.fn().mockRejectedValue(networkError);

      await expect(
        withRetry(mockFn, { maxRetries: 2, baseDelay: 10 })
      ).rejects.toEqual(networkError);
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('handleError', () => {
    it('should dispatch error toast event when showToast is true', () => {
      const apiError: APIError = { message: 'Test error', status: 500 };

      handleError(apiError, 'test context', { showToast: true });

      expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'show-error-toast',
          detail: {
            title: 'Error',
            message: 'Server error. Please try again later.',
          },
        })
      );
    });

    it('should not dispatch toast event when showToast is false', () => {
      const apiError: APIError = { message: 'Test error', status: 500 };

      handleError(apiError, 'test context', { showToast: false });

      expect(mockWindow.dispatchEvent).not.toHaveBeenCalled();
    });

    it('should log error when logError is true', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const apiError: APIError = { message: 'Test error', status: 500 };

      handleError(apiError, 'test context', { logError: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in test context:',
        apiError
      );

      consoleSpy.mockRestore();
    });
  });

  describe('createApiWrapper', () => {
    it('should wrap function with error handling', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = ErrorService.createApiWrapper(mockFn, 'test context');

      const result = await wrappedFn('arg1', 'arg2');

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle errors in wrapped function', async () => {
      const apiError: APIError = { message: 'Test error', status: 500 };
      const mockFn = vi.fn().mockRejectedValue(apiError);
      const wrappedFn = ErrorService.createApiWrapper(mockFn, 'test context');

      await expect(wrappedFn()).rejects.toEqual(apiError);
    });

    it('should apply retry logic when configured', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue('success');

      const wrappedFn = ErrorService.createApiWrapper(mockFn, 'test context', {
        retryConfig: {
          maxRetries: 2,
          baseDelay: 10,
          maxDelay: 100,
          backoffFactor: 2,
        },
      });

      const result = await wrappedFn();

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
