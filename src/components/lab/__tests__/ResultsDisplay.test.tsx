import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ResultsDisplay } from '../ResultsDisplay';
import { useLabStore } from '@/store/lab.store';
import type { ReactionPrediction } from '@/types/reaction.types';

// Mock the lab store
vi.mock('@/store/lab.store');

const mockUseLabStore = vi.mocked(useLabStore);

describe('ResultsDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no reaction result', () => {
    mockUseLabStore.mockReturnValue({
      selectedChemicals: [],
      reactionResult: null,
      isReacting: false,
      error: null,
      environment: 'Earth (Normal)',
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      triggerReaction: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    const { container } = render(<ResultsDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders reaction results correctly', () => {
    const mockReactionResult: ReactionPrediction = {
      products: [
        {
          chemical_id: 1,
          molecular_formula: 'H2O',
          common_name: 'Water',
          quantity: 2,
          is_soluble: true,
        },
        {
          chemical_id: 2,
          molecular_formula: 'NaCl',
          common_name: 'Salt',
          quantity: 1,
          is_soluble: true,
        },
      ],
      effects: [
        {
          effect_type: 'gas_production',
          gas_type: 'steam',
          color: 'white',
          intensity: 0.5,
          duration: 10,
        },
        {
          effect_type: 'temperature_change',
          delta_celsius: 25,
        },
      ],
      explanation:
        'This is a simple acid-base neutralization reaction that produces water and salt.',
      is_world_first: false,
    };

    const mockSelectedChemicals = [
      {
        chemical: {
          id: 1,
          molecular_formula: 'HCl',
          common_name: 'Hydrochloric Acid',
          state_of_matter: 'liquid' as const,
          color: 'colorless',
          density: 1.18,
          properties: {},
        },
        quantity: 1,
      },
      {
        chemical: {
          id: 2,
          molecular_formula: 'NaOH',
          common_name: 'Sodium Hydroxide',
          state_of_matter: 'solid' as const,
          color: 'white',
          density: 2.13,
          properties: {},
        },
        quantity: 1,
      },
    ];

    mockUseLabStore.mockReturnValue({
      selectedChemicals: mockSelectedChemicals,
      reactionResult: mockReactionResult,
      isReacting: false,
      error: null,
      environment: 'Earth (Normal)',
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      triggerReaction: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ResultsDisplay />);

    // Check header
    expect(screen.getByText('Reaction Complete')).toBeInTheDocument();

    // Check reactants
    expect(screen.getByText('Reactants')).toBeInTheDocument();
    expect(screen.getByText('HCl')).toBeInTheDocument();
    expect(screen.getByText('(Hydrochloric Acid)')).toBeInTheDocument();
    expect(screen.getByText('NaOH')).toBeInTheDocument();
    expect(screen.getByText('(Sodium Hydroxide)')).toBeInTheDocument();

    // Check products
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('H2O')).toBeInTheDocument();
    expect(screen.getByText('(Water)')).toBeInTheDocument();
    expect(screen.getByText('NaCl')).toBeInTheDocument();
    expect(screen.getByText('(Salt)')).toBeInTheDocument();
    expect(screen.getAllByText('Soluble')).toHaveLength(2);

    // Check visual effects
    expect(screen.getByText('Visual Effects')).toBeInTheDocument();
    expect(screen.getByText('gas production')).toBeInTheDocument();
    expect(screen.getByText('temperature change')).toBeInTheDocument();

    // Check explanation
    expect(screen.getByText('Scientific Explanation')).toBeInTheDocument();
    expect(
      screen.getByText(mockReactionResult.explanation)
    ).toBeInTheDocument();
  });

  it('displays world-first discovery banner', () => {
    const mockReactionResult: ReactionPrediction = {
      products: [
        {
          chemical_id: 1,
          molecular_formula: 'NewCompound',
          common_name: 'Unknown Compound',
          quantity: 1,
          is_soluble: false,
        },
      ],
      effects: [],
      explanation: 'You have discovered a completely new compound!',
      is_world_first: true,
    };

    mockUseLabStore.mockReturnValue({
      selectedChemicals: [
        {
          chemical: {
            id: 1,
            molecular_formula: 'X',
            common_name: 'Mystery Chemical',
            state_of_matter: 'solid' as const,
            color: 'unknown',
            density: 1.0,
            properties: {},
          },
          quantity: 1,
        },
      ],
      reactionResult: mockReactionResult,
      isReacting: false,
      error: null,
      environment: 'Earth (Normal)',
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      triggerReaction: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ResultsDisplay />);

    expect(screen.getByText(/WORLD-FIRST DISCOVERY!/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Congratulations! You've discovered a reaction that no one has found before!/
      )
    ).toBeInTheDocument();
  });

  it('displays different effect types correctly', () => {
    const mockReactionResult: ReactionPrediction = {
      products: [
        {
          chemical_id: 1,
          molecular_formula: 'H2O',
          common_name: 'Water',
          quantity: 1,
          is_soluble: true,
        },
      ],
      effects: [
        {
          effect_type: 'light_emission',
          color: 'blue',
          intensity: 0.8,
          radius: 5,
          duration: 15,
        },
        {
          effect_type: 'foam_production',
          color: 'white',
          density: 0.3,
          bubble_size: 'large' as const,
          stability: 30,
        },
        {
          effect_type: 'volume_change',
          factor: 1.5,
        },
      ],
      explanation: 'Multiple effects demonstration.',
      is_world_first: false,
    };

    mockUseLabStore.mockReturnValue({
      selectedChemicals: [
        {
          chemical: {
            id: 1,
            molecular_formula: 'Test',
            common_name: 'Test Chemical',
            state_of_matter: 'liquid' as const,
            color: 'blue',
            density: 1.0,
            properties: {},
          },
          quantity: 1,
        },
      ],
      reactionResult: mockReactionResult,
      isReacting: false,
      error: null,
      environment: 'Earth (Normal)',
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      triggerReaction: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    render(<ResultsDisplay />);

    expect(screen.getByText('light emission')).toBeInTheDocument();
    expect(screen.getByText('foam production')).toBeInTheDocument();
    expect(screen.getByText('volume change')).toBeInTheDocument();

    expect(
      screen.getByText(/Light emission \(blue, 80% intensity\)/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/white foam production \(large bubbles\)/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Volume expansion \(1.5x\)/)).toBeInTheDocument();
  });
});
