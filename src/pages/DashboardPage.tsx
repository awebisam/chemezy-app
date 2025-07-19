import React from 'react';
import { UserDashboard } from '@/components/dashboard';

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserDashboard />
      </div>
    </div>
  );
};
