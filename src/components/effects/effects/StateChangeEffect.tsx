import React from 'react';
import { BaseEffect, EffectRegistry, EffectAnimations } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { StateChangeEffect as StateChangeEffectType } from '@/types/reaction.types';

export class StateChangeEffect extends BaseEffect<StateChangeEffectType> {
  render(
    props: BaseEffectProps<StateChangeEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    // For state change, we'll use the final_state and infer from chemical properties
    const finalState = effect.final_state;
    const transitionProgress = EffectAnimations.easeInOut(progress);

    // State-specific properties - assuming initial state is liquid by default
    const fromState = 'liquid'; // Default assumption
    const toState = finalState;

    // State visualization properties
    const stateColors = {
      solid: '#8B7355',
      liquid: '#3B82F6',
      gas: '#E5E7EB',
      plasma: '#FF6B35',
      aqueous: '#06B6D4',
    };

    // State patterns and effects
    const fromColor =
      stateColors[fromState as keyof typeof stateColors] || '#9CA3AF';
    const toColor =
      stateColors[toState as keyof typeof stateColors] || '#9CA3AF';

    // Interpolate between states
    const currentColor = super.interpolateColor(
      fromColor,
      toColor,
      transitionProgress
    );

    const stateProps = this.getStateProperties(
      fromState,
      toState,
      transitionProgress
    );

    if (reduceMotion) {
      return (
        <g>
          <defs>
            {this.createRadialGradient(
              `state-static-${fromState}-${toState}`,
              currentColor,
              0.8,
              [
                { offset: '0%', opacity: 0.9 },
                { offset: '50%', opacity: 0.6 },
                { offset: '100%', opacity: 0.2 },
              ]
            )}
          </defs>

          {/* Static state indicator */}
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={30}
            fill={`url(#state-static-${fromState}-${toState})`}
            stroke={currentColor}
            strokeWidth="2"
          />

          {/* State label */}
          <text
            x={vesselCenter.x}
            y={vesselCenter.y - 50}
            textAnchor="middle"
            className="text-sm font-semibold"
            fill={currentColor}
          >
            {fromState} → {toState}
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {/* State transition gradient */}
          {this.createRadialGradient(
            `state-transition-${fromState}-${toState}`,
            currentColor,
            0.8,
            [
              { offset: '0%', opacity: 0.9 },
              { offset: '30%', opacity: 0.7 },
              { offset: '70%', opacity: 0.4 },
              { offset: '100%', opacity: 0.1 },
            ]
          )}

          {/* State-specific patterns */}
          {this.createStatePattern(fromState, toState, transitionProgress)}

          {/* Particle system filter */}
          {(toState === 'gas' || toState === 'plasma') && (
            <filter id={`particle-system-${fromState}-${toState}`}>
              <feTurbulence
                baseFrequency="0.3"
                numOctaves="2"
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale={transitionProgress * 3}
              />
            </filter>
          )}
        </defs>

        {/* Main state visualization */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={25 + stateProps.expansion * 20}
          fill={`url(#state-transition-${fromState}-${toState})`}
          opacity={stateProps.opacity}
          filter={
            stateProps.hasParticles
              ? `url(#particle-system-${fromState}-${toState})`
              : undefined
          }
        />

        {/* State pattern overlay */}
        {stateProps.hasPattern && (
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={25 + stateProps.expansion * 20}
            fill={`url(#state-pattern-${fromState}-${toState})`}
            opacity={0.6}
          />
        )}

        {/* State-specific effects */}
        {this.renderStateEffects(
          vesselCenter,
          fromState,
          toState,
          transitionProgress
        )}

        {/* Transition particles */}
        {this.renderTransitionParticles(
          vesselCenter,
          fromState,
          toState,
          progress,
          transitionProgress
        )}

        {/* State labels */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - 60}
          textAnchor="middle"
          className="text-sm font-bold"
          fill={currentColor}
        >
          {fromState} → {toState}
        </text>

        {/* Progress indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - 40}
          textAnchor="middle"
          className="text-xs"
          fill={currentColor}
          opacity={0.8}
        >
          {Math.round(transitionProgress * 100)}% Complete
        </text>
      </g>
    );
  }

  private getStateProperties(
    fromState: string,
    toState: string,
    progress: number
  ): {
    expansion: number;
    opacity: number;
    hasParticles: boolean;
    hasPattern: boolean;
  } {
    const expansionMap = {
      solid: 0,
      liquid: 0.2,
      gas: 0.8,
      plasma: 1.2,
      aqueous: 0.3,
    };

    const fromExpansion =
      expansionMap[fromState as keyof typeof expansionMap] || 0;
    const toExpansion = expansionMap[toState as keyof typeof expansionMap] || 0;
    const expansion = fromExpansion + (toExpansion - fromExpansion) * progress;

    const opacity = toState === 'gas' ? 0.6 + (1 - progress) * 0.4 : 0.8;
    const hasParticles = toState === 'gas' || toState === 'plasma';
    const hasPattern = fromState === 'solid' || toState === 'solid';

    return { expansion, opacity, hasParticles, hasPattern };
  }

  private createStatePattern(
    fromState: string,
    toState: string,
    progress: number
  ): React.ReactElement {
    const patternId = `state-pattern-${fromState}-${toState}`;

    if (fromState === 'solid' || toState === 'solid') {
      return (
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="12"
          height="12"
        >
          <rect width="12" height="12" fill="none" />
          <rect
            x="0"
            y="0"
            width="6"
            height="6"
            fill={stateColors.solid}
            opacity={
              fromState === 'solid' ? (1 - progress) * 0.5 : progress * 0.5
            }
          />
          <rect
            x="6"
            y="6"
            width="6"
            height="6"
            fill={stateColors.solid}
            opacity={
              fromState === 'solid' ? (1 - progress) * 0.5 : progress * 0.5
            }
          />
        </pattern>
      );
    }

    return <pattern id={patternId} />;
  }

  private renderStateEffects(
    vesselCenter: { x: number; y: number },
    fromState: string,
    toState: string,
    progress: number
  ): React.ReactElement[] {
    const effects: React.ReactElement[] = [];

    // Melting effect (solid to liquid)
    if (fromState === 'solid' && toState === 'liquid') {
      effects.push(
        <g key="melting">
          {Array.from({ length: 5 }, (_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            const x = vesselCenter.x + Math.cos(angle) * 30;
            const y = vesselCenter.y + Math.sin(angle) * 30;
            const dropY = y + progress * 20;

            return (
              <ellipse
                key={`melt-${i}`}
                cx={x}
                cy={dropY}
                rx={3}
                ry={6 + progress * 4}
                fill={stateColors.liquid}
                opacity={progress * 0.7}
              />
            );
          })}
        </g>
      );
    }

    // Evaporation effect (liquid to gas)
    if (fromState === 'liquid' && toState === 'gas') {
      effects.push(
        <g key="evaporation">
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 25 + progress * 30;
            const x = vesselCenter.x + Math.cos(angle) * distance;
            const y =
              vesselCenter.y + Math.sin(angle) * distance - progress * 40;
            const size = 2 + progress * 3;

            return (
              <circle
                key={`evap-${i}`}
                cx={x}
                cy={y}
                r={size}
                fill={stateColors.gas}
                opacity={(1 - progress) * 0.8}
              />
            );
          })}
        </g>
      );
    }

    // Condensation effect (gas to liquid)
    if (fromState === 'gas' && toState === 'liquid') {
      effects.push(
        <g key="condensation">
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 50 - progress * 25;
            const x = vesselCenter.x + Math.cos(angle) * distance;
            const y = vesselCenter.y + Math.sin(angle) * distance;
            const size = 1 + progress * 2;

            return (
              <circle
                key={`cond-${i}`}
                cx={x}
                cy={y}
                r={size}
                fill={stateColors.liquid}
                opacity={progress * 0.9}
              />
            );
          })}
        </g>
      );
    }

    // Ionization effect (gas to plasma)
    if (fromState === 'gas' && toState === 'plasma') {
      effects.push(
        <g key="ionization">
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = vesselCenter.x + Math.cos(angle) * 35;
            const y = vesselCenter.y + Math.sin(angle) * 35;

            return (
              <g key={`ion-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={3}
                  fill={stateColors.plasma}
                  opacity={progress * 0.8}
                />
                <line
                  x1={x - 6}
                  y1={y}
                  x2={x + 6}
                  y2={y}
                  stroke={stateColors.plasma}
                  strokeWidth="1"
                  opacity={progress * 0.6}
                />
                <line
                  x1={x}
                  y1={y - 6}
                  x2={x}
                  y2={y + 6}
                  stroke={stateColors.plasma}
                  strokeWidth="1"
                  opacity={progress * 0.6}
                />
              </g>
            );
          })}
        </g>
      );
    }

    return effects;
  }

  private renderTransitionParticles(
    vesselCenter: { x: number; y: number },
    _fromState: string,
    toState: string,
    progress: number,
    transitionProgress: number
  ): React.ReactElement[] {
    const particles: React.ReactElement[] = [];
    const numParticles = 15;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2 + progress * Math.PI;
      const distance = 20 + transitionProgress * 40;
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y + Math.sin(angle) * distance;

      const size =
        toState === 'gas'
          ? 1 + transitionProgress * 2
          : 2 - transitionProgress * 1;
      const opacity = 0.6 + 0.4 * Math.sin(progress * Math.PI * 3 + i);

      particles.push(
        <circle
          key={`particle-${i}`}
          cx={x}
          cy={y}
          r={size}
          fill={stateColors[toState as keyof typeof stateColors] || '#9CA3AF'}
          opacity={opacity * transitionProgress}
        />
      );
    }

    return particles;
  }

  getDuration(_effect: StateChangeEffectType): number {
    return 6000; // 6 seconds for state transition
  }
}

// State colors for easy access
const stateColors = {
  solid: '#8B7355',
  liquid: '#3B82F6',
  gas: '#E5E7EB',
  plasma: '#FF6B35',
  aqueous: '#06B6D4',
};

// Register the effect
EffectRegistry.register('state_change', StateChangeEffect);
