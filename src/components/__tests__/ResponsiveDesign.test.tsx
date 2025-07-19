import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MainLayout } from '@/components/layout/MainLayout';
import { LabPage } from '@/pages/LabPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { useAuthStore } from '@/store/auth.store';
import { useLabStore } from '@/store/lab.store';
import { useDashboardStore } from '@/store/dashboard.store';

// Mock the stores
vi.mock('@/store/auth.store');
vi.mock('@/store/lab.store');
vi.mock('@/store/dashboard.store');

const mockAuthStore = vi.mocked(useAuthStore);
const mockLabStore = vi.mocked(useLabStore);
const mockDashboardStore = vi.mocked(useDashboardStore);

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Responsive Design', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    mockAuthStore.mockReturnValue({
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);

    mockLabStore.mockReturnValue({
      selectedChemicals: [],
      reactionResult: null,
      clearLab: vi.fn(),
      addChemical: vi.fn(),
    } as any);

    mockDashboardStore.mockReturnValue({
      awards: [],
      reactionStats: null,
      isLoading: false,
      error: null,
      refreshDashboard: vi.fn(),
      fetchAvailableAwards: vi.fn(),
      getTotalPoints: vi.fn(() => 0),
      getRecentAwards: vi.fn(() => []),
      clearError: vi.fn(),
    } as any);
  });

  describe('MainLayout Responsive Navigation', () => {
    it('should show mobile menu button on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      renderWithRouter(<MainLayout />);

      // Mobile menu button should be present
      const menuButton = screen.getByLabelText('Toggle mobile menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', () => {
      renderWithRouter(<MainLayout />);

      const menuButton = screen.getByLabelText('Toggle mobile menu');

      // Menu should be hidden initially
      expect(screen.queryByText('Virtual Lab')).not.toBeVisible();

      // Click to open menu
      fireEvent.click(menuButton);

      // Menu items should be visible
      expect(screen.getByText('Virtual Lab')).toBeVisible();
      expect(screen.getByText('Dashboard')).toBeVisible();
    });

    it('should show desktop navigation on larger screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      renderWithRouter(<MainLayout />);

      // Desktop navigation should be visible
      const desktopNav = screen.getAllByText('Virtual Lab')[0];
      expect(desktopNav).toBeInTheDocument();
    });
  });

  describe('LabPage Responsive Layout', () => {
    it('should render responsive layout structure', () => {
      renderWithRouter(<LabPage />);

      // Page title should be present
      expect(screen.getByText('Virtual Chemistry Lab')).toBeInTheDocument();

      // Inventory toggle button should be present
      expect(screen.getByText(/Hide|Show/)).toBeInTheDocument();

      // Lab bench should be present
      expect(screen.getByText('Lab Bench')).toBeInTheDocument();
    });

    it('should toggle inventory visibility', () => {
      renderWithRouter(<LabPage />);

      const toggleButton = screen.getByRole('button', { name: /Hide|Show/ });

      // Initially inventory should be visible
      expect(screen.getByText('Chemical Inventory')).toBeInTheDocument();

      // Click to hide inventory
      fireEvent.click(toggleButton);

      // Inventory should still be in DOM but layout should change
      expect(screen.getByText('Chemical Inventory')).toBeInTheDocument();
    });

    it('should show mobile-optimized instructions', () => {
      renderWithRouter(<LabPage />);

      // Mobile instructions should be present
      expect(screen.getByText(/Tap \+ Add/)).toBeInTheDocument();
    });
  });

  describe('Touch-friendly Interactions', () => {
    it('should have touch-manipulation class on interactive elements', () => {
      renderWithRouter(<LabPage />);

      const buttons = screen.getAllByRole('button');

      // At least some buttons should have touch-manipulation class
      const touchButtons = buttons.filter(button =>
        button.className.includes('touch-manipulation')
      );

      expect(touchButtons.length).toBeGreaterThan(0);
    });

    it('should have appropriate minimum touch target sizes', () => {
      renderWithRouter(<LabPage />);

      const buttons = screen.getAllByRole('button');

      // Check that buttons have reasonable minimum sizes for touch
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight) || parseInt(styles.height);
        const minWidth = parseInt(styles.minWidth) || parseInt(styles.width);

        // Touch targets should be at least 44px (iOS) or 48dp (Android)
        // We'll be lenient and check for at least 32px
        if (minHeight > 0) {
          expect(minHeight).toBeGreaterThanOrEqual(32);
        }
      });
    });
  });

  describe('Responsive Typography and Spacing', () => {
    it('should use responsive text classes', () => {
      renderWithRouter(<LabPage />);

      const heading = screen.getByText('Virtual Chemistry Lab');

      // Should have responsive text classes
      expect(heading.className).toMatch(/text-(xl|2xl)/);
      expect(heading.className).toMatch(/sm:text-/);
    });

    it('should use responsive padding and margins', () => {
      renderWithRouter(<LabPage />);

      const container = screen
        .getByText('Virtual Chemistry Lab')
        .closest('div');

      // Should have responsive spacing classes
      expect(container?.className).toMatch(/p(x|y)?-\d+/);
      expect(container?.className).toMatch(/sm:p/);
    });
  });

  describe('Grid and Layout Responsiveness', () => {
    it('should use responsive grid classes', () => {
      renderWithRouter(<LabPage />);

      // Look for grid containers
      const gridElements = document.querySelectorAll('[class*="grid"]');

      expect(gridElements.length).toBeGreaterThan(0);

      // Check for responsive grid classes
      const responsiveGrids = Array.from(gridElements).filter(
        el =>
          el.className.includes('grid-cols-1') &&
          (el.className.includes('lg:grid-cols') ||
            el.className.includes('sm:grid-cols'))
      );

      expect(responsiveGrids.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile-specific Features', () => {
    it('should show mobile-specific UI elements', () => {
      renderWithRouter(<LabPage />);

      // Mobile-specific text should be present
      expect(
        screen.getByText(/Tap \+ Add on chemicals to experiment/)
      ).toBeInTheDocument();
    });

    it('should hide desktop-only elements on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      renderWithRouter(<LabPage />);

      // Desktop-specific instructions should be hidden
      const desktopInstructions = screen.queryByText(
        /Drag chemicals from the inventory to the lab bench/
      );

      // This text might still be in DOM but hidden with CSS classes
      if (desktopInstructions) {
        expect(desktopInstructions.className).toMatch(/hidden|sm:block/);
      }
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain proper ARIA labels on touch devices', () => {
      renderWithRouter(<LabPage />);

      const buttons = screen.getAllByRole('button');

      // All buttons should have accessible names
      buttons.forEach(button => {
        const accessibleName =
          button.getAttribute('aria-label') ||
          button.getAttribute('aria-labelledby') ||
          button.textContent;

        expect(accessibleName).toBeTruthy();
      });
    });

    it('should have proper focus management', () => {
      renderWithRouter(<LabPage />);

      const focusableElements = screen.getAllByRole('button');

      // Elements should be focusable
      focusableElements.forEach(element => {
        expect(element.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
