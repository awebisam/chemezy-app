import React from 'react';
import { ReactionHistory, ReactionStatistics } from '@/components/dashboard';

export const ReactionHistoryDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reaction History & Statistics Demo
          </h1>
          <p className="mt-2 text-gray-600">
            Demonstration of the new reaction history and statistics components
          </p>
        </div>

        {/* Statistics Section */}
        <div className="mb-12">
          <ReactionStatistics />
        </div>

        {/* History Section */}
        <div>
          <ReactionHistory />
        </div>
      </div>
    </div>
  );
};
