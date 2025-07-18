// Award-related type definitions

export type AwardCategory =
  | 'discovery'
  | 'database_contribution'
  | 'community'
  | 'special'
  | 'achievement';

export interface AwardTemplate {
  id: number;
  name: string;
  description: string;
  category: AwardCategory;
  metadata: Record<string, any>;
}

export interface UserAward {
  id: number;
  user_id: number;
  template_id: number;
  tier: number;
  progress: Record<string, any>;
  granted_at: string;
  related_entity_type?: string | null;
  related_entity_id?: number | null;
  template: AwardTemplate;
}

export interface AvailableAward {
  template_id: number;
  name: string;
  description: string;
  category: AwardCategory;
  metadata: Record<string, any>;
  progress: Record<string, any>;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  award_count: number;
  total_points: number;
}

export interface UserRank {
  rank: number | null;
  user_id: number;
  username: string;
  award_count: number;
  total_points: number;
  category?: string | null;
}

export interface AwardParams {
  category?: AwardCategory;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}
