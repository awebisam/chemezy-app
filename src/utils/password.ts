export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Use at least 8 characters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include lowercase letters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include uppercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include numbers');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include special characters');
  }

  // Bonus points for length
  if (password.length >= 12) {
    score = Math.min(score + 1, 4);
  }

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(score - 1, 0);
    suggestions.push('Avoid repeating characters');
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    score = Math.max(score - 1, 0);
    suggestions.push('Avoid common patterns');
  }

  const strengthMap = {
    0: { label: 'Very Weak' as const, color: 'bg-red-500' },
    1: { label: 'Weak' as const, color: 'bg-red-400' },
    2: { label: 'Fair' as const, color: 'bg-yellow-500' },
    3: { label: 'Good' as const, color: 'bg-blue-500' },
    4: { label: 'Strong' as const, color: 'bg-green-500' },
  };

  const strength = strengthMap[Math.min(score, 4) as keyof typeof strengthMap];

  return {
    score: Math.min(score, 4),
    label: strength.label,
    color: strength.color,
    suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
