import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { reactionService } from '@/services/reaction.service';
import type { LabStore } from '@/types/store.types';
import type { Chemical, SelectedChemical } from '@/types/chemical.types';
import type { Environment } from '@/types/reaction.types';
// ReactionPrediction is used in the store interface

export const useLabStore = create<LabStore>()(
  devtools(
    (set, get) => ({
      // State
      selectedChemicals: [],
      environment: 'Earth (Normal)',
      reactionResult: null,
      isReacting: false,
      error: null,

      // Actions
      addChemical: (chemical: Chemical, quantity: number) => {
        const { selectedChemicals } = get();

        // Check if chemical is already selected
        const existingIndex = selectedChemicals.findIndex(
          selected => selected.chemical.id === chemical.id
        );

        if (existingIndex >= 0) {
          // Update quantity of existing chemical
          const updated = [...selectedChemicals];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          set({ selectedChemicals: updated });
        } else {
          // Add new chemical
          const newSelected: SelectedChemical = { chemical, quantity };
          set({
            selectedChemicals: [...selectedChemicals, newSelected],
          });
        }

        // Clear any previous error
        set({ error: null });
      },

      removeChemical: (chemicalId: number) => {
        const { selectedChemicals } = get();
        const filtered = selectedChemicals.filter(
          selected => selected.chemical.id !== chemicalId
        );
        set({ selectedChemicals: filtered });
      },

      updateChemicalQuantity: (chemicalId: number, quantity: number) => {
        const { selectedChemicals } = get();

        if (quantity <= 0) {
          // Remove chemical if quantity is 0 or negative
          get().removeChemical(chemicalId);
          return;
        }

        const updated = selectedChemicals.map(selected =>
          selected.chemical.id === chemicalId
            ? { ...selected, quantity }
            : selected
        );
        set({ selectedChemicals: updated });
      },

      setEnvironment: (environment: Environment) => {
        set({ environment, error: null });
      },

      triggerReaction: async () => {
        const { selectedChemicals, environment } = get();

        if (selectedChemicals.length === 0) {
          set({ error: 'Please add at least one chemical to react' });
          return;
        }

        set({ isReacting: true, error: null });

        try {
          const reactionRequest = {
            reactants: selectedChemicals.map(selected => ({
              chemical_id: selected.chemical.id,
              quantity: selected.quantity,
            })),
            environment,
          };

          const result = await reactionService.predictReaction(reactionRequest);

          set({
            reactionResult: result,
            isReacting: false,
            error: null,
          });
        } catch (error: any) {
          set({
            reactionResult: null,
            isReacting: false,
            error: error.message || 'Failed to predict reaction',
          });
          throw error;
        }
      },

      clearLab: () => {
        set({
          selectedChemicals: [],
          reactionResult: null,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'lab-store',
    }
  )
);
