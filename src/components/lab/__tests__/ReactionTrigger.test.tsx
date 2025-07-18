import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReactionTrigger } from '../ReactionTrigger';
import { useLabStore } from '@/store/lab.store';

// Mock the lab store
vi.mock('@/store/lab.store');

const mockUseLabStore = vi.mocked(useLabStore);

describe('ReactionTrigger', () => {
  const mockTriggerReaction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTriggerReaction.mockClear();
  });

  it('renders with no chemicals selected', () => {
    mockUseLabStore.mockReturnValue({
      selectedChemicals: [],
      isReacting: false,
      triggerReaction: mockTriggerReaction,
      error: null,
      // Add other required store properties
      environment: 'Earth (Normal)',
      reactionResult: null,
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ReactionTrigger />);

    expect(
      screen.getByRole('button', { name: /start reaction/i })
    ).toBeDisabled();
    expect(
      screen.getByText(/add chemicals to the lab bench/i)
    ).toBeInTheDocument();
  });

  it('renders with chemicals selected and enabled button', () => {
    const mockChemicals = [
      {
        chemical: {
          id: 1,
          molecular_formula: 'H2O',
          common_name: 'Water',
          state_of_matter: 'liquid' as const,
          color: 'colorless',
          density: 1.0,
          properties: {},
        },
        quantity: 2,
      },
    ];

    mockUseLabStore.mockReturnValue({
      selectedChemicals: mockChemicals,
      isReacting: false,
      triggerReaction: mockTriggerReaction,
      error: null,
      environment: 'Earth (Normal)',
      reactionResult: null,
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ReactionTrigger />);

    const button = screen.getByRole('button', { name: /start reaction/i });
    expect(button).not.toBeDisabled();
    expect(screen.getByText(/ready to react 1 chemical/i)).toBeInTheDocument();
    expect(screen.getByText('H2O')).toBeInTheDocument();
  });

  it('shows loading state when reacting', () => {
    mockUseLabStore.mockReturnValue({
      selectedChemicals: [
        {
          chemical: {
            id: 1,
            molecular_formula: 'H2O',
            common_name: 'Water',
            state_of_matter: 'liquid' as const,
            color: 'colorless',
            density: 1.0,
            properties: {},
          },
          quantity: 1,
        },
      ],
      isReacting: true,
      triggerReaction: mockTriggerReaction,
      error: null,
      environment: 'Earth (Normal)',
      reactionResult: null,
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ReactionTrigger />);

    expect(screen.getByText(/reacting.../i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error message when reaction fails', () => {
    const errorMessage = 'Reaction failed due to incompatible chemicals';

    mockUseLabStore.mockReturnValue({
      selectedChemicals: [
        {
          chemical: {
            id: 1,
            molecular_formula: 'H2O',
            common_name: 'Water',
            state_of_matter: 'liquid' as const,
            color: 'colorless',
            density: 1.0,
            properties: {},
          },
          quantity: 1,
        },
      ],
      isReacting: false,
      triggerReaction: mockTriggerReaction,
      error: errorMessage,
      environment: 'Earth (Normal)',
      reactionResult: null,
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ReactionTrigger />);

    expect(screen.getByText('Reaction Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls triggerReaction when button is clicked', async () => {
    mockUseLabStore.mockReturnValue({
      selectedChemicals: [
        {
          chemical: {
            id: 1,
            molecular_formula: 'H2O',
            common_name: 'Water',
            state_of_matter: 'liquid' as const,
            color: 'colorless',
            density: 1.0,
            properties: {},
          },
          quantity: 1,
        },
      ],
      isReacting: false,
      triggerReaction: mockTriggerReaction,
      error: null,
      environment: 'Earth (Normal)',
      reactionResult: null,
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ReactionTrigger />);

    const button = screen.getByRole('button', { name: /start reaction/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockTriggerReaction).toHaveBeenCalledTimes(1);
    });
  });

  it('displays multiple chemicals correctly', () => {
    const mockChemicals = [
      {
        chemical: {
          id: 1,
          molecular_formula: 'H2O',
          common_name: 'Water',
          state_of_matter: 'liquid' as const,
          color: 'colorless',
          density: 1.0,
          properties: {},
        },
        quantity: 2,
      },
      {
        chemical: {
          id: 2,
          molecular_formula: 'NaCl',
          common_name: 'Salt',
          state_of_matter: 'solid' as const,
          color: 'white',
          density: 2.16,
          properties: {},
        },
        quantity: 1,
      },
    ];

    mockUseLabStore.mockReturnValue({
      selectedChemicals: mockChemicals,
      isReacting: false,
      triggerReaction: mockTriggerReaction,
      error: null,
      environment: 'Earth (Normal)',
      reactionResult: null,
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ReactionTrigger />);

    expect(screen.getByText(/ready to react 2 chemicals/i)).toBeInTheDocument();
    expect(screen.getByText('H2O')).toBeInTheDocument();
    expect(screen.getByText('×2')).toBeInTheDocument();
    expect(screen.getByText('NaCl')).toBeInTheDocument();
  });
});
