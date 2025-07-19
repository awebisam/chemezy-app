import React from 'react';
import { BaseEffect, EffectRegistry, EffectAnimations } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { LightEmissionEffect as LightEmissionEffectType } from '@/types/reaction.types';

export class LightEmissionEffect extends BaseEffect<LightEmissionEffectType> {
  render(
    props: BaseEffectProps<LightEmissionEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    const maxRadius = effect.radius * 25; // Scale radius for visualization
    const pulseIntensity = EffectAnimations.pulse(progress, effect.intensity);
    const currentRadius = maxRadius * (reduceMotion ? 0.8 : pulseIntensity);
    const baseOpacity = effect.intensity * 0.8;

    // Create multiple light layers for depth
    const lightLayers = [
      { radius: currentRadius, opacity: baseOpacity * 0.3 },
      { radius: currentRadius * 0.7, opacity: baseOpacity * 0.6 },
      { radius: currentRadius * 0.4, opacity: baseOpacity * 0.9 },
    ];

    if (reduceMotion) {
      return (
        <g>
          <defs>
            {this.createRadialGradient(
              `light-static-${effect.color}`,
              effect.color,
              baseOpacity,
              [
                { offset: '0%', opacity: 1 },
                { offset: '60%', opacity: 0.4 },
                { offset: '100%', opacity: 0 },
              ]
            )}
          </defs>
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={maxRadius * 0.8}
            fill={`url(#light-static-${effect.color})`}
          />
          <text
            x={vesselCenter.x}
            y={vesselCenter.y - maxRadius - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            Light Emission
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {/* Main light gradient */}
          {this.createRadialGradient(
            `light-gradient-${effect.color}`,
            effect.color,
            baseOpacity,
            [
              { offset: '0%', opacity: 1 },
              { offset: '40%', opacity: 0.8 },
              { offset: '70%', opacity: 0.4 },
              { offset: '100%', opacity: 0 },
            ]
          )}

          {/* Bright core gradient */}
          {this.createRadialGradient(
            `light-core-${effect.color}`,
            effect.color,
            1,
            [
              { offset: '0%', opacity: 1 },
              { offset: '30%', opacity: 0.9 },
              { offset: '100%', opacity: 0 },
            ]
          )}

          {/* Light rays filter */}
          <filter id={`light-rays-${effect.color}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow layers */}
        {lightLayers.map((layer, index) => (
          <circle
            key={index}
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={layer.radius}
            fill={`url(#light-gradient-${effect.color})`}
            opacity={layer.opacity}
            filter={`url(#light-rays-${effect.color})`}
          />
        ))}

        {/* Bright core */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={currentRadius * 0.2}
          fill={`url(#light-core-${effect.color})`}
          opacity={baseOpacity}
        />

        {/* Light rays */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const rayLength = currentRadius * 1.5;
          const x1 = vesselCenter.x + Math.cos(angle) * (currentRadius * 0.3);
          const y1 = vesselCenter.y + Math.sin(angle) * (currentRadius * 0.3);
          const x2 = vesselCenter.x + Math.cos(angle) * rayLength;
          const y2 = vesselCenter.y + Math.sin(angle) * rayLength;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={effect.color}
              strokeWidth="2"
              opacity={baseOpacity * 0.6}
              strokeLinecap="round"
            />
          );
        })}

        {/* Sparkles around the light */}
        {Array.from({ length: 12 }, (_, i) => {
          const sparkleAngle = (i / 12) * Math.PI * 2 + progress * Math.PI;
          const sparkleDistance =
            currentRadius * 0.8 + Math.sin(progress * Math.PI * 2 + i) * 20;
          const sparkleX =
            vesselCenter.x + Math.cos(sparkleAngle) * sparkleDistance;
          const sparkleY =
            vesselCenter.y + Math.sin(sparkleAngle) * sparkleDistance;
          const sparkleOpacity =
            baseOpacity * (0.3 + 0.7 * Math.sin(progress * Math.PI * 3 + i));

          return (
            <circle
              key={i}
              cx={sparkleX}
              cy={sparkleY}
              r={1 + Math.sin(progress * Math.PI * 4 + i) * 1}
              fill={effect.color}
              opacity={sparkleOpacity}
            />
          );
        })}

        {/* Intensity indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - currentRadius - 15}
          textAnchor="middle"
          className="text-xs fill-gray-600"
          opacity={1 - progress * 0.3}
        >
          ⚡ {Math.round(effect.intensity * 100)}% Intensity
        </text>
      </g>
    );
  }

  getDuration(effect: LightEmissionEffectType): number {
    return effect.duration * 1000; // Convert to milliseconds
  }
}

// Register the effect
EffectRegistry.register('light_emission', LightEmissionEffect);
