import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../Navigation';
import { useAuthStore } from '@/store/auth.store';
import { vi } from 'vitest';

// Mock the auth store
vi.mock('@/store/auth.store');
const mockUseAuthStore = useAuthStore as any;

// Mock the navigation hook
vi.mock('@/hooks/useNavigation', () => ({
  useNavigation: () => ({
    navigationRoutes: [
      {
        path: '/lab',
        label: 'Virtual Lab',
        description: 'Experiment with chemicals',
        showInNav: true
      },
      {
        path: '/dashboard',
        label: 'Dashboard',
        description: 'View your progress',
        showInNav: true
      },
      {
        path: '/leaderboard',
        label: 'Leaderboard',
        description: 'Compare with others',
        showInNav: true
      }
    ],
    isActive: (path: string) => path === '/lab',
    navigateTo: vi.fn()
  })
}));

const renderNavigation = (props = {}) => {
  return render(
    <BrowserRouter>
      <Navigation {...props} />
    </BrowserRouter>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: { username: 'testuser', email: 'test@example.com' },
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links', () => {
    renderNavigation();
    
    expect(screen.getByText('Virtual Lab')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('shows active state for current route', () => {
    renderNavigation();
    
    const labLink = screen.getByText('Virtual Lab').closest('a');
    expect(labLink).toHaveAttribute('aria-current', 'page');
  });

  it('displays user information when showUserMenu is true', () => {
    renderNavigation({ showUserMenu: true });
    
    expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
  });

  it('does not display user menu when showUserMenu is false', () => {
    renderNavigation({ showUserMenu: false });
    
    expect(screen.queryByText('Welcome, testuser!')).not.toBeInTheDocument();
  });

  it('opens and closes mobile menu', () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens and closes user menu', async () => {
    renderNavigation({ showUserMenu: true });
    
    const userMenuButton = screen.getByLabelText('User menu');
    expect(userMenuButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(userMenuButton);
    expect(userMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Check if dropdown menu appears
    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', () => {
    renderNavigation();
    
    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    
    fireEvent.keyDown(mobileMenuButton, { key: 'Enter' });
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.keyDown(mobileMenuButton, { key: ' ' });
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls logout when sign out is clicked', async () => {
    const mockLogout = vi.fn();
    mockUseAuthStore.mockReturnValue({
      user: { username: 'testuser', email: 'test@example.com' },
      logout: mockLogout,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn()
    });

    renderNavigation({ showUserMenu: true });
    
    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);
    
    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('applies correct accessibility attributes', () => {
    renderNavigation();
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    
    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  it('renders with vertical variant', () => {
    renderNavigation({ variant: 'vertical' });
    
    // The component should still render navigation links
    expect(screen.getByText('Virtual Lab')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });
});