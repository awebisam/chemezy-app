import React, { useEffect } from 'react';
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

    // Default fallback - show login prompt
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h1>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-600 mb-4">
              You need to be signed in to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If authentication is not required but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated && redirectTo) {
    window.location.href = redirectTo;
    return null;
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
};
