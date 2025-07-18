// Store interface definitions for state management

import type { User } from './api.types';
import type { Chemical, SelectedChemical } from './chemical.types';
import type { Environment, ReactionPrediction, UserReactionStats } from './reaction.types';
import type { UserAward, AvailableAward, LeaderboardEntry, UserRank, AwardCategory } from './award.types';

// Authentication Store Interface
export interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

// Lab Store Interface
export interface LabStore {
  // State
  selectedChemicals: SelectedChemical[];
  environment: Environment;
  reactionResult: ReactionPrediction | null;
  isReacting: boolean;
  error: string | null;

  // Actions
  addChemical: (chemical: Chemical, quantity: number) => void;
  removeChemical: (chemicalId: number) => void;
  updateChemicalQuantity: (chemicalId: number, quantity: number) => void;
  setEnvironment: (environment: Environment) => void;
  triggerReaction: () => Promise<void>;
  clearLab: () => void;
  clearError: () => void;
}

// Chemical Store Interface
export interface ChemicalStore {
  // State
  chemicals: Chemical[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };

  // Actions
  fetchChemicals: (params?: { skip?: number; limit?: number }) => Promise<void>;
  searchChemicals: (query: string) => void;
  createChemical: (data: { molecular_formula: string; common_name?: string }) => Promise<Chemical>;
  clearError: () => void;
  resetPagination: () => void;
}

// Dashboard Store Interface
export interface DashboardStore {
  // State
  awards: UserAward[];
  availableAwards: AvailableAward[];
  leaderboard: LeaderboardEntry[];
  userRank: UserRank | null;
  reactionStats: UserReactionStats | null;
  reactionHistory: ReactionPrediction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAwards: (params?: { category?: AwardCategory; skip?: number; limit?: number }) => Promise<void>;
  fetchAvailableAwards: (category?: AwardCategory) => Promise<void>;
  fetchLeaderboard: (category?: AwardCategory, limit?: number) => Promise<void>;
  fetchUserRank: (category?: AwardCategory) => Promise<void>;
  fetchReactionStats: () => Promise<void>;
  fetchReactionHistory: () => Promise<void>;
  clearError: () => void;
}

// Effects Store Interface (for Visual Effects Engine)
export interface EffectsStore {
  // State
  activeEffects: Array<{
    id: string;
    effect: any; // Will be typed as VisualEffect from reaction.types
    startTime: number;
    duration?: number;
  }>;
  isReducedMotion: boolean;

  // Actions
  addEffect: (effect: any, duration?: number) => string;
  removeEffect: (effectId: string) => void;
  clearAllEffects: () => void;
  setReducedMotion: (enabled: boolean) => void;
}

// Global App Store Interface
export interface AppStore {
  // State
  isInitialized: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
    duration?: number;
  }>;

  // Actions
  initialize: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<AppStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}