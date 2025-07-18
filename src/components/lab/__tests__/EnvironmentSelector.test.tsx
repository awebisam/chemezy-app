import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnvironmentSelector } from '../EnvironmentSelector';
import { useLabStore } from '@/store/lab.store';

// Mock the lab store
vi.mock('@/store/lab.store');

const mockUseLabStore = vi.mocked(useLabStore);

describe('EnvironmentSelector', () => {
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
  });

  it('renders all environment options', () => {
    render(<EnvironmentSelector />);

    // Check that all environment options are rendered
    expect(screen.getByText('Earth (Normal)')).toBeInTheDocument();
    expect(screen.getByText('Vacuum')).toBeInTheDocument();
    expect(screen.getByText('Pure Oxygen')).toBeInTheDocument();
    expect(screen.getByText('Inert Gas')).toBeInTheDocument();
    expect(screen.getByText('Acidic Environment')).toBeInTheDocument();
    expect(screen.getByText('Basic Environment')).toBeInTheDocument();
  });

  it('displays the current environment selection', () => {
    render(<EnvironmentSelector />);

    // Check that the current environment is indicated
    const currentEnvIndicator = screen.getByText(/Current Environment:/);
    expect(currentEnvIndicator).toBeInTheDocument();
    expect(screen.getByText(/🌍 Earth \(Normal\)/)).toBeInTheDocument();
  });

  it('highlights the selected environment option', () => {
    render(<EnvironmentSelector />);

    // The Earth (Normal) button should be selected (pressed)
    const earthButton = screen.getByRole('button', {
      name: /Earth \(Normal\)/,
    });
    expect(earthButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls setEnvironment when a different environment is selected', () => {
    render(<EnvironmentSelector />);

    // Click on Vacuum environment
    const vacuumButton = screen.getByRole('button', { name: /Vacuum/ });
    fireEvent.click(vacuumButton);

    expect(mockSetEnvironment).toHaveBeenCalledWith('Vacuum');
  });

  it('updates selection when environment changes', () => {
    // First render with Earth (Normal)
    const { rerender } = render(<EnvironmentSelector />);

    let earthButton = screen.getByRole('button', { name: /Earth \(Normal\)/ });
    let vacuumButton = screen.getByRole('button', { name: /Vacuum/ });

    expect(earthButton).toHaveAttribute('aria-pressed', 'true');
    expect(vacuumButton).toHaveAttribute('aria-pressed', 'false');

    // Update mock to return Vacuum as selected
    mockUseLabStore.mockReturnValue({
      environment: 'Vacuum',
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

    // Re-render with updated environment
    rerender(<EnvironmentSelector />);

    earthButton = screen.getByRole('button', { name: /Earth \(Normal\)/ });
    vacuumButton = screen.getByRole('button', { name: /Vacuum/ });

    expect(earthButton).toHaveAttribute('aria-pressed', 'false');
    expect(vacuumButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/🌌 Vacuum/)).toBeInTheDocument();
  });

  it('displays environment descriptions', () => {
    render(<EnvironmentSelector />);

    // Check that descriptions are present (they appear in both card and tooltip)
    expect(
      screen.getAllByText(/Standard atmospheric conditions/).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Complete absence of matter/).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/100% oxygen environment/).length
    ).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', () => {
    render(<EnvironmentSelector />);

    // Check for proper ARIA attributes
    const buttons = screen.getAllByRole('button');
    const environmentButtons = buttons.filter(
      button => button.getAttribute('aria-pressed') !== null
    );

    environmentButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-pressed');
      expect(button).toHaveAttribute('aria-describedby');
    });

    // Check for tooltips
    const tooltips = screen.getAllByRole('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <EnvironmentSelector className="custom-class" />
    );

    const environmentSelector = container.firstChild as HTMLElement;
    expect(environmentSelector).toHaveClass('custom-class');
  });

  it('shows information tooltip', () => {
    render(<EnvironmentSelector />);

    const infoButton = screen.getByLabelText('Environment information');
    expect(infoButton).toBeInTheDocument();
  });
});
