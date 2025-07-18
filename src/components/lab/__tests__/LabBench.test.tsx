import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LabBench } from '../LabBench';
import { useLabStore } from '@/store/lab.store';
import type { Chemical } from '@/types/chemical.types';

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

describe('LabBench', () => {
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

  it('renders empty lab bench correctly', () => {
    render(<LabBench />);
    
    expect(screen.getByText('Lab Bench')).toBeInTheDocument();
    expect(screen.getByText('Empty Lab Bench')).toBeInTheDocument();
    expect(screen.getByText(/Drag chemicals from the inventory/)).toBeInTheDocument();
  });

  it('handles drag and drop correctly', () => {
    render(<LabBench />);
    
    const dropZone = screen.getByRole('region', { name: 'Lab bench drop zone' });
    
    // Simulate drag over
    fireEvent.dragOver(dropZone, {
      dataTransfer: {
        dropEffect: 'copy',
      },
    });
    
    expect(screen.getByText('Drop chemical here')).toBeInTheDocument();
    
    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: vi.fn().mockReturnValue(JSON.stringify(mockChemical)),
      },
    });
    
    expect(mockAddChemical).toHaveBeenCalledWith(mockChemical, 1);
  });

  it('displays selected chemicals when present', () => {
    mockUseLabStore.mockReturnValue({
      selectedChemicals: [{ chemical: mockChemical, quantity: 2 }],
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

    render(<LabBench />);
    
    expect(screen.getByText('Selected Chemicals (1)')).toBeInTheDocument();
    expect(screen.queryByText('Empty Lab Bench')).not.toBeInTheDocument();
  });

  it('handles invalid drop data gracefully', () => {
    render(<LabBench />);
    
    const dropZone = screen.getByRole('region', { name: 'Lab bench drop zone' });
    
    // Simulate drop with invalid data
    fireEvent.drop(dropZone, {
      dataTransfer: {
        getData: vi.fn().mockReturnValue('invalid json'),
      },
    });
    
    expect(screen.getByText('Failed to add chemical to lab bench')).toBeInTheDocument();
    expect(mockAddChemical).not.toHaveBeenCalled();
  });
});