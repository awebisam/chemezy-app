import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
}

export const useResponsive = (
  breakpoints: Partial<BreakpointConfig> = {}
): ResponsiveState => {
  const bp = { ...defaultBreakpoints, ...breakpoints };

  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
        screenWidth: 1024,
        screenHeight: 768,
        orientation: 'landscape',
        isTouchDevice: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      isMobile: width < bp.md,
      isTablet: width >= bp.md && width < bp.lg,
      isDesktop: width >= bp.lg && width < bp.xl,
      isLargeDesktop: width >= bp.xl,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setState({
        isMobile: width < bp.md,
        isTablet: width >= bp.md && width < bp.lg,
        isDesktop: width >= bp.lg && width < bp.xl,
        isLargeDesktop: width >= bp.xl,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Handle orientation change on mobile devices
    window.addEventListener('orientationchange', () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(handleResize, 100);
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [bp.md, bp.lg, bp.xl]);

  return state;
};

// Utility hook for specific breakpoint checks
export const useBreakpoint = (breakpoint: keyof BreakpointConfig): boolean => {
  const { screenWidth } = useResponsive();
  const bp = defaultBreakpoints[breakpoint];

  return screenWidth >= bp;
};

// Hook for checking if device supports touch
export const useTouchDevice = (): boolean => {
  const { isTouchDevice } = useResponsive();
  return isTouchDevice;
};
