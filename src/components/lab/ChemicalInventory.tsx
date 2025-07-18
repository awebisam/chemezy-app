import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChemicalCard } from './ChemicalCard';
import { ChemicalDetailModal } from './ChemicalDetailModal';
import { useChemicalStore } from '@/store/chemical.store';
import type { Chemical } from '@/types/chemical.types';
import { cn } from '@/utils/cn';

export interface ChemicalInventoryProps {
  onChemicalSelect?: (chemical: Chemical) => void;
  onAddToLab?: (chemical: Chemical) => void;
  className?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  showAddButton?: boolean;
  pageSize?: number;
}

export const ChemicalInventory: React.FC<ChemicalInventoryProps> = ({
  onChemicalSelect,
  onAddToLab,
  className,
  showSearch = true,
  showPagination = true,
  showAddButton = false,
  pageSize = 20,
}) => {
  const {
    chemicals,
    searchQuery,
    isLoading,
    error,
    pagination,
    fetchChemicals,
    searchChemicals,
    clearError,
    loadMore,
    hasMore,
  } = useChemicalStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    if (chemicals.length === 0 && !isLoading) {
      fetchChemicals({ skip: 0, limit: pageSize });
    }
  }, [fetchChemicals, chemicals.length, isLoading, pageSize]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        searchChemicals(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, searchChemicals]);

  // Filter chemicals based on search query (client-side filtering as backup)
  const filteredChemicals = useMemo(() => {
    if (!localSearchQuery.trim()) {
      return chemicals;
    }

    const query = localSearchQuery.toLowerCase();
    return chemicals.filter(
      chemical =>
        chemical.molecular_formula.toLowerCase().includes(query) ||
        chemical.common_name.toLowerCase().includes(query)
    );
  }, [chemicals, localSearchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(event.target.value);
  };

  const handleChemicalSelect = (chemical: Chemical) => {
    if (onChemicalSelect) {
      onChemicalSelect(chemical);
    }
  };

  const handleAddToLab = (chemical: Chemical) => {
    if (onAddToLab) {
      onAddToLab(chemical);
    }
  };

  const handleViewDetails = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedChemical(null);
  };

  const handleLoadMore = async () => {
    if (!isLoading && hasMore()) {
      await loadMore();
    }
  };

  const handleRetry = () => {
    clearError();
    fetchChemicals({ skip: 0, limit: pageSize });
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Chemical Inventory
        </h2>

        {showSearch && (
          <Input
            type="text"
            placeholder="Search by formula or name..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            className="w-full"
          />
        )}

        {/* Results count */}
        <div className="mt-2 text-sm text-gray-600">
          {isLoading ? (
            'Loading chemicals...'
          ) : (
            <>
              {filteredChemicals.length} of {pagination.total} chemicals
              {localSearchQuery && ` matching "${localSearchQuery}"`}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <svg
              className="w-12 h-12 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load chemicals
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRetry} variant="primary">
              Try Again
            </Button>
          </div>
        ) : filteredChemicals.length === 0 && !isLoading ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {localSearchQuery
                ? 'No chemicals found'
                : 'No chemicals available'}
            </h3>
            <p className="text-gray-600">
              {localSearchQuery
                ? `No chemicals match "${localSearchQuery}". Try a different search term.`
                : 'There are no chemicals in the inventory yet.'}
            </p>
          </div>
        ) : (
          /* Chemical Grid */
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredChemicals.map(chemical => (
                <ChemicalCard
                  key={chemical.id}
                  chemical={chemical}
                  onSelect={handleChemicalSelect}
                  onViewDetails={handleViewDetails}
                  onAddToLab={handleAddToLab}
                  isDraggable={true}
                  showAddButton={showAddButton}
                />
              ))}
            </div>

            {/* Loading indicator for initial load */}
            {isLoading && chemicals.length === 0 && (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Load More Button */}
            {showPagination && hasMore() && !isLoading && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleLoadMore}
                  variant="secondary"
                  isLoading={isLoading}
                  loadingText="Loading more..."
                >
                  Load More Chemicals
                </Button>
              </div>
            )}

            {/* Loading indicator for load more */}
            {isLoading && chemicals.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <LoadingSpinner size="md" />
                <span className="ml-2 text-gray-600">
                  Loading more chemicals...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chemical Detail Modal */}
      <ChemicalDetailModal
        chemical={selectedChemical}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};
