import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { useLabStore } from '@/store/lab.store';
import type { SelectedChemical as SelectedChemicalType } from '@/types/chemical.types';

export interface SelectedChemicalProps {
  selectedChemical: SelectedChemicalType;
  className?: string;
}

export const SelectedChemical: React.FC<SelectedChemicalProps> = ({
  selectedChemical,
  className,
}) => {
  const { updateChemicalQuantity, removeChemical } = useLabStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(selectedChemical.quantity.toString());

  const { chemical, quantity } = selectedChemical;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 999) {
      updateChemicalQuantity(chemical.id, newQuantity);
    }
  };

  const handleQuantityInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTempQuantity(value);
  };

  const handleQuantitySubmit = () => {
    const numValue = parseFloat(tempQuantity);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 999) {
      updateChemicalQuantity(chemical.id, numValue);
      setIsEditing(false);
    } else {
      // Reset to current quantity if invalid
      setTempQuantity(quantity.toString());
      setIsEditing(false);
    }
  };

  const handleQuantityKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleQuantitySubmit();
    } else if (event.key === 'Escape') {
      setTempQuantity(quantity.toString());
      setIsEditing(false);
    }
  };

  const handleRemove = () => {
    removeChemical(chemical.id);
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
        'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
        'transition-all duration-200 hover:shadow-md hover:border-gray-300',
        className
      )}
    >
      {/* Header with Remove Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
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
        
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
          aria-label={`Remove ${chemical.common_name} from lab bench`}
          title="Remove from lab bench"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
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
      <div className="mb-4">
        <div className="text-xs text-gray-500">
          Density: {chemical.density} g/cm³
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          
          <div className="flex items-center space-x-2">
            {/* Decrease Button */}
            <button
              onClick={() => handleQuantityChange(quantity - 0.1)}
              disabled={quantity <= 0.1}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                'transition-colors duration-200',
                quantity <= 0.1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
              aria-label="Decrease quantity"
            >
              −
            </button>

            {/* Quantity Display/Input */}
            {isEditing ? (
              <input
                type="number"
                value={tempQuantity}
                onChange={handleQuantityInputChange}
                onBlur={handleQuantitySubmit}
                onKeyDown={handleQuantityKeyDown}
                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0.1"
                max="999"
                step="0.1"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setTempQuantity(quantity.toString());
                }}
                className="w-16 px-2 py-1 text-sm text-center bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors duration-200"
                aria-label="Edit quantity"
              >
                {quantity}
              </button>
            )}

            {/* Increase Button */}
            <button
              onClick={() => handleQuantityChange(quantity + 0.1)}
              disabled={quantity >= 999}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                'transition-colors duration-200',
                quantity >= 999
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Unit Label */}
        <div className="text-xs text-gray-500 text-right mt-1">
          grams
        </div>
      </div>

      {/* Quick Quantity Buttons */}
      <div className="flex space-x-1 mt-3">
        {[1, 5, 10].map((quickQuantity) => (
          <button
            key={quickQuantity}
            onClick={() => handleQuantityChange(quickQuantity)}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded transition-colors duration-200',
              quantity === quickQuantity
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {quickQuantity}g
          </button>
        ))}
      </div>
    </div>
  );
};