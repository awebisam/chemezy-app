import React from 'react';
import { BaseEffect, EffectRegistry, EffectAnimations } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { VolumeChangeEffect as VolumeChangeEffectType } from '@/types/reaction.types';

export class VolumeChangeEffect extends BaseEffect<VolumeChangeEffectType> {
  render(
    props: BaseEffectProps<VolumeChangeEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    const volumeFactor = effect.factor;
    const isExpansion = volumeFactor > 1;
    const isContraction = volumeFactor < 1;

    // Calculate scaling progress with easing
    const scalingProgress = EffectAnimations.easeInOut(progress);
    const currentScale = 1 + (volumeFactor - 1) * scalingProgress;

    // Visual properties
    const baseRadius = 30;
    const currentRadius = baseRadius * currentScale;
    const maxRadius = baseRadius * Math.max(volumeFactor, 1);

    // Color based on volume change
    const volumeColor = isExpansion ? '#FF6B35' : '#3B82F6';
    const intensity = Math.abs(volumeFactor - 1);

    // Animation properties
    const pulseIntensity = EffectAnimations.pulse(progress, intensity);
    const waveIntensity = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7;

    if (reduceMotion) {
      return (
        <g>
          <defs>
            {this.createRadialGradient(
              `volume-static-${Math.round(volumeFactor * 100)}`,
              volumeColor,
              0.7,
              [
                { offset: '0%', opacity: 0.8 },
                { offset: '50%', opacity: 0.5 },
                { offset: '100%', opacity: 0.1 },
              ]
            )}
          </defs>

          {/* Static volume indicator */}
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={currentRadius}
            fill={`url(#volume-static-${Math.round(volumeFactor * 100)})`}
            stroke={volumeColor}
            strokeWidth="2"
            strokeDasharray="4,2"
          />

          {/* Volume label */}
          <text
            x={vesselCenter.x}
            y={vesselCenter.y - currentRadius - 15}
            textAnchor="middle"
            className="text-sm font-semibold"
            fill={volumeColor}
          >
            {isExpansion ? '📈' : '📉'} {Math.round(volumeFactor * 100)}%
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {/* Volume gradient */}
          {this.createRadialGradient(
            `volume-gradient-${Math.round(volumeFactor * 100)}`,
            volumeColor,
            0.8,
            [
              { offset: '0%', opacity: 0.9 },
              { offset: '40%', opacity: 0.6 },
              { offset: '80%', opacity: 0.3 },
              { offset: '100%', opacity: 0.05 },
            ]
          )}

          {/* Expansion waves gradient */}
          {this.createRadialGradient(
            `expansion-waves-${Math.round(volumeFactor * 100)}`,
            volumeColor,
            0.4,
            [
              { offset: '0%', opacity: 0 },
              { offset: '50%', opacity: 0.6 },
              { offset: '100%', opacity: 0 },
            ]
          )}

          {/* Compression pattern */}
          {isContraction && (
            <pattern
              id={`compression-pattern-${Math.round(volumeFactor * 100)}`}
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
            >
              <rect width="8" height="8" fill={volumeColor} opacity="0.1" />
              <path
                d="M0,4 L8,4 M4,0 L4,8"
                stroke={volumeColor}
                strokeWidth="1"
                opacity="0.4"
              />
              <path
                d="M2,2 L6,6 M6,2 L2,6"
                stroke={volumeColor}
                strokeWidth="0.5"
                opacity="0.6"
              />
            </pattern>
          )}

          {/* Expansion ripple effect */}
          {isExpansion && (
            <filter id={`expansion-ripple-${Math.round(volumeFactor * 100)}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Main volume visualization */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={currentRadius}
          fill={`url(#volume-gradient-${Math.round(volumeFactor * 100)})`}
          opacity={0.8}
          filter={
            isExpansion
              ? `url(#expansion-ripple-${Math.round(volumeFactor * 100)})`
              : undefined
          }
        />

        {/* Compression pattern overlay */}
        {isContraction && (
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={currentRadius}
            fill={`url(#compression-pattern-${Math.round(volumeFactor * 100)})`}
            opacity={0.6}
          />
        )}

        {/* Volume change waves */}
        {isExpansion &&
          this.renderExpansionWaves(
            vesselCenter,
            progress,
            maxRadius,
            volumeColor,
            pulseIntensity
          )}
        {isContraction &&
          this.renderContractionWaves(
            vesselCenter,
            progress,
            baseRadius,
            volumeColor,
            waveIntensity
          )}

        {/* Volume indicator particles */}
        {this.renderVolumeParticles(
          vesselCenter,
          progress,
          currentScale,
          volumeColor,
          isExpansion
        )}

        {/* Scale reference circle */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={baseRadius}
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity={0.4}
        />

        {/* Volume change indicators */}
        {isExpansion &&
          this.renderExpansionIndicators(
            vesselCenter,
            currentRadius,
            volumeColor,
            scalingProgress
          )}
        {isContraction &&
          this.renderContractionIndicators(
            vesselCenter,
            currentRadius,
            volumeColor,
            scalingProgress
          )}

        {/* Volume factor display */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - currentRadius - 25}
          textAnchor="middle"
          className="text-lg font-bold"
          fill={volumeColor}
        >
          {isExpansion ? '📈' : '📉'} {Math.round(volumeFactor * 100)}%
        </text>

        {/* Change type display */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - currentRadius - 5}
          textAnchor="middle"
          className="text-xs"
          fill={volumeColor}
          opacity={0.8}
        >
          {isExpansion ? 'Expansion' : 'Contraction'}
        </text>

        {/* Progress indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y + currentRadius + 20}
          textAnchor="middle"
          className="text-xs"
          fill={volumeColor}
          opacity={0.6}
        >
          {Math.round(scalingProgress * 100)}% Complete
        </text>
      </g>
    );
  }

  private renderExpansionWaves(
    vesselCenter: { x: number; y: number },
    progress: number,
    maxRadius: number,
    color: string,
    pulseIntensity: number
  ): React.ReactElement[] {
    const waves = [];
    const numWaves = 4;

    for (let i = 0; i < numWaves; i++) {
      const waveProgress = (progress * 2 - i * 0.3) % 1;
      const radius = maxRadius * waveProgress;
      const opacity = (1 - waveProgress) * 0.6 * pulseIntensity;

      if (waveProgress > 0 && waveProgress < 1) {
        waves.push(
          <circle
            key={`expansion-wave-${i}`}
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity={opacity}
          />
        );
      }
    }

    return waves;
  }

  private renderContractionWaves(
    vesselCenter: { x: number; y: number },
    progress: number,
    baseRadius: number,
    color: string,
    waveIntensity: number
  ): React.ReactElement[] {
    const waves = [];
    const numWaves = 6;

    for (let i = 0; i < numWaves; i++) {
      const angle = (i / numWaves) * Math.PI * 2;
      const distance = baseRadius * (1 - progress * 0.3);
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y + Math.sin(angle) * distance;

      waves.push(
        <g key={`contraction-wave-${i}`}>
          <line
            x1={vesselCenter.x}
            y1={vesselCenter.y}
            x2={x}
            y2={y}
            stroke={color}
            strokeWidth="1"
            opacity={waveIntensity * 0.4}
          />
          <circle
            cx={x}
            cy={y}
            r={2}
            fill={color}
            opacity={waveIntensity * 0.6}
          />
        </g>
      );
    }

    return waves;
  }

  private renderVolumeParticles(
    vesselCenter: { x: number; y: number },
    progress: number,
    scale: number,
    color: string,
    isExpansion: boolean
  ): React.ReactElement[] {
    const particles = [];
    const numParticles = 12;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const baseDistance = 25;
      const distance = baseDistance * scale;
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y + Math.sin(angle) * distance;

      const size = isExpansion ? 1 + scale * 2 : 3 - scale * 1.5;
      const opacity = 0.6 + 0.4 * Math.sin(progress * Math.PI * 2 + i);

      particles.push(
        <circle
          key={`volume-particle-${i}`}
          cx={x}
          cy={y}
          r={Math.max(0.5, size)}
          fill={color}
          opacity={opacity}
        />
      );
    }

    return particles;
  }

  private renderExpansionIndicators(
    vesselCenter: { x: number; y: number },
    radius: number,
    color: string,
    progress: number
  ): React.ReactElement[] {
    const indicators = [];
    const numIndicators = 8;

    for (let i = 0; i < numIndicators; i++) {
      const angle = (i / numIndicators) * Math.PI * 2;
      const x = vesselCenter.x + Math.cos(angle) * radius;
      const y = vesselCenter.y + Math.sin(angle) * radius;

      const arrowLength = 8 + progress * 4;
      const arrowX = x + Math.cos(angle) * arrowLength;
      const arrowY = y + Math.sin(angle) * arrowLength;

      indicators.push(
        <g key={`expansion-indicator-${i}`}>
          <line
            x1={x}
            y1={y}
            x2={arrowX}
            y2={arrowY}
            stroke={color}
            strokeWidth="2"
            opacity={0.7}
          />
          <polygon
            points={`${arrowX},${arrowY} ${arrowX - 3},${arrowY - 2} ${arrowX - 3},${arrowY + 2}`}
            fill={color}
            opacity={0.7}
            transform={`rotate(${(angle * 180) / Math.PI} ${arrowX} ${arrowY})`}
          />
        </g>
      );
    }

    return indicators;
  }

  private renderContractionIndicators(
    vesselCenter: { x: number; y: number },
    radius: number,
    color: string,
    progress: number
  ): React.ReactElement[] {
    const indicators = [];
    const numIndicators = 6;

    for (let i = 0; i < numIndicators; i++) {
      const angle = (i / numIndicators) * Math.PI * 2;
      const x = vesselCenter.x + Math.cos(angle) * (radius + 10);
      const y = vesselCenter.y + Math.sin(angle) * (radius + 10);

      const arrowLength = 8 + progress * 4;
      const arrowX = x - Math.cos(angle) * arrowLength;
      const arrowY = y - Math.sin(angle) * arrowLength;

      indicators.push(
        <g key={`contraction-indicator-${i}`}>
          <line
            x1={x}
            y1={y}
            x2={arrowX}
            y2={arrowY}
            stroke={color}
            strokeWidth="2"
            opacity={0.7}
          />
          <polygon
            points={`${arrowX},${arrowY} ${arrowX + 3},${arrowY - 2} ${arrowX + 3},${arrowY + 2}`}
            fill={color}
            opacity={0.7}
            transform={`rotate(${((angle + Math.PI) * 180) / Math.PI} ${arrowX} ${arrowY})`}
          />
        </g>
      );
    }

    return indicators;
  }

  getDuration(_effect: VolumeChangeEffectType): number {
    return 4000; // 4 seconds for volume change
  }
}

// Register the effect
EffectRegistry.register('volume_change', VolumeChangeEffect);
