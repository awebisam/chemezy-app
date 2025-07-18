import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { VisualEffect } from '@/types/reaction.types';

// Effect pool for performance optimization
interface EffectInstance {
  id: string;
  effect: VisualEffect;
  startTime: number;
  duration: number;
  isActive: boolean;
  cleanup?: () => void;
}

export interface EffectsRendererProps {
  effects: VisualEffect[];
  containerSize: { width: number; height: number };
  onEffectComplete?: (effectId: string) => void;
  className?: string;
  // Reaction vessel attachment point
  vesselCenter?: { x: number; y: number };
  // Accessibility
  reduceMotion?: boolean;
}

export const EffectsRenderer: React.FC<EffectsRendererProps> = ({
  effects,
  containerSize,
  onEffectComplete,
  className,
  vesselCenter = { x: containerSize.width / 2, y: containerSize.height / 2 },
  reduceMotion = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeEffects, setActiveEffects] = useState<EffectInstance[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const effectIdCounter = useRef(0);

  // Generate unique effect ID
  const generateEffectId = useCallback(() => {
    return `effect-${Date.now()}-${++effectIdCounter.current}`;
  }, []);

  // Create effect instance from visual effect
  const createEffectInstance = useCallback(
    (effect: VisualEffect): EffectInstance => {
      const id = generateEffectId();
      const duration = getDurationFromEffect(effect);

      return {
        id,
        effect,
        startTime: Date.now(),
        duration,
        isActive: true,
      };
    },
    [generateEffectId]
  );

  // Get duration from effect properties
  const getDurationFromEffect = (effect: VisualEffect): number => {
    switch (effect.effect_type) {
      case 'gas_production':
      case 'light_emission':
        return effect.duration * 1000; // Convert to milliseconds
      case 'foam_production':
        return effect.stability * 1000;
      case 'temperature_change':
        return 3000; // 3 seconds default
      case 'state_change':
        return 2000; // 2 seconds default
      case 'volume_change':
        return 1500; // 1.5 seconds default
      case 'spill':
        return 4000; // 4 seconds default
      case 'texture_change':
        return 2500; // 2.5 seconds default
      default:
        return 3000; // 3 seconds default
    }
  };

  // Animation loop for managing effect lifecycles
  const animationLoop = useCallback(() => {
    const currentTime = Date.now();

    setActiveEffects(prev => {
      const updated = prev.map(instance => {
        const elapsed = currentTime - instance.startTime;
        const progress = Math.min(elapsed / instance.duration, 1);

        if (progress >= 1 && instance.isActive) {
          // Effect completed
          if (instance.cleanup) {
            instance.cleanup();
          }
          if (onEffectComplete) {
            onEffectComplete(instance.id);
          }
          return { ...instance, isActive: false };
        }

        return instance;
      });

      // Remove inactive effects
      return updated.filter(instance => instance.isActive);
    });

    // Continue animation loop if there are active effects
    if (activeEffects.some(instance => instance.isActive)) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [activeEffects, onEffectComplete]);

  // Start new effects when effects prop changes
  useEffect(() => {
    if (effects.length === 0) return;

    const newInstances = effects.map(createEffectInstance);
    setActiveEffects(prev => [...prev, ...newInstances]);

    // Start animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animationLoop);
  }, [effects, createEffectInstance, animationLoop]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Cleanup all active effects
      activeEffects.forEach(instance => {
        if (instance.cleanup) {
          instance.cleanup();
        }
      });
    };
  }, [activeEffects]);

  // Check for reduced motion preference
  const shouldReduceMotion =
    reduceMotion ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <svg
        ref={svgRef}
        width={containerSize.width}
        height={containerSize.height}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* Render active effects */}
        {activeEffects.map(instance => (
          <EffectRenderer
            key={instance.id}
            instance={instance}
            vesselCenter={vesselCenter}
            containerSize={containerSize}
            reduceMotion={shouldReduceMotion}
          />
        ))}
      </svg>
    </div>
  );
};

// Individual effect renderer component
interface EffectRendererProps {
  instance: EffectInstance;
  vesselCenter: { x: number; y: number };
  containerSize: { width: number; height: number };
  reduceMotion: boolean;
}

const EffectRenderer: React.FC<EffectRendererProps> = ({
  instance,
  vesselCenter,
  containerSize,
  reduceMotion,
}) => {
  const { effect, startTime, duration } = instance;
  const currentTime = Date.now();
  const progress = Math.min((currentTime - startTime) / duration, 1);

  switch (effect.effect_type) {
    case 'gas_production':
      return (
        <GasProductionRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    case 'light_emission':
      return (
        <LightEmissionRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    case 'temperature_change':
      return (
        <TemperatureChangeRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    case 'foam_production':
      return (
        <FoamProductionRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    case 'state_change':
      return (
        <StateChangeRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    case 'volume_change':
      return (
        <VolumeChangeRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    case 'spill':
      return (
        <SpillRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    case 'texture_change':
      return (
        <TextureChangeRenderer
          effect={effect}
          progress={progress}
          vesselCenter={vesselCenter}
          containerSize={containerSize}
          reduceMotion={reduceMotion}
        />
      );
    default:
      return null;
  }
};

// Base props for all effect renderers
interface BaseEffectRendererProps {
  progress: number;
  vesselCenter: { x: number; y: number };
  containerSize: { width: number; height: number };
  reduceMotion: boolean;
}

// Gas Production Effect Renderer
interface GasProductionRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').GasProductionEffect;
}

const GasProductionRenderer: React.FC<GasProductionRendererProps> = ({
  effect,
  progress,
  vesselCenter,
  reduceMotion,
}) => {
  const numParticles = Math.floor(effect.intensity * 12); // 0-12 particles based on intensity
  const particles = Array.from({ length: numParticles }, (_, i) => {
    const angle = (i / numParticles) * Math.PI * 2;
    const baseRadius = 20;
    const expandedRadius = baseRadius + progress * 80;
    const x = vesselCenter.x + Math.cos(angle) * expandedRadius;
    const y =
      vesselCenter.y + Math.sin(angle) * expandedRadius - progress * 100;
    const opacity = Math.max(0, 1 - progress * 1.5);
    const size = 4 + progress * 6;

    return { x, y, opacity, size, key: i };
  });

  if (reduceMotion) {
    return (
      <g>
        <circle
          cx={vesselCenter.x}
          cy={vesselCenter.y}
          r={20 + progress * 30}
          fill={effect.color}
          opacity={0.3}
        />
        <text
          x={vesselCenter.x}
          y={vesselCenter.y - 40}
          textAnchor="middle"
          className="text-xs fill-gray-600"
        >
          {effect.gas_type} Gas
        </text>
      </g>
    );
  }

  return (
    <g>
      {particles.map(particle => (
        <circle
          key={particle.key}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          fill={effect.color}
          opacity={particle.opacity}
        />
      ))}
    </g>
  );
};

// Light Emission Effect Renderer
interface LightEmissionRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').LightEmissionEffect;
}

const LightEmissionRenderer: React.FC<LightEmissionRendererProps> = ({
  effect,
  progress,
  vesselCenter,
  reduceMotion,
}) => {
  const maxRadius = effect.radius * 20; // Scale radius for visualization
  const currentRadius =
    maxRadius *
    (reduceMotion ? 1 : 0.5 + 0.5 * Math.sin(progress * Math.PI * 4));
  const opacity =
    effect.intensity *
    (reduceMotion ? 0.6 : 0.3 + 0.3 * Math.sin(progress * Math.PI * 6));

  return (
    <g>
      <defs>
        <radialGradient
          id={`light-gradient-${effect.color}`}
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop offset="0%" stopColor={effect.color} stopOpacity={opacity} />
          <stop
            offset="70%"
            stopColor={effect.color}
            stopOpacity={opacity * 0.5}
          />
          <stop offset="100%" stopColor={effect.color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle
        cx={vesselCenter.x}
        cy={vesselCenter.y}
        r={currentRadius}
        fill={`url(#light-gradient-${effect.color})`}
      />
    </g>
  );
};

// Temperature Change Effect Renderer
interface TemperatureChangeRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').TemperatureChangeEffect;
}

const TemperatureChangeRenderer: React.FC<TemperatureChangeRendererProps> = ({
  effect,
  progress,
  vesselCenter,
  reduceMotion,
}) => {
  const isHeating = effect.delta_celsius > 0;
  const color = isHeating ? '#ff4444' : '#4444ff';
  const intensity = Math.abs(effect.delta_celsius) / 100; // Normalize to 0-1 range
  const waveAmplitude = reduceMotion ? 0 : intensity * 10;
  const waveFreq = reduceMotion ? 0 : 4;

  return (
    <g>
      {/* Temperature waves */}
      {!reduceMotion && (
        <>
          {Array.from({ length: 3 }, (_, i) => {
            const waveY =
              vesselCenter.y +
              Math.sin(progress * Math.PI * waveFreq + i * 0.5) * waveAmplitude;
            return (
              <ellipse
                key={i}
                cx={vesselCenter.x}
                cy={waveY}
                rx={30 + i * 10}
                ry={8}
                fill={color}
                opacity={0.3 * (1 - progress) * intensity}
              />
            );
          })}
        </>
      )}

      {/* Temperature indicator */}
      <circle
        cx={vesselCenter.x}
        cy={vesselCenter.y}
        r={25}
        fill={color}
        opacity={reduceMotion ? 0.3 : 0.1 + intensity * 0.2}
      />

      {/* Temperature text */}
      <text
        x={vesselCenter.x}
        y={vesselCenter.y - 35}
        textAnchor="middle"
        className="text-xs fill-gray-600"
      >
        {isHeating ? '🔥' : '❄️'} {Math.abs(effect.delta_celsius)}°C
      </text>
    </g>
  );
};

// Foam Production Effect Renderer
interface FoamProductionRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').FoamProductionEffect;
}

const FoamProductionRenderer: React.FC<FoamProductionRendererProps> = ({
  effect,
  progress,
  vesselCenter,
  reduceMotion,
}) => {
  const bubbleSize =
    effect.bubble_size === 'small'
      ? 3
      : effect.bubble_size === 'medium'
        ? 5
        : 7;
  const numBubbles = Math.floor(effect.density * 20);

  const bubbles = Array.from({ length: numBubbles }, (_, i) => {
    const angle = (i / numBubbles) * Math.PI * 2;
    const distance = (i % 3) * 15 + 10;
    const x = vesselCenter.x + Math.cos(angle) * distance;
    const y = vesselCenter.y + Math.sin(angle) * distance - progress * 50;
    const opacity = Math.max(0, 1 - progress);
    const size =
      bubbleSize + (reduceMotion ? 0 : Math.sin(progress * Math.PI * 2) * 2);

    return { x, y, opacity, size, key: i };
  });

  return (
    <g>
      {bubbles.map(bubble => (
        <circle
          key={bubble.key}
          cx={bubble.x}
          cy={bubble.y}
          r={bubble.size}
          fill={effect.color}
          stroke="#ffffff"
          strokeWidth="1"
          opacity={bubble.opacity}
        />
      ))}
    </g>
  );
};

// State Change Effect Renderer
interface StateChangeRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').StateChangeEffect;
}

const StateChangeRenderer: React.FC<StateChangeRendererProps> = ({
  effect,
  progress,
  vesselCenter,
  reduceMotion,
}) => {
  const scale = reduceMotion ? 1 : 0.8 + 0.4 * Math.sin(progress * Math.PI);
  const opacity = 0.8 * (1 - progress);

  return (
    <g>
      <circle
        cx={vesselCenter.x}
        cy={vesselCenter.y}
        r={30 * scale}
        fill="none"
        stroke="#9333ea"
        strokeWidth="2"
        strokeDasharray="5,5"
        opacity={opacity}
      />
      <text
        x={vesselCenter.x}
        y={vesselCenter.y}
        textAnchor="middle"
        className="text-xs fill-purple-600"
        opacity={opacity}
      >
        → {effect.final_state}
      </text>
    </g>
  );
};

// Volume Change Effect Renderer
interface VolumeChangeRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').VolumeChangeEffect;
}

const VolumeChangeRenderer: React.FC<VolumeChangeRendererProps> = ({
  effect,
  progress,
  vesselCenter,
}) => {
  const isExpanding = effect.factor > 1;
  const baseRadius = 25;
  const targetRadius = baseRadius * effect.factor;
  const currentRadius = baseRadius + (targetRadius - baseRadius) * progress;
  const opacity = 0.6 * (1 - progress * 0.5);

  return (
    <g>
      <circle
        cx={vesselCenter.x}
        cy={vesselCenter.y}
        r={currentRadius}
        fill={isExpanding ? '#22c55e' : '#ef4444'}
        opacity={opacity}
      />
      <text
        x={vesselCenter.x}
        y={vesselCenter.y - currentRadius - 10}
        textAnchor="middle"
        className="text-xs fill-gray-600"
      >
        {isExpanding ? '📈' : '📉'} {effect.factor}x
      </text>
    </g>
  );
};

// Spill Effect Renderer
interface SpillRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').SpillEffect;
}

const SpillRenderer: React.FC<SpillRendererProps> = ({
  effect,
  progress,
  vesselCenter,
}) => {
  const maxRadius = effect.spread_radius * 20;
  const currentRadius = maxRadius * progress;
  const opacity = effect.amount_percentage * (1 - progress * 0.7);

  return (
    <g>
      <ellipse
        cx={vesselCenter.x}
        cy={vesselCenter.y + 20}
        rx={currentRadius}
        ry={currentRadius * 0.3}
        fill="#3b82f6"
        opacity={opacity}
      />
      <text
        x={vesselCenter.x}
        y={vesselCenter.y - 30}
        textAnchor="middle"
        className="text-xs fill-gray-600"
      >
        💧 Spill ({Math.round(effect.amount_percentage * 100)}%)
      </text>
    </g>
  );
};

// Texture Change Effect Renderer
interface TextureChangeRendererProps extends BaseEffectRendererProps {
  effect: import('@/types/reaction.types').TextureChangeEffect;
}

const TextureChangeRenderer: React.FC<TextureChangeRendererProps> = ({
  effect,
  progress,
  vesselCenter,
  reduceMotion,
}) => {
  const scale = reduceMotion ? 1 : 0.9 + 0.2 * Math.sin(progress * Math.PI * 2);
  const opacity = 0.7 * (1 - progress * 0.3);

  return (
    <g>
      <defs>
        <pattern
          id={`texture-pattern-${effect.texture_type}`}
          patternUnits="userSpaceOnUse"
          width="4"
          height="4"
        >
          <rect width="4" height="4" fill={effect.color} />
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.3)" />
        </pattern>
      </defs>
      <circle
        cx={vesselCenter.x}
        cy={vesselCenter.y}
        r={25 * scale}
        fill={`url(#texture-pattern-${effect.texture_type})`}
        opacity={opacity}
      />
      <text
        x={vesselCenter.x}
        y={vesselCenter.y - 35}
        textAnchor="middle"
        className="text-xs fill-gray-600"
      >
        🎨 {effect.texture_type}
      </text>
    </g>
  );
};
