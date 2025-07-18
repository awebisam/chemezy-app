import React from 'react';
import { BaseEffect, EffectRegistry, EffectAnimations } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { TextureChangeEffect as TextureChangeEffectType } from '@/types/reaction.types';

export class TextureChangeEffect extends BaseEffect<TextureChangeEffectType> {
  render(
    props: BaseEffectProps<TextureChangeEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    const textureType = effect.texture_type;
    const color = effect.color;
    const viscosity = effect.viscosity || 1;
    
    // For demo purposes, we'll show a transition to the new texture
    const fromTexture = 'smooth'; // Default assumption
    const toTexture = textureType;

    // Calculate texture transition progress
    const transitionProgress = EffectAnimations.easeInOut(progress);
    
    // Texture properties
    const textureIntensity = 0.6 + (viscosity * 0.1);
    const surfaceRadius = 35 + (viscosity * 3);

    if (reduceMotion) {
      return (
        <g>
          <defs>
            {this.createTexturePattern(fromTexture, toTexture, transitionProgress, color, viscosity)}
          </defs>
          
          {/* Static texture surface */}
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={surfaceRadius}
            fill={`url(#texture-pattern-${fromTexture}-${toTexture})`}
            opacity={0.7}
          />
          
          {/* Texture label */}
          <text
            x={vesselCenter.x}
            y={vesselCenter.y - surfaceRadius - 15}
            textAnchor="middle"
            className="text-xs"
            fill={color}
          >
            🎨 {fromTexture} → {toTexture}
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {/* Texture patterns */}
          {this.createTexturePattern(fromTexture, toTexture, transitionProgress, color, viscosity)}
          
          {/* Texture gradient overlay */}
          {this.createRadialGradient(
            `texture-gradient-${fromTexture}-${toTexture}`,
            color,
            textureIntensity,
            [
              { offset: '0%', opacity: 0.8 },
              { offset: '50%', opacity: 0.6 },
              { offset: '100%', opacity: 0.2 },
            ]
          )}

          {/* Texture transformation shimmer */}
          <linearGradient
            id={`texture-shimmer-${fromTexture}-${toTexture}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
            <stop offset={`${transitionProgress * 100}%`} stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>

          {/* Texture wave distortion */}
          <filter id={`texture-wave-${fromTexture}-${toTexture}`}>
            <feTurbulence
              baseFrequency="0.05"
              numOctaves="3"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={transitionProgress * 2}
            />
          </filter>
        </defs>

        {/* Base texture surface */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={surfaceRadius}
          fill={`url(#texture-pattern-${fromTexture}-${toTexture})`}
          opacity={0.8}
        />

        {/* Texture gradient overlay */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={surfaceRadius}
          fill={`url(#texture-gradient-${fromTexture}-${toTexture})`}
          opacity={0.6}
        />

        {/* Texture transformation shimmer */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={surfaceRadius * 0.8}
          fill={`url(#texture-shimmer-${fromTexture}-${toTexture})`}
          opacity={0.5}
          filter={`url(#texture-wave-${fromTexture}-${toTexture})`}
        />

        {/* Texture particles */}
        {this.renderTextureParticles(vesselCenter, progress, transitionProgress, color, viscosity)}

        {/* Texture transformation waves */}
        {this.renderTextureWaves(vesselCenter, progress, surfaceRadius, color, transitionProgress)}

        {/* Surface tension effects */}
        {this.renderSurfaceTensionEffects(vesselCenter, progress, surfaceRadius, color, viscosity)}

        {/* Texture information */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - surfaceRadius - 25}
          textAnchor="middle"
          className="text-sm font-bold"
          fill={color}
        >
          🎨 {fromTexture} → {toTexture}
        </text>

        {/* Viscosity indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - surfaceRadius - 10}
          textAnchor="middle"
          className="text-xs"
          fill={color}
          opacity={0.8}
        >
          Viscosity: {viscosity} • {Math.round(transitionProgress * 100)}% Complete
        </text>
      </g>
    );
  }

  private createTexturePattern(
    fromTexture: string,
    toTexture: string,
    progress: number,
    color: string,
    viscosity: number
  ): React.ReactElement {
    const patternId = `texture-pattern-${fromTexture}-${toTexture}`;
    const patternSize = 20 + (viscosity * 2);
    
    return (
      <pattern
        id={patternId}
        patternUnits="userSpaceOnUse"
        width={patternSize}
        height={patternSize}
      >
        <rect width={patternSize} height={patternSize} fill={color} opacity="0.1" />
        
        {/* From texture pattern */}
        {this.getTextureElements(fromTexture, patternSize, color, (1 - progress) * 0.8)}
        
        {/* To texture pattern */}
        {this.getTextureElements(toTexture, patternSize, color, progress * 0.8)}
      </pattern>
    );
  }

  private getTextureElements(
    texture: string,
    size: number,
    color: string,
    opacity: number
  ): React.ReactElement[] {
    const elements: React.ReactElement[] = [];
    const half = size / 2;
    const quarter = size / 4;

    switch (texture) {
      case 'smooth':
        elements.push(
          <circle
            key="smooth"
            cx={half}
            cy={half}
            r={quarter}
            fill={color}
            opacity={opacity * 0.3}
          />
        );
        break;

      case 'rough':
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = half + Math.cos(angle) * quarter;
          const y = half + Math.sin(angle) * quarter;
          elements.push(
            <rect
              key={`rough-${i}`}
              x={x - 1}
              y={y - 1}
              width="2"
              height="2"
              fill={color}
              opacity={opacity * 0.6}
            />
          );
        }
        break;

      case 'crystalline':
        elements.push(
          <path
            key="crystalline"
            d={`M${half},${quarter} L${half + quarter},${half} L${half},${half + quarter} L${half - quarter},${half} Z`}
            fill={color}
            opacity={opacity * 0.7}
          />
        );
        break;

      case 'porous':
        for (let i = 0; i < 6; i++) {
          const x = (i % 3) * quarter + quarter / 2;
          const y = Math.floor(i / 3) * quarter + quarter / 2;
          elements.push(
            <circle
              key={`porous-${i}`}
              cx={x}
              cy={y}
              r={2}
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity={opacity * 0.5}
            />
          );
        }
        break;

      case 'fibrous':
        for (let i = 0; i < 4; i++) {
          const y = (i * quarter) + quarter / 2;
          elements.push(
            <line
              key={`fibrous-${i}`}
              x1="0"
              y1={y}
              x2={size}
              y2={y}
              stroke={color}
              strokeWidth="1"
              opacity={opacity * 0.4}
            />
          );
        }
        break;

      case 'granular':
        for (let i = 0; i < 12; i++) {
          const x = (i % 4) * quarter / 2 + quarter / 4;
          const y = Math.floor(i / 4) * quarter / 2 + quarter / 4;
          elements.push(
            <circle
              key={`granular-${i}`}
              cx={x}
              cy={y}
              r={1}
              fill={color}
              opacity={opacity * 0.6}
            />
          );
        }
        break;

      case 'viscous':
        elements.push(
          <path
            key="viscous"
            d={`M0,${half} Q${quarter},${quarter} ${half},${half} Q${half + quarter},${half + quarter} ${size},${half}`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity={opacity * 0.5}
          />
        );
        break;

      default:
        elements.push(
          <rect
            key="default"
            x={quarter}
            y={quarter}
            width={half}
            height={half}
            fill={color}
            opacity={opacity * 0.4}
          />
        );
    }

    return elements;
  }

  private renderTextureParticles(
    vesselCenter: { x: number; y: number },
    progress: number,
    transitionProgress: number,
    color: string,
    viscosity: number
  ): React.ReactElement[] {
    const particles = [];
    const numParticles = Math.floor(8 + viscosity * 2);

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const distance = 20 + transitionProgress * 20;
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y + Math.sin(angle) * distance;
      
      const size = 1 + viscosity * 0.5;
      const opacity = 0.5 + 0.5 * Math.sin(progress * Math.PI * 2 + i);
      
      particles.push(
        <circle
          key={`texture-particle-${i}`}
          cx={x}
          cy={y}
          r={size}
          fill={color}
          opacity={opacity * transitionProgress}
        />
      );
    }

    return particles;
  }

  private renderTextureWaves(
    vesselCenter: { x: number; y: number },
    progress: number,
    radius: number,
    color: string,
    transitionProgress: number
  ): React.ReactElement[] {
    const waves = [];
    const numWaves = 3;

    for (let i = 0; i < numWaves; i++) {
      const waveProgress = (progress * 2 - i * 0.4) % 1;
      const waveRadius = radius * (0.5 + waveProgress * 0.7);
      const waveOpacity = (1 - waveProgress) * 0.4 * transitionProgress;

      if (waveProgress > 0 && waveProgress < 1) {
        waves.push(
          <circle
            key={`texture-wave-${i}`}
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={waveRadius}
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3,2"
            opacity={waveOpacity}
          />
        );
      }
    }

    return waves;
  }

  private renderSurfaceTensionEffects(
    vesselCenter: { x: number; y: number },
    progress: number,
    radius: number,
    color: string,
    viscosity: number
  ): React.ReactElement[] {
    const effects = [];
    const numEffects = Math.floor(viscosity * 2);

    for (let i = 0; i < numEffects; i++) {
      const angle = (i / numEffects) * Math.PI * 2;
      const x = vesselCenter.x + Math.cos(angle) * radius;
      const y = vesselCenter.y + Math.sin(angle) * radius;
      
      const tensionHeight = 5 + Math.sin(progress * Math.PI * 2 + i) * 3;
      const tensionOpacity = 0.4 + 0.3 * Math.sin(progress * Math.PI * 1.5 + i);
      
      effects.push(
        <ellipse
          key={`surface-tension-${i}`}
          cx={x}
          cy={y}
          rx={2}
          ry={tensionHeight}
          fill={color}
          opacity={tensionOpacity}
          transform={`rotate(${angle * 180 / Math.PI} ${x} ${y})`}
        />
      );
    }

    return effects;
  }

  getDuration(effect: TextureChangeEffectType): number {
    // Duration depends on viscosity and texture complexity
    const baseDuration = 4000;
    const viscosityMultiplier = 1 + (effect.viscosity || 1) * 0.2;
    
    return baseDuration * viscosityMultiplier;
  }
}

// Register the effect
EffectRegistry.register('texture_change', TextureChangeEffect);