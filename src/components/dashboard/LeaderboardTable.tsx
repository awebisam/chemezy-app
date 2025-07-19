import React, { useState, useEffect, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboard.store';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { AwardCategory, LeaderboardEntry } from '@/types/award.types';

interface LeaderboardTableProps {
  category?: AwardCategory;
  limit?: number;
  showUserRank?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  category,
  limit = 50,
  showUserRank = true,
}) => {
  const {
    leaderboard,
    userRank,
    isLoading,
    error,
    fetchLeaderboard,
    fetchUserRank,
    clearError,
  } = useDashboardStore();

  const { user } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<
    'rank' | 'username' | 'award_count' | 'total_points'
  >('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchLeaderboard(category, limit);
        if (showUserRank) {
          await fetchUserRank(category);
        }
      } catch (error) {
        console.error('Failed to load leaderboard data:', error);
      }
    };

    loadData();
  }, [category, limit, showUserRank]); // Remove store functions to avoid infinite loop

  // Sort and paginate leaderboard data
  const sortedAndPaginatedData = useMemo(() => {
    const sortedData = [...leaderboard];

    // Sort data
    sortedData.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'award_count':
          comparison = a.award_count - b.award_count;
          break;
        case 'total_points':
          comparison = a.total_points - b.total_points;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalPages: Math.ceil(sortedData.length / itemsPerPage),
      totalItems: sortedData.length,
    };
  }, [leaderboard, sortBy, sortOrder, currentPage, itemsPerPage]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    clearError();
    fetchLeaderboard(category, limit);
    if (showUserRank) {
      fetchUserRank(category);
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center">
          <span className="text-yellow-600 font-bold">🥇</span>
          <span className="ml-2 font-bold text-yellow-600">#{rank}</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center">
          <span className="text-gray-500 font-bold">🥈</span>
          <span className="ml-2 font-bold text-gray-500">#{rank}</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center">
          <span className="text-orange-600 font-bold">🥉</span>
          <span className="ml-2 font-bold text-orange-600">#{rank}</span>
        </div>
      );
    } else {
      return <span className="font-medium">#{rank}</span>;
    }
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return user && entry.user_id === user.id;
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg
        className="w-4 h-4 text-primary-600"
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
        className="w-4 h-4 text-primary-600"
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
    );
  };

  if (isLoading && leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Leaderboard
            {category && (
              <span className="ml-2 text-sm font-normal text-gray-500 capitalize">
                ({category.replace('_', ' ')})
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Top performers in the chemistry lab
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
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

      {/* User Rank Display */}
      {showUserRank && userRank && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-primary-900">
                Your Rank
              </h3>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex items-center">
                  {getRankDisplay(userRank.rank || 0)}
                </div>
                <div className="text-sm text-primary-700">
                  {userRank.award_count} awards
                </div>
                <div className="text-sm text-primary-700">
                  {userRank.total_points.toLocaleString()} points
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-primary-600">
                {userRank.username}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {sortedAndPaginatedData.data.length === 0 ? (
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No rankings available
          </h3>
          <p className="text-gray-600">
            {category
              ? `No rankings found for the ${category.replace('_', ' ')} category.`
              : 'No rankings available at this time.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-200">
              {sortedAndPaginatedData.data.map(entry => (
                <div
                  key={entry.user_id}
                  className={`p-4 ${
                    isCurrentUser(entry)
                      ? 'bg-primary-50 border-l-4 border-primary-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {entry.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div
                          className={`text-sm font-medium ${
                            isCurrentUser(entry)
                              ? 'text-primary-900'
                              : 'text-gray-900'
                          }`}
                        >
                          {entry.username}
                          {isCurrentUser(entry) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {getRankDisplay(entry.rank)}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-yellow-500 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{entry.award_count} awards</span>
                    </div>
                    <div className="font-medium text-gray-900">
                      {entry.total_points.toLocaleString()} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rank</span>
                      {getSortIcon('rank')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('username')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>User</span>
                      {getSortIcon('username')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('award_count')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Awards</span>
                      {getSortIcon('award_count')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('total_points')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Points</span>
                      {getSortIcon('total_points')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndPaginatedData.data.map(entry => (
                  <tr
                    key={entry.user_id}
                    className={`hover:bg-gray-50 ${
                      isCurrentUser(entry)
                        ? 'bg-primary-50 border-l-4 border-primary-500'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRankDisplay(entry.rank)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {entry.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div
                            className={`text-sm font-medium ${
                              isCurrentUser(entry)
                                ? 'text-primary-900'
                                : 'text-gray-900'
                            }`}
                          >
                            {entry.username}
                            {isCurrentUser(entry) && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-yellow-500 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-900">
                          {entry.award_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {entry.total_points.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sortedAndPaginatedData.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="secondary"
                    size="sm"
                    className="touch-manipulation"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-gray-700">
                    Page {currentPage} of {sortedAndPaginatedData.totalPages}
                  </span>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === sortedAndPaginatedData.totalPages}
                    variant="secondary"
                    size="sm"
                    className="touch-manipulation"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * itemsPerPage,
                          sortedAndPaginatedData.totalItems
                        )}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">
                        {sortedAndPaginatedData.totalItems}
                      </span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="ghost"
                        size="sm"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>

                      {/* Page numbers */}
                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            sortedAndPaginatedData.totalPages
                          ),
                        },
                        (_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <Button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              variant={
                                currentPage === pageNumber ? 'primary' : 'ghost'
                              }
                              size="sm"
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNumber
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        }
                      )}

                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === sortedAndPaginatedData.totalPages
                        }
                        variant="ghost"
                        size="sm"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
