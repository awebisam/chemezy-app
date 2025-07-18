import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { awardsService } from '@/services/awards.service';
import { reactionService } from '@/services/reaction.service';
import type { DashboardStore } from '@/types/store.types';
import type { AwardCategory } from '@/types/award.types';
// Other types are used in the store interface

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set, get) => ({
      // State
      awards: [],
      availableAwards: [],
      leaderboard: [],
      userRank: null,
      reactionStats: null,
      reactionHistory: [],
      isLoading: false,
      error: null,

      // Actions
      fetchAwards: async (params = {}) => {
        set({ isLoading: true, error: null });

        try {
          const awards = await awardsService.getUserAwards(params);

          set({
            awards,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch awards',
          });
          throw error;
        }
      },

      fetchAvailableAwards: async category => {
        set({ isLoading: true, error: null });

        try {
          const availableAwards =
            await awardsService.getAvailableAwards(category);

          set({
            availableAwards,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch available awards',
          });
          throw error;
        }
      },

      fetchLeaderboard: async (category, limit = 50) => {
        set({ isLoading: true, error: null });

        try {
          const leaderboard = category
            ? await awardsService.getCategoryLeaderboard(category)
            : await awardsService.getOverallLeaderboard();

          // Apply limit if specified
          const limitedLeaderboard = limit
            ? leaderboard.slice(0, limit)
            : leaderboard;

          set({
            leaderboard: limitedLeaderboard,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch leaderboard',
          });
          throw error;
        }
      },

      fetchUserRank: async category => {
        set({ isLoading: true, error: null });

        try {
          const userRank = category
            ? await awardsService.getUserRankByCategory(category)
            : await awardsService.getUserRank();

          set({
            userRank,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch user rank',
          });
          throw error;
        }
      },

      fetchReactionStats: async () => {
        set({ isLoading: true, error: null });

        try {
          const reactionStats = await reactionService.getReactionStats();

          set({
            reactionStats,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch reaction statistics',
          });
          throw error;
        }
      },

      fetchReactionHistory: async () => {
        set({ isLoading: true, error: null });

        try {
          const reactionHistory = await reactionService.getReactionCache();

          set({
            reactionHistory,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch reaction history',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Helper methods for dashboard functionality
      getAwardsByCategory: (category: AwardCategory) => {
        const { awards } = get();
        return awards.filter(award => award.template.category === category);
      },

      getRecentAwards: (days: number = 30) => {
        const { awards } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return awards.filter(award => new Date(award.granted_at) >= cutoffDate);
      },

      getTotalPoints: () => {
        const { awards } = get();
        return awards.reduce((total, award) => total + award.tier * 10, 0);
      },

      getProgressTowardsAward: (templateId: number) => {
        const { availableAwards } = get();
        const award = availableAwards.find(
          award => award.template_id === templateId
        );
        return award?.progress || {};
      },

      // Refresh all dashboard data
      refreshDashboard: async () => {
        const promises = [
          get().fetchAwards(),
          get().fetchAvailableAwards(),
          get().fetchLeaderboard(),
          get().fetchUserRank(),
          get().fetchReactionStats(),
          get().fetchReactionHistory(),
        ];

        try {
          await Promise.allSettled(promises);
        } catch (error) {
          // Individual fetch methods handle their own errors
          console.warn('Some dashboard data failed to refresh:', error);
        }
      },

      // Check if user has a specific award
      hasAward: (templateId: number) => {
        const { awards } = get();
        return awards.some(award => award.template_id === templateId);
      },

      // Get user's rank in leaderboard
      getUserPositionInLeaderboard: () => {
        const { leaderboard, userRank } = get();
        if (!userRank) return null;

        const position = leaderboard.findIndex(
          entry => entry.user_id === userRank.user_id
        );
        return position >= 0 ? position + 1 : null;
      },
    }),
    {
      name: 'dashboard-store',
    }
  )
);
