import React from 'react';
import { ChemicalInventory } from '@/components/lab';
import type { Chemical } from '@/types/chemical.types';

export const ChemicalInventoryDemo: React.FC = () => {
  const handleChemicalSelect = (chemical: Chemical) => {
    console.log('Selected chemical:', chemical);
    // In a real app, this would add the chemical to the lab bench
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg h-[800px]">
          <ChemicalInventory
            onChemicalSelect={handleChemicalSelect}
            showSearch={true}
            showPagination={true}
            pageSize={20}
          />
        </div>
      </div>
    </div>
  );
};