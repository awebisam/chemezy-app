import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { chemicalService } from '@/services/chemical.service';
import type { ChemicalStore } from '@/types/store.types';
// Chemical type is used in the store interface

export const useChemicalStore = create<ChemicalStore>()(
  devtools(
    (set, get) => ({
      // State
      chemicals: [],
      searchQuery: '',
      isLoading: false,
      error: null,
      pagination: {
        skip: 0,
        limit: 20,
        total: 0,
      },

      // Actions
      fetchChemicals: async (params = {}) => {
        set({ isLoading: true, error: null });

        try {
          const { skip = 0, limit = 20 } = params;
          const { searchQuery } = get();

          const searchParams = {
            skip,
            limit,
            ...(searchQuery && { search: searchQuery }),
          };

          const response = await chemicalService.getChemicals(searchParams);

          set({
            chemicals:
              skip === 0
                ? response.results
                : [...get().chemicals, ...response.results],
            pagination: {
              skip,
              limit,
              total: response.count,
            },
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch chemicals',
          });
          throw error;
        }
      },

      searchChemicals: (query: string) => {
        set({
          searchQuery: query,
          chemicals: [], // Clear existing chemicals for new search
          pagination: { ...get().pagination, skip: 0 },
        });

        // Fetch chemicals with new search query
        get().fetchChemicals({ skip: 0, limit: get().pagination.limit });
      },

      createChemical: async data => {
        set({ isLoading: true, error: null });

        try {
          const newChemical = await chemicalService.createChemical(data);

          // Add the new chemical to the beginning of the list
          set({
            chemicals: [newChemical, ...get().chemicals],
            pagination: {
              ...get().pagination,
              total: get().pagination.total + 1,
            },
            isLoading: false,
            error: null,
          });

          return newChemical;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to create chemical',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      resetPagination: () => {
        set({
          pagination: {
            skip: 0,
            limit: 20,
            total: 0,
          },
          chemicals: [],
        });
      },

      // Helper methods for pagination
      loadMore: async () => {
        const { pagination, isLoading } = get();

        if (
          isLoading ||
          pagination.skip + pagination.limit >= pagination.total
        ) {
          return; // Already loading or no more data
        }

        const nextSkip = pagination.skip + pagination.limit;
        await get().fetchChemicals({
          skip: nextSkip,
          limit: pagination.limit,
        });
      },

      hasMore: () => {
        const { pagination } = get();
        return pagination.skip + pagination.limit < pagination.total;
      },

      // Get filtered chemicals based on current search
      getFilteredChemicals: () => {
        const { chemicals, searchQuery } = get();

        if (!searchQuery.trim()) {
          return chemicals;
        }

        const query = searchQuery.toLowerCase();
        return chemicals.filter(
          chemical =>
            chemical.molecular_formula.toLowerCase().includes(query) ||
            chemical.common_name.toLowerCase().includes(query)
        );
      },
    }),
    {
      name: 'chemical-store',
    }
  )
);
