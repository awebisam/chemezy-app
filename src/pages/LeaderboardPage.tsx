import React, { useState } from 'react';
import {
  LeaderboardTable,
  LeaderboardCategoryFilter,
} from '@/components/dashboard';
import type { AwardCategory } from '@/types/award.types';

export const LeaderboardPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<
    AwardCategory | undefined
  >(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const handleCategoryChange = (category?: AwardCategory) => {
    setSelectedCategory(category);
    // Close mobile filter panel after selection
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            <p className="mt-2 text-gray-600">
              See how you rank against other chemistry enthusiasts
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div
          className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
        >
          <div className="sticky top-8">
            <LeaderboardCategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <LeaderboardTable
            category={selectedCategory}
            limit={100}
            showUserRank={true}
          />
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Filter Leaderboard
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <LeaderboardCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
