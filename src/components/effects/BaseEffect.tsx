import React from 'react';
import type { VisualEffect } from '@/types/reaction.types';

// Base configuration for all visual effects
export interface BaseEffectConfig {
  vesselCenter: { x: number; y: number };
  containerSize: { width: number; height: number };
  reduceMotion: boolean;
  progress: number; // 0-1 animation progress
  onComplete?: () => void;
}

// Base effect props interface
export interface BaseEffectProps<T extends VisualEffect = VisualEffect> {
  effect: T;
  config: BaseEffectConfig;
  className?: string;
}

// Abstract base effect component interface
export interface IBaseEffect<T extends VisualEffect = VisualEffect> {
  render(props: BaseEffectProps<T>): React.ReactElement | null;
  getDuration(effect: T): number;
  cleanup?(): void;
}

// Base effect implementation
export abstract class BaseEffect<T extends VisualEffect = VisualEffect>
  implements IBaseEffect<T>
{
  abstract render(props: BaseEffectProps<T>): React.ReactElement | null;
  abstract getDuration(effect: T): number;

  // Optional cleanup method
  cleanup(): void {
    // Default implementation - can be overridden
  }

  // Utility method to create SVG elements with proper namespace
  protected createSVGElement(
    type: string,
    props: Record<string, any>
  ): React.ReactElement {
    return React.createElement(type, props);
  }

  // Helper method to calculate easing functions
  protected easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  protected easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  protected easeIn(t: number): number {
    return t * t * t;
  }

  // Helper method to generate particles
  protected generateParticles(
    count: number,
    center: { x: number; y: number },
    progress: number,
    options: {
      baseRadius?: number;
      maxRadius?: number;
      angle?: number;
      spread?: number;
    } = {}
  ): Array<{
    x: number;
    y: number;
    opacity: number;
    size: number;
    key: number;
  }> {
    const {
      baseRadius = 20,
      maxRadius = 100,
      angle = 0,
      spread = Math.PI * 2,
    } = options;

    return Array.from({ length: count }, (_, i) => {
      const particleAngle = angle + (i / count) * spread;
      const distance = baseRadius + progress * (maxRadius - baseRadius);
      const x = center.x + Math.cos(particleAngle) * distance;
      const y = center.y + Math.sin(particleAngle) * distance;
      const opacity = Math.max(0, 1 - progress);
      const size = 3 + progress * 5;

      return { x, y, opacity, size, key: i };
    });
  }

  // Helper method to generate random variations
  protected randomVariation(base: number, variation: number): number {
    return base + (Math.random() - 0.5) * variation;
  }

  // Helper method to interpolate colors
  protected interpolateColor(
    color1: string,
    color2: string,
    t: number
  ): string {
    // Simple RGB interpolation - can be enhanced for more complex color spaces
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);

    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Helper method to create gradients
  protected createRadialGradient(
    id: string,
    color: string,
    opacity: number,
    stops: Array<{ offset: string; opacity: number }> = [
      { offset: '0%', opacity: 1 },
      { offset: '70%', opacity: 0.5 },
      { offset: '100%', opacity: 0 },
    ]
  ): React.ReactElement {
    return (
      <radialGradient id={id} cx="50%" cy="50%" r="50%">
        {stops.map((stop, index) => (
          <stop
            key={index}
            offset={stop.offset}
            stopColor={color}
            stopOpacity={opacity * stop.opacity}
          />
        ))}
      </radialGradient>
    );
  }

  // Helper method to create patterns
  protected createPattern(
    id: string,
    width: number,
    height: number,
    children: React.ReactNode
  ): React.ReactElement {
    return (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={width}
        height={height}
      >
        {children}
      </pattern>
    );
  }

  // Helper method to apply accessibility considerations
  protected applyAccessibilityProps(
    reduceMotion: boolean,
    baseProps: Record<string, any>
  ): Record<string, any> {
    if (reduceMotion) {
      // Remove or reduce animations for accessibility
      const {
        animationDuration,
        animationDelay,
        animationIterationCount,
        transform,
        ...accessibleProps
      } = baseProps;

      return {
        ...accessibleProps,
        // Provide static alternative or minimal animation
        opacity: baseProps.opacity || 0.8,
      };
    }

    return baseProps;
  }
}

// Effect registry for dynamic loading
export class EffectRegistry {
  private static effects: Map<string, new () => BaseEffect> = new Map();

  static register<T extends BaseEffect>(
    effectType: string,
    effectClass: new () => T
  ): void {
    this.effects.set(effectType, effectClass);
  }

  static get(effectType: string): BaseEffect | null {
    const EffectClass = this.effects.get(effectType);
    return EffectClass ? new EffectClass() : null;
  }

  static getAll(): string[] {
    return Array.from(this.effects.keys());
  }
}

// Effect factory for creating effect instances
export class EffectFactory {
  static createEffect(effect: VisualEffect): BaseEffect | null {
    return EffectRegistry.get(effect.effect_type);
  }
}

// Common effect animations and utilities
export const EffectAnimations = {
  // Pulse animation
  pulse: (progress: number, intensity: number = 1): number => {
    return intensity * (0.5 + 0.5 * Math.sin(progress * Math.PI * 6));
  },

  // Wave animation
  wave: (
    progress: number,
    frequency: number = 4,
    amplitude: number = 1
  ): number => {
    return amplitude * Math.sin(progress * Math.PI * frequency);
  },

  // Bounce animation
  bounce: (progress: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (progress < 1 / d1) {
      return n1 * progress * progress;
    } else if (progress < 2 / d1) {
      return n1 * (progress -= 1.5 / d1) * progress + 0.75;
    } else if (progress < 2.5 / d1) {
      return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
    } else {
      return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
    }
  },

  // Elastic animation
  elastic: (progress: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return progress === 0
      ? 0
      : progress === 1
        ? 1
        : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) +
          1;
  },

  // Spiral path
  spiral: (
    progress: number,
    center: { x: number; y: number },
    radius: number
  ): { x: number; y: number } => {
    const angle = progress * Math.PI * 4;
    const currentRadius = radius * progress;
    return {
      x: center.x + Math.cos(angle) * currentRadius,
      y: center.y + Math.sin(angle) * currentRadius,
    };
  },

  // Orbital motion
  orbit: (
    progress: number,
    center: { x: number; y: number },
    radius: number,
    speed: number = 1
  ): { x: number; y: number } => {
    const angle = progress * Math.PI * 2 * speed;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  },

  // Easing functions
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  easeOut: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },

  easeIn: (t: number): number => {
    return t * t * t;
  },
};

// Performance monitoring for effects
export class EffectPerformanceMonitor {
  private static frameCount = 0;
  private static lastTime = 0;
  private static fps = 0;

  static startFrame(): void {
    const now = performance.now();
    if (this.lastTime === 0) {
      this.lastTime = now;
    }

    this.frameCount++;

    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  static getFPS(): number {
    return this.fps;
  }

  static shouldReduceQuality(): boolean {
    return this.fps < 30; // Reduce quality if FPS drops below 30
  }
}

// Effect configuration presets
export const EffectPresets = {
  // High performance preset
  performance: {
    maxParticles: 8,
    animationDuration: 2000,
    qualityLevel: 'medium',
  },

  // High quality preset
  quality: {
    maxParticles: 20,
    animationDuration: 4000,
    qualityLevel: 'high',
  },

  // Accessibility preset
  accessibility: {
    maxParticles: 4,
    animationDuration: 1000,
    qualityLevel: 'low',
    reduceMotion: true,
  },
};
