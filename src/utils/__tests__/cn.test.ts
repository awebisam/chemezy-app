import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'text-sm');
    expect(result).toBe('px-2 py-1 text-sm');
  });

  it('should handle conditional classes', () => {
    const result = cn(
      'base-class',
      true && 'conditional-class',
      false && 'hidden-class'
    );
    expect(result).toBe('base-class conditional-class');
  });

  it('should merge conflicting Tailwind classes correctly', () => {
    const result = cn('px-2 px-4', 'py-1 py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      active: true,
      disabled: false,
      primary: true,
    });
    expect(result).toBe('active primary');
  });

  it('should handle empty inputs', () => {
    const result = cn('', null, undefined, false);
    expect(result).toBe('');
  });

  it('should handle complex combinations', () => {
    const isActive = true;
    const isDisabled = false;
    const variant = 'primary';

    const result = cn(
      'btn',
      `btn-${variant}`,
      {
        'btn-active': isActive,
        'btn-disabled': isDisabled,
      },
      isActive && 'state-active'
    );

    expect(result).toBe('btn btn-primary btn-active state-active');
  });
});
