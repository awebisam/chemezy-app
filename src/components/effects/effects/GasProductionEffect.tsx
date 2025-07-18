import React from 'react';
import { BaseEffect, EffectRegistry } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { GasProductionEffect as GasProductionEffectType } from '@/types/reaction.types';

export class GasProductionEffect extends BaseEffect<GasProductionEffectType> {
  render(
    props: BaseEffectProps<GasProductionEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    const numParticles = Math.floor(effect.intensity * (reduceMotion ? 6 : 15));
    const particles = this.generateParticles(
      numParticles,
      vesselCenter,
      progress,
      {
        baseRadius: 20,
        maxRadius: 120,
        spread: Math.PI * 2,
      }
    );

    // Enhanced particles with more realistic gas behavior
    const enhancedParticles = particles.map((particle, index) => {
      const buoyancy = -progress * 80; // Gas rises
      const turbulence = reduceMotion
        ? 0
        : Math.sin(progress * Math.PI * 4 + index) * 10;
      const dispersal = progress * 30;

      return {
        ...particle,
        y: particle.y + buoyancy,
        x: particle.x + turbulence + (Math.random() - 0.5) * dispersal,
        size: particle.size * (1 + Math.sin(progress * Math.PI) * 0.5),
        opacity: particle.opacity * (1 - progress * 0.8),
      };
    });

    if (reduceMotion) {
      return (
        <g>
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={30}
            fill={effect.color}
            opacity={0.4}
          />
          <text
            x={vesselCenter.x}
            y={vesselCenter.y - 45}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {effect.gas_type} Production
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {this.createRadialGradient(
            `gas-gradient-${effect.gas_type}`,
            effect.color,
            0.6,
            [
              { offset: '0%', opacity: 1 },
              { offset: '50%', opacity: 0.6 },
              { offset: '100%', opacity: 0 },
            ]
          )}
        </defs>

        {/* Main gas cloud */}
        <ellipse
          cx={vesselCenter.x}
          cy={vesselCenter.y - progress * 40}
          rx={20 + progress * 50}
          ry={15 + progress * 30}
          fill={`url(#gas-gradient-${effect.gas_type})`}
          opacity={0.3 * (1 - progress * 0.5)}
        />

        {/* Individual gas particles */}
        {enhancedParticles.map(particle => (
          <circle
            key={particle.key}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={effect.color}
            opacity={particle.opacity}
            className="animate-pulse"
          />
        ))}

        {/* Gas type label */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - 60 - progress * 20}
          textAnchor="middle"
          className="text-xs fill-gray-600"
          opacity={1 - progress * 0.5}
        >
          {effect.gas_type}
        </text>
      </g>
    );
  }

  getDuration(effect: GasProductionEffectType): number {
    return effect.duration * 1000; // Convert to milliseconds
  }
}

// Register the effect
EffectRegistry.register('gas_production', GasProductionEffect);
