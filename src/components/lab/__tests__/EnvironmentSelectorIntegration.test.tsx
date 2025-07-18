import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LabPage } from '@/pages/LabPage';
import { useLabStore } from '@/store/lab.store';
import { useChemicalStore } from '@/store/chemical.store';

// Mock the stores
vi.mock('@/store/lab.store');
vi.mock('@/store/chemical.store');

const mockUseLabStore = vi.mocked(useLabStore);
const mockUseChemicalStore = vi.mocked(useChemicalStore);

describe('EnvironmentSelector Integration', () => {
  const mockSetEnvironment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseLabStore.mockReturnValue({
      environment: 'Earth (Normal)',
      setEnvironment: mockSetEnvironment,
      selectedChemicals: [],
      reactionResult: null,
      isReacting: false,
      error: null,
      addChemical: vi.fn(),
      removeChemical: vi.fn(),
      updateChemicalQuantity: vi.fn(),
      triggerReaction: vi.fn(),
      clearLab: vi.fn(),
      clearError: vi.fn(),
    });

    mockUseChemicalStore.mockReturnValue({
      chemicals: [],
      totalChemicals: 0,
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      error: null,
      searchQuery: '',
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        pages: 1,
      },
      fetchChemicals: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('renders EnvironmentSelector in LabPage', () => {
    render(<LabPage />);

    // Check that the environment selector is rendered
    expect(screen.getByText('Experimental Environment')).toBeInTheDocument();
    expect(screen.getByText('Earth (Normal)')).toBeInTheDocument();
    expect(screen.getByText('Vacuum')).toBeInTheDocument();
  });

  it('allows environment selection in LabPage context', () => {
    render(<LabPage />);

    // Click on Vacuum environment
    const vacuumButton = screen.getByRole('button', { name: /Vacuum/ });
    fireEvent.click(vacuumButton);

    // Verify that setEnvironment was called
    expect(mockSetEnvironment).toHaveBeenCalledWith('Vacuum');
  });

  it('displays current environment indicator', () => {
    render(<LabPage />);

    // Check that current environment is displayed
    expect(screen.getByText(/Current Environment:/)).toBeInTheDocument();
    expect(screen.getByText(/🌍 Earth \(Normal\)/)).toBeInTheDocument();
  });

  it('shows environment descriptions for educational value', () => {
    render(<LabPage />);

    // Check that educational descriptions are present
    expect(screen.getAllByText(/Standard atmospheric conditions/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Complete absence of matter/).length).toBeGreaterThan(0);
  });

  it('integrates properly with lab layout', () => {
    render(<LabPage />);

    // Check that environment selector is rendered
    expect(screen.getByText('Experimental Environment')).toBeInTheDocument();
    
    // Check that it appears in the lab page along with other components
    expect(screen.getByText('Virtual Chemistry Lab')).toBeInTheDocument();
    
    // Check that all environment options are available
    expect(screen.getByText('Earth (Normal)')).toBeInTheDocument();
    expect(screen.getByText('Vacuum')).toBeInTheDocument();
    expect(screen.getByText('Pure Oxygen')).toBeInTheDocument();
  });
});