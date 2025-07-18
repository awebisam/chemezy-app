import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ToastProvider, useToastHelpers } from '../Toast';

// Test component that uses the toast hooks
const TestComponent: React.FC = () => {
  const toast = useToastHelpers();

  return (
    <div>
      <button onClick={() => toast.success('Success', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => toast.error('Error', 'Error message')}>
        Show Error
      </button>
      <button onClick={() => toast.warning('Warning', 'Warning message')}>
        Show Warning
      </button>
      <button onClick={() => toast.info('Info', 'Info message')}>
        Show Info
      </button>
    </div>
  );
};

const TestWrapper: React.FC = () => (
  <ToastProvider>
    <TestComponent />
  </ToastProvider>
);

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders success toast correctly', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders error toast correctly', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders warning toast correctly', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('renders info toast correctly', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText('Show Info'));

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('shows close button for manual dismissal', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByLabelText('Close notification')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText('Show Success'));

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('supports multiple toasts simultaneously', async () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
