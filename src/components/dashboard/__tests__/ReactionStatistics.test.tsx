import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReactionStatistics } from '../ReactionStatistics';

// Mock the dashboard store
const mockDashboardStore = {
  reactionStats: null,
  reactionHistory: [],
  isLoading: false,
  error: null,
  fetchReactionStats: vi.fn(),
  fetchReactionHistory: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('@/store/dashboard.store', () => ({
  useDashboardStore: () => mockDashboardStore,
}));

// Mock UI components
vi.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size }: { size: string }) => (
    <div data-testid="loading-spinner" data-size={size}>
      Loading...
    </div>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    isLoading,
    disabled,
    ...props
  }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      data-loading={isLoading}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('ReactionStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardStore.reactionStats = null;
    mockDashboardStore.reactionHistory = [];
    mockDashboardStore.isLoading = false;
    mockDashboardStore.error = null;
  });

  it('renders loading state correctly', () => {
    mockDashboardStore.isLoading = true;

    render(<ReactionStatistics />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
  });

  it('calls fetch functions on mount', () => {
    render(<ReactionStatistics />);

    expect(mockDashboardStore.fetchReactionStats).toHaveBeenCalledTimes(1);
    expect(mockDashboardStore.fetchReactionHistory).toHaveBeenCalledTimes(1);
  });

  it('renders statistics cards with default values', () => {
    render(<ReactionStatistics />);

    expect(screen.getByText('Total Reactions')).toBeInTheDocument();
    expect(screen.getByText('Total Discoveries')).toBeInTheDocument();
    expect(screen.getByText('World-First Discoveries')).toBeInTheDocument();
    expect(screen.getByText('Unique Products')).toBeInTheDocument();

    // Check for default values (0)
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  it('renders statistics with actual data', () => {
    mockDashboardStore.reactionStats = {
      total_reactions: 25,
      total_discoveries: 5,
    };

    mockDashboardStore.reactionHistory = [
      {
        products: [
          {
            molecular_formula: 'H2O',
            common_name: 'Water',
            quantity: 1,
            is_soluble: true,
          },
          {
            molecular_formula: 'CO2',
            common_name: 'Carbon Dioxide',
            quantity: 1,
            is_soluble: false,
          },
        ],
        effects: [],
        explanation: 'Test reaction 1',
        is_world_first: true,
      },
      {
        products: [
          {
            molecular_formula: 'NaCl',
            common_name: 'Salt',
            quantity: 1,
            is_soluble: true,
          },
        ],
        effects: [],
        explanation: 'Test reaction 2',
        is_world_first: false,
      },
    ];

    render(<ReactionStatistics />);

    expect(screen.getByText('25')).toBeInTheDocument(); // Total reactions
    expect(screen.getByText('5')).toBeInTheDocument(); // Total discoveries
    expect(screen.getByText('1')).toBeInTheDocument(); // World-first discoveries
    expect(screen.getByText('3')).toBeInTheDocument(); // Unique products (H2O, CO2, NaCl)
  });

  it('renders error state correctly', () => {
    mockDashboardStore.error = 'Failed to load statistics';

    render(<ReactionStatistics />);

    expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('handles refresh button click', () => {
    render(<ReactionStatistics />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockDashboardStore.fetchReactionStats).toHaveBeenCalledTimes(2);
    expect(mockDashboardStore.fetchReactionHistory).toHaveBeenCalledTimes(2);
  });

  it('dismisses error when dismiss button is clicked', () => {
    mockDashboardStore.error = 'Test error';

    render(<ReactionStatistics />);

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(mockDashboardStore.clearError).toHaveBeenCalled();
  });

  it('calculates productivity metrics correctly', () => {
    mockDashboardStore.reactionStats = {
      total_reactions: 10,
      total_discoveries: 2,
    };

    mockDashboardStore.reactionHistory = [
      {
        products: [
          {
            molecular_formula: 'H2O',
            common_name: 'Water',
            quantity: 1,
            is_soluble: true,
          },
          {
            molecular_formula: 'CO2',
            common_name: 'Carbon Dioxide',
            quantity: 1,
            is_soluble: false,
          },
        ],
        effects: [],
        explanation: 'Test reaction 1',
        is_world_first: true,
      },
      {
        products: [
          {
            molecular_formula: 'NaCl',
            common_name: 'Salt',
            quantity: 1,
            is_soluble: true,
          },
        ],
        effects: [],
        explanation: 'Test reaction 2',
        is_world_first: true,
      },
    ];

    render(<ReactionStatistics />);

    // Average products per reaction: (2 + 1) / 2 = 1.5
    expect(screen.getByText('1.5')).toBeInTheDocument();

    // Discovery rate: 2 world-first / 10 total = 20%
    expect(screen.getByText('20.0%')).toBeInTheDocument();

    // Unique compounds ratio: 3 unique / 10 total = 30%
    expect(screen.getByText('30.0%')).toBeInTheDocument();
  });

  it('renders achievement milestones correctly', () => {
    mockDashboardStore.reactionStats = {
      total_reactions: 25,
      total_discoveries: 5,
    };

    render(<ReactionStatistics />);

    // Check for milestone labels
    expect(screen.getByText('10 Reactions')).toBeInTheDocument();
    expect(screen.getByText('50 Reactions')).toBeInTheDocument();
    expect(screen.getByText('100 Reactions')).toBeInTheDocument();
    expect(screen.getByText('500 Reactions')).toBeInTheDocument();

    // 25 reactions should complete the 10 milestone and be 50% towards 50
    expect(screen.getByText('✓ Complete')).toBeInTheDocument(); // 10 reactions milestone
    expect(screen.getByText('50%')).toBeInTheDocument(); // 50 reactions milestone
  });

  it('renders recent activity section', () => {
    render(<ReactionStatistics />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    mockDashboardStore.reactionStats = {
      total_reactions: 1234,
      total_discoveries: 567,
    };

    render(<ReactionStatistics />);

    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('567')).toBeInTheDocument();
  });
});
