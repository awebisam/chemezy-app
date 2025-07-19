import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all the page components
jest.mock('@/pages/AuthPage', () => ({
  AuthPage: () => <div data-testid="auth-page">Auth Page</div>,
}));

jest.mock('@/pages/LabPage', () => ({
  LabPage: () => <div data-testid="lab-page">Lab Page</div>,
}));

jest.mock('@/pages/DashboardPage', () => ({
  DashboardPage: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

jest.mock('@/pages/LeaderboardPage', () => ({
  LeaderboardPage: () => (
    <div data-testid="leaderboard-page">Leaderboard Page</div>
  ),
}));

jest.mock('@/pages/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

// Mock the auth store
jest.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  }),
}));

// Mock other components that might cause issues
jest.mock('@/components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/components/ui/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('@/components/ui/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('Routing Integration', () => {
  it('redirects unauthenticated users to auth page', () => {
    renderWithRouter(['/lab']);

    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });

  it('shows auth page when visiting /auth', () => {
    renderWithRouter(['/auth']);

    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });

  it('shows 404 page for unknown routes when authenticated', () => {
    // Mock authenticated state
    jest.doMock('@/store/auth.store', () => ({
      useAuthStore: () => ({
        user: { username: 'testuser' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshToken: jest.fn(),
      }),
    }));

    renderWithRouter(['/unknown-route']);

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  it('redirects root path to /lab for authenticated users', () => {
    // Mock authenticated state
    jest.doMock('@/store/auth.store', () => ({
      useAuthStore: () => ({
        user: { username: 'testuser' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshToken: jest.fn(),
      }),
    }));

    renderWithRouter(['/']);

    // Should redirect to lab page
    expect(screen.getByTestId('lab-page')).toBeInTheDocument();
  });

  it('handles direct navigation to protected routes', () => {
    renderWithRouter(['/dashboard']);

    // Should redirect to auth since user is not authenticated
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });

  it('shows 404 page when navigating to /404', () => {
    renderWithRouter(['/404']);

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});

describe('Route Guard Integration', () => {
  it('protects routes that require authentication', () => {
    renderWithRouter(['/lab']);

    // Should show auth page instead of lab page
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    expect(screen.queryByTestId('lab-page')).not.toBeInTheDocument();
  });

  it('allows access to public routes', () => {
    renderWithRouter(['/auth']);

    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });
});

describe('Navigation State Management', () => {
  it('maintains navigation state across route changes', async () => {
    const { rerender } = renderWithRouter(['/auth']);

    expect(screen.getByTestId('auth-page')).toBeInTheDocument();

    // Simulate navigation to different route
    rerender(
      <MemoryRouter initialEntries={['/404']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
