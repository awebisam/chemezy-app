import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLabStore } from '../lab.store';
import { reactionService } from '@/services/reaction.service';
import type { Chemical } from '@/types/chemical.types';

// Mock the reaction service
vi.mock('@/services/reaction.service', () => ({
  reactionService: {
    predictReaction: vi.fn(),
  },
}));

describe('LabStore', () => {
  const mockChemical: Chemical = {
    id: 1,
    molecular_formula: 'H2O',
    common_name: 'Water',
    state_of_matter: 'liquid',
    color: 'colorless',
    density: 1.0,
    properties: {},
  };

  beforeEach(() => {
    // Reset store state before each test
    useLabStore.setState({
      selectedChemicals: [],
      environment: 'Earth (Normal)',
      reactionResult: null,
      isReacting: false,
      error: null,
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useLabStore.getState();
    
    expect(state.selectedChemicals).toEqual([]);
    expect(state.environment).toBe('Earth (Normal)');
    expect(state.reactionResult).toBeNull();
    expect(state.isReacting).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should add chemical to lab bench', () => {
    const { addChemical } = useLabStore.getState();
    
    addChemical(mockChemical, 2);
    
    const state = useLabStore.getState();
    expect(state.selectedChemicals).toHaveLength(1);
    expect(state.selectedChemicals[0]).toEqual({
      chemical: mockChemical,
      quantity: 2,
    });
  });

  it('should update quantity when adding existing chemical', () => {
    const { addChemical } = useLabStore.getState();
    
    // Add chemical first time
    addChemical(mockChemical, 2);
    // Add same chemical again
    addChemical(mockChemical, 3);
    
    const state = useLabStore.getState();
    expect(state.selectedChemicals).toHaveLength(1);
    expect(state.selectedChemicals[0].quantity).toBe(5);
  });

  it('should remove chemical from lab bench', () => {
    const { addChemical, removeChemical } = useLabStore.getState();
    
    addChemical(mockChemical, 2);
    removeChemical(mockChemical.id);
    
    const state = useLabStore.getState();
    expect(state.selectedChemicals).toHaveLength(0);
  });

  it('should update chemical quantity', () => {
    const { addChemical, updateChemicalQuantity } = useLabStore.getState();
    
    addChemical(mockChemical, 2);
    updateChemicalQuantity(mockChemical.id, 5);
    
    const state = useLabStore.getState();
    expect(state.selectedChemicals[0].quantity).toBe(5);
  });

  it('should remove chemical when quantity is set to 0', () => {
    const { addChemical, updateChemicalQuantity } = useLabStore.getState();
    
    addChemical(mockChemical, 2);
    updateChemicalQuantity(mockChemical.id, 0);
    
    const state = useLabStore.getState();
    expect(state.selectedChemicals).toHaveLength(0);
  });

  it('should set environment', () => {
    const { setEnvironment } = useLabStore.getState();
    
    setEnvironment('Vacuum');
    
    const state = useLabStore.getState();
    expect(state.environment).toBe('Vacuum');
  });

  it('should trigger reaction successfully', async () => {
    const mockReactionResult = {
      products: [],
      effects: [],
      explanation: 'Test reaction',
      is_world_first: false,
    };
    
    vi.mocked(reactionService.predictReaction).mockResolvedValue(mockReactionResult);
    
    const { addChemical, triggerReaction } = useLabStore.getState();
    
    addChemical(mockChemical, 2);
    await triggerReaction();
    
    const state = useLabStore.getState();
    expect(state.reactionResult).toEqual(mockReactionResult);
    expect(state.isReacting).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle reaction failure', async () => {
    const mockError = new Error('Reaction failed');
    vi.mocked(reactionService.predictReaction).mockRejectedValue(mockError);
    
    const { addChemical, triggerReaction } = useLabStore.getState();
    
    addChemical(mockChemical, 2);
    
    await expect(triggerReaction()).rejects.toThrow('Reaction failed');
    
    const state = useLabStore.getState();
    expect(state.reactionResult).toBeNull();
    expect(state.isReacting).toBe(false);
    expect(state.error).toBe('Reaction failed');
  });

  it('should not trigger reaction without chemicals', async () => {
    const { triggerReaction } = useLabStore.getState();
    
    await triggerReaction();
    
    const state = useLabStore.getState();
    expect(state.error).toBe('Please add at least one chemical to react');
    expect(reactionService.predictReaction).not.toHaveBeenCalled();
  });

  it('should clear lab', () => {
    const { addChemical, clearLab } = useLabStore.getState();
    
    addChemical(mockChemical, 2);
    useLabStore.setState({ 
      reactionResult: { products: [], effects: [], explanation: 'test', is_world_first: false },
      error: 'test error' 
    });
    
    clearLab();
    
    const state = useLabStore.getState();
    expect(state.selectedChemicals).toEqual([]);
    expect(state.reactionResult).toBeNull();
    expect(state.error).toBeNull();
  });
});