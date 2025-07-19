import { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from '@/components/auth';
import { AuthPage, NotFoundPage } from '@/pages';
import { MainLayout } from '@/components/layout/MainLayout';
import { ErrorBoundary, ToastProvider, LoadingSpinner, PerformanceMonitor, BundleSizeMonitor } from '@/components/ui';
import { RouteGuard } from '@/components/layout';
import { useAuthStore } from '@/store/auth.store';
import { routes } from '@/config/routes';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public route - Landing/Auth page */}
              <Route 
                path="/auth" 
                element={
                  <RouteGuard requireAuth={false}>
                    <AuthPage />
                  </RouteGuard>
                } 
              />

              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  <RouteGuard requireAuth={true}>
                    <MainLayout />
                  </RouteGuard>
                }
              >
                <Route index element={<Navigate to="/lab" replace />} />
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path.substring(1)} // Remove leading slash for nested routes
                    element={
                      <Suspense 
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading page">
                            <LoadingSpinner size="lg" />
                          </div>
                        }
                      >
                        <route.component />
                      </Suspense>
                    }
                  />
                ))}
              </Route>

              {/* 404 Error page */}
              <Route path="/404" element={<NotFoundPage />} />
              
              {/* Catch-all route - redirect to auth if not authenticated, 404 if authenticated */}
              <Route path="*" element={<AuthRedirect />} />
            </Routes>
          </Router>
          
          {/* Development performance monitoring */}
          <PerformanceMonitor showInDev={true} position="bottom-right" />
          <BundleSizeMonitor />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

// Component to handle redirect logic based on auth state
function AuthRedirect() {
  const { isAuthenticated } = useAuthStore();
  
  // If authenticated, show 404 page for unknown routes
  // If not authenticated, redirect to auth page
  return <Navigate to={isAuthenticated ? '/404' : '/auth'} replace />;
}

export default App;
