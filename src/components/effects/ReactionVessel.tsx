import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { EffectsRenderer } from './EffectsRenderer';
import type { VisualEffect } from '@/types/reaction.types';

// Reaction vessel configuration
export interface VesselConfig {
  shape: 'beaker' | 'test-tube' | 'flask' | 'round-bottom' | 'conical';
  size: 'small' | 'medium' | 'large';
  material: 'glass' | 'plastic' | 'metal';
  color: string;
  capacity: number; // in mL
  fillLevel: number; // 0-1
  liquidColor: string;
  bubbling: boolean;
  heating: boolean;
  stirring: boolean;
}

// Attachment points for effects
export interface AttachmentPoint {
  id: string;
  type: 'top' | 'bottom' | 'side' | 'center' | 'rim';
  position: { x: number; y: number };
  radius: number;
  priority: number; // Higher priority points are used first
}

export interface ReactionVesselProps {
  config: VesselConfig;
  effects: VisualEffect[];
  className?: string;
  width?: number;
  height?: number;
  onVesselClick?: () => void;
  onEffectComplete?: (effectId: string) => void;
  // Animation configuration
  animationConfig?: {
    bubbleSpeed?: number;
    stirringSpeed?: number;
    heatingIntensity?: number;
    enableParticles?: boolean;
    enableSteam?: boolean;
    enableGlow?: boolean;
  };
}

export const ReactionVessel: React.FC<ReactionVesselProps> = ({
  config,
  effects,
  className,
  width = 200,
  height = 300,
  onVesselClick,
  onEffectComplete,
  animationConfig = {},
}) => {
  const vesselRef = useRef<SVGSVGElement>(null);
  const [attachmentPoints, setAttachmentPoints] = useState<AttachmentPoint[]>(
    []
  );

  const {
    bubbleSpeed = 1,
    stirringSpeed = 1,
    heatingIntensity = 1,
    enableParticles = true,
    enableSteam = true,
    enableGlow = true,
  } = animationConfig;

  // Calculate vessel dimensions and attachment points
  useEffect(() => {
    const points = calculateAttachmentPoints(config.shape, width, height);
    setAttachmentPoints(points);
  }, [config.shape, width, height]);


  // Generate vessel SVG path based on shape
  const generateVesselPath = (): string => {
    const centerX = width / 2;
    const centerY = height / 2;

    switch (config.shape) {
      case 'beaker':
        return `M ${centerX - 60} ${centerY - 100} 
                L ${centerX - 60} ${centerY + 80} 
                Q ${centerX - 60} ${centerY + 100} ${centerX - 40} ${centerY + 100}
                L ${centerX + 40} ${centerY + 100}
                Q ${centerX + 60} ${centerY + 100} ${centerX + 60} ${centerY + 80}
                L ${centerX + 60} ${centerY - 100}
                Z`;

      case 'test-tube':
        return `M ${centerX - 20} ${centerY - 120}
                L ${centerX - 20} ${centerY + 80}
                Q ${centerX - 20} ${centerY + 120} ${centerX} ${centerY + 120}
                Q ${centerX + 20} ${centerY + 120} ${centerX + 20} ${centerY + 80}
                L ${centerX + 20} ${centerY - 120}
                Z`;

      case 'flask':
        return `M ${centerX - 30} ${centerY - 120}
                L ${centerX - 30} ${centerY - 40}
                L ${centerX - 70} ${centerY + 40}
                Q ${centerX - 80} ${centerY + 100} ${centerX - 20} ${centerY + 100}
                L ${centerX + 20} ${centerY + 100}
                Q ${centerX + 80} ${centerY + 100} ${centerX + 70} ${centerY + 40}
                L ${centerX + 30} ${centerY - 40}
                L ${centerX + 30} ${centerY - 120}
                Z`;

      case 'round-bottom':
        return `M ${centerX - 40} ${centerY - 80}
                L ${centerX - 40} ${centerY + 40}
                Q ${centerX - 40} ${centerY + 100} ${centerX} ${centerY + 100}
                Q ${centerX + 40} ${centerY + 100} ${centerX + 40} ${centerY + 40}
                L ${centerX + 40} ${centerY - 80}
                Z`;

      case 'conical':
        return `M ${centerX - 20} ${centerY - 100}
                L ${centerX - 60} ${centerY + 80}
                Q ${centerX - 60} ${centerY + 100} ${centerX} ${centerY + 100}
                Q ${centerX + 60} ${centerY + 100} ${centerX + 60} ${centerY + 80}
                L ${centerX + 20} ${centerY - 100}
                Z`;

      default:
        return generateVesselPath();
    }
  };

  // Generate liquid path based on vessel shape and fill level
  const generateLiquidPath = (): string => {
    const centerX = width / 2;
    const centerY = height / 2;
    const liquidHeight = config.fillLevel * 180;
    const liquidTop = centerY + 100 - liquidHeight;

    // Add bubbling effect
    const bubbleOffset = config.bubbling
      ? Math.sin(Date.now() * 0.003 * bubbleSpeed) * 3
      : 0;

    switch (config.shape) {
      case 'beaker':
        return `M ${centerX - 60} ${liquidTop + bubbleOffset}
                Q ${centerX} ${liquidTop + bubbleOffset - 5} ${centerX + 60} ${liquidTop + bubbleOffset}
                L ${centerX + 60} ${centerY + 80}
                Q ${centerX + 60} ${centerY + 100} ${centerX + 40} ${centerY + 100}
                L ${centerX - 40} ${centerY + 100}
                Q ${centerX - 60} ${centerY + 100} ${centerX - 60} ${centerY + 80}
                Z`;

      case 'test-tube':
        return `M ${centerX - 20} ${liquidTop + bubbleOffset}
                Q ${centerX} ${liquidTop + bubbleOffset - 2} ${centerX + 20} ${liquidTop + bubbleOffset}
                L ${centerX + 20} ${centerY + 80}
                Q ${centerX + 20} ${centerY + 120} ${centerX} ${centerY + 120}
                Q ${centerX - 20} ${centerY + 120} ${centerX - 20} ${centerY + 80}
                Z`;

      case 'flask':
        const neckWidth = liquidHeight > 80 ? 60 : 30;
        return `M ${centerX - neckWidth} ${liquidTop + bubbleOffset}
                Q ${centerX} ${liquidTop + bubbleOffset - 5} ${centerX + neckWidth} ${liquidTop + bubbleOffset}
                L ${centerX + 70} ${centerY + 40}
                Q ${centerX + 80} ${centerY + 100} ${centerX + 20} ${centerY + 100}
                L ${centerX - 20} ${centerY + 100}
                Q ${centerX - 80} ${centerY + 100} ${centerX - 70} ${centerY + 40}
                Z`;

      default:
        return generateLiquidPath();
    }
  };

  // Generate steam effect
  const generateSteamEffect = (): React.ReactElement[] => {
    if (!enableSteam || !config.heating) return [];

    const steamParticles = Array.from({ length: 5 }, (_, i) => {
      const x = width / 2 + (Math.random() - 0.5) * 40;
      const y = height / 2 - 120 - i * 10;
      const opacity = 0.6 - i * 0.1;

      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2 + i}
          fill="#ffffff"
          opacity={opacity}
          className="animate-pulse"
        />
      );
    });

    return steamParticles;
  };

  // Generate heating glow effect
  const generateHeatingGlow = (): React.ReactElement | null => {
    if (!enableGlow || !config.heating) return null;

    const glowIntensity = heatingIntensity * 0.5;

    return (
      <g>
        <defs>
          <radialGradient id="heating-glow" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity={glowIntensity} />
            <stop
              offset="70%"
              stopColor="#ff8c42"
              stopOpacity={glowIntensity * 0.5}
            />
            <stop offset="100%" stopColor="#ff8c42" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse
          cx={width / 2}
          cy={height / 2 + 120}
          rx={80}
          ry={20}
          fill="url(#heating-glow)"
        />
      </g>
    );
  };

  // Generate stirring effect
  const generateStirringEffect = (): React.ReactElement | null => {
    if (!config.stirring) return null;

    const stirringAngle = Date.now() * 0.002 * stirringSpeed;
    const centerX = width / 2;
    const centerY = height / 2;

    return (
      <g>
        {/* Stirring rod */}
        <line
          x1={centerX}
          y1={centerY - 130}
          x2={centerX + Math.cos(stirringAngle) * 15}
          y2={centerY + Math.sin(stirringAngle) * 15}
          stroke="#cccccc"
          strokeWidth="2"
        />

        {/* Vortex effect */}
        <circle
          cx={centerX}
          cy={centerY}
          r={20}
          fill="none"
          stroke={config.liquidColor}
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity={0.3}
          transform={`rotate(${(stirringAngle * 180) / Math.PI} ${centerX} ${centerY})`}
        />
      </g>
    );
  };

  // Get primary attachment point for effects
  const getPrimaryAttachmentPoint = (): { x: number; y: number } => {
    const centerPoint = attachmentPoints.find(p => p.type === 'center') ||
      attachmentPoints[0] || { position: { x: width / 2, y: height / 2 } };

    return centerPoint.position;
  };

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={vesselRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="cursor-pointer"
        onClick={onVesselClick}
      >
        {/* Heating glow effect */}
        {generateHeatingGlow()}

        {/* Vessel outline */}
        <path
          d={generateVesselPath()}
          fill="none"
          stroke={config.color}
          strokeWidth="3"
          opacity={0.8}
        />

        {/* Liquid */}
        {config.fillLevel > 0 && (
          <path
            d={generateLiquidPath()}
            fill={config.liquidColor}
            opacity={0.7}
          />
        )}

        {/* Bubbles */}
        {config.bubbling && enableParticles && (
          <g>
            {Array.from({ length: 6 }, (_, i) => {
              const bubbleX = width / 2 + (Math.random() - 0.5) * 60;
              const bubbleY = height / 2 + 50 + Math.random() * 40;
              const bubbleSize = 1 + Math.random() * 3;

              return (
                <circle
                  key={i}
                  cx={bubbleX}
                  cy={bubbleY}
                  r={bubbleSize}
                  fill="#ffffff"
                  opacity={0.6}
                  className="animate-bounce"
                  style={{
                    animationDuration: `${1 + Math.random()}s`,
                    animationDelay: `${Math.random()}s`,
                  }}
                />
              );
            })}
          </g>
        )}

        {/* Steam effect */}
        {generateSteamEffect()}

        {/* Stirring effect */}
        {generateStirringEffect()}

        {/* Vessel label */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-xs fill-gray-600"
        >
          {config.shape.charAt(0).toUpperCase() +
            config.shape.slice(1).replace('-', ' ')}
        </text>

        {/* Capacity indicator */}
        <text
          x={width - 10}
          y={20}
          textAnchor="end"
          className="text-xs fill-gray-500"
        >
          {Math.round(config.fillLevel * config.capacity)}mL
        </text>
      </svg>

      {/* Visual effects overlay */}
      <EffectsRenderer
        effects={effects}
        containerSize={{ width, height }}
        vesselCenter={getPrimaryAttachmentPoint()}
        onEffectComplete={onEffectComplete}
        className="absolute inset-0"
      />
    </div>
  );
};

// Helper function to calculate attachment points based on vessel shape
function calculateAttachmentPoints(
  shape: VesselConfig['shape'],
  width: number,
  height: number
): AttachmentPoint[] {
  const centerX = width / 2;
  const centerY = height / 2;

  const basePoints: AttachmentPoint[] = [
    {
      id: 'center',
      type: 'center',
      position: { x: centerX, y: centerY },
      radius: 30,
      priority: 100,
    },
    {
      id: 'top',
      type: 'top',
      position: { x: centerX, y: centerY - 100 },
      radius: 20,
      priority: 90,
    },
    {
      id: 'bottom',
      type: 'bottom',
      position: { x: centerX, y: centerY + 100 },
      radius: 25,
      priority: 80,
    },
  ];

  switch (shape) {
    case 'beaker':
      return [
        ...basePoints,
        {
          id: 'rim',
          type: 'rim',
          position: { x: centerX, y: centerY - 100 },
          radius: 60,
          priority: 95,
        },
        {
          id: 'left-side',
          type: 'side',
          position: { x: centerX - 60, y: centerY },
          radius: 15,
          priority: 70,
        },
        {
          id: 'right-side',
          type: 'side',
          position: { x: centerX + 60, y: centerY },
          radius: 15,
          priority: 70,
        },
      ];

    case 'test-tube':
      return [
        ...basePoints,
        {
          id: 'mouth',
          type: 'top',
          position: { x: centerX, y: centerY - 120 },
          radius: 20,
          priority: 95,
        },
      ];

    case 'flask':
      return [
        ...basePoints,
        {
          id: 'neck',
          type: 'top',
          position: { x: centerX, y: centerY - 80 },
          radius: 15,
          priority: 95,
        },
        {
          id: 'bulb-left',
          type: 'side',
          position: { x: centerX - 70, y: centerY + 40 },
          radius: 20,
          priority: 75,
        },
        {
          id: 'bulb-right',
          type: 'side',
          position: { x: centerX + 70, y: centerY + 40 },
          radius: 20,
          priority: 75,
        },
      ];

    default:
      return basePoints;
  }
}

// Preset vessel configurations
export const VesselPresets = {
  standardBeaker: {
    shape: 'beaker' as const,
    size: 'medium' as const,
    material: 'glass' as const,
    color: '#4a90e2',
    capacity: 250,
    fillLevel: 0.6,
    liquidColor: '#87ceeb',
    bubbling: false,
    heating: false,
    stirring: false,
  },

  testTube: {
    shape: 'test-tube' as const,
    size: 'small' as const,
    material: 'glass' as const,
    color: '#4a90e2',
    capacity: 50,
    fillLevel: 0.4,
    liquidColor: '#98fb98',
    bubbling: true,
    heating: false,
    stirring: false,
  },

  reactionFlask: {
    shape: 'flask' as const,
    size: 'large' as const,
    material: 'glass' as const,
    color: '#4a90e2',
    capacity: 500,
    fillLevel: 0.7,
    liquidColor: '#ffa500',
    bubbling: true,
    heating: true,
    stirring: true,
  },
} as const;
