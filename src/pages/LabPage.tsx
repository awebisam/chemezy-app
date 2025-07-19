import React, { useState } from 'react';
import {
  ChemicalInventory,
  LabBench,
  EnvironmentSelector,
  ReactionTrigger,
  ResultsDisplay,
} from '@/components/lab';
import { useLabStore } from '@/store/lab.store';

export const LabPage: React.FC = () => {
  const { selectedChemicals, clearLab, addChemical, reactionResult } =
    useLabStore();
  const [showInventory, setShowInventory] = useState(true);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Virtual Chemistry Lab
              </h1>
              <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                Drag chemicals from the inventory to the lab bench to start
                experimenting
              </p>
              <p className="text-sm text-gray-600 mt-1 sm:hidden">
                Tap + Add on chemicals to experiment
              </p>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap"
              >
                <span className="sm:hidden">
                  {showInventory ? 'Hide' : 'Show'}
                </span>
                <span className="hidden sm:inline">
                  {showInventory ? 'Hide' : 'Show'} Inventory
                </span>
              </button>

              {selectedChemicals.length > 0 && (
                <button
                  onClick={clearLab}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors duration-200 whitespace-nowrap"
                >
                  Clear Lab
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-first layout: Stack on small screens, side-by-side on large */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Chemical Inventory - Full width on mobile, sidebar on desktop */}
          {showInventory && (
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit lg:sticky lg:top-24">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Chemical Inventory
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                    Drag chemicals to the lab bench or use the + Add button on
                    touch devices
                  </p>
                  <p className="text-sm text-gray-600 mt-1 sm:hidden">
                    Tap + Add to use chemicals
                  </p>
                </div>
                <div className="p-4 max-h-96 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
                  <ChemicalInventory
                    showAddButton={true}
                    onAddToLab={chemical => addChemical(chemical, 1)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lab Bench Area */}
          <div className={`${showInventory ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}`}>
            <div className="space-y-6">
              {/* Environment Selection */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <EnvironmentSelector />
              </div>

              {/* Lab Bench */}
              <LabBench />

              {/* Reaction Trigger */}
              {selectedChemicals.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <ReactionTrigger />
                </div>
              )}

              {/* Reaction Results */}
              {reactionResult && (
                <div>
                  <ResultsDisplay />
                </div>
              )}

              {/* Instructions - Collapsible on mobile */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <details className="sm:open">
                  <summary className="text-sm font-medium text-blue-900 mb-2 cursor-pointer sm:cursor-default">
                    How to use the lab:
                  </summary>
                  <ul className="text-sm text-blue-800 space-y-1 mt-2">
                    <li className="hidden sm:block">
                      • <strong>Desktop:</strong> Drag chemicals from the inventory
                      to the lab bench
                    </li>
                    <li>
                      • <strong>Mobile/Touch:</strong> Tap the "+ Add" button on
                      chemical cards
                    </li>
                    <li>
                      • <strong>Adjust quantities:</strong> Use the +/- buttons or
                      tap the quantity to edit
                    </li>
                    <li>
                      • <strong>Remove chemicals:</strong> Tap the × button on any
                      chemical in the lab bench
                    </li>
                    <li>
                      • <strong>Quick quantities:</strong> Use the 1g, 5g, 10g
                      buttons for common amounts
                    </li>
                  </ul>
                </details>
              </div>

              {/* Lab Status */}
              {selectedChemicals.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-900 mb-2">
                    Lab Status:
                  </h3>
                  <div className="text-sm text-green-800">
                    <p className="mb-1">
                      {selectedChemicals.length} chemical
                      {selectedChemicals.length !== 1 ? 's' : ''} ready
                    </p>
                    <p>
                      Total mass:{' '}
                      {selectedChemicals
                        .reduce((sum, selected) => sum + selected.quantity, 0)
                        .toFixed(1)}
                      g
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
