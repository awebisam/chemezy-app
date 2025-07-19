import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { routes, getRouteByPath, generateBreadcrumbsFromPath, getRouteMetadata } from '@/config/routes';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current route information
  const currentRoute = useMemo(() => {
    return getRouteByPath(location.pathname);
  }, [location.pathname]);

  // Get breadcrumbs for current path
  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbsFromPath(location.pathname);
  }, [location.pathname]);

  // Get route metadata
  const metadata = useMemo(() => {
    return getRouteMetadata(location.pathname);
  }, [location.pathname]);

  // Navigation helpers
  const navigateTo = useCallback((path: string, options?: { replace?: boolean; state?: any }) => {
    navigate(path, options);
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  // Check if a path is active
  const isActive = useCallback((path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Get navigation routes for menus
  const navigationRoutes = useMemo(() => {
    return routes.filter(route => route.showInNav);
  }, []);

  return {
    // Current state
    currentPath: location.pathname,
    currentRoute,
    breadcrumbs,
    metadata,
    
    // Navigation functions
    navigateTo,
    goBack,
    goForward,
    isActive,
    
    // Route data
    routes,
    navigationRoutes,
  };
};

// Hook for managing page loading states during navigation
export const usePageLoading = () => {
  const location = useLocation();
  
  // This could be enhanced to track actual loading states
  // For now, it provides a simple interface for page transitions
  return {
    isLoading: false, // Could be connected to route-level loading states
    pathname: location.pathname,
    key: location.key, // Useful for detecting navigation changes
  };
};