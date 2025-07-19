import type { APIError } from '@/types/api.types';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  retryConfig?: Partial<RetryConfig>;
}

export class ErrorService {
  private static defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  };

  /**
   * Convert API errors to user-friendly messages
   */
  static getUserFriendlyMessage(error: APIError | Error): string {
    if ('status' in error) {
      // Handle API errors
      switch (error.status) {
        case 400:
          return error.message || 'Invalid request. Please check your input and try again.';
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return error.message || 'This action conflicts with existing data.';
        case 422:
          return error.message || 'Please check your input and try again.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error. Please try again later.';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred. Please try again.';
      }
    }

    // Handle generic errors
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Determine if an error is retryable
   */
  static isRetryableError(error: APIError | Error): boolean {
    if ('status' in error) {
      // Retry on server errors and rate limiting
      return error.status >= 500 || error.status === 429;
    }

    // Retry on network errors
    return (
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('fetch')
    );
  }

  /**
   * Calculate delay for exponential backoff
   */
  static calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry if it's the last attempt or error is not retryable
        if (attempt > retryConfig.maxRetries || !this.isRetryableError(lastError)) {
          throw lastError;
        }

        // Wait before retrying
        const delay = this.calculateDelay(attempt, retryConfig);
        await this.sleep(delay);

        console.warn(`Retry attempt ${attempt}/${retryConfig.maxRetries} after ${delay}ms delay`);
      }
    }

    throw lastError!;
  }

  /**
   * Handle errors with consistent logging and user feedback
   */
  static handleError(
    error: APIError | Error,
    context: string,
    options: ErrorHandlerOptions = {}
  ): APIError {
    const {
      showToast = true,
      logError = true,
    } = options;

    // Normalize error
    const apiError: APIError = 'status' in error ? error : {
      message: error.message,
      status: 0,
    };

    // Log error
    if (logError) {
      console.error(`Error in ${context}:`, apiError);
    }

    // Show toast notification if requested
    if (showToast && typeof window !== 'undefined') {
      // We'll dispatch a custom event that the toast system can listen to
      const event = new CustomEvent('show-error-toast', {
        detail: {
          title: 'Error',
          message: this.getUserFriendlyMessage(apiError),
        },
      });
      window.dispatchEvent(event);
    }

    return apiError;
  }

  /**
   * Create a wrapper for API calls with error handling and retry logic
   */
  static createApiWrapper<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: string,
    options: ErrorHandlerOptions = {}
  ) {
    return async (...args: T): Promise<R> => {
      try {
        if (options.retryConfig) {
          return await this.withRetry(() => fn(...args), options.retryConfig);
        }
        return await fn(...args);
      } catch (error) {
        throw this.handleError(error as APIError | Error, context, options);
      }
    };
  }
}

// Export convenience functions
export const withRetry = ErrorService.withRetry.bind(ErrorService);
export const handleError = ErrorService.handleError.bind(ErrorService);
export const getUserFriendlyMessage = ErrorService.getUserFriendlyMessage.bind(ErrorService);
export const createApiWrapper = ErrorService.createApiWrapper.bind(ErrorService);