import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Breadcrumb } from './Breadcrumb';
import { PageTransition } from './PageTransition';

export const MainLayout: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/lab" 
                className="flex items-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
              >
                <h1 className="text-lg sm:text-xl font-bold text-primary-600">
                  {import.meta.env.VITE_APP_NAME || 'Chemezy'}
                </h1>
              </Link>

              {/* Main Navigation */}
              <div className="ml-8">
                <Navigation />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb />
        </div>
        
        {/* Page Content with Transitions */}
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
};
