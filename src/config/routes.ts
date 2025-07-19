import { lazy } from 'react';

// Lazy load pages for better performance
export const LazyLabPage = lazy(() => 
  import('@/pages/LabPage').then(module => ({ default: module.LabPage }))
);

export const LazyDashboardPage = lazy(() => 
  import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage }))
);

export const LazyLeaderboardPage = lazy(() => 
  import('@/pages/LeaderboardPage').then(module => ({ default: module.LeaderboardPage }))
);

// Route configuration
export interface RouteConfig {
  path: string;
  label: string;
  component: React.ComponentType;
  requireAuth: boolean;
  showInNav: boolean;
  icon?: string;
  breadcrumbLabel?: string;
  description?: string;
  keywords?: string[];
  parent?: string;
}

export const routes: RouteConfig[] = [
  {
    path: '/lab',
    label: 'Virtual Lab',
    component: LazyLabPage,
    requireAuth: true,
    showInNav: true,
    icon: 'lab',
    breadcrumbLabel: 'Lab',
    description: 'Experiment with chemicals in a safe virtual environment',
    keywords: ['experiment', 'chemistry', 'reactions', 'lab']
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    component: LazyDashboardPage,
    requireAuth: true,
    showInNav: true,
    icon: 'dashboard',
    breadcrumbLabel: 'Dashboard',
    description: 'View your achievements, awards, and progress',
    keywords: ['awards', 'achievements', 'progress', 'statistics']
  },
  {
    path: '/leaderboard',
    label: 'Leaderboard',
    component: LazyLeaderboardPage,
    requireAuth: true,
    showInNav: true,
    icon: 'leaderboard',
    breadcrumbLabel: 'Leaderboard',
    description: 'Compare your progress with other chemistry enthusiasts',
    keywords: ['ranking', 'competition', 'leaderboard', 'top users']
  }
];

// Get navigation routes (only those that should show in nav)
export const getNavigationRoutes = () => routes.filter(route => route.showInNav);

// Get route by path
export const getRouteByPath = (path: string) => routes.find(route => route.path === path);

// Generate breadcrumb items from current path
export const generateBreadcrumbsFromPath = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  // Don't add home breadcrumb if we're on the lab page
  if (pathname !== '/lab') {
    breadcrumbs.push({
      label: 'Lab',
      path: '/lab',
      isActive: false
    });
  }

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath);
    const isLast = index === pathSegments.length - 1;

    if (route) {
      // Only add if it's not the lab route when we're on lab page
      if (!(pathname === '/lab' && currentPath === '/lab')) {
        breadcrumbs.push({
          label: route.breadcrumbLabel || route.label,
          path: isLast ? undefined : currentPath,
          isActive: isLast
        });
      }
    } else {
      // Fallback for unknown routes or dynamic segments
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
        isActive: isLast
      });
    }
  });

  return breadcrumbs;
};

// Get route metadata for SEO and navigation
export const getRouteMetadata = (pathname: string) => {
  const route = getRouteByPath(pathname);
  return {
    title: route?.label || 'Chemezy',
    description: route?.description || 'Interactive virtual chemistry laboratory',
    keywords: route?.keywords || ['chemistry', 'education', 'virtual lab']
  };
};