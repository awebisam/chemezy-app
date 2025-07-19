import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsive, useBreakpoint, useTouchDevice } from '../useResponsive';

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock touch support
const mockTouchSupport = (hasTouch: boolean) => {
  if (hasTouch) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: () => {},
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 1,
    });
  } else {
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  }
};

describe('useResponsive', () => {
  beforeEach(() => {
    // Reset to default desktop size
    mockWindowDimensions(1024, 768);
    mockTouchSupport(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect mobile screen size', () => {
    mockWindowDimensions(640, 480);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.screenWidth).toBe(640);
    expect(result.current.screenHeight).toBe(480);
    expect(result.current.orientation).toBe('landscape');
  });

  it('should detect tablet screen size', () => {
    mockWindowDimensions(800, 600);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(false);
  });

  it('should detect desktop screen size', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isLargeDesktop).toBe(false);
  });

  it('should detect large desktop screen size', () => {
    mockWindowDimensions(1400, 900);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(true);
  });

  it('should detect portrait orientation', () => {
    mockWindowDimensions(480, 800);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.orientation).toBe('portrait');
  });

  it('should detect landscape orientation', () => {
    mockWindowDimensions(800, 480);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.orientation).toBe('landscape');
  });

  it('should detect touch device', () => {
    mockTouchSupport(true);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should detect non-touch device', () => {
    mockTouchSupport(false);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isTouchDevice).toBe(false);
  });

  it('should use custom breakpoints', () => {
    mockWindowDimensions(900, 600);
    const customBreakpoints = {
      md: 900,
      lg: 1200,
    };
    
    const { result } = renderHook(() => useResponsive(customBreakpoints));
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
  });

  it('should update on window resize', () => {
    mockWindowDimensions(640, 480);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(true);
    
    // Simulate window resize
    mockWindowDimensions(1200, 800);
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.screenWidth).toBe(1200);
    expect(result.current.screenHeight).toBe(800);
  });

  it('should handle orientation change', () => {
    mockWindowDimensions(480, 800);
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.orientation).toBe('portrait');
    
    // Simulate orientation change
    mockWindowDimensions(800, 480);
    
    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
      // Simulate the timeout delay
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.orientation).toBe('landscape');
  });

  it('should provide SSR-safe defaults', () => {
    // Mock server environment
    const originalWindow = global.window;
    delete (global as any).window;
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.screenWidth).toBe(1024);
    expect(result.current.screenHeight).toBe(768);
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isTouchDevice).toBe(false);
    
    // Restore window
    global.window = originalWindow;
  });
});

describe('useBreakpoint', () => {
  beforeEach(() => {
    mockWindowDimensions(1024, 768);
  });

  it('should return true for met breakpoints', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useBreakpoint('lg'));
    
    expect(result.current).toBe(true);
  });

  it('should return false for unmet breakpoints', () => {
    mockWindowDimensions(800, 600);
    const { result } = renderHook(() => useBreakpoint('lg'));
    
    expect(result.current).toBe(false);
  });
});

describe('useTouchDevice', () => {
  it('should return true for touch devices', () => {
    mockTouchSupport(true);
    const { result } = renderHook(() => useTouchDevice());
    
    expect(result.current).toBe(true);
  });

  it('should return false for non-touch devices', () => {
    mockTouchSupport(false);
    const { result } = renderHook(() => useTouchDevice());
    
    expect(result.current).toBe(false);
  });
});