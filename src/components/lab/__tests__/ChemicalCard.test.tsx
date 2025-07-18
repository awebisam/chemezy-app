import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChemicalCard } from '../ChemicalCard';
import type { Chemical } from '@/types/chemical.types';

const mockChemical: Chemical = {
  id: 1,
  molecular_formula: 'H2O',
  common_name: 'Water',
  state_of_matter: 'liquid',
  color: '#0066cc',
  density: 1.0,
  properties: {
    boiling_point: 100,
    freezing_point: 0,
  },
};

describe('ChemicalCard', () => {
  it('renders chemical information correctly', () => {
    render(<ChemicalCard chemical={mockChemical} />);

    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('H2O')).toBeInTheDocument();
    expect(screen.getByText('liquid')).toBeInTheDocument();
    expect(screen.getByText('Density: 1 g/cm³')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const mockOnSelect = vi.fn();
    render(<ChemicalCard chemical={mockChemical} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockChemical);
  });

  it('calls onViewDetails when details button is clicked', () => {
    const mockOnViewDetails = vi.fn();
    render(<ChemicalCard chemical={mockChemical} onViewDetails={mockOnViewDetails} />);

    fireEvent.click(screen.getByText('Details'));
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockChemical);
  });

  it('shows drag indicator when draggable', () => {
    render(<ChemicalCard chemical={mockChemical} isDraggable={true} />);
    expect(screen.getByText('Drag to lab')).toBeInTheDocument();
  });

  it('does not show drag indicator when not draggable', () => {
    render(<ChemicalCard chemical={mockChemical} isDraggable={false} />);
    expect(screen.queryByText('Drag to lab')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const mockOnSelect = vi.fn();
    render(<ChemicalCard chemical={mockChemical} onSelect={mockOnSelect} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith(mockChemical);

    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnSelect).toHaveBeenCalledTimes(2);
  });
});