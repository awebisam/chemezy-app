import React, { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { LoadingTransition } from './PageTransition';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  redirectTo,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <LoadingTransition isLoading={true}>
        <div />
      </LoadingTransition>
    );
  }

  // Handle authentication requirements
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate to={redirectTo || '/auth'} state={{ from: location }} replace />
    );
  }

  if (!requireAuth && isAuthenticated && location.pathname === '/auth') {
    return <Navigate to="/lab" replace />;
  }

  // Wrap children in Suspense for lazy-loaded components
  return (
    <Suspense
      fallback={
        fallback || (
          <LoadingTransition isLoading={true}>
            <div />
          </LoadingTransition>
        )
      }
    >
      {children}
    </Suspense>
  );
};

// Higher-order component for route protection
export const withRouteGuard = (
  Component: React.ComponentType,
  options: Omit<RouteGuardProps, 'children'> = {}
) => {
  return (props: any) => (
    <RouteGuard {...options}>
      <Component {...props} />
    </RouteGuard>
  );
};
