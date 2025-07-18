import React from 'react';
import { cn } from '@/utils/cn';
import type { Chemical } from '@/types/chemical.types';

export interface ChemicalCardProps {
  chemical: Chemical;
  onSelect?: (chemical: Chemical) => void;
  onViewDetails?: (chemical: Chemical) => void;
  isDraggable?: boolean;
  className?: string;
}

export const ChemicalCard: React.FC<ChemicalCardProps> = ({
  chemical,
  onSelect,
  onViewDetails,
  isDraggable = true,
  className,
}) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggable) {
      event.preventDefault();
      return;
    }
    
    // Store chemical data for drop handling
    event.dataTransfer.setData('application/json', JSON.stringify(chemical));
    event.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    event.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    // Reset visual feedback
    event.currentTarget.style.opacity = '1';
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(chemical);
    }
  };

  const handleDetailsClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onViewDetails) {
      onViewDetails(chemical);
    }
  };

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'solid':
        return 'bg-gray-100 text-gray-800';
      case 'liquid':
        return 'bg-blue-100 text-blue-800';
      case 'gas':
        return 'bg-green-100 text-green-800';
      case 'plasma':
        return 'bg-purple-100 text-purple-800';
      case 'aqueous':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        isDraggable && 'cursor-grab active:cursor-grabbing',
        !isDraggable && onSelect && 'cursor-pointer',
        className
      )}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
          e.preventDefault();
          onSelect(chemical);
        }
      }}
      aria-label={`Chemical: ${chemical.common_name} (${chemical.molecular_formula})`}
    >
      {/* Chemical Color Indicator */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
          style={{ backgroundColor: chemical.color }}
          aria-label={`Color: ${chemical.color}`}
        />
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            getStateColor(chemical.state_of_matter)
          )}
        >
          {chemical.state_of_matter}
        </span>
      </div>

      {/* Chemical Names */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          {chemical.common_name}
        </h3>
        <p className="text-gray-600 text-sm font-mono">
          {chemical.molecular_formula}
        </p>
      </div>

      {/* Properties */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">
          Density: {chemical.density} g/cm³
        </div>
        {chemical.properties && Object.keys(chemical.properties).length > 0 && (
          <div className="text-xs text-gray-500">
            {Object.keys(chemical.properties).length} properties
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        {isDraggable && (
          <div className="flex items-center text-xs text-gray-400">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            Drag to lab
          </div>
        )}
        
        {onViewDetails && (
          <button
            onClick={handleDetailsClick}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            aria-label={`View details for ${chemical.common_name}`}
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
};