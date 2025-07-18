import { apiClient } from './api';
import type {
  ReactionRequest,
  ReactionPrediction,
  UserReactionStats,
} from '@/types/reaction.types';

export class ReactionService {
  private reactionCache: Map<string, ReactionPrediction> = new Map();

  /**
   * Predict the outcome of a chemical reaction
   */
  async predictReaction(request: ReactionRequest): Promise<ReactionPrediction> {
    // Create cache key based on request parameters
    const cacheKey = this.createCacheKey(request);

    // Check cache first
    if (this.reactionCache.has(cacheKey)) {
      const cachedResult = this.reactionCache.get(cacheKey)!;
      return cachedResult;
    }

    const response = await apiClient.post<ReactionPrediction>(
      '/reactions/react',
      request
    );

    // Cache the result for future use
    this.reactionCache.set(cacheKey, response);

    return response;
  }

  /**
   * Get cached reaction predictions from the server
   */
  async getReactionCache(): Promise<ReactionPrediction[]> {
    const response =
      await apiClient.get<ReactionPrediction[]>('/reactions/cache');
    return response;
  }

  /**
   * Get user's reaction statistics
   */
  async getReactionStats(): Promise<UserReactionStats> {
    const response = await apiClient.get<UserReactionStats>('/reactions/stats');
    return response;
  }

  /**
   * Clear local reaction cache
   */
  clearLocalCache(): void {
    this.reactionCache.clear();
  }

  /**
   * Get cached reaction by cache key
   */
  getCachedReaction(request: ReactionRequest): ReactionPrediction | null {
    const cacheKey = this.createCacheKey(request);
    return this.reactionCache.get(cacheKey) || null;
  }

  /**
   * Check if a reaction is cached locally
   */
  isReactionCached(request: ReactionRequest): boolean {
    const cacheKey = this.createCacheKey(request);
    return this.reactionCache.has(cacheKey);
  }

  /**
   * Get the size of the local cache
   */
  getCacheSize(): number {
    return this.reactionCache.size;
  }

  /**
   * Create a unique cache key for a reaction request
   */
  private createCacheKey(request: ReactionRequest): string {
    const sortedReactants = [...request.reactants].sort(
      (a, b) => a.chemical_id - b.chemical_id
    );

    const reactantsKey = sortedReactants
      .map(r => `${r.chemical_id}:${r.quantity}`)
      .join(',');

    const environment = request.environment || 'Earth (Normal)';
    const catalyst = request.catalyst_id || 'none';

    return `${reactantsKey}|${environment}|${catalyst}`;
  }

  /**
   * Preload reactions into cache
   */
  async preloadReactionCache(): Promise<void> {
    try {
      const cachedReactions = await this.getReactionCache();
      // Note: We can't recreate the exact cache keys without the original requests,
      // but we can store them for reference
      console.log(
        `Loaded ${cachedReactions.length} cached reactions from server`
      );
    } catch (error) {
      console.warn('Failed to preload reaction cache:', error);
    }
  }
}

export const reactionService = new ReactionService();
