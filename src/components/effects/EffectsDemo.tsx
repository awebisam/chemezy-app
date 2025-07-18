import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { ReactionVessel, VesselPresets } from './ReactionVessel';
import type { VisualEffect } from '@/types/reaction.types';

// Demo effects
const DEMO_EFFECTS: VisualEffect[] = [
  {
    effect_type: 'gas_production',
    gas_type: 'Hydrogen',
    color: '#E6F3FF',
    intensity: 0.8,
    duration: 4,
  },
  {
    effect_type: 'light_emission',
    color: '#FF6B35',
    intensity: 0.7,
    radius: 2,
    duration: 3,
  },
  {
    effect_type: 'gas_production',
    gas_type: 'Steam',
    color: '#FFFFFF',
    intensity: 0.6,
    duration: 6,
  },
];

export interface EffectsDemoProps {
  className?: string;
}

export const EffectsDemo: React.FC<EffectsDemoProps> = ({ className }) => {
  const [selectedEffect, setSelectedEffect] = useState<VisualEffect>(DEMO_EFFECTS[0]);
  const [activeEffects, setActiveEffects] = useState<VisualEffect[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playEffect = useCallback(() => {
    setActiveEffects([selectedEffect]);
    setIsPlaying(true);
    
    // Auto-stop after effect duration
    const duration = 'duration' in selectedEffect ? selectedEffect.duration * 1000 : 3000;
    setTimeout(() => {
      setIsPlaying(false);
      setActiveEffects([]);
    }, duration);
  }, [selectedEffect]);

  const playAllEffects = useCallback(() => {
    setActiveEffects(DEMO_EFFECTS);
    setIsPlaying(true);
    
    // Auto-stop after longest effect duration
    const maxDuration = Math.max(...DEMO_EFFECTS.map(effect => 
      'duration' in effect ? effect.duration * 1000 : 3000
    ));
    setTimeout(() => {
      setIsPlaying(false);
      setActiveEffects([]);
    }, maxDuration);
  }, []);

  const stopEffects = useCallback(() => {
    setActiveEffects([]);
    setIsPlaying(false);
  }, []);

  const selectDemoEffect = useCallback((effect: VisualEffect) => {
    setSelectedEffect(effect);
  }, []);

  return (
    <div className={cn('max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Visual Effects Engine Demo
        </h2>
        <p className="text-gray-600">
          Explore configurable SVG animations for chemical reactions
        </p>
      </div>

      {/* Main demo area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reaction vessel with effects */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reaction Vessel
            </h3>
            
            <div className="flex justify-center mb-4">
              <ReactionVessel
                config={{
                  ...VesselPresets.reactionFlask,
                  bubbling: activeEffects.some(e => e.effect_type === 'gas_production'),
                  heating: activeEffects.some(e => e.effect_type === 'light_emission'),
                  stirring: activeEffects.length > 1,
                }}
                effects={activeEffects}
                width={350}
                height={450}
                animationConfig={{
                  bubbleSpeed: 2,
                  stirringSpeed: 1.5,
                  heatingIntensity: 1.2,
                  enableParticles: true,
                  enableSteam: true,
                  enableGlow: true,
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={playEffect}
                disabled={isPlaying}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  isPlaying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {isPlaying ? 'Playing...' : 'Play Selected Effect'}
              </button>
              
              <button
                onClick={playAllEffects}
                disabled={isPlaying}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  isPlaying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                )}
              >
                Play All Effects
              </button>
              
              <button
                onClick={stopEffects}
                disabled={!isPlaying}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  !isPlaying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                )}
              >
                Stop
              </button>
            </div>
          </div>

          {/* Effect selection */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Effect
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {DEMO_EFFECTS.map((effect, index) => (
                <button
                  key={index}
                  onClick={() => selectDemoEffect(effect)}
                  className={cn(
                    'p-3 text-left border rounded-lg transition-colors',
                    selectedEffect === effect
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="font-medium text-sm text-gray-900 capitalize">
                    {effect.effect_type.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {effect.effect_type === 'gas_production' && 
                      `${effect.gas_type} • ${Math.round(effect.intensity * 100)}% intensity`
                    }
                    {effect.effect_type === 'light_emission' && 
                      `${effect.color} • ${Math.round(effect.intensity * 100)}% intensity`
                    }
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Information panel */}
        <div className="space-y-4">

          {/* Effect information */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Effect Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-sm text-gray-900 capitalize">
                  {selectedEffect.effect_type.replace('_', ' ')}
                </span>
              </div>
              
              {selectedEffect.effect_type === 'gas_production' && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Gas:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedEffect.gas_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Color:</span>
                    <span className="ml-2 inline-flex items-center">
                      <span
                        className="w-4 h-4 rounded border mr-2"
                        style={{ backgroundColor: selectedEffect.color }}
                      />
                      {selectedEffect.color}
                    </span>
                  </div>
                </>
              )}
              
              {selectedEffect.effect_type === 'light_emission' && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Color:</span>
                    <span className="ml-2 inline-flex items-center">
                      <span
                        className="w-4 h-4 rounded border mr-2"
                        style={{ backgroundColor: selectedEffect.color }}
                      />
                      {selectedEffect.color}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Radius:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedEffect.radius} units
                    </span>
                  </div>
                </>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-700">Intensity:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {'intensity' in selectedEffect ? `${Math.round(selectedEffect.intensity * 100)}%` : 'N/A'}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {'duration' in selectedEffect ? `${selectedEffect.duration}s` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance info */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Effects:</span>
                <span className="text-gray-900">{activeEffects.length}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Animation Status:</span>
                <span className={cn(
                  'font-medium',
                  isPlaying ? 'text-green-600' : 'text-gray-500'
                )}>
                  {isPlaying ? 'Running' : 'Stopped'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reduced Motion:</span>
                <span className="text-gray-900">
                  {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Visual Effects Engine - SVG animations driven by reaction API responses
        </p>
        <p className="mt-1">
          Effects are automatically generated based on chemical reaction predictions
        </p>
      </div>
    </div>
  );
};