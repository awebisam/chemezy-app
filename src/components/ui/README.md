# UI Component Library

This directory contains the core UI components for the Chemezy Frontend application. All components are built with accessibility, responsiveness, and usability in mind.

## Components

### Button

A versatile button component with multiple variants, sizes, and loading states.

**Features:**

- Multiple variants: `primary`, `secondary`, `danger`, `ghost`
- Three sizes: `sm`, `md`, `lg`
- Loading state with spinner and custom loading text
- Full accessibility support with ARIA attributes
- Keyboard navigation support

**Usage:**

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

<Button isLoading loadingText="Saving...">
  Save
</Button>
```

### Input

A form input component with validation states, icons, and accessibility features.

**Features:**

- Label and helper text support
- Error state with validation messages
- Left and right icon slots
- Required field indicator
- Full accessibility with proper ARIA attributes
- Auto-generated IDs for label association

**Usage:**

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email Address"
  type="email"
  placeholder="user@example.com"
  error={errors.email}
  isRequired
  helperText="We'll never share your email"
/>;
```

### Modal

A fully accessible modal component with focus management and keyboard navigation.

**Features:**

- Backdrop click to close (configurable)
- Escape key to close
- Focus trapping and management
- Multiple sizes: `sm`, `md`, `lg`, `xl`
- Proper ARIA attributes for screen readers
- Portal rendering to document body

**Usage:**

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to continue?</p>
  <div className="flex justify-end gap-2 mt-4">
    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>;
```

### LoadingSpinner

A customizable loading spinner with multiple sizes and colors.

**Features:**

- Four sizes: `sm`, `md`, `lg`, `xl`
- Multiple colors: `primary`, `secondary`, `white`, `gray`
- Proper accessibility with `role="status"` and screen reader text
- Smooth CSS animations

**Usage:**

```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="lg" color="primary" />
<LoadingSpinner aria-label="Loading data..." />
```

### Toast Notification System

A comprehensive toast notification system with multiple types and auto-dismissal.

**Features:**

- Four types: `success`, `error`, `warning`, `info`
- Auto-dismissal with configurable duration
- Manual dismissal with close button
- Action buttons support
- Stacking multiple toasts
- Smooth entrance and exit animations
- Full accessibility support

**Usage:**

```tsx
import { ToastProvider, useToastHelpers } from '@/components/ui';

// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>;

// Use in components
const Component = () => {
  const toast = useToastHelpers();

  const handleSuccess = () => {
    toast.success('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    toast.error('Error!', 'Something went wrong', {
      duration: 10000, // 10 seconds
      action: {
        label: 'Retry',
        onClick: () => retryOperation(),
      },
    });
  };
};
```

## Accessibility Features

All components include comprehensive accessibility features:

- **Keyboard Navigation**: Full keyboard support with proper focus management
- **Screen Reader Support**: Proper ARIA labels, roles, and live regions
- **Focus Management**: Logical tab order and focus trapping where appropriate
- **High Contrast**: Compatible with high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Styling

Components use Tailwind CSS v4 with custom theme variables defined in `src/index.css`:

- Primary colors: `--color-primary-*`
- Secondary colors: `--color-secondary-*`
- Custom animations: `--animate-bounce-slow`, `--animate-pulse-slow`

## Testing

All components include comprehensive test suites covering:

- Rendering and basic functionality
- Accessibility features
- User interactions
- Error states
- Edge cases

Run tests with:

```bash
npm test src/components/ui/__tests__/
```

## Demo

See all components in action with the `UIDemo` component:

```tsx
import { UIDemo } from '@/components/ui';

<UIDemo />;
```

This provides a comprehensive showcase of all components with interactive examples.
