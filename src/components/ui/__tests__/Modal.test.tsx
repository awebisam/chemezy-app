import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Modal } from '../Modal';

// Mock createPortal to render in the same container
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  it('renders when open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('shows close button by default', () => {
    render(<Modal {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when backdrop is clicked and closeOnBackdropClick is false', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />);
    
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when modal content is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Modal content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    expect(screen.getByRole('dialog').firstChild).toHaveClass('max-w-md');
    
    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByRole('dialog').firstChild).toHaveClass('max-w-2xl');
  });

  it('sets body overflow to hidden when open', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('manages focus correctly', async () => {
    render(
      <Modal {...defaultProps}>
        <button>First button</button>
        <button>Second button</button>
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.getByText('First button')).toHaveFocus();
    });
  });

  it('traps focus within modal', async () => {
    render(
      <Modal {...defaultProps}>
        <button>First button</button>
        <button>Second button</button>
      </Modal>
    );
    
    const firstButton = screen.getByText('First button');
    const secondButton = screen.getByText('Second button');
    
    // Focus should start on first button
    await waitFor(() => {
      expect(firstButton).toHaveFocus();
    });
    
    // Tab to second button
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(secondButton).toHaveFocus();
    
    // Tab from last element should go to first
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(firstButton).toHaveFocus();
    
    // Shift+Tab from first element should go to last
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(secondButton).toHaveFocus();
  });

  it('focuses initial focus element when provided', async () => {
    const initialFocusRef = { current: null as HTMLButtonElement | null };
    
    render(
      <Modal {...defaultProps} initialFocus={initialFocusRef}>
        <button>First button</button>
        <button ref={initialFocusRef}>Target button</button>
      </Modal>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Target button')).toHaveFocus();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Modal {...defaultProps} title="Accessible Modal" />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('prevents event propagation on modal content click', () => {
    const onClose = vi.fn();
    const onContentClick = vi.fn();
    
    render(
      <Modal {...defaultProps} onClose={onClose}>
        <div onClick={onContentClick}>Modal content</div>
      </Modal>
    );
    
    fireEvent.click(screen.getByText('Modal content'));
    
    expect(onContentClick).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});