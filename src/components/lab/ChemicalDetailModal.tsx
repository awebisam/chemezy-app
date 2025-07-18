import React from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Chemical } from '@/types/chemical.types';

export interface ChemicalDetailModalProps {
  chemical: Chemical | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChemicalDetailModal: React.FC<ChemicalDetailModalProps> = ({
  chemical,
  isOpen,
  onClose,
}) => {
  if (!chemical) return null;

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

  const formatPropertyValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chemical Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header with color and state */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: chemical.color }}
              aria-label={`Color: ${chemical.color}`}
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {chemical.common_name}
              </h3>
              <p className="text-gray-600 font-mono text-lg">
                {chemical.molecular_formula}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStateColor(
              chemical.state_of_matter
            )}`}
          >
            {chemical.state_of_matter}
          </span>
        </div>

        {/* Basic Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Basic Properties</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono">{chemical.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Molecular Formula:</span>
                <span className="font-mono">{chemical.molecular_formula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Common Name:</span>
                <span>{chemical.common_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">State of Matter:</span>
                <span className="capitalize">{chemical.state_of_matter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Color:</span>
                <div className="flex items-center space-x-2">
                  <span>{chemical.color}</span>
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: chemical.color }}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Density:</span>
                <span>{chemical.density} g/cm³</span>
              </div>
            </div>
          </div>

          {/* Additional Properties */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Additional Properties
            </h4>
            {chemical.properties && Object.keys(chemical.properties).length > 0 ? (
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {Object.entries(chemical.properties).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0">
                    <div className="font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className="text-gray-600 mt-1 font-mono text-xs break-all">
                      {formatPropertyValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No additional properties available</p>
            )}
          </div>
        </div>

        {/* Safety Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Safety Notice
          </h4>
          <p className="text-yellow-700 text-sm">
            This is a virtual chemistry lab. In real life, always follow proper safety
            protocols when handling chemicals. Consult safety data sheets (SDS) and
            work under appropriate supervision.
          </p>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How to Use</h4>
          <p className="text-blue-700 text-sm">
            Drag this chemical from the inventory to your lab bench to add it to your
            experiment. You can specify the quantity and combine it with other chemicals
            to see what reactions occur.
          </p>
        </div>
      </div>
    </Modal>
  );
};