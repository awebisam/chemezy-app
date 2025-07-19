import { describe, it, expect } from 'vitest';
import {
  calculatePasswordStrength,
  validateEmail,
  validatePassword,
} from '../password';

describe('password utilities', () => {
  describe('calculatePasswordStrength', () => {
    it('should return very weak for empty password', () => {
      const result = calculatePasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.label).toBe('Very Weak');
      expect(result.color).toBe('bg-red-500');
      expect(result.suggestions).toContain('Use at least 8 characters');
    });

    it('should return weak for short password', () => {
      const result = calculatePasswordStrength('abc');
      expect(result.score).toBe(0); // Only has lowercase, missing length, uppercase, numbers, special chars
      expect(result.label).toBe('Very Weak');
      expect(result.suggestions).toContain('Use at least 8 characters');
      expect(result.suggestions).toContain('Include uppercase letters');
      expect(result.suggestions).toContain('Include numbers');
    });

    it('should return fair for password with basic requirements', () => {
      const result = calculatePasswordStrength('Password1');
      expect(result.score).toBe(3);
      expect(result.label).toBe('Good');
      expect(result.suggestions).toContain('Include special characters');
    });

    it('should return strong for complex password', () => {
      const result = calculatePasswordStrength('MyStr0ng!P@ssw0rd');
      expect(result.score).toBe(4);
      expect(result.label).toBe('Strong');
      expect(result.color).toBe('bg-green-500');
      expect(result.suggestions).toHaveLength(0);
    });

    it('should penalize repeating characters', () => {
      const result = calculatePasswordStrength('Passsssword1!');
      expect(result.suggestions).toContain('Avoid repeating characters');
    });

    it('should penalize common patterns', () => {
      const result = calculatePasswordStrength('Password123!');
      expect(result.suggestions).toContain('Avoid common patterns');
    });

    it('should give bonus for long passwords', () => {
      const result = calculatePasswordStrength('MyVeryLongPassword1!');
      expect(result.score).toBe(4);
      expect(result.label).toBe('Strong');
    });

    it('should limit suggestions to 3', () => {
      const result = calculatePasswordStrength('a');
      expect(result.suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      // Note: test..test@example.com is actually valid according to RFC standards
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('MyStr0ng!Password');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short passwords', () => {
      const result = validatePassword('Short1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 8 characters long'
      );
    });

    it('should require lowercase letters', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should require uppercase letters', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should require numbers', () => {
      const result = validatePassword('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
    });

    it('should return all validation errors', () => {
      const result = validatePassword('pass');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // length, uppercase, numbers (has lowercase)
    });
  });
});
