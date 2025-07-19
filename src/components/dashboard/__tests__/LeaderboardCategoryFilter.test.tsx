import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { LeaderboardCategoryFilter } from '../LeaderboardCategoryFilter';
import type { AwardCategory } from '@/types/award.types';

describe('LeaderboardCategoryFilter', () => {
  const mockOnCategoryChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all category options', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    expect(screen.getByText('Overall')).toBeInTheDocument();
    expect(screen.getByText('Discovery')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Special')).toBeInTheDocument();
    expect(screen.getByText('Achievement')).toBeInTheDocument();
  });

  it('displays category descriptions', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    expect(screen.getByText('All categories combined')).toBeInTheDocument();
    expect(
      screen.getByText('First-time reaction discoveries')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Contributing to chemical database')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Community engagement and sharing')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Special achievements and milestones')
    ).toBeInTheDocument();
    expect(
      screen.getByText('General achievements and progress')
    ).toBeInTheDocument();
  });

  it('highlights selected category', () => {
    render(
      <LeaderboardCategoryFilter
        selectedCategory="discovery"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const discoveryButton = screen.getByText('Discovery').closest('button');
    expect(discoveryButton).toHaveClass(
      'text-blue-600',
      'bg-blue-50',
      'border-blue-200'
    );

    // Check that the selected indicator is present
    const checkIcon = discoveryButton?.querySelector(
      'svg[viewBox="0 0 20 20"]'
    );
    expect(checkIcon).toBeInTheDocument();
  });

  it('calls onCategoryChange when category is selected', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    const discoveryButton = screen.getByText('Discovery').closest('button');
    fireEvent.click(discoveryButton!);

    expect(mockOnCategoryChange).toHaveBeenCalledWith('discovery');
  });

  it('calls onCategoryChange with undefined for overall category', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    const overallButton = screen.getByText('Overall').closest('button');
    fireEvent.click(overallButton!);

    expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
  });

  it('displays correct icons for each category', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    // Check that each category button contains an SVG icon
    const categoryButtons = screen.getAllByRole('button');
    categoryButtons.forEach(button => {
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('applies correct color schemes for different categories', () => {
    const categories: Array<{
      category: AwardCategory;
      expectedClass: string;
    }> = [
      { category: 'discovery', expectedClass: 'text-blue-600' },
      { category: 'database_contribution', expectedClass: 'text-green-600' },
      { category: 'community', expectedClass: 'text-purple-600' },
      { category: 'special', expectedClass: 'text-yellow-600' },
      { category: 'achievement', expectedClass: 'text-red-600' },
    ];

    categories.forEach(({ category, expectedClass }) => {
      const { rerender } = render(
        <LeaderboardCategoryFilter
          selectedCategory={category}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const categoryButton = screen
        .getByText(
          category === 'database_contribution'
            ? 'Database'
            : category.charAt(0).toUpperCase() + category.slice(1)
        )
        .closest('button');

      expect(categoryButton).toHaveClass(expectedClass);

      rerender(<div />); // Clear for next iteration
    });
  });

  it('renders mobile quick filter buttons', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    // Mobile filter buttons should be present but hidden on larger screens
    const mobileContainer = screen
      .getByText('Overall')
      .closest('div')
      ?.parentElement?.querySelector('.sm\\:hidden');
    expect(mobileContainer).toBeInTheDocument();
  });

  it('handles category selection in mobile view', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    // Find mobile filter buttons (they should have rounded-full class)
    const mobileButtons = screen
      .getAllByRole('button')
      .filter(button => button.className.includes('rounded-full'));

    expect(mobileButtons.length).toBeGreaterThan(0);

    // Click on a mobile button
    const mobileDiscoveryButton = mobileButtons.find(button =>
      button.textContent?.includes('Discovery')
    );

    if (mobileDiscoveryButton) {
      fireEvent.click(mobileDiscoveryButton);
      expect(mockOnCategoryChange).toHaveBeenCalledWith('discovery');
    }
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class';
    const { container } = render(
      <LeaderboardCategoryFilter
        className={customClass}
        onCategoryChange={mockOnCategoryChange}
      />
    );

    expect(container.firstChild).toHaveClass(customClass);
  });

  it('shows filter title', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    expect(screen.getByText('Filter by Category')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(
      <LeaderboardCategoryFilter onCategoryChange={mockOnCategoryChange} />
    );

    const firstButton = screen.getByText('Overall').closest('button');

    // Focus the button
    firstButton?.focus();
    expect(document.activeElement).toBe(firstButton);

    // Press Enter to activate
    fireEvent.keyDown(firstButton!, { key: 'Enter', code: 'Enter' });
    // Note: The actual click event would be triggered by the browser,
    // but we can test that the button is focusable and responds to keyboard events
  });

  it('maintains selection state correctly', () => {
    const { rerender } = render(
      <LeaderboardCategoryFilter
        selectedCategory="discovery"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    // Discovery should be selected
    let discoveryButton = screen.getByText('Discovery').closest('button');
    expect(discoveryButton).toHaveClass('text-blue-600');

    // Change selection
    rerender(
      <LeaderboardCategoryFilter
        selectedCategory="community"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    // Community should now be selected, discovery should not
    discoveryButton = screen.getByText('Discovery').closest('button');
    const communityButton = screen.getByText('Community').closest('button');

    expect(discoveryButton).not.toHaveClass('text-blue-600');
    expect(communityButton).toHaveClass('text-purple-600');
  });
});
