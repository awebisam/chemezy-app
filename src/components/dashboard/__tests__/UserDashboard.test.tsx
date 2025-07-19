import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserDashboard } from '../UserDashboard';

// Mock the dashboard store
const mockUseDashboardStore = vi.fn();
vi.mock('@/store/dashboard.store', () => ({
  useDashboardStore: () => mockUseDashboardStore(),
}));

// Mock child components
vi.mock('../AwardsGrid', () => ({
  AwardsGrid: ({ category }: { category?: string }) => (
    <div data-testid="awards-grid">
      Awards Grid - Category: {category || 'all'}
    </div>
  ),
}));

vi.mock('../ProgressTracker', () => ({
  ProgressTracker: ({ category }: { category?: string }) => (
    <div data-testid="progress-tracker">
      Progress Tracker - Category: {category || 'all'}
    </div>
  ),
}));

describe('UserDashboard', () => {
  const mockStoreData = {
    awards: [
      {
        id: 1,
        user_id: 1,
        template_id: 1,
        tier: 2,
        progress: {},
        granted_at: '2024-01-01T00:00:00Z',
        template: {
          id: 1,
          name: 'First Discovery',
          description: 'Made your first chemical discovery',
          category: 'discovery' as const,
          metadata: {},
        },
      },
    ],
    availableAwards: [],
    reactionStats: {
      total_reactions: 25,
      unique_discoveries: 5,
      total_points: 150,
    },
    isLoading: false,
    error: null,
    fetchAwards: vi.fn(),
    fetchAvailableAwards: vi.fn(),
    fetchReactionStats: vi.fn(),
    refreshDashboard: vi.fn(),
    getTotalPoints: vi.fn(() => 20),
    getRecentAwards: vi.fn(() => []),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    mockUseDashboardStore.mockReturnValue(mockStoreData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard header correctly', () => {
    render(<UserDashboard />);

    expect(screen.getByText('Your Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Track your progress and achievements in chemistry')
    ).toBeInTheDocument();
  });

  it('displays stats overview cards', () => {
    render(<UserDashboard />);

    expect(screen.getByText('Total Awards')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // awards.length
    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument(); // getTotalPoints()
    expect(screen.getByText('Reactions')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // reactionStats.total_reactions
  });

  it('renders category filter buttons', () => {
    render(<UserDashboard />);

    expect(screen.getByText('All Awards')).toBeInTheDocument();
    expect(screen.getByText('Discovery')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Special')).toBeInTheDocument();
    expect(screen.getByText('Achievement')).toBeInTheDocument();
  });

  it('renders AwardsGrid and ProgressTracker components', () => {
    render(<UserDashboard />);

    expect(screen.getByTestId('awards-grid')).toBeInTheDocument();
    expect(screen.getByTestId('progress-tracker')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreData,
      isLoading: true,
      awards: [],
    });

    render(<UserDashboard />);

    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreData,
      error: 'Failed to load dashboard data',
    });

    render(<UserDashboard />);

    expect(
      screen.getByText('Failed to load dashboard data')
    ).toBeInTheDocument();
  });

  it('calls refreshDashboard on mount', async () => {
    const refreshDashboard = vi.fn();
    mockUseDashboardStore.mockReturnValue({
      ...mockStoreData,
      refreshDashboard,
    });

    render(<UserDashboard />);

    await waitFor(() => {
      expect(refreshDashboard).toHaveBeenCalledTimes(1);
    });
  });
});
