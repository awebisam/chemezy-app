import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorBoundary, useErrorHandler } from '../ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock component to test useErrorHandler hook
const TestErrorHandler = () => {
  const { handleError } = useErrorHandler();

  return (
    <button onClick={() => handleError(new Error('Hook error'))}>
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('shows error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV;
    vi.stubGlobal('import.meta', { env: { DEV: true } });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();

    // Restore original environment
    vi.stubGlobal('import.meta', { env: { DEV: originalEnv } });
  });

  it('retries rendering when Try Again is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('reloads page when Reload Page is clicked', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Reload Page'));

    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('handles multiple errors correctly', () => {
    const onError = vi.fn();

    const { rerender } = render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);

    // Reset and throw another error
    fireEvent.click(screen.getByText('Try Again'));

    rerender(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(2);
  });
});

describe('useErrorHandler', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('logs errors to console', () => {
    render(<TestErrorHandler />);

    fireEvent.click(screen.getByText('Trigger Error'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error caught by useErrorHandler:',
      expect.any(Error),
      undefined
    );
  });

  it('handles errors with error info', () => {
    const TestComponent = () => {
      const { handleError } = useErrorHandler();

      const errorInfo = {
        componentStack: 'Test component stack',
      };

      return (
        <button onClick={() => handleError(new Error('Test'), errorInfo)}>
          Trigger Error with Info
        </button>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Trigger Error with Info'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error caught by useErrorHandler:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: 'Test component stack',
      })
    );
  });
});
