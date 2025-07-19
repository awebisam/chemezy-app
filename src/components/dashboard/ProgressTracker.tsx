import React, { useEffect, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboard.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { AwardCategory, AvailableAward } from '@/types/award.types';

interface ProgressTrackerProps {
  category?: AwardCategory;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  category,
}) => {
  const { availableAwards, isLoading, fetchAvailableAwards } =
    useDashboardStore();

  useEffect(() => {
    fetchAvailableAwards(category);
  }, [category, fetchAvailableAwards]);

  // Filter and sort available awards by progress
  const sortedAvailableAwards = useMemo(() => {
    return [...availableAwards]
      .filter(award => {
        // Only show awards that have progress data
        return award.progress && Object.keys(award.progress).length > 0;
      })
      .sort((a, b) => {
        // Sort by completion percentage (highest first)
        const aProgress = calculateProgressPercentage(a);
        const bProgress = calculateProgressPercentage(b);
        return bProgress - aProgress;
      })
      .slice(0, 10); // Show top 10 awards in progress
  }, [availableAwards]);

  const calculateProgressPercentage = (award: AvailableAward): number => {
    if (!award.progress || Object.keys(award.progress).length === 0) {
      return 0;
    }

    // This is a simplified calculation - in a real app, you'd need to know
    // the requirements for each award type from the metadata
    const progressEntries = Object.entries(award.progress);
    let totalProgress = 0;
    let maxProgress = 0;

    progressEntries.forEach(([key, value]) => {
      if (typeof value === 'number') {
        totalProgress += value;
        // Estimate max based on common award thresholds
        if (key.includes('reaction') || key.includes('discovery')) {
          maxProgress += 100; // Assume 100 reactions/discoveries for completion
        } else if (key.includes('chemical')) {
          maxProgress += 50; // Assume 50 chemicals for completion
        } else {
          maxProgress += 10; // Default threshold
        }
      }
    });

    return maxProgress > 0
      ? Math.min((totalProgress / maxProgress) * 100, 100)
      : 0;
  };

  const getCategoryColor = (category: AwardCategory) => {
    const colors = {
      discovery: 'text-blue-600 bg-blue-50 border-blue-200',
      database_contribution: 'text-green-600 bg-green-50 border-green-200',
      community: 'text-purple-600 bg-purple-50 border-purple-200',
      special: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      achievement: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[category] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatProgressValue = (_key: string, value: any): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Complete' : 'Incomplete';
    }
    return String(value);
  };

  const getProgressLabel = (key: string): string => {
    const labels: Record<string, string> = {
      reactions_count: 'Reactions',
      discoveries_count: 'Discoveries',
      chemicals_used: 'Chemicals Used',
      experiments_completed: 'Experiments',
      days_active: 'Days Active',
      points_earned: 'Points Earned',
      awards_earned: 'Awards Earned',
    };
    return (
      labels[key] ||
      key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="mt-2 text-sm text-gray-600">Loading progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Progress Tracker
        </h2>

        {sortedAvailableAwards.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
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
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No progress to track
            </h3>
            <p className="text-xs text-gray-600">
              Start experimenting to see your progress toward awards!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAvailableAwards.map(award => {
              const progressPercentage = calculateProgressPercentage(award);

              return (
                <div
                  key={award.template_id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm mb-1">
                        {award.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {award.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(award.category)}`}
                    >
                      {award.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-xs text-gray-600">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress Details */}
                  <div className="space-y-2">
                    {Object.entries(award.progress)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-600">
                            {getProgressLabel(key)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatProgressValue(key, value)}
                          </span>
                        </div>
                      ))}

                    {Object.keys(award.progress).length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{Object.keys(award.progress).length - 3} more criteria
                      </div>
                    )}
                  </div>

                  {/* Completion Status */}
                  {progressPercentage >= 90 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-green-600">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Almost there! Keep experimenting to earn this award.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {sortedAvailableAwards.length}
            </div>
            <div className="text-xs text-gray-600">Awards in Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {
                sortedAvailableAwards.filter(
                  award => calculateProgressPercentage(award) >= 50
                ).length
              }
            </div>
            <div className="text-xs text-gray-600">Nearly Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};
