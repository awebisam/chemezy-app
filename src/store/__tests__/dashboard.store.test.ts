import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDashboardStore } from '../dashboard.store';
import { awardsService } from '@/services/awards.service';
import { reactionService } from '@/services/reaction.service';
import type { UserAward, LeaderboardEntry, UserRank } from '@/types/award.types';
import type { UserReactionStats } from '@/types/reaction.types';

// Mock the services
vi.mock('@/services/awards.service', () => ({
  awardsService: {
    getUserAwards: vi.fn(),
    getAvailableAwards: vi.fn(),
    getOverallLeaderboard: vi.fn(),
    getCategoryLeaderboard: vi.fn(),
    getUserRank: vi.fn(),
    getUserRankByCategory: vi.fn(),
  },
}));

vi.mock('@/services/reaction.service', () => ({
  reactionService: {
    getReactionStats: vi.fn(),
    getReactionCache: vi.fn(),
  },
}));

describe('DashboardStore', () => {
  const mockAwards: UserAward[] = [
    {
      id: 1,
      user_id: 1,
      template_id: 1,
      tier: 1,
      progress: {},
      granted_at: '2023-01-01T00:00:00Z',
      template: {
        id: 1,
        name: 'First Discovery',
        description: 'Make your first discovery',
        category: 'discovery',
        metadata: {},
      },
    },
  ];

  const mockLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      user_id: 1,
      username: 'testuser',
      award_count: 5,
      total_points: 50,
    },
  ];

  const mockUserRank: UserRank = {
    rank: 1,
    user_id: 1,
    username: 'testuser',
    award_count: 5,
    total_points: 50,
  };

  const mockReactionStats: UserReactionStats = {
    total_reactions: 10,
    total_discoveries: 3,
  };

  beforeEach(() => {
    // Reset store state before each test
    useDashboardStore.setState({
      awards: [],
      availableAwards: [],
      leaderboard: [],
      userRank: null,
      reactionStats: null,
      reactionHistory: [],
      isLoading: false,
      error: null,
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useDashboardStore.getState();
    
    expect(state.awards).toEqual([]);
    expect(state.availableAwards).toEqual([]);
    expect(state.leaderboard).toEqual([]);
    expect(state.userRank).toBeNull();
    expect(state.reactionStats).toBeNull();
    expect(state.reactionHistory).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fetch awards successfully', async () => {
    vi.mocked(awardsService.getUserAwards).mockResolvedValue(mockAwards);

    const { fetchAwards } = useDashboardStore.getState();
    
    await fetchAwards();
    
    const state = useDashboardStore.getState();
    expect(state.awards).toEqual(mockAwards);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetch awards failure', async () => {
    const mockError = new Error('Failed to fetch awards');
    vi.mocked(awardsService.getUserAwards).mockRejectedValue(mockError);

    const { fetchAwards } = useDashboardStore.getState();
    
    await expect(fetchAwards()).rejects.toThrow('Failed to fetch awards');
    
    const state = useDashboardStore.getState();
    expect(state.awards).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Failed to fetch awards');
  });

  it('should fetch leaderboard successfully', async () => {
    vi.mocked(awardsService.getOverallLeaderboard).mockResolvedValue(mockLeaderboard);

    const { fetchLeaderboard } = useDashboardStore.getState();
    
    await fetchLeaderboard();
    
    const state = useDashboardStore.getState();
    expect(state.leaderboard).toEqual(mockLeaderboard);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fetch category leaderboard', async () => {
    vi.mocked(awardsService.getCategoryLeaderboard).mockResolvedValue(mockLeaderboard);

    const { fetchLeaderboard } = useDashboardStore.getState();
    
    await fetchLeaderboard('discovery');
    
    expect(awardsService.getCategoryLeaderboard).toHaveBeenCalledWith('discovery');
    
    const state = useDashboardStore.getState();
    expect(state.leaderboard).toEqual(mockLeaderboard);
  });

  it('should fetch user rank successfully', async () => {
    vi.mocked(awardsService.getUserRank).mockResolvedValue(mockUserRank);

    const { fetchUserRank } = useDashboardStore.getState();
    
    await fetchUserRank();
    
    const state = useDashboardStore.getState();
    expect(state.userRank).toEqual(mockUserRank);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fetch reaction stats successfully', async () => {
    vi.mocked(reactionService.getReactionStats).mockResolvedValue(mockReactionStats);

    const { fetchReactionStats } = useDashboardStore.getState();
    
    await fetchReactionStats();
    
    const state = useDashboardStore.getState();
    expect(state.reactionStats).toEqual(mockReactionStats);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should get awards by category', () => {
    useDashboardStore.setState({ awards: mockAwards });
    
    const { getAwardsByCategory } = useDashboardStore.getState();
    const discoveryAwards = getAwardsByCategory('discovery');
    
    expect(discoveryAwards).toEqual(mockAwards);
  });

  it('should calculate total points', () => {
    useDashboardStore.setState({ awards: mockAwards });
    
    const { getTotalPoints } = useDashboardStore.getState();
    const totalPoints = getTotalPoints();
    
    // tier 1 * 10 = 10 points
    expect(totalPoints).toBe(10);
  });

  it('should check if user has award', () => {
    useDashboardStore.setState({ awards: mockAwards });
    
    const { hasAward } = useDashboardStore.getState();
    
    expect(hasAward(1)).toBe(true);
    expect(hasAward(999)).toBe(false);
  });

  it('should clear error', () => {
    useDashboardStore.setState({ error: 'Test error' });
    
    const { clearError } = useDashboardStore.getState();
    clearError();
    
    const state = useDashboardStore.getState();
    expect(state.error).toBeNull();
  });
});