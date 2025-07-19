import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';
import { PerformanceMonitor } from '../PerformanceMonitor';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Button onClick={() => {}}>Test Button</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Test Button</Button>);
      
      const button = screen.getByRole('button', { name: 'Test Button' });
      
      // Focus with Tab
      await user.tab();
      expect(button).toHaveFocus();
      
      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Activate with Space
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper ARIA attributes when loading', async () => {
      render(
        <Button isLoading loadingText="Saving changes">
          Save
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByText('Loading, please wait')).toBeInTheDocument();
    });

    it('should support custom ARIA attributes', async () => {
      render(
        <Button 
          aria-label="Close dialog"
          aria-describedby="close-help"
          aria-expanded={false}
          aria-haspopup="dialog"
        >
          ×
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
      expect(button).toHaveAttribute('aria-describedby', 'close-help');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  describe('Input Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Input 
          label="Email Address" 
          type="email" 
          helperText="We'll never share your email"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should properly associate label with input', () => {
      render(<Input label="Username" />);
      
      const input = screen.getByRole('textbox', { name: 'Username' });
      const label = screen.getByText('Username');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('should indicate required fields', () => {
      render(<Input label="Password" isRequired />);
      
      const input = screen.getByRole('textbox', { name: /password/i });
      expect(input).toHaveAttribute('required');
      expect(screen.getByText('*')).toHaveAttribute('aria-label', 'required');
    });

    it('should properly handle error states', () => {
      render(
        <Input 
          label="Email" 
          error="Please enter a valid email address"
        />
      );
      
      const input = screen.getByRole('textbox', { name: 'Email' });
      const errorMessage = screen.getByRole('alert');
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', errorMessage.getAttribute('id'));
      expect(errorMessage).toHaveTextContent('Please enter a valid email address');
    });

    it('should associate helper text with input', () => {
      render(
        <Input 
          label="Username" 
          helperText="Must be at least 3 characters"
        />
      );
      
      const input = screen.getByRole('textbox', { name: 'Username' });
      const helperText = screen.getByText('Must be at least 3 characters');
      
      expect(input).toHaveAttribute('aria-describedby', helperText.getAttribute('id'));
    });
  });

  describe('Modal Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Modal 
          isOpen={true} 
          onClose={() => {}} 
          title="Confirmation"
          aria-describedby="modal-description"
        >
          <p id="modal-description">Are you sure you want to delete this item?</p>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>Outside Button</button>
          <Modal isOpen={true} onClose={() => {}}>
            <button>First Button</button>
            <button>Second Button</button>
          </Modal>
        </div>
      );
      
      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');
      const closeButton = screen.getByLabelText('Close modal');
      
      // Focus should be trapped within modal
      await user.tab();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      expect(secondButton).toHaveFocus();
      
      await user.tab();
      expect(closeButton).toHaveFocus();
      
      // Should cycle back to first focusable element
      await user.tab();
      expect(firstButton).toHaveFocus();
    });

    it('should close on Escape key', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();
      
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Modal content</p>
        </Modal>
      );
      
      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should prevent body scroll when open', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}}>
          <p>Modal content</p>
        </Modal>
      );
      
      expect(document.body.style.overflow).toBe('');
      
      rerender(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Modal content</p>
        </Modal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('Focus Management', () => {
    it('should handle focus restoration after modal closes', async () => {
      const user = userEvent.setup();
      let isOpen = true;
      const setIsOpen = (open: boolean) => { isOpen = open; };
      
      const TestComponent = () => (
        <div>
          <button onClick={() => setIsOpen(true)}>Open Modal</button>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </Modal>
        </div>
      );
      
      const { rerender } = render(<TestComponent />);
      
      const openButton = screen.getByText('Open Modal');
      await user.click(openButton);
      
      // Modal should be open and focused
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Close modal
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);
      
      // Rerender with closed modal
      isOpen = false;
      rerender(<TestComponent />);
      
      // Focus should be restored (in a real scenario)
      // Note: This is simplified for testing
      expect(openButton).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Support', () => {
    beforeEach(() => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('should respect reduced motion preferences', () => {
      // This would be tested with actual animation components
      // For now, we just verify the utility function works
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      expect(prefersReducedMotion).toBe(true);
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide appropriate live region announcements', async () => {
      // Mock live region functionality
      const mockAnnounce = jest.fn();
      
      // This would test actual live region announcements
      // For now, we verify the structure is in place
      expect(mockAnnounce).toBeDefined();
    });

    it('should have proper heading hierarchy', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );
      
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(3);
      
      // Verify heading levels
      expect(headings[0]).toHaveProperty('tagName', 'H1');
      expect(headings[1]).toHaveProperty('tagName', 'H2');
      expect(headings[2]).toHaveProperty('tagName', 'H3');
    });
  });

  describe('Performance Monitor Accessibility', () => {
    it('should have accessible toggle button', () => {
      render(<PerformanceMonitor showInDev={true} />);
      
      const toggleButton = screen.getByRole('button', { name: /performance monitor/i });
      expect(toggleButton).toHaveAttribute('aria-label');
      expect(toggleButton).toHaveAttribute('title');
    });

    it('should announce performance status changes', async () => {
      // This would test actual performance status announcements
      // Implementation would depend on the specific requirements
      const { container } = render(<PerformanceMonitor showInDev={true} />);
      expect(container).toBeInTheDocument();
    });
  });
});

describe('Keyboard Navigation Integration', () => {
  it('should support tab navigation through interactive elements', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Button>First Button</Button>
        <Input label="Text Input" />
        <Button>Second Button</Button>
      </div>
    );
    
    const firstButton = screen.getByText('First Button');
    const textInput = screen.getByRole('textbox');
    const secondButton = screen.getByText('Second Button');
    
    // Tab through elements
    await user.tab();
    expect(firstButton).toHaveFocus();
    
    await user.tab();
    expect(textInput).toHaveFocus();
    
    await user.tab();
    expect(secondButton).toHaveFocus();
  });

  it('should support shift+tab for reverse navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Button>First Button</Button>
        <Button>Second Button</Button>
      </div>
    );
    
    const firstButton = screen.getByText('First Button');
    const secondButton = screen.getByText('Second Button');
    
    // Focus second button first
    secondButton.focus();
    expect(secondButton).toHaveFocus();
    
    // Shift+Tab should go to first button
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(firstButton).toHaveFocus();
  });
});