import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncOperation } from '../useAsyncOperation';
import type { APIError } from '@/types/api.types';

// Mock the error service
vi.mock('@/services/error.service', () => ({
  ErrorService: {
    createApiWrapper: vi.fn((fn) => fn),
  },
}));

describe('useAsyncOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useAsyncOperation(mockFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should handle successful execution', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsyncOperation(mockFn));

    act(() => {
      result.current.execute('arg1', 'arg2');
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should handle execution errors', async () => {
    const apiError: APIError = { message: 'Test error', status: 500 };
    const mockFn = vi.fn().mockRejectedValue(apiError);
    const { result } = renderHook(() => useAsyncOperation(mockFn));

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(apiError);
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should support retry functionality', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValue('success');
    
    const { result } = renderHook(() => useAsyncOperation(mockFn));

    // First execution fails
    act(() => {
      result.current.execute('test');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();

    // Retry should succeed
    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeNull();
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('test');
  });

  it('should reset state', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useAsyncOperation(mockFn));

    // Set some state
    act(() => {
      result.current.execute();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should check if data is stale', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsyncOperation(mockFn));

    // Initially stale (no data)
    expect(result.current.isStale(5000)).toBe(true);

    // Execute to get data
    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Fresh data
    expect(result.current.isStale(5000)).toBe(false);

    // Wait a bit and check staleness with a very short max age
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Should be stale with very short max age
    expect(result.current.isStale(1)).toBe(true);
  });

  it('should cancel previous requests when new one starts', async () => {
    let resolveFirst: (value: string) => void;
    let resolveSecond: (value: string) => void;

    const firstPromise = new Promise<string>((resolve) => {
      resolveFirst = resolve;
    });

    const secondPromise = new Promise<string>((resolve) => {
      resolveSecond = resolve;
    });

    const mockFn = vi.fn()
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result } = renderHook(() => useAsyncOperation(mockFn));

    // Start first request
    act(() => {
      result.current.execute('first');
    });

    expect(result.current.loading).toBe(true);

    // Start second request (should cancel first)
    act(() => {
      result.current.execute('second');
    });

    // Resolve first request (should be ignored)
    act(() => {
      resolveFirst('first result');
    });

    // Resolve second request
    act(() => {
      resolveSecond('second result');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('second result');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should not reset error on new operation when resetOnNewOperation is false', async () => {
    const apiError: APIError = { message: 'Test error', status: 500 };
    const mockFn = vi.fn()
      .mockRejectedValueOnce(apiError)
      .mockResolvedValue('success');

    const { result } = renderHook(() => 
      useAsyncOperation(mockFn, { resetOnNewOperation: false })
    );

    // First execution fails
    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(apiError);

    // Second execution should not reset error initially
    act(() => {
      result.current.execute();
    });

    expect(result.current.error).toEqual(apiError); // Error should still be there

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeNull(); // Error cleared after success
  });
});