import React, { useState } from 'react';
import { ChemicalInventory, LabBench, EnvironmentSelector } from '@/components/lab';
import { useLabStore } from '@/store/lab.store';

export const LabPage: React.FC = () => {
  const { selectedChemicals, clearLab, addChemical } = useLabStore();
  const [showInventory, setShowInventory] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Virtual Chemistry Lab</h1>
              <p className="text-sm text-gray-600 mt-1">
                Drag chemicals from the inventory to the lab bench to start experimenting
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                {showInventory ? 'Hide' : 'Show'} Inventory
              </button>
              
              {selectedChemicals.length > 0 && (
                <button
                  onClick={clearLab}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Clear Lab
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chemical Inventory */}
          {showInventory && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Chemical Inventory</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Drag chemicals to the lab bench or use the + Add button on touch devices
                  </p>
                </div>
                <div className="p-4">
                  <ChemicalInventory 
                    showAddButton={true}
                    onAddToLab={(chemical) => addChemical(chemical, 1)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lab Bench */}
          <div className={showInventory ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {/* Environment Selection */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <EnvironmentSelector />
            </div>
            
            <LabBench />
            
            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">How to use the lab:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Desktop:</strong> Drag chemicals from the inventory to the lab bench</li>
                <li>• <strong>Mobile/Touch:</strong> Tap the "+ Add" button on chemical cards</li>
                <li>• <strong>Adjust quantities:</strong> Use the +/- buttons or click the quantity to edit</li>
                <li>• <strong>Remove chemicals:</strong> Click the × button on any chemical in the lab bench</li>
                <li>• <strong>Quick quantities:</strong> Use the 1g, 5g, 10g buttons for common amounts</li>
              </ul>
            </div>

            {/* Lab Status */}
            {selectedChemicals.length > 0 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">Lab Status:</h3>
                <p className="text-sm text-green-800">
                  You have {selectedChemicals.length} chemical{selectedChemicals.length !== 1 ? 's' : ''} ready for experimentation.
                  Total mass: {selectedChemicals.reduce((sum, selected) => sum + selected.quantity, 0).toFixed(1)}g
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};