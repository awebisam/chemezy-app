import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('renders basic input correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);

    const label = screen.getByText('Username');
    const input = screen.getByPlaceholderText('Enter username');

    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('shows required indicator when isRequired is true', () => {
    render(<Input label="Email" isRequired />);

    const requiredIndicator = screen.getByLabelText('required');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveTextContent('*');
  });

  it('displays error message', () => {
    render(<Input label="Password" error="Password is required" />);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Password is required');

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
  });

  it('displays helper text when no error', () => {
    render(<Input label="Username" helperText="Must be unique" />);

    const helperText = screen.getByText('Must be unique');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-gray-500');

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', helperText.id);
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input
        label="Email"
        error="Invalid email"
        helperText="Enter your email address"
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    expect(
      screen.queryByText('Enter your email address')
    ).not.toBeInTheDocument();
  });

  it('renders with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">@</span>;
    render(<Input leftIcon={<LeftIcon />} />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10');
  });

  it('renders with right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">👁</span>;
    render(<Input rightIcon={<RightIcon />} />);

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pr-10');
  });

  it('handles different input types', () => {
    render(<Input type="password" />);

    const input = screen.getByRole('textbox', { hidden: true }); // password inputs are hidden from screen readers by default
    expect(input).toHaveAttribute('type', 'password');
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Something went wrong" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'border-red-300',
      'focus:border-red-500',
      'focus:ring-red-500'
    );
  });

  it('applies normal styling when no error', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'border-gray-300',
      'focus:border-primary-500',
      'focus:ring-primary-500'
    );
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('passes through additional props', () => {
    render(<Input data-testid="custom-input" maxLength={10} />);

    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('generates unique IDs for multiple inputs', () => {
    render(
      <div>
        <Input label="First" />
        <Input label="Second" />
      </div>
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });

  it('uses provided ID when given', () => {
    render(<Input id="custom-id" label="Test" />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test');

    expect(input).toHaveAttribute('id', 'custom-id');
    expect(label).toHaveAttribute('for', 'custom-id');
  });
});
