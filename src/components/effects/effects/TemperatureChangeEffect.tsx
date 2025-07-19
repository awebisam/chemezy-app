import React from 'react';
import { BaseEffect, EffectRegistry, EffectAnimations } from '../BaseEffect';
import type { BaseEffectProps } from '../BaseEffect';
import type { TemperatureChangeEffect as TemperatureChangeEffectType } from '@/types/reaction.types';

export class TemperatureChangeEffect extends BaseEffect<TemperatureChangeEffectType> {
  render(
    props: BaseEffectProps<TemperatureChangeEffectType>
  ): React.ReactElement | null {
    const { effect, config } = props;
    const { vesselCenter, reduceMotion, progress } = config;

    const temperature = effect.delta_celsius;
    const isHeating = temperature > 0;
    const isCooling = temperature < 0;
    const isExtreme = Math.abs(temperature) > 100;

    // Color mapping based on temperature
    const getTemperatureColor = (temp: number): string => {
      if (temp > 200) return '#FF0000'; // Extreme heat - red
      if (temp > 100) return '#FF6600'; // High heat - orange
      if (temp > 50) return '#FFB300'; // Medium heat - yellow-orange
      if (temp > 0) return '#FFD700'; // Low heat - yellow
      if (temp > -50) return '#87CEEB'; // Mild cold - light blue
      if (temp > -100) return '#4682B4'; // Cold - blue
      return '#0000FF'; // Extreme cold - deep blue
    };

    // Intensity calculation
    const intensity = Math.min(Math.abs(temperature) / 200, 1);
    const pulseIntensity = EffectAnimations.pulse(progress, intensity);
    const color = getTemperatureColor(temperature);

    // Thermometer dimensions
    const thermometerHeight = 100;
    const thermometerWidth = 20;
    const bulbRadius = 15;
    const thermometerX = vesselCenter.x + 80;
    const thermometerY = vesselCenter.y - thermometerHeight / 2;

    // Temperature fill calculation
    const normalizedTemp = Math.max(-100, Math.min(300, temperature));
    const fillPercentage = (normalizedTemp + 100) / 400; // Map -100 to 300 to 0-1
    const fillHeight = fillPercentage * thermometerHeight;

    if (reduceMotion) {
      return (
        <g>
          <defs>
            {this.createRadialGradient(
              `temp-static-${Math.abs(temperature)}`,
              color,
              intensity,
              [
                { offset: '0%', opacity: 0.8 },
                { offset: '50%', opacity: 0.4 },
                { offset: '100%', opacity: 0 },
              ]
            )}
          </defs>

          {/* Static temperature indicator */}
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={30 + intensity * 20}
            fill={`url(#temp-static-${Math.abs(temperature)})`}
            stroke={color}
            strokeWidth="2"
            strokeDasharray="4,2"
          />

          {/* Temperature label */}
          <text
            x={vesselCenter.x}
            y={vesselCenter.y - 60}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {isHeating ? '🔥' : '❄️'} {temperature > 0 ? '+' : ''}
            {temperature}°C
          </text>
        </g>
      );
    }

    return (
      <g>
        <defs>
          {/* Temperature gradient */}
          {this.createRadialGradient(
            `temp-gradient-${Math.abs(temperature)}`,
            color,
            intensity,
            [
              { offset: '0%', opacity: 0.9 },
              { offset: '30%', opacity: 0.7 },
              { offset: '60%', opacity: 0.4 },
              { offset: '100%', opacity: 0 },
            ]
          )}

          {/* Thermometer gradient */}
          <linearGradient
            id={`thermometer-fill-${Math.abs(temperature)}`}
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop
              offset={`${fillPercentage * 100}%`}
              stopColor={color}
              stopOpacity="0.8"
            />
            <stop
              offset={`${fillPercentage * 100}%`}
              stopColor="#E5E7EB"
              stopOpacity="0.3"
            />
            <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0.1" />
          </linearGradient>

          {/* Heat waves filter */}
          {isHeating && (
            <filter id={`heat-waves-${Math.abs(temperature)}`}>
              <feTurbulence
                baseFrequency="0.02"
                numOctaves="3"
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale={intensity * 5}
              />
            </filter>
          )}

          {/* Frost pattern */}
          {isCooling && (
            <pattern
              id={`frost-pattern-${Math.abs(temperature)}`}
              patternUnits="userSpaceOnUse"
              width="10"
              height="10"
            >
              <rect width="10" height="10" fill={color} opacity="0.1" />
              <path
                d="M5,0 L5,10 M0,5 L10,5 M2,2 L8,8 M8,2 L2,8"
                stroke={color}
                strokeWidth="0.5"
                opacity="0.6"
              />
            </pattern>
          )}
        </defs>

        {/* Main temperature effect */}
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={25 + intensity * 40 * pulseIntensity}
          fill={`url(#temp-gradient-${Math.abs(temperature)})`}
          filter={
            isHeating ? `url(#heat-waves-${Math.abs(temperature)})` : undefined
          }
        />

        {/* Frost overlay for cooling */}
        {isCooling && (
          <circle
            cx={vesselCenter.x}
            cy={vesselCenter.y}
            r={25 + intensity * 40}
            fill={`url(#frost-pattern-${Math.abs(temperature)})`}
            opacity={intensity * 0.6}
          />
        )}

        {/* Temperature particles */}
        {isHeating &&
          this.renderHeatParticles(vesselCenter, progress, intensity, color)}
        {isCooling &&
          this.renderColdParticles(vesselCenter, progress, intensity, color)}

        {/* Thermometer visualization */}
        <g>
          {/* Thermometer body */}
          <rect
            x={thermometerX - thermometerWidth / 2}
            y={thermometerY}
            width={thermometerWidth}
            height={thermometerHeight}
            fill="#F3F4F6"
            stroke="#9CA3AF"
            strokeWidth="2"
            rx="10"
          />

          {/* Temperature fill */}
          <rect
            x={thermometerX - thermometerWidth / 2 + 2}
            y={thermometerY + thermometerHeight - fillHeight}
            width={thermometerWidth - 4}
            height={fillHeight}
            fill={`url(#thermometer-fill-${Math.abs(temperature)})`}
            rx="8"
          />

          {/* Thermometer bulb */}
          <circle
            cx={thermometerX}
            cy={thermometerY + thermometerHeight + bulbRadius}
            r={bulbRadius}
            fill={color}
            stroke="#9CA3AF"
            strokeWidth="2"
            opacity={0.8}
          />

          {/* Temperature scale marks */}
          {Array.from({ length: 5 }, (_, i) => {
            const markY = thermometerY + (i * thermometerHeight) / 4;
            const tempValue = 300 - i * 100;
            return (
              <g key={i}>
                <line
                  x1={thermometerX + thermometerWidth / 2}
                  y1={markY}
                  x2={thermometerX + thermometerWidth / 2 + 5}
                  y2={markY}
                  stroke="#6B7280"
                  strokeWidth="1"
                />
                <text
                  x={thermometerX + thermometerWidth / 2 + 8}
                  y={markY + 3}
                  className="text-xs fill-gray-600"
                  fontSize="10"
                >
                  {tempValue}°
                </text>
              </g>
            );
          })}
        </g>

        {/* Extreme temperature warning */}
        {isExtreme && (
          <g>
            <circle
              cx={vesselCenter.x}
              cy={vesselCenter.y}
              r={60 + Math.sin(progress * Math.PI * 6) * 10}
              fill="none"
              stroke={isHeating ? '#FF0000' : '#0000FF'}
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity={0.8}
            />
            <text
              x={vesselCenter.x}
              y={vesselCenter.y - 80}
              textAnchor="middle"
              className="text-sm font-bold fill-red-600"
            >
              ⚠️ EXTREME TEMPERATURE
            </text>
          </g>
        )}

        {/* Temperature display */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - 60}
          textAnchor="middle"
          className="text-lg font-bold"
          fill={color}
        >
          {temperature > 0 ? '+' : ''}
          {temperature}°C
        </text>

        {/* Temperature change indicator */}
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - 40}
          textAnchor="middle"
          className="text-xs fill-gray-600"
        >
          {isHeating ? '🔥 Heating' : '❄️ Cooling'}
        </text>
      </g>
    );
  }

  private renderHeatParticles(
    vesselCenter: { x: number; y: number },
    progress: number,
    intensity: number,
    color: string
  ): React.ReactElement[] {
    const particles = [];
    const numParticles = Math.floor(intensity * 12);

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const distance = 30 + Math.sin(progress * Math.PI * 2 + i) * 20;
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y + Math.sin(angle) * distance - progress * 40;
      const size = 2 + Math.sin(progress * Math.PI * 3 + i) * 2;
      const opacity =
        intensity * (0.5 + 0.5 * Math.sin(progress * Math.PI * 4 + i));

      particles.push(
        <circle
          key={`heat-${i}`}
          cx={x}
          cy={y}
          r={size}
          fill={color}
          opacity={opacity}
          className="animate-pulse"
        />
      );
    }

    return particles;
  }

  private renderColdParticles(
    vesselCenter: { x: number; y: number },
    progress: number,
    intensity: number,
    color: string
  ): React.ReactElement[] {
    const particles = [];
    const numParticles = Math.floor(intensity * 8);

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const distance = 25 + Math.sin(progress * Math.PI + i) * 15;
      const x = vesselCenter.x + Math.cos(angle) * distance;
      const y = vesselCenter.y + Math.sin(angle) * distance + progress * 20;
      const size = 1 + Math.sin(progress * Math.PI * 2 + i) * 1.5;
      const opacity =
        intensity * (0.6 + 0.4 * Math.sin(progress * Math.PI * 3 + i));

      // Ice crystal shape
      particles.push(
        <g key={`cold-${i}`}>
          <circle cx={x} cy={y} r={size} fill={color} opacity={opacity} />
          <path
            d={`M${x - size},${y} L${x + size},${y} M${x},${y - size} L${x},${y + size} M${x - size * 0.7},${y - size * 0.7} L${x + size * 0.7},${y + size * 0.7} M${x + size * 0.7},${y - size * 0.7} L${x - size * 0.7},${y + size * 0.7}`}
            stroke={color}
            strokeWidth="0.5"
            opacity={opacity * 0.8}
          />
        </g>
      );
    }

    return particles;
  }

  getDuration(_effect: TemperatureChangeEffectType): number {
    return 5000; // 5 seconds for temperature change visualization
  }
}

// Register the effect
EffectRegistry.register('temperature_change', TemperatureChangeEffect);
