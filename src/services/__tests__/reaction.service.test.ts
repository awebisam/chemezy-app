import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactionService } from '../reaction.service';
import { apiClient } from '../api';
import type { ReactionRequest, ReactionPrediction } from '@/types/reaction.types';

// Mock the API client
vi.mock('../api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock the error service
vi.mock('../error.service', () => ({
  createApiWrapper: vi.fn((fn) => fn),
}));

describe('ReactionService', () => {
  const mockReactionRequest: ReactionRequest = {
    reactants: [
      { chemical_id: 1, quantity: 1.0 },
      { chemical_id: 2, quantity: 2.0 },
    ],
    environment: 'Earth (Normal)',
    catalyst_id: undefined,
  };

  const mockReactionPrediction: ReactionPrediction = {
    products: [
      {
        chemical_id: 3,
        molecular_formula: 'H2O',
        common_name: 'Water',
        quantity: 1.0,
        state_of_matter: 'liquid',
        color: 'colorless',
      },
    ],
    effects: [],
    explanation: 'Test reaction explanation',
    is_world_first: false,
    state_of_product: 'liquid',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    reactionService.clearLocalCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('predictReaction', () => {
    it('should predict reaction successfully', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      const result = await reactionService.predictReaction(mockReactionRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/reactions/react', mockReactionRequest);
      expect(result).toEqual(mockReactionPrediction);
    });

    it('should cache reaction results', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      // First call
      await reactionService.predictReaction(mockReactionRequest);
      expect(apiClient.post).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result = await reactionService.predictReaction(mockReactionRequest);
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReactionPrediction);
    });

    it('should create different cache keys for different requests', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      const request1 = { ...mockReactionRequest };
      const request2 = { ...mockReactionRequest, environment: 'Vacuum' };

      await reactionService.predictReaction(request1);
      await reactionService.predictReaction(request2);

      expect(apiClient.post).toHaveBeenCalledTimes(2);
    });

    it('should handle catalyst in cache key', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      const request1 = { ...mockReactionRequest };
      const request2 = { ...mockReactionRequest, catalyst_id: 5 };

      await reactionService.predictReaction(request1);
      await reactionService.predictReaction(request2);

      expect(apiClient.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('getReactionCache', () => {
    it('should fetch cached reactions from server', async () => {
      const mockCachedReactions = [mockReactionPrediction];
      vi.mocked(apiClient.get).mockResolvedValue(mockCachedReactions);

      const result = await reactionService.getReactionCache();

      expect(apiClient.get).toHaveBeenCalledWith('/reactions/cache');
      expect(result).toEqual(mockCachedReactions);
    });
  });

  describe('getReactionStats', () => {
    it('should fetch user reaction statistics', async () => {
      const mockStats = {
        total_reactions: 10,
        world_first_discoveries: 2,
        favorite_environment: 'Earth (Normal)',
        most_used_chemical: 'Water',
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockStats);

      const result = await reactionService.getReactionStats();

      expect(apiClient.get).toHaveBeenCalledWith('/reactions/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('cache management', () => {
    it('should clear local cache', () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      // Add something to cache
      reactionService.predictReaction(mockReactionRequest);
      expect(reactionService.getCacheSize()).toBeGreaterThan(0);

      // Clear cache
      reactionService.clearLocalCache();
      expect(reactionService.getCacheSize()).toBe(0);
    });

    it('should get cached reaction', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      // Cache a reaction
      await reactionService.predictReaction(mockReactionRequest);

      // Get cached reaction
      const cached = reactionService.getCachedReaction(mockReactionRequest);
      expect(cached).toEqual(mockReactionPrediction);
    });

    it('should return null for non-cached reaction', () => {
      const cached = reactionService.getCachedReaction(mockReactionRequest);
      expect(cached).toBeNull();
    });

    it('should check if reaction is cached', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      expect(reactionService.isReactionCached(mockReactionRequest)).toBe(false);

      await reactionService.predictReaction(mockReactionRequest);
      expect(reactionService.isReactionCached(mockReactionRequest)).toBe(true);
    });

    it('should return cache size', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockReactionPrediction);

      expect(reactionService.getCacheSize()).toBe(0);

      await reactionService.predictReaction(mockReactionRequest);
      expect(reactionService.getCacheSize()).toBe(1);

      const request2 = { ...mockReactionRequest, environment: 'Vacuum' };
      await reactionService.predictReaction(request2);
      expect(reactionService.getCacheSize()).toBe(2);
    });
  });

  describe('cache key generation', () => {
    it('should create consistent cache keys', () => {
      const request1 = {
        reactants: [
          { chemical_id: 1, quantity: 1.0 },
          { chemical_id: 2, quantity: 2.0 },
        ],
        environment: 'Earth (Normal)',
      };

      const request2 = {
        reactants: [
          { chemical_id: 2, quantity: 2.0 },
          { chemical_id: 1, quantity: 1.0 },
        ],
        environment: 'Earth (Normal)',
      };

      // Should create the same cache key regardless of reactant order
      const key1 = (reactionService as any).createCacheKey(request1);
      const key2 = (reactionService as any).createCacheKey(request2);
      expect(key1).toBe(key2);
    });

    it('should include all relevant parameters in cache key', () => {
      const request = {
        reactants: [{ chemical_id: 1, quantity: 1.0 }],
        environment: 'Vacuum',
        catalyst_id: 5,
      };

      const key = (reactionService as any).createCacheKey(request);
      expect(key).toContain('1:1');
      expect(key).toContain('Vacuum');
      expect(key).toContain('5');
    });

    it('should handle missing optional parameters', () => {
      const request = {
        reactants: [{ chemical_id: 1, quantity: 1.0 }],
      };

      const key = (reactionService as any).createCacheKey(request);
      expect(key).toContain('Earth (Normal)');
      expect(key).toContain('none');
    });
  });

  describe('preloadReactionCache', () => {
    it('should preload cache successfully', async () => {
      const mockCachedReactions = [mockReactionPrediction];
      vi.mocked(apiClient.get).mockResolvedValue(mockCachedReactions);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await reactionService.preloadReactionCache();

      expect(apiClient.get).toHaveBeenCalledWith('/reactions/cache');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Loaded 1 cached reactions from server'
      );

      consoleSpy.mockRestore();
    });

    it('should handle preload errors gracefully', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await reactionService.preloadReactionCache();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to preload reaction cache:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});