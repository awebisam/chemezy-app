import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { usePageLoading, useAsyncLoading } from '../usePageLoading';

// Mock timers
vi.useFakeTimers();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('usePageLoading', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should start with loading state', () => {
    const { result } = renderHook(() => usePageLoading(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  it('should stop loading after default delay', () => {
    const { result } = renderHook(() => usePageLoading(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should respect custom delay', () => {
    const { result } = renderHook(() => usePageLoading({ delay: 500 }), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should timeout after maximum time', () => {
    const { result } = renderHook(() => usePageLoading({ timeout: 1000 }), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should restart loading on route change', () => {
    const { result, rerender } = renderHook(
      ({ initialEntries }) => usePageLoading(),
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        ),
        initialProps: { initialEntries: ['/'] }
      }
    );

    // Initial loading
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current.isLoading).toBe(false);

    // Change route
    rerender({ initialEntries: ['/new-route'] });
    
    expect(result.current.isLoading).toBe(true);
  });
});

describe('useAsyncLoading', () => {
  it('should initialize with empty loading states', () => {
    const { result } = renderHook(() => useAsyncLoading());
    
    expect(result.current.loadingStates).toEqual({});
    expect(result.current.isAnyLoading).toBe(false);
    expect(result.current.isLoading('test')).toBe(false);
  });

  it('should set and get loading states', () => {
    const { result } = renderHook(() => useAsyncLoading());
    
    act(() => {
      result.current.setLoading('operation1', true);
    });
    
    expect(result.current.isLoading('operation1')).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);
    expect(result.current.loadingStates).toEqual({ operation1: true });
  });

  it('should handle multiple loading states', () => {
    const { result } = renderHook(() => useAsyncLoading());
    
    act(() => {
      result.current.setLoading('op1', true);
      result.current.setLoading('op2', true);
    });
    
    expect(result.current.isLoading('op1')).toBe(true);
    expect(result.current.isLoading('op2')).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);
    
    act(() => {
      result.current.setLoading('op1', false);
    });
    
    expect(result.current.isLoading('op1')).toBe(false);
    expect(result.current.isLoading('op2')).toBe(true);
    expect(result.current.isAnyLoading).toBe(true);
    
    act(() => {
      result.current.setLoading('op2', false);
    });
    
    expect(result.current.isAnyLoading).toBe(false);
  });

  it('should return false for non-existent keys', () => {
    const { result } = renderHook(() => useAsyncLoading());
    
    expect(result.current.isLoading('nonexistent')).toBe(false);
  });
});