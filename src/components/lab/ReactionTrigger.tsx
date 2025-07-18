import React from 'react';
import { Button } from '@/components/ui/Button';
import { useLabStore } from '@/store/lab.store';
import { cn } from '@/utils/cn';

export interface ReactionTriggerProps {
  className?: string;
}

export const ReactionTrigger: React.FC<ReactionTriggerProps> = ({
  className,
}) => {
  const { selectedChemicals, isReacting, triggerReaction, error } =
    useLabStore();

  const canReact = selectedChemicals.length > 0 && !isReacting;

  const handleReaction = async () => {
    try {
      await triggerReaction();
    } catch (error) {
      // Error is already handled in the store
      console.error('Reaction failed:', error);
    }
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      {/* Main Reaction Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleReaction}
        disabled={!canReact}
        isLoading={isReacting}
        loadingText="Reacting..."
        className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow duration-200"
        aria-describedby={error ? 'reaction-error' : undefined}
      >
        {isReacting ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Reacting...
          </span>
        ) : (
          <span className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Start Reaction
          </span>
        )}
      </Button>

      {/* Status Information */}
      <div className="text-center">
        {selectedChemicals.length === 0 ? (
          <p className="text-sm text-gray-500">
            Add chemicals to the lab bench to start a reaction
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Ready to react {selectedChemicals.length} chemical
            {selectedChemicals.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          id="reaction-error"
          className="max-w-md p-3 bg-red-50 border border-red-200 rounded-md"
          role="alert"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Reaction Failed
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chemical Summary */}
      {selectedChemicals.length > 0 && (
        <div className="text-center max-w-md">
          <p className="text-xs text-gray-500 mb-2">Selected chemicals:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedChemicals.map((selected, index) => (
              <span
                key={`${selected.chemical.id}-${index}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {selected.chemical.molecular_formula}
                {selected.quantity > 1 && (
                  <span className="ml-1 text-primary-600">
                    ×{selected.quantity}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
