import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { useLabStore } from '@/store/lab.store';
import { SelectedChemical } from './SelectedChemical';
import type { Chemical } from '@/types/chemical.types';

export interface LabBenchProps {
  className?: string;
}

export const LabBench: React.FC<LabBenchProps> = ({ className }) => {
  const { selectedChemicals, addChemical } = useLabStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
    setDragError(null);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    // Only set dragOver to false if we're leaving the drop zone entirely
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
      setDragError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    setDragError(null);

    try {
      const chemicalData = event.dataTransfer.getData('application/json');
      if (!chemicalData) {
        setDragError('Invalid chemical data');
        return;
      }

      const chemical: Chemical = JSON.parse(chemicalData);
      
      // Add chemical with default quantity of 1
      addChemical(chemical, 1);
      
      // Show success feedback briefly
      setTimeout(() => setDragError(null), 3000);
    } catch (error) {
      console.error('Error parsing dropped chemical:', error);
      setDragError('Failed to add chemical to lab bench');
      setTimeout(() => setDragError(null), 3000);
    }
  };

  const handleTouchDrop = (chemical: Chemical) => {
    addChemical(chemical, 1);
  };

  // Touch support for mobile devices
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    // Prevent default to enable custom touch handling
    event.preventDefault();
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    // Get touch position
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Check if we're over the drop zone
    if (element && event.currentTarget.contains(element)) {
      setIsDragOver(true);
    } else {
      setIsDragOver(false);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className={cn('bg-white rounded-lg border-2 border-dashed', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Lab Bench
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Drag chemicals here to set up your experiment
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          'min-h-[300px] p-6 transition-all duration-200 relative',
          isDragOver && 'bg-primary-50 border-primary-300',
          !isDragOver && 'border-gray-300'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Lab bench drop zone"
      >
        {/* Drag Feedback */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-50 bg-opacity-90 rounded-lg pointer-events-none">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-primary-600 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-primary-700 font-medium">Drop chemical here</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {dragError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{dragError}</p>
          </div>
        )}

        {/* Selected Chemicals */}
        {selectedChemicals.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Selected Chemicals ({selectedChemicals.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedChemicals.map((selected, index) => (
                <SelectedChemical
                  key={`${selected.chemical.id}-${index}`}
                  selectedChemical={selected}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Empty Lab Bench
            </h3>
            <p className="text-gray-500 max-w-sm">
              Drag chemicals from the inventory to start setting up your experiment.
              You can add multiple chemicals and adjust their quantities.
            </p>
          </div>
        )}
      </div>

      {/* Touch Support Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-600 text-center">
          💡 Tip: On touch devices, tap a chemical in the inventory to add it to the lab bench
        </p>
      </div>
    </div>
  );
};