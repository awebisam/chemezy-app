import React from 'react';
import { cn } from '@/utils/cn';
import { useLabStore } from '@/store/lab.store';
import type { Environment } from '@/types/reaction.types';

export interface EnvironmentSelectorProps {
  className?: string;
}

interface EnvironmentOption {
  value: Environment;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const environmentOptions: EnvironmentOption[] = [
  {
    value: 'Earth (Normal)',
    label: 'Earth (Normal)',
    description:
      'Standard atmospheric conditions with 21% oxygen, 78% nitrogen, and normal pressure.',
    icon: '🌍',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
  },
  {
    value: 'Vacuum',
    label: 'Vacuum',
    description:
      'Complete absence of matter - no air pressure or atmospheric gases.',
    icon: '🌌',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
  },
  {
    value: 'Pure Oxygen',
    label: 'Pure Oxygen',
    description:
      '100% oxygen environment - highly reactive conditions that accelerate combustion.',
    icon: '💨',
    color: 'bg-red-100 border-red-300 text-red-800',
  },
  {
    value: 'Inert Gas',
    label: 'Inert Gas',
    description:
      'Noble gas environment (argon/helium) that prevents oxidation and unwanted reactions.',
    icon: '⚪',
    color: 'bg-gray-100 border-gray-300 text-gray-800',
  },
  {
    value: 'Acidic Environment',
    label: 'Acidic Environment',
    description:
      'Low pH conditions that promote acid-catalyzed reactions and metal dissolution.',
    icon: '🧪',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  },
  {
    value: 'Basic Environment',
    label: 'Basic Environment',
    description:
      'High pH conditions that favor base-catalyzed reactions and saponification.',
    icon: '🧂',
    color: 'bg-green-100 border-green-300 text-green-800',
  },
];

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  className,
}) => {
  const { environment, setEnvironment } = useLabStore();

  const handleEnvironmentChange = (newEnvironment: Environment) => {
    setEnvironment(newEnvironment);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Experimental Environment
        </h3>
        <div className="group relative">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Environment information"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Choose the environment conditions for your experiment
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {environmentOptions.map(option => {
          const isSelected = environment === option.value;

          return (
            <div key={option.value} className="group relative">
              <button
                type="button"
                onClick={() => handleEnvironmentChange(option.value)}
                className={cn(
                  'w-full p-4 rounded-lg border-2 transition-all duration-300 text-left',
                  'hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  isSelected
                    ? `${option.color} border-current shadow-md scale-105 ring-2 ring-primary-500 ring-offset-2`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                )}
                aria-pressed={isSelected}
                aria-describedby={`env-desc-${option.value.replace(/[^a-zA-Z0-9]/g, '-')}`}
              >
                <div className="flex items-start space-x-3">
                  <span
                    className="text-2xl flex-shrink-0"
                    role="img"
                    aria-hidden="true"
                  >
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        'font-medium text-sm',
                        isSelected ? 'text-current' : 'text-gray-900'
                      )}
                    >
                      {option.label}
                    </h4>
                    <p
                      className={cn(
                        'text-xs mt-1 line-clamp-2',
                        isSelected ? 'text-current opacity-80' : 'text-gray-600'
                      )}
                    >
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-current"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              {/* Tooltip for detailed description */}
              <div
                id={`env-desc-${option.value.replace(/[^a-zA-Z0-9]/g, '-')}`}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 max-w-xs text-center"
                role="tooltip"
              >
                {option.description}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current selection indicator */}
      <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-primary-600 font-medium text-sm">
            Current Environment:
          </span>
          <span className="text-primary-800 font-semibold text-sm">
            {environmentOptions.find(opt => opt.value === environment)?.icon}{' '}
            {environment}
          </span>
        </div>
      </div>
    </div>
  );
};
