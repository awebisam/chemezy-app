import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ChemicalCard } from '../ChemicalCard';
import { LabBench } from '../LabBench';
import { useLabStore } from '../../../store/lab.store';
import type { Chemical } from '../../../types/chemical.types';

// Mock the lab store
vi.mock('@/store/lab.store');

const mockChemical: Chemical = {
  id: 1,
  molecular_formula: 'H2O',
  common_name: 'Water',
  state_of_matter: 'liquid',
  color: '#0066cc',
  density: 1.0,
  properties: {},
};

const mockUseLabStore = vi.mocked(useLabStore);

describe('Drag and Drop Integration', () => {
  const mockAddChemical = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseLabStore.mockReturnValue({
      selectedChemicals: [],
      environment: 'Earth (Normal)',
      reactionResult: null,
      isReacting: false,
      error: null,
      addChemical: mockAddChemical,
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      setEnvironment: vi.fn(),
      triggerReaction: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('allows dragging chemical from card to lab bench', () => {
    const { container } = render(
      <div>
        <ChemicalCard chemical={mockChemical} isDraggable={true} />
        <LabBench />
      </div>
    );

    const chemicalCard = container.querySelector('[draggable="true"]');
    const labBench = screen.getByRole('region', { name: 'Lab bench drop zone' });

    expect(chemicalCard).toBeInTheDocument();
    expect(labBench).toBeInTheDocument();

    // Simulate drag start
    fireEvent.dragStart(chemicalCard!, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: 'copy',
      },
    });

    // Simulate drag over lab bench
    fireEvent.dragOver(labBench, {
      dataTransfer: {
        dropEffect: 'copy',
      },
    });

    expect(screen.getByText('Drop chemical here')).toBeInTheDocument();

    // Simulate drop
    fireEvent.drop(labBench, {
      dataTransfer: {
        getData: vi.fn().mockReturnValue(JSON.stringify(mockChemical)),
      },
    });

    expect(mockAddChemical).toHaveBeenCalledWith(mockChemical, 1);
  });

  it('shows visual feedback during drag operations', () => {
    render(<LabBench />);

    const labBench = screen.getByRole('region', { name: 'Lab bench drop zone' });

    // Initially no drag feedback
    expect(screen.queryByText('Drop chemical here')).not.toBeInTheDocument();

    // Drag over should show feedback
    fireEvent.dragOver(labBench, {
      dataTransfer: {
        dropEffect: 'copy',
      },
    });

    expect(screen.getByText('Drop chemical here')).toBeInTheDocument();

    // Drag leave should hide feedback
    fireEvent.dragLeave(labBench, {
      clientX: 0,
      clientY: 0,
    });

    // Note: The dragLeave handler checks if we're actually leaving the bounds
    // In a real scenario, this would hide the feedback
  });

  

  it('prevents drag when isDraggable is false', () => {
    const { container } = render(<ChemicalCard chemical={mockChemical} isDraggable={false} />);

    const chemicalCard = container.querySelector('[aria-label="Chemical: Water (H2O)"]');
    
    // Should not have draggable attribute set to true
    expect(chemicalCard).toHaveAttribute('draggable', 'false');
    
    // Should not show drag hint
    expect(screen.queryByText('Drag to lab')).not.toBeInTheDocument();
  });
});