import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
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

describe('Leaderboard Integration', () => {
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

  it('renders leaderboard page with table and filters', async () => {
    render(<LeaderboardPage />);

    await waitFor(() => {
      // Check main page elements - use more specific selectors
      expect(
        screen.getByRole('heading', { level: 1, name: 'Leaderboard' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('See how you rank against other chemistry enthusiasts')
      ).toBeInTheDocument();

      // Check that leaderboard data is displayed
      expect(screen.getByText('alice_chemist')).toBeInTheDocument();
      expect(screen.getByText('bob_scientist')).toBeInTheDocument();

      // Check that filter categories are available
      expect(screen.getByText('Filter by Category')).toBeInTheDocument();
    });
  });

  it('displays user rank information', async () => {
    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Your Rank')).toBeInTheDocument();
      expect(screen.getByText('15 awards')).toBeInTheDocument();
      expect(screen.getByText('450 points')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
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

    render(<LeaderboardPage />);

    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
  });

  it('calls fetch functions on mount', async () => {
    render(<LeaderboardPage />);

    await waitFor(() => {
      expect(mockFetchLeaderboard).toHaveBeenCalled();
      expect(mockFetchUserRank).toHaveBeenCalled();
    });
  });
});
