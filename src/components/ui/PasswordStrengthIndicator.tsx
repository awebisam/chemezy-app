import React from 'react';
import { calculatePasswordStrength } from '@/utils/password';
import { cn } from '@/utils/cn';

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, showSuggestions = true }) => {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              strength.color
            )}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {strength.label}
        </span>
      </div>

      {showSuggestions && strength.suggestions.length > 0 && (
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Suggestions:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {strength.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
