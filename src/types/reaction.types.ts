// Reaction-related type definitions

export type Environment = 
  | 'Earth (Normal)'
  | 'Vacuum'
  | 'Pure Oxygen'
  | 'Inert Gas'
  | 'Acidic Environment'
  | 'Basic Environment';

export interface ReactantInput {
  chemical_id: number;
  quantity: number;
}

export interface ProductOutput {
  chemical_id?: number | null;
  molecular_formula: string;
  common_name: string;
  quantity: number;
  is_soluble: boolean;
}

export interface ReactionRequest {
  reactants: ReactantInput[];
  environment?: Environment;
  catalyst_id?: number | null;
}

// Visual Effects Types
export interface GasProductionEffect {
  effect_type: 'gas_production';
  gas_type: string;
  color: string;
  intensity: number; // 0.0 to 1.0
  duration: number; // seconds
}

export interface LightEmissionEffect {
  effect_type: 'light_emission';
  color: string;
  intensity: number; // 0.0 to 1.0
  radius: number; // meters
  duration: number; // seconds
}

export interface TemperatureChangeEffect {
  effect_type: 'temperature_change';
  delta_celsius: number;
}

export interface FoamProductionEffect {
  effect_type: 'foam_production';
  color: string;
  density: number;
  bubble_size: 'small' | 'medium' | 'large';
  stability: number; // seconds
}

export interface StateChangeEffect {
  effect_type: 'state_change';
  product_chemical_id: number;
  final_state: string;
}

export interface VolumeChangeEffect {
  effect_type: 'volume_change';
  factor: number; // e.g., 1.5 for 50% expansion
}

export interface SpillEffect {
  effect_type: 'spill';
  amount_percentage: number; // 0.0 to 1.0
  spread_radius: number; // meters
}

export interface TextureChangeEffect {
  effect_type: 'texture_change';
  product_chemical_id: number;
  texture_type: string;
  color: string;
  viscosity: number; // 0.0 to 1.0
}

export type VisualEffect = 
  | GasProductionEffect
  | LightEmissionEffect
  | TemperatureChangeEffect
  | FoamProductionEffect
  | StateChangeEffect
  | VolumeChangeEffect
  | SpillEffect
  | TextureChangeEffect;

export interface ReactionPrediction {
  products: ProductOutput[];
  effects: VisualEffect[];
  explanation: string;
  is_world_first: boolean;
  state_of_product?: string | null;
}

export interface UserReactionStats {
  total_reactions: number;
  total_discoveries: number;
}