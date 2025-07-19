import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboard.store';
import { AwardsGrid } from './AwardsGrid';
import { ProgressTracker } from './ProgressTracker';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { AwardCategory } from '@/types/award.types';

export const UserDashboard: React.FC = () => {
  const {
    awards,
    reactionStats,
    isLoading,
    error,
    refreshDashboard,
    fetchAvailableAwards,
    getTotalPoints,
    getRecentAwards,
    clearError,
  } = useDashboardStore();

  const [selectedCategory, setSelectedCategory] = useState<
    AwardCategory | 'all'
  >('all');
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  useEffect(() => {
    // Load initial dashboard data
    refreshDashboard();
  }, [refreshDashboard]);

  const handleCategoryChange = (category: AwardCategory | 'all') => {
    setSelectedCategory(category);
    if (category !== 'all') {
      fetchAvailableAwards(category);
    } else {
      fetchAvailableAwards();
    }
  };

  const handleRefresh = () => {
    clearError();
    refreshDashboard();
  };

  const totalPoints = getTotalPoints();
  const recentAwards = getRecentAwards(30);

  const categories: Array<{ value: AwardCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Awards' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'database_contribution', label: 'Database' },
    { value: 'community', label: 'Community' },
    { value: 'special', label: 'Special' },
    { value: 'achievement', label: 'Achievement' },
  ];

  if (isLoading && awards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              Your Dashboard
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Track your progress and achievements in chemistry
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              isLoading={isLoading}
              loadingText="Refreshing..."
              className="w-full sm:w-auto"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto">
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
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Awards
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {awards.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Points
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {totalPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Recent Awards
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {recentAwards.length}
              </p>
              <p className="text-xs text-gray-500 hidden sm:block">
                Last 30 days
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
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
              </div>
            </div>
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Reactions
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {reactionStats?.total_reactions || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 touch-manipulation ${
                selectedCategory === category.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle for Recent Awards */}
      <div className="mb-4 sm:mb-6">
        <label className="flex items-center touch-manipulation">
          <input
            type="checkbox"
            checked={showRecentOnly}
            onChange={e => setShowRecentOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
          />
          <span className="ml-2 text-sm text-gray-700">
            <span className="hidden sm:inline">
              Show only recent awards (last 30 days)
            </span>
            <span className="sm:hidden">Recent only (30 days)</span>
          </span>
        </label>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Awards Grid - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <AwardsGrid
            category={selectedCategory === 'all' ? undefined : selectedCategory}
            showRecentOnly={showRecentOnly}
          />
        </div>

        {/* Progress Tracker - Takes up 1 column on large screens */}
        <div className="lg:col-span-1">
          <ProgressTracker
            category={selectedCategory === 'all' ? undefined : selectedCategory}
          />
        </div>
      </div>
    </div>
  );
};
