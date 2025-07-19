import React from 'react';
import type { AwardCategory } from '@/types/award.types';

interface LeaderboardCategoryFilterProps {
  selectedCategory?: AwardCategory;
  onCategoryChange: (category?: AwardCategory) => void;
  className?: string;
}

export const LeaderboardCategoryFilter: React.FC<
  LeaderboardCategoryFilterProps
> = ({ selectedCategory, onCategoryChange, className = '' }) => {
  const categories: Array<{
    value?: AwardCategory;
    label: string;
    description: string;
  }> = [
    {
      value: undefined,
      label: 'Overall',
      description: 'All categories combined',
    },
    {
      value: 'discovery',
      label: 'Discovery',
      description: 'First-time reaction discoveries',
    },
    {
      value: 'database_contribution',
      label: 'Database',
      description: 'Contributing to chemical database',
    },
    {
      value: 'community',
      label: 'Community',
      description: 'Community engagement and sharing',
    },
    {
      value: 'special',
      label: 'Special',
      description: 'Special achievements and milestones',
    },
    {
      value: 'achievement',
      label: 'Achievement',
      description: 'General achievements and progress',
    },
  ];

  const getCategoryIcon = (category?: AwardCategory) => {
    switch (category) {
      case 'discovery':
        return (
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        );
      case 'database_contribution':
        return (
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
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
        );
      case 'community':
        return (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        );
      case 'special':
        return (
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
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case 'achievement':
        return (
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
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
      default:
        return (
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
    }
  };

  const getCategoryColor = (category?: AwardCategory) => {
    switch (category) {
      case 'discovery':
        return 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'database_contribution':
        return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100';
      case 'community':
        return 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'special':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'achievement':
        return 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Filter by Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(category => (
            <button
              key={category.value || 'overall'}
              onClick={() => onCategoryChange(category.value)}
              className={`
                relative flex items-start p-3 border rounded-lg text-left transition-all duration-200
                ${
                  selectedCategory === category.value
                    ? `${getCategoryColor(category.value)} border-2 shadow-sm`
                    : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getCategoryIcon(category.value)}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="text-sm font-medium">{category.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {category.description}
                </div>
              </div>
              {selectedCategory === category.value && (
                <div className="flex-shrink-0 ml-2">
                  <svg
                    className="w-4 h-4 text-current"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick filter buttons for mobile */}
      <div className="sm:hidden">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value || 'overall'}
              onClick={() => onCategoryChange(category.value)}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200
                ${
                  selectedCategory === category.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="mr-1">{getCategoryIcon(category.value)}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
