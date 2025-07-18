import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { useLabStore } from '@/store/lab.store';
import {
  ReactionVessel,
  VesselPresets,
} from '@/components/effects/ReactionVessel';
import type { ProductOutput, VisualEffect } from '@/types/reaction.types';

export interface ResultsDisplayProps {
  className?: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  className,
}) => {
  const { reactionResult, selectedChemicals } = useLabStore();
  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger celebration animation for world-first discoveries
  useEffect(() => {
    if (reactionResult?.is_world_first) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [reactionResult?.is_world_first]);

  if (!reactionResult) {
    return null;
  }

  const { products, effects, explanation, is_world_first } = reactionResult;

  return (
    <div className={cn('bg-white rounded-lg border shadow-sm', className)}>
      {/* Header with World-First Discovery Banner */}
      <div className="p-4 border-b border-gray-200">
        {is_world_first && (
          <div
            className={cn(
              'mb-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white relative overflow-hidden',
              showCelebration && 'animate-pulse'
            )}
          >
            <div className="flex items-center justify-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-bold text-lg">
                🎉 WORLD-FIRST DISCOVERY! 🎉
              </span>
            </div>
            <p className="text-center mt-2 text-sm opacity-90">
              Congratulations! You've discovered a reaction that no one has
              found before!
            </p>

            {/* Celebration particles */}
            {showCelebration && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${10 + (i % 2) * 20}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s',
                    }}
                  >
                    ✨
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Reaction Complete
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Reactants → Products */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800">
            Reaction Summary
          </h3>

          <div className="flex items-center space-x-4">
            {/* Reactants */}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Reactants
              </h4>
              <div className="space-y-2">
                {selectedChemicals.map((selected, index) => (
                  <div
                    key={`${selected.chemical.id}-${index}`}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-200"
                  >
                    <div>
                      <span className="font-mono text-sm font-medium text-blue-900">
                        {selected.chemical.molecular_formula}
                      </span>
                      <span className="text-xs text-blue-700 ml-2">
                        ({selected.chemical.common_name})
                      </span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">
                      ×{selected.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>

            {/* Products */}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Products
              </h4>
              <div className="space-y-2">
                {products.map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Effects with Reaction Vessel */}
        {effects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-medium text-gray-800">
              Visual Effects
            </h3>

            {/* Interactive Reaction Vessel */}
            <div className="flex justify-center mb-4">
              <ReactionVessel
                config={{
                  ...VesselPresets.reactionFlask,
                  bubbling: effects.some(
                    e => e.effect_type === 'gas_production'
                  ),
                  heating: effects.some(
                    e => e.effect_type === 'temperature_change'
                  ),
                  stirring: effects.some(
                    e => e.effect_type === 'foam_production'
                  ),
                }}
                effects={effects}
                width={300}
                height={400}
                animationConfig={{
                  bubbleSpeed: 1.5,
                  stirringSpeed: 2,
                  heatingIntensity: 1.2,
                  enableParticles: true,
                  enableSteam: true,
                  enableGlow: true,
                }}
              />
            </div>

            {/* Effect Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {effects.map((effect, index) => (
                <EffectCard key={index} effect={effect} />
              ))}
            </div>
          </div>
        )}

        {/* Scientific Explanation */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-800">
            Scientific Explanation
          </h3>
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: ProductOutput;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200">
      <div>
        <span className="font-mono text-sm font-medium text-green-900">
          {product.molecular_formula}
        </span>
        <span className="text-xs text-green-700 ml-2">
          ({product.common_name})
        </span>
        {product.is_soluble && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
            Soluble
          </span>
        )}
      </div>
      <span className="text-sm text-green-600 font-medium">
        ×{product.quantity}
      </span>
    </div>
  );
};

// Effect Card Component
interface EffectCardProps {
  effect: VisualEffect;
}

const EffectCard: React.FC<EffectCardProps> = ({ effect }) => {
  const getEffectIcon = (effectType: string) => {
    switch (effectType) {
      case 'gas_production':
        return '💨';
      case 'light_emission':
        return '💡';
      case 'temperature_change':
        return '🌡️';
      case 'foam_production':
        return '🫧';
      case 'state_change':
        return '🔄';
      case 'volume_change':
        return '📏';
      case 'spill':
        return '💧';
      case 'texture_change':
        return '🎨';
      default:
        return '⚡';
    }
  };

  const getEffectDescription = (effect: VisualEffect) => {
    switch (effect.effect_type) {
      case 'gas_production':
        return `${effect.gas_type} gas production (${effect.color})`;
      case 'light_emission':
        return `Light emission (${effect.color}, ${effect.intensity * 100}% intensity)`;
      case 'temperature_change':
        return `Temperature ${effect.delta_celsius > 0 ? 'increase' : 'decrease'} of ${Math.abs(effect.delta_celsius)}°C`;
      case 'foam_production':
        return `${effect.color} foam production (${effect.bubble_size} bubbles)`;
      case 'state_change':
        return `State change to ${effect.final_state}`;
      case 'volume_change':
        return `Volume ${effect.factor > 1 ? 'expansion' : 'contraction'} (${effect.factor}x)`;
      case 'spill':
        return `Spill effect (${effect.amount_percentage * 100}% amount)`;
      case 'texture_change':
        return `Texture change to ${effect.texture_type} (${effect.color})`;
      default:
        return 'Unknown effect';
    }
  };

  return (
    <div className="flex items-center p-3 bg-purple-50 rounded-md border border-purple-200">
      <span className="text-lg mr-3">{getEffectIcon(effect.effect_type)}</span>
      <div>
        <p className="text-sm font-medium text-purple-900 capitalize">
          {effect.effect_type.replace('_', ' ')}
        </p>
        <p className="text-xs text-purple-700">
          {getEffectDescription(effect)}
        </p>
      </div>
    </div>
  );
};
