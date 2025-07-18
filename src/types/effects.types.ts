// Enhanced visual effects types for the new architecture
import type { VisualEffect } from './reaction.types';

// Base effect configuration that all effects inherit
export interface BaseEffectConfig {
  id?: string;
  priority?: number; // Higher priority effects render on top
  delay?: number; // Delay before effect starts (in milliseconds)
  duration?: number; // Override effect duration
  loop?: boolean; // Whether effect should loop
  attachmentPoint?: string; // ID of attachment point on vessel
  zIndex?: number; // Rendering order
}

// Enhanced effect types with additional configuration
export interface EnhancedGasProductionEffect extends BaseEffectConfig {
  effect_type: 'gas_production';
  gas_type: string;
  color: string;
  intensity: number; // 0.0 to 1.0
  duration: number; // seconds
  // Enhanced properties
  particle_count?: number;
  dispersion_rate?: number;
  buoyancy?: number;
  turbulence?: number;
  emission_pattern?: 'continuous' | 'burst' | 'pulsed';
}

export interface EnhancedLightEmissionEffect extends BaseEffectConfig {
  effect_type: 'light_emission';
  color: string;
  intensity: number; // 0.0 to 1.0
  radius: number; // meters
  duration: number; // seconds
  // Enhanced properties
  pulse_frequency?: number;
  glow_layers?: number;
  sparkle_count?: number;
  ray_count?: number;
  light_type?: 'steady' | 'pulsing' | 'flickering' | 'strobe';
}

export interface EnhancedTemperatureChangeEffect extends BaseEffectConfig {
  effect_type: 'temperature_change';
  delta_celsius: number;
  // Enhanced properties
  heat_distribution?: 'uniform' | 'gradient' | 'localized';
  thermal_waves?: boolean;
  steam_production?: boolean;
  color_shift?: { from: string; to: string };
}

export interface EnhancedFoamProductionEffect extends BaseEffectConfig {
  effect_type: 'foam_production';
  color: string;
  density: number;
  bubble_size: 'small' | 'medium' | 'large';
  stability: number; // seconds
  // Enhanced properties
  foam_height?: number;
  bubble_velocity?: number;
  surface_tension?: number;
  foam_pattern?: 'uniform' | 'clustered' | 'random';
}

export interface EnhancedStateChangeEffect extends BaseEffectConfig {
  effect_type: 'state_change';
  product_chemical_id: number;
  final_state: string;
  // Enhanced properties
  transition_type?: 'gradual' | 'instant' | 'crystallization' | 'melting';
  nucleation_points?: number;
  crystal_pattern?: 'cubic' | 'hexagonal' | 'amorphous';
  phase_boundary?: boolean;
}

export interface EnhancedVolumeChangeEffect extends BaseEffectConfig {
  effect_type: 'volume_change';
  factor: number; // e.g., 1.5 for 50% expansion
  // Enhanced properties
  expansion_type?: 'uniform' | 'directional' | 'irregular';
  elasticity?: number;
  pressure_waves?: boolean;
  volume_oscillation?: boolean;
}

export interface EnhancedSpillEffect extends BaseEffectConfig {
  effect_type: 'spill';
  amount_percentage: number; // 0.0 to 1.0
  spread_radius: number; // meters
  // Enhanced properties
  liquid_viscosity?: number;
  surface_adhesion?: number;
  flow_pattern?: 'radial' | 'directional' | 'random';
  evaporation_rate?: number;
}

export interface EnhancedTextureChangeEffect extends BaseEffectConfig {
  effect_type: 'texture_change';
  product_chemical_id: number;
  texture_type: string;
  color: string;
  viscosity: number; // 0.0 to 1.0
  // Enhanced properties
  surface_roughness?: number;
  reflectivity?: number;
  pattern_scale?: number;
  texture_evolution?: boolean;
}

// Union type for all enhanced effects
export type EnhancedVisualEffect =
  | EnhancedGasProductionEffect
  | EnhancedLightEmissionEffect
  | EnhancedTemperatureChangeEffect
  | EnhancedFoamProductionEffect
  | EnhancedStateChangeEffect
  | EnhancedVolumeChangeEffect
  | EnhancedSpillEffect
  | EnhancedTextureChangeEffect;

// Effect combination and sequencing
export interface EffectSequence {
  id: string;
  name: string;
  effects: EnhancedVisualEffect[];
  timing: 'parallel' | 'sequential' | 'cascade';
  total_duration: number;
  loop?: boolean;
}

// Effect group for organizing related effects
export interface EffectGroup {
  id: string;
  name: string;
  description: string;
  effects: EnhancedVisualEffect[];
  trigger_conditions?: {
    temperature_range?: { min: number; max: number };
    ph_range?: { min: number; max: number };
    chemical_ids?: number[];
    environment_types?: string[];
  };
}

// Effect performance metrics
export interface EffectPerformanceMetrics {
  render_time: number; // milliseconds
  memory_usage: number; // bytes
  frame_rate: number; // fps
  particle_count: number;
  effect_complexity: 'low' | 'medium' | 'high';
}

// Effect preset configurations
export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  category: 'reaction' | 'heating' | 'cooling' | 'mixing' | 'crystallization';
  effects: EnhancedVisualEffect[];
  preview_image?: string;
  performance_level: 'low' | 'medium' | 'high';
}

// Effect customization options
export interface EffectCustomization {
  color_palette?: string[];
  animation_speed?: number; // 0.1 to 3.0
  particle_density?: number; // 0.1 to 2.0
  quality_level?: 'low' | 'medium' | 'high' | 'ultra';
  enable_sound?: boolean;
  enable_haptic?: boolean;
}

// Effect library for storing and managing effects
export interface EffectLibrary {
  presets: EffectPreset[];
  custom_effects: EnhancedVisualEffect[];
  sequences: EffectSequence[];
  groups: EffectGroup[];
  user_favorites: string[];
  recent_effects: string[];
}

// Effect validation and compatibility
export interface EffectValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  compatibility: {
    browser_support: boolean;
    performance_impact: 'low' | 'medium' | 'high';
    memory_requirements: number;
  };
}

// Effect animation keyframes
export interface EffectKeyframe {
  time: number; // 0-1 (normalized time)
  properties: Record<string, any>;
  easing?:
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'bounce'
    | 'elastic';
}

// Advanced effect configuration
export interface AdvancedEffectConfig {
  keyframes?: EffectKeyframe[];
  physics?: {
    gravity?: number;
    friction?: number;
    elasticity?: number;
    collision_detection?: boolean;
  };
  lighting?: {
    ambient_color?: string;
    directional_light?: {
      direction: { x: number; y: number; z: number };
      intensity: number;
    };
    shadows?: boolean;
  };
  post_processing?: {
    blur?: number;
    glow?: number;
    distortion?: number;
    color_grading?: {
      contrast: number;
      brightness: number;
      saturation: number;
    };
  };
}

// Effect state management
export interface EffectState {
  id: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled' | 'error';
  progress: number; // 0-1
  start_time: number;
  elapsed_time: number;
  remaining_time: number;
  current_frame: number;
  total_frames: number;
  performance_metrics: EffectPerformanceMetrics;
}

// Effect event system
export interface EffectEvent {
  type:
    | 'start'
    | 'progress'
    | 'complete'
    | 'error'
    | 'pause'
    | 'resume'
    | 'cancel';
  effect_id: string;
  timestamp: number;
  data?: any;
}

// Effect callback definitions
export interface EffectCallbacks {
  onStart?: (event: EffectEvent) => void;
  onProgress?: (event: EffectEvent) => void;
  onComplete?: (event: EffectEvent) => void;
  onError?: (event: EffectEvent) => void;
  onPause?: (event: EffectEvent) => void;
  onResume?: (event: EffectEvent) => void;
  onCancel?: (event: EffectEvent) => void;
}

// Convert basic visual effect to enhanced version
export function enhanceVisualEffect(
  basicEffect: VisualEffect,
  config: BaseEffectConfig = {}
): EnhancedVisualEffect {
  const enhanced = {
    ...basicEffect,
    ...config,
  } as EnhancedVisualEffect;

  // Add default enhanced properties based on effect type
  switch (basicEffect.effect_type) {
    case 'gas_production':
      return {
        ...enhanced,
        particle_count: 15,
        dispersion_rate: 1.0,
        buoyancy: 0.8,
        turbulence: 0.3,
        emission_pattern: 'continuous',
      } as EnhancedGasProductionEffect;

    case 'light_emission':
      return {
        ...enhanced,
        pulse_frequency: 2.0,
        glow_layers: 3,
        sparkle_count: 12,
        ray_count: 8,
        light_type: 'pulsing',
      } as EnhancedLightEmissionEffect;

    case 'temperature_change':
      const tempEffect = enhanced as EnhancedTemperatureChangeEffect;
      return {
        ...enhanced,
        heat_distribution: 'uniform',
        thermal_waves: true,
        steam_production: Math.abs(tempEffect.delta_celsius) > 50,
        color_shift:
          tempEffect.delta_celsius > 0
            ? { from: '#ffffff', to: '#ff4444' }
            : { from: '#ffffff', to: '#4444ff' },
      } as EnhancedTemperatureChangeEffect;

    case 'foam_production':
      const foamEffect = enhanced as EnhancedFoamProductionEffect;
      return {
        ...enhanced,
        foam_height: foamEffect.density * 30,
        bubble_velocity: 1.0,
        surface_tension: 0.7,
        foam_pattern: 'uniform',
      } as EnhancedFoamProductionEffect;

    case 'state_change':
      return {
        ...enhanced,
        transition_type: 'gradual',
        nucleation_points: 5,
        crystal_pattern: 'cubic',
        phase_boundary: true,
      } as EnhancedStateChangeEffect;

    case 'volume_change':
      return {
        ...enhanced,
        expansion_type: 'uniform',
        elasticity: 0.5,
        pressure_waves: true,
        volume_oscillation: false,
      } as EnhancedVolumeChangeEffect;

    case 'spill':
      return {
        ...enhanced,
        liquid_viscosity: 0.5,
        surface_adhesion: 0.7,
        flow_pattern: 'radial',
        evaporation_rate: 0.1,
      } as EnhancedSpillEffect;

    case 'texture_change':
      return {
        ...enhanced,
        surface_roughness: 0.5,
        reflectivity: 0.3,
        pattern_scale: 1.0,
        texture_evolution: true,
      } as EnhancedTextureChangeEffect;

    default:
      return enhanced;
  }
}

// Effect compatibility checker
export function checkEffectCompatibility(
  effects: EnhancedVisualEffect[]
): EffectValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for conflicting effects
  const effectTypes = effects.map(e => e.effect_type);
  const duplicates = effectTypes.filter(
    (type, index) => effectTypes.indexOf(type) !== index
  );

  if (duplicates.length > 0) {
    warnings.push(`Duplicate effect types detected: ${duplicates.join(', ')}`);
  }

  // Check performance impact
  const highImpactEffects = effects.filter(
    e =>
      e.effect_type === 'gas_production' || e.effect_type === 'light_emission'
  );

  const performanceImpact =
    highImpactEffects.length > 3
      ? 'high'
      : highImpactEffects.length > 1
        ? 'medium'
        : 'low';

  // Estimate memory requirements
  const memoryRequirements = effects.length * 2048; // 2KB per effect estimate

  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    compatibility: {
      browser_support: true, // SVG is widely supported
      performance_impact: performanceImpact,
      memory_requirements: memoryRequirements,
    },
  };
}
