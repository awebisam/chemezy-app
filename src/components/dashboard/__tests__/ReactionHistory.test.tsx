import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReactionHistory } from '../ReactionHistory';

// Mock the stores
const mockUseDashboardStore = vi.fn();
const mockUseLabStore = vi.fn();

vi.mock('@/store/dashboard.store', () => ({
  useDashboardStore: () => mockUseDashboardStore(),
}));

vi.mock('@/store/lab.store', () => ({
  useLabStore: () => mockUseLabStore(),
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

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

describe('ReactionHistory', () => {
  const mockDashboardStore = {
    reactionHistory: [],
    isLoading: false,
    error: null,
    fetchReactionHistory: vi.fn(),
    clearError: vi.fn(),
  };

  const mockLabStore = {
    setEnvironment: vi.fn(),
    addChemical: vi.fn(),
    clearLab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboardStore.mockReturnValue(mockDashboardStore);
    mockUseLabStore.mockReturnValue(mockLabStore);
  });

  it('renders loading state correctly', () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      isLoading: true,
      reactionHistory: [],
    });

    render(<ReactionHistory />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading reaction history...')).toBeInTheDocument();
  });

  it('renders empty state when no reactions', () => {
    render(<ReactionHistory />);

    expect(screen.getByText('No reactions found')).toBeInTheDocument();
    expect(
      screen.getByText('Start experimenting to build your reaction history!')
    ).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      error: 'Failed to load reactions',
    });

    render(<ReactionHistory />);

    expect(screen.getByText('Failed to load reactions')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('calls fetchReactionHistory on mount', () => {
    render(<ReactionHistory />);

    expect(mockDashboardStore.fetchReactionHistory).toHaveBeenCalledTimes(1);
  });

  it('handles refresh button click', () => {
    render(<ReactionHistory />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockDashboardStore.fetchReactionHistory).toHaveBeenCalledTimes(2);
  });

  it('handles export functionality', () => {
    // Mock URL.createObjectURL and related functions
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(
      () => mockLink as any
    );
    vi.spyOn(document.body, 'removeChild').mockImplementation(
      () => mockLink as any
    );

    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      reactionHistory: [
        {
          products: [
            {
              molecular_formula: 'H2O',
              common_name: 'Water',
              quantity: 1,
              is_soluble: true,
            },
          ],
          effects: [],
          explanation: 'Test reaction',
          is_world_first: false,
        },
      ],
    });

    render(<ReactionHistory />);

    const exportButton = screen.getByText('Export History');
    fireEvent.click(exportButton);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('handles sort order change', () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      reactionHistory: [
        {
          products: [
            {
              molecular_formula: 'H2O',
              common_name: 'Water',
              quantity: 1,
              is_soluble: true,
            },
          ],
          effects: [],
          explanation: 'Test reaction',
          is_world_first: false,
        },
      ],
    });

    render(<ReactionHistory />);

    const sortSelect = screen.getByDisplayValue('Newest First');
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });

    expect(sortSelect).toHaveValue('oldest');
  });

  it('handles world-first filter toggle', () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      reactionHistory: [
        {
          products: [
            {
              molecular_formula: 'H2O',
              common_name: 'Water',
              quantity: 1,
              is_soluble: true,
            },
          ],
          effects: [],
          explanation: 'Test reaction',
          is_world_first: true,
        },
      ],
    });

    render(<ReactionHistory />);

    const filterCheckbox = screen.getByLabelText(
      'Show only world-first discoveries'
    );
    fireEvent.click(filterCheckbox);

    expect(filterCheckbox).toBeChecked();
  });

  it('opens reaction detail modal when view details is clicked', async () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      reactionHistory: [
        {
          products: [
            {
              molecular_formula: 'H2O',
              common_name: 'Water',
              quantity: 1,
              is_soluble: true,
            },
          ],
          effects: [],
          explanation: 'Test reaction',
          is_world_first: false,
        },
      ],
    });

    render(<ReactionHistory />);

    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Reaction Details'
      );
    });
  });

  it('handles recreate reaction functionality', async () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      reactionHistory: [
        {
          products: [
            {
              molecular_formula: 'H2O',
              common_name: 'Water',
              quantity: 1,
              is_soluble: true,
            },
          ],
          effects: [],
          explanation: 'Test reaction',
          is_world_first: false,
        },
      ],
    });

    render(<ReactionHistory />);

    const recreateButton = screen.getByText('Recreate');
    fireEvent.click(recreateButton);

    expect(mockLabStore.clearLab).toHaveBeenCalled();
    expect(mockLabStore.setEnvironment).toHaveBeenCalled();
  });

  it('dismisses error when dismiss button is clicked', () => {
    mockUseDashboardStore.mockReturnValue({
      ...mockDashboardStore,
      error: 'Test error',
    });

    render(<ReactionHistory />);

    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);

    expect(mockDashboardStore.clearError).toHaveBeenCalled();
  });
});
