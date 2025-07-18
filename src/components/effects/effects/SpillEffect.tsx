import React from 'react';
import { BaseEffect, EffectRegistry, EffectAnimations } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { SpillEffect as SpillEffectType } from '@/types/reaction.types';

export class SpillEffect extends BaseEffect<SpillEffectType> {
  render(
    props: BaseEffectProps<SpillEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    const amount = effect.amount_percentage;
    const spreadRadius = effect.spread_radius;
    const color = '#3B82F6'; // Default blue color
    const viscosity = 3; // Default viscosity

    // Calculate spill progress with different easing based on viscosity
    const spillProgress = viscosity > 5 
      ? EffectAnimations.easeOut(progress) // Thick liquids spread slower
      : EffectAnimations.easeInOut(progress); // Thin liquids spread more evenly

    // Spill properties
    const maxSpread = spreadRadius * amount;
    const currentSpread = maxSpread * spillProgress;
    const spillHeight = Math.max(2, 15 - viscosity * 2);

    // Viscosity affects flow pattern
    const flowSpeed = Math.max(0.1, 2 - viscosity * 0.3);
    const flowPattern = Math.sin(progress * Math.PI * flowSpeed) * 0.2 + 0.8;

    if (reduceMotion) {
      return (
        <g>
          <defs>
            {this.createRadialGradient(
              `spill-static-${color}`,
              color,
              0.8,
              [
                { offset: '0%', opacity: 0.9 },
                { offset: '70%', opacity: 0.7 },
                { offset: '100%', opacity: 0.3 },
              ]
            )}
          </defs>
          
          {/* Static spill */}
          <ellipse
            cx={vesselCenter.x}
            cy={vesselCenter.y + 40}
            rx={currentSpread}
            ry={spillHeight}
            fill={`url(#spill-static-${color})`}
            opacity={0.8}
          />
          
          {/* Spill label */}
          <text
            x={vesselCenter.x}
            y={vesselCenter.y + 70}
            textAnchor="middle"
            className="text-xs"
            fill={color}
          >
            💧 Spill: {Math.round(amount)}%
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {/* Spill gradient */}
          {this.createRadialGradient(
            `spill-gradient-${color}`,
            color,
            0.8,
            [
              { offset: '0%', opacity: 0.9 },
              { offset: '40%', opacity: 0.8 },
              { offset: '80%', opacity: 0.6 },
              { offset: '100%', opacity: 0.2 },
            ]
          )}

          {/* Liquid texture pattern */}
          <pattern
            id={`liquid-texture-${color}`}
            patternUnits="userSpaceOnUse"
            width="20"
            height="20"
          >
            <rect width="20" height="20" fill={color} opacity="0.1" />
            <circle cx="5" cy="5" r="2" fill={color} opacity="0.3" />
            <circle cx="15" cy="5" r="1.5" fill={color} opacity="0.25" />
            <circle cx="10" cy="15" r="1.8" fill={color} opacity="0.28" />
            <circle cx="3" cy="15" r="1.2" fill={color} opacity="0.2" />
            <circle cx="17" cy="15" r="1" fill={color} opacity="0.15" />
          </pattern>

          {/* Viscosity flow pattern */}
          <pattern
            id={`viscosity-flow-${color}`}
            patternUnits="userSpaceOnUse"
            width="15"
            height="8"
          >
            <rect width="15" height="8" fill="none" />
            <path
              d={`M0,4 Q${viscosity * 2},${2 + viscosity} ${15},4`}
              stroke={color}
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
          </pattern>

          {/* Spill shimmer effect */}
          <linearGradient
            id={`spill-shimmer-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
            <stop offset={`${spillProgress * 100}%`} stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Initial spill flow from vessel */}
        {this.renderSpillFlow(vesselCenter, progress, color, viscosity, spillProgress)}

        {/* Main spill body */}
        <ellipse
          cx={vesselCenter.x}
          cy={vesselCenter.y + 40}
          rx={currentSpread}
          ry={spillHeight * flowPattern}
          fill={`url(#spill-gradient-${color})`}
          opacity={0.8}
        />

        {/* Liquid texture overlay */}
        <ellipse
          cx={vesselCenter.x}
          cy={vesselCenter.y + 40}
          rx={currentSpread}
          ry={spillHeight * flowPattern}
          fill={`url(#liquid-texture-${color})`}
          opacity={0.6}
        />

        {/* Viscosity flow patterns */}
        <ellipse
          cx={vesselCenter.x}
          cy={vesselCenter.y + 40}
          rx={currentSpread}
          ry={spillHeight * flowPattern}
          fill={`url(#viscosity-flow-${color})`}
          opacity={0.4}
        />

        {/* Spill shimmer effect */}
        <ellipse
          cx={vesselCenter.x}
          cy={vesselCenter.y + 40}
          rx={currentSpread * 0.8}
          ry={spillHeight * flowPattern * 0.6}
          fill={`url(#spill-shimmer-${color})`}
          opacity={0.5}
        />

        {/* Spill edge ripples */}
        {this.renderSpillRipples(vesselCenter, progress, currentSpread, color, viscosity)}

        {/* Spill droplets */}
        {this.renderSpillDroplets(vesselCenter, progress, currentSpread, color, viscosity, spillProgress)}

        {/* Spill information */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y + 40 + spillHeight + 15}
          textAnchor="middle"
          className="text-xs font-semibold"
          fill={color}
        >
          💧 Spill: {Math.round(amount)}%
        </text>

        {/* Viscosity indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y + 40 + spillHeight + 30}
          textAnchor="middle"
          className="text-xs"
          fill={color}
          opacity={0.8}
        >
          Viscosity: {viscosity} • Spread: {Math.round(currentSpread)}px
        </text>
      </g>
    );
  }

  private renderSpillFlow(
    vesselCenter: { x: number; y: number },
    progress: number,
    color: string,
    viscosity: number,
    spillProgress: number
  ): React.ReactElement[] {
    const flows = [];
    const numFlows = Math.max(1, Math.floor(6 - viscosity));

    for (let i = 0; i < numFlows; i++) {
      const angle = -Math.PI / 2 + (i - numFlows / 2) * 0.3;
      const flowLength = 40 * spillProgress;
      const x1 = vesselCenter.x + Math.cos(angle) * 25;
      const y1 = vesselCenter.y + Math.sin(angle) * 25;
      const x2 = x1 + Math.cos(Math.PI / 2) * flowLength;
      const y2 = y1 + Math.sin(Math.PI / 2) * flowLength;

      const flowWidth = Math.max(1, 4 - viscosity * 0.5);
      const flowOpacity = 0.8 - (i * 0.1);

      flows.push(
        <line
          key={`flow-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={flowWidth}
          opacity={flowOpacity}
          strokeLinecap="round"
        />
      );

      // Add flow droplets
      if (spillProgress > 0.3) {
        const dropletY = y2 + Math.sin(progress * Math.PI * 3 + i) * 5;
        flows.push(
          <circle
            key={`flow-droplet-${i}`}
            cx={x2}
            cy={dropletY}
            r={1 + Math.sin(progress * Math.PI * 2 + i) * 0.5}
            fill={color}
            opacity={0.7}
          />
        );
      }
    }

    return flows;
  }

  private renderSpillRipples(
    vesselCenter: { x: number; y: number },
    progress: number,
    currentSpread: number,
    color: string,
    viscosity: number
  ): React.ReactElement[] {
    const ripples = [];
    const numRipples = Math.max(2, Math.floor(5 - viscosity));

    for (let i = 0; i < numRipples; i++) {
      const rippleProgress = (progress * 3 - i * 0.5) % 1;
      const rippleRadius = currentSpread * (0.8 + rippleProgress * 0.4);
      const rippleOpacity = (1 - rippleProgress) * 0.4;

      if (rippleProgress > 0 && rippleProgress < 1) {
        ripples.push(
          <ellipse
            key={`ripple-${i}`}
            cx={vesselCenter.x}
            cy={vesselCenter.y + 40}
            rx={rippleRadius}
            ry={rippleRadius * 0.3}
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity={rippleOpacity}
          />
        );
      }
    }

    return ripples;
  }

  private renderSpillDroplets(
    vesselCenter: { x: number; y: number },
    progress: number,
    currentSpread: number,
    color: string,
    viscosity: number,
    spillProgress: number
  ): React.ReactElement[] {
    const droplets = [];
    const numDroplets = Math.floor(spillProgress * 15);

    for (let i = 0; i < numDroplets; i++) {
      const angle = (i / numDroplets) * Math.PI * 2;
      const distance = currentSpread * (0.7 + Math.random() * 0.6);
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y + 40 + Math.sin(angle) * distance * 0.3;

      const dropletSize = Math.max(0.5, 3 - viscosity * 0.3);
      const dropletOpacity = 0.6 + 0.4 * Math.sin(progress * Math.PI * 2 + i);

      // Larger droplets for higher viscosity
      if (viscosity > 3) {
        droplets.push(
          <ellipse
            key={`droplet-${i}`}
            cx={x}
            cy={y}
            rx={dropletSize}
            ry={dropletSize * 1.5}
            fill={color}
            opacity={dropletOpacity}
          />
        );
      } else {
        droplets.push(
          <circle
            key={`droplet-${i}`}
            cx={x}
            cy={y}
            r={dropletSize}
            fill={color}
            opacity={dropletOpacity}
          />
        );
      }

      // Add droplet trails for low viscosity
      if (viscosity < 3 && spillProgress > 0.5) {
        const trailLength = 5 - viscosity;
        droplets.push(
          <line
            key={`trail-${i}`}
            x1={x}
            y1={y - trailLength}
            x2={x}
            y2={y}
            stroke={color}
            strokeWidth="0.5"
            opacity={dropletOpacity * 0.5}
          />
        );
      }
    }

    return droplets;
  }

  getDuration(effect: SpillEffectType): number {
    // Duration depends on amount and spread radius
    const baseDuration = 3000;
    const amountMultiplier = 1 + (effect.amount_percentage / 100) * 0.5;
    const spreadMultiplier = 1 + (effect.spread_radius / 100) * 0.2;
    
    return baseDuration * amountMultiplier * spreadMultiplier;
  }
}

// Register the effect
EffectRegistry.register('spill', SpillEffect);