import React, { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

interface ReactionStatisticsProps {
  className?: string;
}

export const ReactionStatistics: React.FC<ReactionStatisticsProps> = ({
  className = '',
}) => {
  const {
    reactionStats,
    reactionHistory,
    isLoading,
    error,
    fetchReactionStats,
    fetchReactionHistory,
    clearError,
  } = useDashboardStore();

  useEffect(() => {
    fetchReactionStats();
    fetchReactionHistory();
  }, [fetchReactionStats, fetchReactionHistory]);

  const handleRefresh = () => {
    clearError();
    fetchReactionStats();
    fetchReactionHistory();
  };

  // Calculate additional statistics from reaction history
  const worldFirstDiscoveries = reactionHistory.filter(
    reaction => reaction.is_world_first
  ).length;

  const uniqueProducts = new Set(
    reactionHistory.flatMap(reaction =>
      reaction.products.map(product => product.molecular_formula)
    )
  ).size;

  const averageProductsPerReaction =
    reactionHistory.length > 0
      ? (
          reactionHistory.reduce(
            (sum, reaction) => sum + reaction.products.length,
            0
          ) / reactionHistory.length
        ).toFixed(1)
      : '0';

  // Calculate reactions by time period
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Mock timestamps for demonstration (in real implementation, these would come from API)
  const reactionsToday = reactionHistory.filter((_, index) => {
    const mockDate = new Date(Date.now() - index * 60000);
    return mockDate >= today;
  }).length;

  const reactionsThisWeek = reactionHistory.filter((_, index) => {
    const mockDate = new Date(Date.now() - index * 60000);
    return mockDate >= thisWeek;
  }).length;

  const reactionsThisMonth = reactionHistory.filter((_, index) => {
    const mockDate = new Date(Date.now() - index * 60000);
    return mockDate >= thisMonth;
  }).length;

  const statisticsCards = [
    {
      title: 'Total Reactions',
      value: reactionStats?.total_reactions || 0,
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      description: 'Chemical reactions performed',
    },
    {
      title: 'Total Discoveries',
      value: reactionStats?.total_discoveries || 0,
      icon: (
        <svg
          className="w-6 h-6 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      bgColor: 'bg-yellow-50',
      description: 'New compounds discovered',
    },
    {
      title: 'World-First Discoveries',
      value: worldFirstDiscoveries,
      icon: (
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      description: 'First-ever discoveries',
    },
    {
      title: 'Unique Products',
      value: uniqueProducts,
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      bgColor: 'bg-green-50',
      description: 'Different compounds created',
    },
  ];

  const timeBasedStats = [
    {
      period: 'Today',
      count: reactionsToday,
      color: 'text-blue-600',
    },
    {
      period: 'This Week',
      count: reactionsThisWeek,
      color: 'text-green-600',
    },
    {
      period: 'This Month',
      count: reactionsThisMonth,
      color: 'text-purple-600',
    },
  ];

  if (isLoading && !reactionStats) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reaction Statistics
          </h2>
          <p className="mt-1 text-gray-600">
            Your chemistry experimentation overview
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statisticsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                {stat.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Time-based Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {timeBasedStats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-medium text-gray-600">{stat.period}</p>
              <p className={`text-3xl font-bold ${stat.color} mt-1`}>
                {stat.count}
              </p>
              <p className="text-xs text-gray-500 mt-1">reactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Productivity Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Average products per reaction
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {averageProductsPerReaction}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Discovery rate</span>
              <span className="text-lg font-semibold text-gray-900">
                {reactionStats?.total_reactions
                  ? (
                      (worldFirstDiscoveries / reactionStats.total_reactions) *
                      100
                    ).toFixed(1)
                  : '0'}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Unique compounds ratio
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {reactionStats?.total_reactions
                  ? (
                      (uniqueProducts / reactionStats.total_reactions) *
                      100
                    ).toFixed(1)
                  : '0'}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Achievement Milestones
          </h3>
          <div className="space-y-4">
            {/* Reaction milestones */}
            {[10, 50, 100, 500].map(milestone => {
              const progress = Math.min(
                ((reactionStats?.total_reactions || 0) / milestone) * 100,
                100
              );
              const isCompleted =
                (reactionStats?.total_reactions || 0) >= milestone;

              return (
                <div key={milestone}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">
                      {milestone} Reactions
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-green-600' : 'text-gray-900'
                      }`}
                    >
                      {isCompleted ? '✓ Complete' : `${progress.toFixed(0)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
