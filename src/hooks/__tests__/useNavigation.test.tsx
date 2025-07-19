import React from 'react';
import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useNavigation, usePageLoading } from '../useNavigation';
import { vi } from 'vitest';

// Mock the routes configuration
vi.mock('@/config/routes', () => ({
  routes: [
    {
      path: '/lab',
      label: 'Virtual Lab',
      showInNav: true,
      description: 'Experiment with chemicals',
      keywords: ['chemistry', 'lab'],
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      showInNav: true,
      description: 'View your progress',
      keywords: ['progress', 'awards'],
    },
  ],
  getRouteByPath: (path: string) => {
    const routes = [
      {
        path: '/lab',
        label: 'Virtual Lab',
        showInNav: true,
        description: 'Experiment with chemicals',
        keywords: ['chemistry', 'lab'],
      },
      {
        path: '/dashboard',
        label: 'Dashboard',
        showInNav: true,
        description: 'View your progress',
        keywords: ['progress', 'awards'],
      },
    ];
    return routes.find(route => route.path === path);
  },
  generateBreadcrumbsFromPath: (pathname: string) => {
    if (pathname === '/lab') {
      return [{ label: 'Lab', path: undefined, isActive: true }];
    }
    if (pathname === '/dashboard') {
      return [
        { label: 'Lab', path: '/lab', isActive: false },
        { label: 'Dashboard', path: undefined, isActive: true },
      ];
    }
    return [];
  },
  getRouteMetadata: (pathname: string) => ({
    title: pathname === '/lab' ? 'Virtual Lab' : 'Chemezy',
    description:
      pathname === '/lab'
        ? 'Experiment with chemicals'
        : 'Interactive virtual chemistry laboratory',
    keywords:
      pathname === '/lab' ? ['chemistry', 'lab'] : ['chemistry', 'education'],
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useNavigation', () => {
  it('returns current path information', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });

    expect(result.current.currentPath).toBe('/');
    expect(result.current.routes).toHaveLength(2);
    expect(result.current.navigationRoutes).toHaveLength(2);
  });

  it('provides navigation functions', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });

    expect(typeof result.current.navigateTo).toBe('function');
    expect(typeof result.current.goBack).toBe('function');
    expect(typeof result.current.goForward).toBe('function');
    expect(typeof result.current.isActive).toBe('function');
  });

  it('checks if path is active', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });

    // Test exact match
    expect(result.current.isActive('/', true)).toBe(true);
    expect(result.current.isActive('/lab', true)).toBe(false);

    // Test prefix match
    expect(result.current.isActive('/', false)).toBe(true);
  });

  it('returns route metadata', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });

    expect(result.current.metadata).toEqual({
      title: 'Chemezy',
      description: 'Interactive virtual chemistry laboratory',
      keywords: ['chemistry', 'education'],
    });
  });

  it('returns breadcrumbs for current path', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });

    expect(result.current.breadcrumbs).toEqual([]);
  });
});

describe('usePageLoading', () => {
  it('returns loading state information', () => {
    const { result } = renderHook(() => usePageLoading(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.pathname).toBe('/');
    expect(typeof result.current.key).toBe('string');
  });
});
