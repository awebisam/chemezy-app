import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('applies correct color classes', () => {
    render(<LoadingSpinner color="secondary" />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('text-secondary-600');
  });

  it('uses custom aria-label', () => {
    render(<LoadingSpinner aria-label="Processing request" />);
    expect(screen.getByLabelText('Processing request')).toBeInTheDocument();
  });

  it('includes screen reader text', () => {
    render(<LoadingSpinner aria-label="Custom loading" />);
    expect(screen.getByText('Custom loading')).toHaveClass('sr-only');
  });
});