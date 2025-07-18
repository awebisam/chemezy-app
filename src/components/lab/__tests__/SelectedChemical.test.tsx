import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectedChemical } from '../SelectedChemical';
import { useLabStore } from '@/store/lab.store';
import type { Chemical, SelectedChemical as SelectedChemicalType } from '@/types/chemical.types';

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

const mockSelectedChemical: SelectedChemicalType = {
  chemical: mockChemical,
  quantity: 5,
};

const mockUseLabStore = vi.mocked(useLabStore);

describe('SelectedChemical', () => {
  const mockUpdateChemicalQuantity = vi.fn();
  const mockRemoveChemical = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseLabStore.mockReturnValue({
      selectedChemicals: [],
      environment: 'Earth (Normal)',
      reactionResult: null,
      isReacting: false,
      error: null,
      addChemical: vi.fn(),
      removeChemical: mockRemoveChemical,
      updateChemicalQuantity: mockUpdateChemicalQuantity,
      setEnvironment: vi.fn(),
      triggerReaction: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('renders chemical information correctly', () => {
    render(<SelectedChemical selectedChemical={mockSelectedChemical} />);
    
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('H2O')).toBeInTheDocument();
    expect(screen.getByText('liquid')).toBeInTheDocument();
    expect(screen.getByText('Density: 1 g/cm³')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles quantity increase correctly', () => {
    render(<SelectedChemical selectedChemical={mockSelectedChemical} />);
    
    const increaseButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseButton);
    
    expect(mockUpdateChemicalQuantity).toHaveBeenCalledWith(1, 5.1);
  });

  it('handles quantity decrease correctly', () => {
    render(<SelectedChemical selectedChemical={mockSelectedChemical} />);
    
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseButton);
    
    expect(mockUpdateChemicalQuantity).toHaveBeenCalledWith(1, 4.9);
  });

  it('handles quick quantity selection', () => {
    render(<SelectedChemical selectedChemical={mockSelectedChemical} />);
    
    const quickButton = screen.getByText('10g');
    fireEvent.click(quickButton);
    
    expect(mockUpdateChemicalQuantity).toHaveBeenCalledWith(1, 10);
  });

  it('handles chemical removal', () => {
    render(<SelectedChemical selectedChemical={mockSelectedChemical} />);
    
    const removeButton = screen.getByLabelText('Remove Water from lab bench');
    fireEvent.click(removeButton);
    
    expect(mockRemoveChemical).toHaveBeenCalledWith(1);
  });

  it('handles quantity editing', () => {
    render(<SelectedChemical selectedChemical={mockSelectedChemical} />);
    
    const quantityButton = screen.getByLabelText('Edit quantity');
    fireEvent.click(quantityButton);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '7.5' } });
    fireEvent.blur(input);
    
    expect(mockUpdateChemicalQuantity).toHaveBeenCalledWith(1, 7.5);
  });

  it('prevents quantity decrease below minimum', () => {
    const lowQuantityChemical = {
      ...mockSelectedChemical,
      quantity: 0.1,
    };
    
    render(<SelectedChemical selectedChemical={lowQuantityChemical} />);
    
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    expect(decreaseButton).toBeDisabled();
  });

  it('prevents quantity increase above maximum', () => {
    const highQuantityChemical = {
      ...mockSelectedChemical,
      quantity: 999,
    };
    
    render(<SelectedChemical selectedChemical={highQuantityChemical} />);
    
    const increaseButton = screen.getByLabelText('Increase quantity');
    expect(increaseButton).toBeDisabled();
  });
});