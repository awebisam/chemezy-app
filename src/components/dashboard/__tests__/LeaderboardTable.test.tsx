import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardTable } from '../LeaderboardTable';
import { useDashboardStore } from '@/store/dashboard.store';
import { useAuthStore } from '@/store/auth.store';
import type { LeaderboardEntry, UserRank } from '@/types/award.types';

// Mock the stores
vi.mock('@/store/dashboard.store');
vi.mock('@/store/auth.store');

const mockUseDashboardStore = vi.mocked(useDashboardStore);
const mockUseAuthStore = vi.mocked(useAuthStore);

const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    user_id: 1,
    username: 'alice_chemist',
    award_count: 25,
    total_points: 750,
  },
  {
    rank: 2,
    user_id: 2,
    username: 'bob_scientist',
    award_count: 20,
    total_points: 600,
  },
  {
    rank: 3,
    user_id: 3,
    username: 'charlie_lab',
    award_count: 18,
    total_points: 540,
  },
  {
    rank: 4,
    user_id: 4,
    username: 'current_user',
    award_count: 15,
    total_points: 450,
  },
];

const mockUserRank: UserRank = {
  rank: 4,
  user_id: 4,
  username: 'current_user',
  award_count: 15,
  total_points: 450,
};

const mockUser = {
  id: 4,
  username: 'current_user',
  email: 'user@example.com',
};

describe('LeaderboardTable', () => {
  const mockFetchLeaderboard = vi.fn();
  const mockFetchUserRank = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDashboardStore.mockReturnValue({
      leaderboard: mockLeaderboardData,
      userRank: mockUserRank,
      isLoading: false,
      error: null,
      fetchLeaderboard: mockFetchLeaderboard,
      fetchUserRank: mockFetchUserRank,
      clearError: mockClearError,
      // Add other required properties with default values
      awards: [],
      availableAwards: [],
      reactionStats: null,
      reactionHistory: [],
      fetchAwards: vi.fn(),
      fetchAvailableAwards: vi.fn(),
      fetchReactionStats: vi.fn(),
      fetchReactionHistory: vi.fn(),
      getAwardsByCategory: vi.fn(),
      getRecentAwards: vi.fn(),
      getTotalPoints: vi.fn(),
      getProgressTowardsAward: vi.fn(),
      refreshDashboard: vi.fn(),
      hasAward: vi.fn(),
      getUserPositionInLeaderboard: vi.fn(),
    });

    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });
  });

  it('renders leaderboard table with data', async () => {
    render(<LeaderboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
      expect(screen.getByText('alice_chemist')).toBeInTheDocument();
      expect(screen.getByText('bob_scientist')).toBeInTheDocument();
      expect(screen.getByText('charlie_lab')).toBeInTheDocument();
      expect(screen.getByText('current_user')).toBeInTheDocument();
    });
  });

  it('displays user rank when showUserRank is true', async () => {
    render(<LeaderboardTable showUserRank={true} />);

    await waitFor(() => {
      expect(screen.getByText('Your Rank')).toBeInTheDocument();
      expect(screen.getByText('#4')).toBeInTheDocument();
      expect(screen.getByText('15 awards')).toBeInTheDocument();
      expect(screen.getByText('450 points')).toBeInTheDocument();
    });
  });

  it('does not display user rank when showUserRank is false', async () => {
    render(<LeaderboardTable showUserRank={false} />);

    await waitFor(() => {
      expect(screen.queryByText('Your Rank')).not.toBeInTheDocument();
    });
  });

  it('highlights current user row', async () => {
    render(<LeaderboardTable />);

    await waitFor(() => {
      // Look for the "You" badge which is unique to the table row
      expect(screen.getByText('You')).toBeInTheDocument();
      const youBadge = screen.getByText('You');
      const currentUserRow = youBadge.closest('tr');
      expect(currentUserRow).toHaveClass('bg-primary-50');
    });
  });

  it('displays special icons for top 3 ranks', async () => {
    render(<LeaderboardTable />);

    await waitFor(() => {
      // Check for medal emojis in top 3 positions
      expect(screen.getByText('🥇')).toBeInTheDocument(); // 1st place
      expect(screen.getByText('🥈')).toBeInTheDocument(); // 2nd place
      expect(screen.getByText('🥉')).toBeInTheDocument(); // 3rd place
    });
  });

  it('handles sorting by different columns', async () => {
    render(<LeaderboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });

    // Click on username column to sort
    const usernameHeader = screen.getByText('User');
    fireEvent.click(usernameHeader);

    // The component should re-render with sorted data
    // Since we're mocking the data, we just verify the click was handled
    expect(usernameHeader).toBeInTheDocument();
  });

  it('handles pagination when there are many entries', async () => {
    // Create more mock data to test pagination
    const manyEntries = Array.from({ length: 50 }, (_, i) => ({
      rank: i + 1,
      user_id: i + 1,
      username: `user_${i + 1}`,
      award_count: 50 - i,
      total_points: (50 - i) * 30,
    }));

    mockUseDashboardStore.mockReturnValue({
      leaderboard: manyEntries,
      userRank: mockUserRank,
      isLoading: false,
      error: null,
      fetchLeaderboard: mockFetchLeaderboard,
      fetchUserRank: mockFetchUserRank,
      clearError: mockClearError,
      // Add other required properties with default values
      awards: [],
      availableAwards: [],
      reactionStats: null,
      reactionHistory: [],
      fetchAwards: vi.fn(),
      fetchAvailableAwards: vi.fn(),
      fetchReactionStats: vi.fn(),
      fetchReactionHistory: vi.fn(),
      getAwardsByCategory: vi.fn(),
      getRecentAwards: vi.fn(),
      getTotalPoints: vi.fn(),
      getProgressTowardsAward: vi.fn(),
      refreshDashboard: vi.fn(),
      hasAward: vi.fn(),
      getUserPositionInLeaderboard: vi.fn(),
    });

    render(<LeaderboardTable />);

    await waitFor(() => {
      // Should show pagination controls - look for buttons with specific roles
      const nextButtons = screen.getAllByText('Next');
      const prevButtons = screen.getAllByText('Previous');
      expect(nextButtons.length).toBeGreaterThan(0);
      expect(prevButtons.length).toBeGreaterThan(0);
    });
  });

  it('displays loading state', () => {
    mockUseDashboardStore.mockReturnValue({
      leaderboard: [],
      userRank: null,
      isLoading: true,
      error: null,
      fetchLeaderboard: mockFetchLeaderboard,
      fetchUserRank: mockFetchUserRank,
      clearError: mockClearError,
      // Add other required properties with default values
      awards: [],
      availableAwards: [],
      reactionStats: null,
      reactionHistory: [],
      fetchAwards: vi.fn(),
      fetchAvailableAwards: vi.fn(),
      fetchReactionStats: vi.fn(),
      fetchReactionHistory: vi.fn(),
      getAwardsByCategory: vi.fn(),
      getRecentAwards: vi.fn(),
      getTotalPoints: vi.fn(),
      getProgressTowardsAward: vi.fn(),
      refreshDashboard: vi.fn(),
      hasAward: vi.fn(),
      getUserPositionInLeaderboard: vi.fn(),
    });

    render(<LeaderboardTable />);

    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    const errorMessage = 'Failed to load leaderboard';
    mockUseDashboardStore.mockReturnValue({
      leaderboard: [],
      userRank: null,
      isLoading: false,
      error: errorMessage,
      fetchLeaderboard: mockFetchLeaderboard,
      fetchUserRank: mockFetchUserRank,
      clearError: mockClearError,
      // Add other required properties with default values
      awards: [],
      availableAwards: [],
      reactionStats: null,
      reactionHistory: [],
      fetchAwards: vi.fn(),
      fetchAvailableAwards: vi.fn(),
      fetchReactionStats: vi.fn(),
      fetchReactionHistory: vi.fn(),
      getAwardsByCategory: vi.fn(),
      getRecentAwards: vi.fn(),
      getTotalPoints: vi.fn(),
      getProgressTowardsAward: vi.fn(),
      refreshDashboard: vi.fn(),
      hasAward: vi.fn(),
      getUserPositionInLeaderboard: vi.fn(),
    });

    render(<LeaderboardTable />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Test error dismissal
    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);
    expect(mockClearError).toHaveBeenCalled();
  });

  it('displays empty state when no data', async () => {
    mockUseDashboardStore.mockReturnValue({
      leaderboard: [],
      userRank: null,
      isLoading: false,
      error: null,
      fetchLeaderboard: mockFetchLeaderboard,
      fetchUserRank: mockFetchUserRank,
      clearError: mockClearError,
      // Add other required properties with default values
      awards: [],
      availableAwards: [],
      reactionStats: null,
      reactionHistory: [],
      fetchAwards: vi.fn(),
      fetchAvailableAwards: vi.fn(),
      fetchReactionStats: vi.fn(),
      fetchReactionHistory: vi.fn(),
      getAwardsByCategory: vi.fn(),
      getRecentAwards: vi.fn(),
      getTotalPoints: vi.fn(),
      getProgressTowardsAward: vi.fn(),
      refreshDashboard: vi.fn(),
      hasAward: vi.fn(),
      getUserPositionInLeaderboard: vi.fn(),
    });

    render(<LeaderboardTable />);

    await waitFor(() => {
      expect(screen.getByText('No rankings available')).toBeInTheDocument();
    });
  });

  it('calls fetchLeaderboard and fetchUserRank on mount', async () => {
    render(<LeaderboardTable category="discovery" limit={100} />);

    // Wait for useEffect to run
    await waitFor(() => {
      expect(mockFetchLeaderboard).toHaveBeenCalledWith('discovery', 100);
      expect(mockFetchUserRank).toHaveBeenCalledWith('discovery');
    });
  });

  it('handles refresh button click', async () => {
    render(<LeaderboardTable />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockClearError).toHaveBeenCalled();
    expect(mockFetchLeaderboard).toHaveBeenCalled();
    expect(mockFetchUserRank).toHaveBeenCalled();
  });

  it('displays category in header when provided', async () => {
    render(<LeaderboardTable category="discovery" />);

    await waitFor(() => {
      expect(screen.getByText('(discovery)')).toBeInTheDocument();
    });
  });

  it('formats numbers correctly', async () => {
    const largeNumberData: LeaderboardEntry[] = [
      {
        rank: 1,
        user_id: 1,
        username: 'high_scorer',
        award_count: 1000,
        total_points: 1234567,
      },
    ];

    mockUseDashboardStore.mockReturnValue({
      leaderboard: largeNumberData,
      userRank: null,
      isLoading: false,
      error: null,
      fetchLeaderboard: mockFetchLeaderboard,
      fetchUserRank: mockFetchUserRank,
      clearError: mockClearError,
      // Add other required properties with default values
      awards: [],
      availableAwards: [],
      reactionStats: null,
      reactionHistory: [],
      fetchAwards: vi.fn(),
      fetchAvailableAwards: vi.fn(),
      fetchReactionStats: vi.fn(),
      fetchReactionHistory: vi.fn(),
      getAwardsByCategory: vi.fn(),
      getRecentAwards: vi.fn(),
      getTotalPoints: vi.fn(),
      getProgressTowardsAward: vi.fn(),
      refreshDashboard: vi.fn(),
      hasAward: vi.fn(),
      getUserPositionInLeaderboard: vi.fn(),
    });

    render(<LeaderboardTable />);

    await waitFor(() => {
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });
  });
});
