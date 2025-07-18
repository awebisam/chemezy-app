import React from 'react';
import { BaseEffect, EffectRegistry } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { FoamProductionEffect as FoamProductionEffectType } from '@/types/reaction.types';

export class FoamProductionEffect extends BaseEffect<FoamProductionEffectType> {
  render(
    props: BaseEffectProps<FoamProductionEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    // Calculate foam properties
    const foamHeight = effect.density * 120; // Scale density to height
    const bubbleSize = this.getBubbleSize(effect.bubble_size);
    const stabilityFactor = effect.stability / 10; // Normalize stability
    const numBubbles = Math.floor(effect.density * 30);

    // Foam color with transparency
    const foamColor = effect.color;
    const foamOpacity = 0.7 + (effect.density * 0.3);

    // Calculate foam expansion over time
    const expansionFactor = Math.sin(progress * Math.PI) * 0.3 + 1;
    const currentHeight = foamHeight * expansionFactor;

    // Stability affects how long foam lasts
    const stabilityProgress = Math.min(progress * (1 + stabilityFactor), 1);
    const foamDecay = Math.max(0, 1 - (stabilityProgress * 0.8));

    if (reduceMotion) {
      return (
        <g>
          <defs>
            {this.createRadialGradient(
              `foam-static-${effect.color}`,
              foamColor,
              foamOpacity,
              [
                { offset: '0%', opacity: 0.8 },
                { offset: '50%', opacity: 0.6 },
                { offset: '100%', opacity: 0.2 },
              ]
            )}
          </defs>
          
          {/* Static foam */}
          <ellipse
            cx={vesselCenter.x}
            cy={vesselCenter.y - currentHeight / 2}
            rx={40}
            ry={currentHeight / 2}
            fill={`url(#foam-static-${effect.color})`}
            opacity={foamDecay}
          />
          
          {/* Foam label */}
          <text
            x={vesselCenter.x}
            y={vesselCenter.y - currentHeight - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            🫧 Foam Production
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {/* Foam gradient */}
          {this.createRadialGradient(
            `foam-gradient-${effect.color}`,
            foamColor,
            foamOpacity,
            [
              { offset: '0%', opacity: 0.9 },
              { offset: '40%', opacity: 0.7 },
              { offset: '80%', opacity: 0.4 },
              { offset: '100%', opacity: 0.1 },
            ]
          )}

          {/* Bubble gradient */}
          {this.createRadialGradient(
            `bubble-gradient-${effect.color}`,
            foamColor,
            0.8,
            [
              { offset: '0%', opacity: 0.3 },
              { offset: '70%', opacity: 0.6 },
              { offset: '85%', opacity: 0.9 },
              { offset: '100%', opacity: 0.1 },
            ]
          )}

          {/* Bubble highlight */}
          {this.createRadialGradient(
            `bubble-highlight-${effect.color}`,
            '#FFFFFF',
            1,
            [
              { offset: '0%', opacity: 0.8 },
              { offset: '30%', opacity: 0.4 },
              { offset: '100%', opacity: 0 },
            ]
          )}

          {/* Foam texture pattern */}
          <pattern
            id={`foam-texture-${effect.color}`}
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
          >
            <rect width="8" height="8" fill={foamColor} opacity="0.1" />
            <circle cx="2" cy="2" r="1.5" fill={foamColor} opacity="0.3" />
            <circle cx="6" cy="2" r="1" fill={foamColor} opacity="0.2" />
            <circle cx="4" cy="6" r="1.2" fill={foamColor} opacity="0.25" />
            <circle cx="1" cy="6" r="0.8" fill={foamColor} opacity="0.15" />
          </pattern>
        </defs>

        {/* Main foam body */}
        <ellipse
          cx={vesselCenter.x}
          cy={vesselCenter.y - currentHeight / 3}
          rx={35 + effect.density * 25}
          ry={currentHeight / 2}
          fill={`url(#foam-gradient-${effect.color})`}
          opacity={foamDecay}
        />

        {/* Foam texture overlay */}
        <ellipse
          cx={vesselCenter.x}
          cy={vesselCenter.y - currentHeight / 3}
          rx={35 + effect.density * 25}
          ry={currentHeight / 2}
          fill={`url(#foam-texture-${effect.color})`}
          opacity={foamDecay * 0.8}
        />

        {/* Individual foam bubbles */}
        {this.renderFoamBubbles(
          vesselCenter,
          progress,
          numBubbles,
          bubbleSize,
          currentHeight,
          foamColor,
          foamDecay
        )}

        {/* Popping bubbles effect */}
        {this.renderPoppingBubbles(
          vesselCenter,
          progress,
          stabilityProgress,
          bubbleSize,
          currentHeight,
          foamColor
        )}

        {/* Foam density indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - currentHeight - 20}
          textAnchor="middle"
          className="text-xs fill-gray-600"
          opacity={foamDecay}
        >
          🫧 Density: {Math.round(effect.density * 100)}%
        </text>

        {/* Bubble size indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - currentHeight - 5}
          textAnchor="middle"
          className="text-xs fill-gray-500"
          opacity={foamDecay}
        >
          Bubbles: {effect.bubble_size}
        </text>

        {/* Stability indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y + currentHeight / 2 + 15}
          textAnchor="middle"
          className="text-xs fill-gray-500"
          opacity={foamDecay}
        >
          Stability: {Math.round(effect.stability)}s
        </text>

        {/* Foam collapse animation */}
        {stabilityProgress > 0.7 && (
          <g opacity={1 - stabilityProgress}>
            {/* Collapsing foam streaks */}
            {Array.from({ length: 5 }, (_, i) => {
              const angle = (i / 5) * Math.PI * 2;
              const x1 = vesselCenter.x + Math.cos(angle) * 30;
              const y1 = vesselCenter.y - currentHeight / 2;
              const x2 = vesselCenter.x + Math.cos(angle) * 20;
              const y2 = vesselCenter.y;
              
              return (
                <line
                  key={`collapse-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={foamColor}
                  strokeWidth="2"
                  opacity={0.6}
                  strokeDasharray="4,2"
                />
              );
            })}
          </g>
        )}
      </g>
    );
  }

  private getBubbleSize(size: 'small' | 'medium' | 'large'): number {
    switch (size) {
      case 'small': return 3;
      case 'medium': return 6;
      case 'large': return 10;
      default: return 6;
    }
  }

  private renderFoamBubbles(
    vesselCenter: { x: number; y: number },
    progress: number,
    numBubbles: number,
    bubbleSize: number,
    foamHeight: number,
    foamColor: string,
    foamDecay: number
  ): React.ReactElement[] {
    const bubbles = [];

    for (let i = 0; i < numBubbles; i++) {
      const angle = (i / numBubbles) * Math.PI * 2;
      const distance = 10 + (i % 3) * 15;
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y - foamHeight / 2 + (i % 4) * 8;
      const size = bubbleSize + Math.sin(progress * Math.PI * 2 + i) * 2;
      const opacity = foamDecay * (0.4 + 0.6 * Math.sin(progress * Math.PI + i));

      bubbles.push(
        <g key={`bubble-${i}`}>
          {/* Bubble body */}
          <circle
            cx={x}
            cy={y}
            r={size}
            fill={`url(#bubble-gradient-${foamColor})`}
            opacity={opacity}
          />
          
          {/* Bubble highlight */}
          <circle
            cx={x - size * 0.3}
            cy={y - size * 0.3}
            r={size * 0.3}
            fill={`url(#bubble-highlight-${foamColor})`}
            opacity={opacity * 0.8}
          />
          
          {/* Bubble outline */}
          <circle
            cx={x}
            cy={y}
            r={size}
            fill="none"
            stroke={foamColor}
            strokeWidth="0.5"
            opacity={opacity * 0.6}
          />
        </g>
      );
    }

    return bubbles;
  }

  private renderPoppingBubbles(
    vesselCenter: { x: number; y: number },
    _progress: number,
    stabilityProgress: number,
    bubbleSize: number,
    foamHeight: number,
    foamColor: string
  ): React.ReactElement[] {
    const poppingBubbles = [];
    const numPoppingBubbles = Math.floor(stabilityProgress * 8);

    for (let i = 0; i < numPoppingBubbles; i++) {
      const angle = (i / numPoppingBubbles) * Math.PI * 2;
      const distance = 15 + (i % 2) * 20;
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y - foamHeight / 2 + (i % 3) * 10;
      const popProgress = (stabilityProgress - 0.5) * 4; // Pop animation progress
      const size = bubbleSize * (1 - popProgress);
      const opacity = Math.max(0, 1 - popProgress * 2);

      if (popProgress > 0 && popProgress < 1) {
        // Popping animation
        poppingBubbles.push(
          <g key={`pop-${i}`}>
            {/* Expanding ring */}
            <circle
              cx={x}
              cy={y}
              r={bubbleSize * popProgress * 2}
              fill="none"
              stroke={foamColor}
              strokeWidth="1"
              opacity={opacity * 0.5}
            />
            
            {/* Shrinking bubble */}
            <circle
              cx={x}
              cy={y}
              r={size}
              fill={foamColor}
              opacity={opacity * 0.3}
            />
            
            {/* Pop sparkles */}
            {Array.from({ length: 4 }, (_, j) => {
              const sparkleAngle = (j / 4) * Math.PI * 2;
              const sparkleDistance = bubbleSize * popProgress * 1.5;
              const sparkleX = x + Math.cos(sparkleAngle) * sparkleDistance;
              const sparkleY = y + Math.sin(sparkleAngle) * sparkleDistance;
              
              return (
                <circle
                  key={`sparkle-${j}`}
                  cx={sparkleX}
                  cy={sparkleY}
                  r={1}
                  fill={foamColor}
                  opacity={opacity}
                />
              );
            })}
          </g>
        );
      }
    }

    return poppingBubbles;
  }

  getDuration(effect: FoamProductionEffectType): number {
    return effect.stability * 1000; // Convert seconds to milliseconds
  }
}

// Register the effect
EffectRegistry.register('foam_production', FoamProductionEffect);