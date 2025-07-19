import React, { useState, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboard.store';
import { AwardDetailModal } from './AwardDetailModal';
import { CelebrationAnimation } from './CelebrationAnimation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AwardCategory, UserAward } from '@/types/award.types';

interface AwardsGridProps {
  category?: AwardCategory;
  showRecentOnly?: boolean;
}

export const AwardsGrid: React.FC<AwardsGridProps> = ({
  category,
  showRecentOnly = false,
}) => {
  const { awards, isLoading, getAwardsByCategory, getRecentAwards } =
    useDashboardStore();

  const [selectedAward, setSelectedAward] = useState<UserAward | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'tier'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCelebration, setShowCelebration] = useState<UserAward | null>(
    null
  );

  // Filter and sort awards
  const filteredAndSortedAwards = useMemo(() => {
    let filteredAwards = awards;

    // Filter by category
    if (category) {
      filteredAwards = getAwardsByCategory(category);
    }

    // Filter by recent only
    if (showRecentOnly) {
      const recentAwards = getRecentAwards(30);
      filteredAwards = filteredAwards.filter(award =>
        recentAwards.some((recent: UserAward) => recent.id === award.id)
      );
    }

    // Sort awards
    const sortedAwards = [...filteredAwards].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison =
            new Date(a.granted_at).getTime() - new Date(b.granted_at).getTime();
          break;
        case 'name':
          comparison = a.template.name.localeCompare(b.template.name);
          break;
        case 'tier':
          comparison = a.tier - b.tier;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sortedAwards;
  }, [
    awards,
    category,
    showRecentOnly,
    sortBy,
    sortOrder,
    getAwardsByCategory,
    getRecentAwards,
  ]);

  const handleAwardClick = (award: UserAward) => {
    setSelectedAward(award);
  };

  const handleCloseModal = () => {
    setSelectedAward(null);
  };

  const getCategoryColor = (category: AwardCategory) => {
    const colors = {
      discovery: 'bg-blue-100 text-blue-800 border-blue-200',
      database_contribution: 'bg-green-100 text-green-800 border-green-200',
      community: 'bg-purple-100 text-purple-800 border-purple-200',
      special: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      achievement: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTierIcon = (tier: number) => {
    if (tier >= 3) {
      return (
        <svg
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (tier >= 2) {
      return (
        <svg
          className="w-5 h-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-5 h-5 text-bronze-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && awards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading awards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with sorting controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Your Awards
          {filteredAndSortedAwards.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredAndSortedAwards.length})
            </span>
          )}
        </h2>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <label
              htmlFor="sort-by"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Sort by:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'date' | 'name' | 'tier')
              }
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-0"
            >
              <option value="date">Date Earned</option>
              <option value="name">Name</option>
              <option value="tier">Tier</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center p-1 touch-manipulation"
            aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Awards Grid */}
      {filteredAndSortedAwards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No awards yet
          </h3>
          <p className="text-gray-600">
            {category || showRecentOnly
              ? 'No awards found for the selected filters.'
              : 'Start experimenting to earn your first awards!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredAndSortedAwards.map(award => (
            <div
              key={award.id}
              onClick={() => handleAwardClick(award)}
              className="card p-4 cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-200 group touch-manipulation"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTierIcon(award.tier)}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(award.template.category)}`}
                  >
                    {award.template.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Tier {award.tier}</div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                {award.template.name}
              </h3>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {award.template.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Earned {formatDate(award.granted_at)}</span>
                <span>{award.tier * 10} points</span>
              </div>

              {/* Progress indicator if available */}
              {award.progress && Object.keys(award.progress).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">
                    Progress Details
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(award.progress)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs text-gray-600"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Award Detail Modal */}
      {selectedAward && (
        <AwardDetailModal
          award={selectedAward}
          isOpen={!!selectedAward}
          onClose={handleCloseModal}
        />
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          award={showCelebration}
          onComplete={() => setShowCelebration(null)}
        />
      )}
    </div>
  );
};
