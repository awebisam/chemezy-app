import { useEffect, useRef, useCallback } from 'react';
import type { VisualEffect } from '@/types/reaction.types';

// Effect lifecycle states
export enum EffectState {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

// Effect instance with lifecycle management
export interface ManagedEffectInstance {
  id: string;
  effect: VisualEffect;
  state: EffectState;
  startTime: number;
  pausedTime?: number;
  duration: number;
  progress: number;
  domElement?: SVGElement;
  animationFrame?: number;
  cleanup?: () => void;
  onStateChange?: (state: EffectState) => void;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// Effect lifecycle manager class
export class EffectLifecycleManager {
  private effects: Map<string, ManagedEffectInstance> = new Map();
  private animationFrame?: number;
  private isRunning = false;
  private memoryUsage = 0;
  private maxMemoryUsage = 50 * 1024 * 1024; // 50MB limit
  private performanceMonitor = new PerformanceMonitor();

  constructor() {
    this.startAnimationLoop();
  }

  // Add effect to management
  addEffect(
    effect: VisualEffect,
    duration: number,
    options: {
      onStateChange?: (state: EffectState) => void;
      onProgress?: (progress: number) => void;
      onComplete?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): string {
    const id = this.generateId();

    const instance: ManagedEffectInstance = {
      id,
      effect,
      state: EffectState.PENDING,
      startTime: Date.now(),
      duration,
      progress: 0,
      ...options,
    };

    this.effects.set(id, instance);
    this.setState(instance, EffectState.ACTIVE);

    return id;
  }

  // Remove effect and cleanup
  removeEffect(id: string): void {
    const instance = this.effects.get(id);
    if (instance) {
      this.cleanupInstance(instance);
      this.effects.delete(id);
    }
  }

  // Pause effect
  pauseEffect(id: string): void {
    const instance = this.effects.get(id);
    if (instance && instance.state === EffectState.ACTIVE) {
      instance.pausedTime = Date.now();
      this.setState(instance, EffectState.PAUSED);
    }
  }

  // Resume effect
  resumeEffect(id: string): void {
    const instance = this.effects.get(id);
    if (
      instance &&
      instance.state === EffectState.PAUSED &&
      instance.pausedTime
    ) {
      const pausedDuration = Date.now() - instance.pausedTime;
      instance.startTime += pausedDuration;
      instance.pausedTime = undefined;
      this.setState(instance, EffectState.ACTIVE);
    }
  }

  // Cancel effect
  cancelEffect(id: string): void {
    const instance = this.effects.get(id);
    if (instance) {
      this.setState(instance, EffectState.CANCELLED);
      this.cleanupInstance(instance);
      this.effects.delete(id);
    }
  }

  // Get effect state
  getEffectState(id: string): EffectState | null {
    const instance = this.effects.get(id);
    return instance ? instance.state : null;
  }

  // Get all active effects
  getActiveEffects(): ManagedEffectInstance[] {
    return Array.from(this.effects.values()).filter(
      instance => instance.state === EffectState.ACTIVE
    );
  }

  // Get memory usage
  getMemoryUsage(): number {
    return this.memoryUsage;
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }

  // Cleanup all effects
  cleanup(): void {
    this.effects.forEach(instance => this.cleanupInstance(instance));
    this.effects.clear();
    this.stopAnimationLoop();
  }

  // Private methods
  private generateId(): string {
    return `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setState(instance: ManagedEffectInstance, state: EffectState): void {
    instance.state = state;
    if (instance.onStateChange) {
      instance.onStateChange(state);
    }
  }

  private cleanupInstance(instance: ManagedEffectInstance): void {
    try {
      // Cancel animation frame if exists
      if (instance.animationFrame) {
        cancelAnimationFrame(instance.animationFrame);
      }

      // Remove DOM element if exists
      if (instance.domElement && instance.domElement.parentNode) {
        instance.domElement.parentNode.removeChild(instance.domElement);
      }

      // Call custom cleanup function
      if (instance.cleanup) {
        instance.cleanup();
      }

      // Update memory usage
      this.updateMemoryUsage();
    } catch (error) {
      console.error('Error during effect cleanup:', error);
      if (instance.onError) {
        instance.onError(error as Error);
      }
    }
  }

  private updateMemoryUsage(): void {
    // Estimate memory usage based on active effects
    this.memoryUsage = this.effects.size * 1024; // Rough estimate: 1KB per effect
  }

  private startAnimationLoop(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.animationLoop();
  }

  private stopAnimationLoop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private animationLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = Date.now();
    const activeEffects = this.getActiveEffects();

    // Process each active effect
    activeEffects.forEach(instance => {
      try {
        const elapsed = currentTime - instance.startTime;
        const progress = Math.min(elapsed / instance.duration, 1);

        instance.progress = progress;

        // Call progress callback
        if (instance.onProgress) {
          instance.onProgress(progress);
        }

        // Check if effect is complete
        if (progress >= 1) {
          this.setState(instance, EffectState.COMPLETED);

          if (instance.onComplete) {
            instance.onComplete();
          }

          // Schedule cleanup
          setTimeout(() => this.removeEffect(instance.id), 100);
        }
      } catch (error) {
        console.error('Error processing effect:', error);
        this.setState(instance, EffectState.ERROR);
        if (instance.onError) {
          instance.onError(error as Error);
        }
      }
    });

    // Performance monitoring
    this.performanceMonitor.recordFrame();

    // Memory management
    if (this.memoryUsage > this.maxMemoryUsage) {
      this.cleanupOldestEffects();
    }

    // Continue animation loop
    this.animationFrame = requestAnimationFrame(this.animationLoop);
  };

  private cleanupOldestEffects(): void {
    const completedEffects = Array.from(this.effects.values())
      .filter(instance => instance.state === EffectState.COMPLETED)
      .sort((a, b) => a.startTime - b.startTime);

    // Remove half of the completed effects
    const toRemove = completedEffects.slice(
      0,
      Math.floor(completedEffects.length / 2)
    );
    toRemove.forEach(instance => this.removeEffect(instance.id));
  }
}

// Performance monitoring class
interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  activeEffects: number;
  droppedFrames: number;
}

class PerformanceMonitor {
  private frames: number[] = [];
  private frameCount = 0;
  private droppedFrames = 0;
  private lastFrameTime = 0;

  recordFrame(): void {
    const currentTime = performance.now();

    if (this.lastFrameTime > 0) {
      const frameTime = currentTime - this.lastFrameTime;
      this.frames.push(frameTime);

      // Keep only last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }

      // Count dropped frames (>33ms for 30fps)
      if (frameTime > 33) {
        this.droppedFrames++;
      }
    }

    this.lastFrameTime = currentTime;
    this.frameCount++;
  }

  getMetrics(): PerformanceMetrics {
    const avgFrameTime =
      this.frames.length > 0
        ? this.frames.reduce((sum, time) => sum + time, 0) / this.frames.length
        : 0;

    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

    return {
      fps,
      frameTime: avgFrameTime,
      memoryUsage: this.estimateMemoryUsage(),
      activeEffects: this.frameCount,
      droppedFrames: this.droppedFrames,
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation based on performance.memory if available
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

// React hook for effect lifecycle management
export function useEffectLifecycle() {
  const managerRef = useRef<EffectLifecycleManager | null>(null);

  // Initialize manager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new EffectLifecycleManager();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.cleanup();
        managerRef.current = null;
      }
    };
  }, []);

  // Add effect
  const addEffect = useCallback(
    (
      effect: VisualEffect,
      duration: number,
      options: {
        onStateChange?: (state: EffectState) => void;
        onProgress?: (progress: number) => void;
        onComplete?: () => void;
        onError?: (error: Error) => void;
      } = {}
    ): string => {
      if (!managerRef.current) {
        throw new Error('Effect lifecycle manager not initialized');
      }
      return managerRef.current.addEffect(effect, duration, options);
    },
    []
  );

  // Remove effect
  const removeEffect = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.removeEffect(id);
    }
  }, []);

  // Pause effect
  const pauseEffect = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.pauseEffect(id);
    }
  }, []);

  // Resume effect
  const resumeEffect = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.resumeEffect(id);
    }
  }, []);

  // Cancel effect
  const cancelEffect = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.cancelEffect(id);
    }
  }, []);

  // Get effect state
  const getEffectState = useCallback((id: string): EffectState | null => {
    return managerRef.current ? managerRef.current.getEffectState(id) : null;
  }, []);

  // Get active effects
  const getActiveEffects = useCallback((): ManagedEffectInstance[] => {
    return managerRef.current ? managerRef.current.getActiveEffects() : [];
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    return managerRef.current
      ? managerRef.current.getPerformanceMetrics()
      : {
          fps: 0,
          frameTime: 0,
          memoryUsage: 0,
          activeEffects: 0,
          droppedFrames: 0,
        };
  }, []);

  return {
    addEffect,
    removeEffect,
    pauseEffect,
    resumeEffect,
    cancelEffect,
    getEffectState,
    getActiveEffects,
    getPerformanceMetrics,
  };
}

// Effect pool for reusing effect instances
export class EffectPool {
  private pool: Map<string, ManagedEffectInstance[]> = new Map();
  private maxPoolSize = 10;

  // Get effect from pool or create new one
  getEffect(effectType: string): ManagedEffectInstance | null {
    const pooledEffects = this.pool.get(effectType);
    if (pooledEffects && pooledEffects.length > 0) {
      return pooledEffects.pop() || null;
    }
    return null;
  }

  // Return effect to pool
  returnEffect(instance: ManagedEffectInstance): void {
    const effectType = instance.effect.effect_type;

    if (!this.pool.has(effectType)) {
      this.pool.set(effectType, []);
    }

    const pooledEffects = this.pool.get(effectType)!;

    if (pooledEffects.length < this.maxPoolSize) {
      // Reset instance state
      instance.state = EffectState.PENDING;
      instance.progress = 0;
      instance.startTime = 0;
      instance.pausedTime = undefined;

      pooledEffects.push(instance);
    }
  }

  // Clear pool
  clear(): void {
    this.pool.clear();
  }
}

// Memory management utilities
export class EffectMemoryManager {
  private static instance: EffectMemoryManager;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB
  private cleanupInterval = 5000; // 5 seconds
  private cleanupTimer?: NodeJS.Timeout;

  static getInstance(): EffectMemoryManager {
    if (!EffectMemoryManager.instance) {
      EffectMemoryManager.instance = new EffectMemoryManager();
    }
    return EffectMemoryManager.instance;
  }

  startMonitoring(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
  }

  stopMonitoring(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private performCleanup(): void {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    // Check memory usage
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > this.memoryThreshold) {
      console.warn('High memory usage detected:', memoryUsage);
      // Trigger cleanup event
      window.dispatchEvent(new CustomEvent('effectMemoryCleanup'));
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}
