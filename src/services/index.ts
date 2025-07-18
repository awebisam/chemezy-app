// Export all services for easy importing
export { apiClient } from './api';
export { authService, AuthService } from './auth.service';
export { chemicalService, ChemicalService } from './chemical.service';
export { reactionService, ReactionService } from './reaction.service';
export { awardsService, AwardsService } from './awards.service';

// Re-export types for convenience
export type { APIError, APIResponse } from '@/types/api.types';
