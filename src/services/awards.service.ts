import { apiClient } from './api';
import { createApiWrapper } from './error.service';
import type {
  UserAward,
  AvailableAward,
  LeaderboardEntry,
  UserRank,
  AwardParams,
  AwardCategory,
} from '@/types/award.types';

export class AwardsService {
  private getUserAwardsWrapper = createApiWrapper(
    this._getUserAwards.bind(this),
    'AwardsService.getUserAwards',
    { 
      showToast: false, 
      logError: true,
      retryConfig: { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    }
  );

  private getAvailableAwardsWrapper = createApiWrapper(
    this._getAvailableAwards.bind(this),
    'AwardsService.getAvailableAwards',
    { 
      showToast: false, 
      logError: true,
      retryConfig: { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    }
  );

  private getOverallLeaderboardWrapper = createApiWrapper(
    this._getOverallLeaderboard.bind(this),
    'AwardsService.getOverallLeaderboard',
    { 
      showToast: false, 
      logError: true,
      retryConfig: { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    }
  );

  private getCategoryLeaderboardWrapper = createApiWrapper(
    this._getCategoryLeaderboard.bind(this),
    'AwardsService.getCategoryLeaderboard',
    { 
      showToast: false, 
      logError: true,
      retryConfig: { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    }
  );

  private getUserRankWrapper = createApiWrapper(
    this._getUserRank.bind(this),
    'AwardsService.getUserRank',
    { 
      showToast: false, 
      logError: true,
      retryConfig: { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    }
  );

  private getUserRankByCategoryWrapper = createApiWrapper(
    this._getUserRankByCategory.bind(this),
    'AwardsService.getUserRankByCategory',
    { 
      showToast: false, 
      logError: true,
      retryConfig: { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    }
  );

  /**
   * Get current user's earned awards
   */
  async getUserAwards(params: AwardParams = {}): Promise<UserAward[]> {
    return this.getUserAwardsWrapper(params);
  }

  /**
   * Get available awards that the user can earn
   */
  async getAvailableAwards(
    category?: AwardCategory
  ): Promise<AvailableAward[]> {
    return this.getAvailableAwardsWrapper(category);
  }

  /**
   * Get overall leaderboard rankings
   */
  async getOverallLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.getOverallLeaderboardWrapper();
  }

  /**
   * Get category-specific leaderboard rankings
   */
  async getCategoryLeaderboard(
    category: AwardCategory
  ): Promise<LeaderboardEntry[]> {
    return this.getCategoryLeaderboardWrapper(category);
  }

  /**
   * Get current user's rank in overall leaderboard
   */
  async getUserRank(): Promise<UserRank> {
    return this.getUserRankWrapper();
  }

  /**
   * Get current user's rank in category-specific leaderboard
   */
  async getUserRankByCategory(category: AwardCategory): Promise<UserRank> {
    return this.getUserRankByCategoryWrapper(category);
  }

  // Private methods that contain the actual API calls
  private async _getUserAwards(params: AwardParams = {}): Promise<UserAward[]> {
    const queryParams = new URLSearchParams();

    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }
    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/awards/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<UserAward[]>(url);
    return response;
  }

  private async _getAvailableAwards(
    category?: AwardCategory
  ): Promise<AvailableAward[]> {
    const url = category
      ? `/awards/available?category=${category}`
      : '/awards/available';
    const response = await apiClient.get<AvailableAward[]>(url);
    return response;
  }

  private async _getOverallLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>(
      '/awards/leaderboard/overall'
    );
    return response;
  }

  private async _getCategoryLeaderboard(
    category: AwardCategory
  ): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>(
      `/awards/leaderboard/${category}`
    );
    return response;
  }

  private async _getUserRank(): Promise<UserRank> {
    const response = await apiClient.get<UserRank>(
      '/awards/leaderboard/my-rank'
    );
    return response;
  }

  private async _getUserRankByCategory(category: AwardCategory): Promise<UserRank> {
    const response = await apiClient.get<UserRank>(
      `/awards/leaderboard/my-rank?category=${category}`
    );
    return response;
  }

  /**
   * Get awards by specific category
   */
  async getAwardsByCategory(category: AwardCategory): Promise<UserAward[]> {
    return this.getUserAwards({ category });
  }

  /**
   * Get user's award statistics
   */
  async getAwardStats(): Promise<{
    total_awards: number;
    total_points: number;
    awards_by_category: Record<AwardCategory, number>;
  }> {
    const awards = await this.getUserAwards();

    const stats = {
      total_awards: awards.length,
      total_points: awards.reduce((sum, award) => sum + award.tier * 10, 0), // Simple point calculation
      awards_by_category: {} as Record<AwardCategory, number>,
    };

    // Count awards by category
    const categories: AwardCategory[] = [
      'discovery',
      'database_contribution',
      'community',
      'special',
      'achievement',
    ];
    categories.forEach(category => {
      stats.awards_by_category[category] = awards.filter(
        award => award.template.category === category
      ).length;
    });

    return stats;
  }

  /**
   * Check if user has a specific award
   */
  async hasAward(templateId: number): Promise<boolean> {
    const awards = await this.getUserAwards();
    return awards.some(award => award.template_id === templateId);
  }

  /**
   * Get recent awards (last 30 days)
   */
  async getRecentAwards(days: number = 30): Promise<UserAward[]> {
    const awards = await this.getUserAwards({
      sort_by: 'granted_at',
      sort_order: 'desc',
    });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return awards.filter(award => new Date(award.granted_at) >= cutoffDate);
  }

  /**
   * Get leaderboard with pagination
   */
  async getLeaderboardPaginated(
    category?: AwardCategory,
    page: number = 1,
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    // Note: The API doesn't seem to support pagination for leaderboards based on the spec,
    // but we can implement client-side pagination if needed
    const leaderboard = category
      ? await this.getCategoryLeaderboard(category)
      : await this.getOverallLeaderboard();

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return leaderboard.slice(startIndex, endIndex);
  }
}

export const awardsService = new AwardsService();
