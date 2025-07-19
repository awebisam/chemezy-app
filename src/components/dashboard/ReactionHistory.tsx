import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboard.store';
import { useLabStore } from '@/store/lab.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { ReactionHistoryItem, Environment } from '@/types/reaction.types';
import type { Chemical } from '@/types/chemical.types';

interface ReactionHistoryProps {
  className?: string;
}

export const ReactionHistory: React.FC<ReactionHistoryProps> = ({
  className = '',
}) => {
  const {
    reactionHistory,
    isLoading,
    error,
    fetchReactionHistory,
    clearError,
  } = useDashboardStore();

  const { setEnvironment, addChemical, clearLab } = useLabStore();

  const [selectedReaction, setSelectedReaction] =
    useState<ReactionHistoryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterByWorldFirst, setFilterByWorldFirst] = useState(false);

  useEffect(() => {
    fetchReactionHistory();
  }, [fetchReactionHistory]);

  // Transform reaction history to include additional metadata
  const transformedHistory: ReactionHistoryItem[] = reactionHistory.map(
    (reaction, index) => ({
      ...reaction,
      id: `reaction-${index}-${Date.now()}`,
      timestamp: new Date(Date.now() - index * 60000).toISOString(), // Mock timestamps for now
      reactants_used: [
        // Mock reactants data - in real implementation this would come from API
        {
          chemical_id: 1,
          molecular_formula: 'H2O',
          common_name: 'Water',
          quantity: 1,
        },
      ],
      environment_used: 'Earth (Normal)',
    })
  );

  const filteredHistory = transformedHistory
    .filter(reaction => !filterByWorldFirst || reaction.is_world_first)
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleViewDetails = (reaction: ReactionHistoryItem) => {
    setSelectedReaction(reaction);
    setIsDetailModalOpen(true);
  };

  const handleRecreateReaction = (reaction: ReactionHistoryItem) => {
    // Clear current lab setup
    clearLab();

    // Set environment
    setEnvironment(reaction.environment_used as Environment);

    // Add chemicals (this would need chemical data from the API)
    reaction.reactants_used.forEach(reactant => {
      // In real implementation, we'd need to fetch chemical details from the chemical service
      const mockChemical: Chemical = {
        id: reactant.chemical_id,
        molecular_formula: reactant.molecular_formula,
        common_name: reactant.common_name,
        state_of_matter: 'liquid',
        color: 'clear',
        density: 1.0,
        properties: {},
      };
      addChemical(mockChemical, reactant.quantity);
    });

    // Close modal and show success message
    setIsDetailModalOpen(false);
    // In real implementation, we'd show a toast notification
    console.log('Reaction recreated successfully');
  };

  const handleExportHistory = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      total_reactions: filteredHistory.length,
      reactions: filteredHistory.map(reaction => ({
        timestamp: reaction.timestamp,
        reactants: reaction.reactants_used,
        environment: reaction.environment_used,
        products: reaction.products,
        is_world_first: reaction.is_world_first,
        explanation: reaction.explanation,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chemezy-reaction-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading && reactionHistory.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading reaction history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reaction History</h2>
          <p className="mt-1 text-gray-600">
            View and recreate your past experiments
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button
            onClick={handleExportHistory}
            variant="secondary"
            size="sm"
            disabled={filteredHistory.length === 0}
          >
            Export History
          </Button>
          <Button
            onClick={() => fetchReactionHistory()}
            variant="secondary"
            size="sm"
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterByWorldFirst}
            onChange={e => setFilterByWorldFirst(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            Show only world-first discoveries
          </span>
        </label>
      </div>

      {/* Reaction List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reactions found
          </h3>
          <p className="text-gray-600">
            {filterByWorldFirst
              ? "You haven't made any world-first discoveries yet."
              : 'Start experimenting to build your reaction history!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map(reaction => (
            <div
              key={reaction.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {reaction.products.map(p => p.common_name).join(' + ')}
                    </h3>
                    {reaction.is_world_first && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🌟 World First
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <p>
                      <strong>Reactants:</strong>{' '}
                      {reaction.reactants_used
                        .map(r => `${r.common_name} (${r.quantity})`)
                        .join(' + ')}
                    </p>
                    <p>
                      <strong>Environment:</strong> {reaction.environment_used}
                    </p>
                    <p>
                      <strong>Date:</strong>{' '}
                      {formatTimestamp(reaction.timestamp)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2">
                    {reaction.explanation}
                  </p>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Button
                    onClick={() => handleViewDetails(reaction)}
                    variant="secondary"
                    size="sm"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleRecreateReaction(reaction)}
                    variant="primary"
                    size="sm"
                  >
                    Recreate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reaction Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Reaction Details"
        size="lg"
      >
        {selectedReaction && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedReaction.products.map(p => p.common_name).join(' + ')}
              </h3>
              {selectedReaction.is_world_first && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  🌟 World First Discovery
                </span>
              )}
            </div>

            {/* Reaction Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reactants</h4>
                <ul className="space-y-1">
                  {selectedReaction.reactants_used.map((reactant, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {reactant.common_name} ({reactant.molecular_formula}) -{' '}
                      {reactant.quantity} units
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Products</h4>
                <ul className="space-y-1">
                  {selectedReaction.products.map((product, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {product.common_name} ({product.molecular_formula}) -{' '}
                      {product.quantity} units
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Environment and Timestamp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Environment</h4>
                <p className="text-sm text-gray-600">
                  {selectedReaction.environment_used}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Date & Time</h4>
                <p className="text-sm text-gray-600">
                  {formatTimestamp(selectedReaction.timestamp)}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedReaction.explanation}
              </p>
            </div>

            {/* Visual Effects */}
            {selectedReaction.effects.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Visual Effects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReaction.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {effect.effect_type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => setIsDetailModalOpen(false)}
                variant="secondary"
              >
                Close
              </Button>
              <Button
                onClick={() => handleRecreateReaction(selectedReaction)}
                variant="primary"
              >
                Recreate This Reaction
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
