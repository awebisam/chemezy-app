import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true,
  redirectTo,
}) => {
  const { isAuthenticated, isLoading, getCurrentUser, token } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // If we have a token but no user info, try to get current user
    if (token && !isAuthenticated && !isLoading) {
      getCurrentUser().catch(() => {
        // If getting user info fails, the store will handle logout
      });
    }
  }, [token, isAuthenticated, isLoading, getCurrentUser]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    const redirectPath = redirectTo || '/lab';
    return <Navigate to={redirectPath} replace />;
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
};
