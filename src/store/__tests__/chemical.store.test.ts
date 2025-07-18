import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChemicalStore } from '../chemical.store';
import { chemicalService } from '@/services/chemical.service';
import type { Chemical, PaginatedChemicals } from '@/types/chemical.types';

// Mock the chemical service
vi.mock('@/services/chemical.service', () => ({
  chemicalService: {
    getChemicals: vi.fn(),
    createChemical: vi.fn(),
  },
}));

describe('ChemicalStore', () => {
  const mockChemicals: Chemical[] = [
    {
      id: 1,
      molecular_formula: 'H2O',
      common_name: 'Water',
      state_of_matter: 'liquid',
      color: 'colorless',
      density: 1.0,
      properties: {},
    },
    {
      id: 2,
      molecular_formula: 'NaCl',
      common_name: 'Salt',
      state_of_matter: 'solid',
      color: 'white',
      density: 2.16,
      properties: {},
    },
  ];

  const mockPaginatedResponse: PaginatedChemicals = {
    count: 2,
    results: mockChemicals,
  };

  beforeEach(() => {
    // Reset store state before each test
    useChemicalStore.setState({
      chemicals: [],
      searchQuery: '',
      isLoading: false,
      error: null,
      pagination: {
        skip: 0,
        limit: 20,
        total: 0,
      },
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useChemicalStore.getState();
    
    expect(state.chemicals).toEqual([]);
    expect(state.searchQuery).toBe('');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.pagination).toEqual({
      skip: 0,
      limit: 20,
      total: 0,
    });
  });

  it('should fetch chemicals successfully', async () => {
    vi.mocked(chemicalService.getChemicals).mockResolvedValue(mockPaginatedResponse);

    const { fetchChemicals } = useChemicalStore.getState();
    
    await fetchChemicals();
    
    const state = useChemicalStore.getState();
    expect(state.chemicals).toEqual(mockChemicals);
    expect(state.pagination.total).toBe(2);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetch chemicals failure', async () => {
    const mockError = new Error('Failed to fetch');
    vi.mocked(chemicalService.getChemicals).mockRejectedValue(mockError);

    const { fetchChemicals } = useChemicalStore.getState();
    
    await expect(fetchChemicals()).rejects.toThrow('Failed to fetch');
    
    const state = useChemicalStore.getState();
    expect(state.chemicals).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Failed to fetch');
  });

  it('should search chemicals', async () => {
    vi.mocked(chemicalService.getChemicals).mockResolvedValue(mockPaginatedResponse);

    const { searchChemicals } = useChemicalStore.getState();
    
    searchChemicals('water');
    
    const state = useChemicalStore.getState();
    expect(state.searchQuery).toBe('water');
    expect(state.chemicals).toEqual([]); // Cleared for new search
    expect(state.pagination.skip).toBe(0);
  });

  it('should create chemical successfully', async () => {
    const newChemical: Chemical = {
      id: 3,
      molecular_formula: 'CO2',
      common_name: 'Carbon Dioxide',
      state_of_matter: 'gas',
      color: 'colorless',
      density: 1.98,
      properties: {},
    };

    vi.mocked(chemicalService.createChemical).mockResolvedValue(newChemical);

    // Set initial state with existing chemicals
    useChemicalStore.setState({ 
      chemicals: mockChemicals,
      pagination: { skip: 0, limit: 20, total: 2 }
    });

    const { createChemical } = useChemicalStore.getState();
    
    const result = await createChemical({
      molecular_formula: 'CO2',
      context: 'test',
    });
    
    expect(result).toEqual(newChemical);
    
    const state = useChemicalStore.getState();
    expect(state.chemicals[0]).toEqual(newChemical); // Added to beginning
    expect(state.pagination.total).toBe(3);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should clear error', () => {
    useChemicalStore.setState({ error: 'Test error' });
    
    const { clearError } = useChemicalStore.getState();
    clearError();
    
    const state = useChemicalStore.getState();
    expect(state.error).toBeNull();
  });

  it('should reset pagination', () => {
    useChemicalStore.setState({
      chemicals: mockChemicals,
      pagination: { skip: 20, limit: 20, total: 100 },
    });
    
    const { resetPagination } = useChemicalStore.getState();
    resetPagination();
    
    const state = useChemicalStore.getState();
    expect(state.chemicals).toEqual([]);
    expect(state.pagination).toEqual({
      skip: 0,
      limit: 20,
      total: 0,
    });
  });

  it('should check if has more data', () => {
    useChemicalStore.setState({
      pagination: { skip: 0, limit: 20, total: 50 },
    });
    
    const { hasMore } = useChemicalStore.getState();
    expect(hasMore()).toBe(true);
    
    useChemicalStore.setState({
      pagination: { skip: 40, limit: 20, total: 50 },
    });
    
    expect(hasMore()).toBe(false);
  });
});