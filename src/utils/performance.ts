/**
 * Performance monitoring utilities for the application
 */

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  effectsCount: number;
  frameRate?: number;
  timestamp: number;
}

export interface EffectPerformanceData {
  effectType: string;
  duration: number;
  renderTime: number;
  memoryDelta: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private effectMetrics: Map<string, EffectPerformanceData[]> = new Map();
  private frameRateBuffer: number[] = [];
  private lastFrameTime = 0;
  private isMonitoring = false;

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.startFrameRateMonitoring();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetrics, 'timestamp'>): void {
    if (!this.isMonitoring) return;

    this.metrics.push({
      ...metric,
      timestamp: performance.now(),
    });

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Record effect-specific performance data
   */
  recordEffectPerformance(data: EffectPerformanceData): void {
    if (!this.isMonitoring) return;

    const effectType = data.effectType;
    if (!this.effectMetrics.has(effectType)) {
      this.effectMetrics.set(effectType, []);
    }

    const effectData = this.effectMetrics.get(effectType)!;
    effectData.push(data);

    // Keep only last 50 metrics per effect type
    if (effectData.length > 50) {
      this.effectMetrics.set(effectType, effectData.slice(-50));
    }
  }

  /**
   * Get current performance statistics
   */
  getPerformanceStats(): {
    averageRenderTime: number;
    averageFrameRate: number;
    memoryUsage: number;
    effectsPerformance: Record<
      string,
      {
        averageRenderTime: number;
        averageDuration: number;
        count: number;
      }
    >;
  } {
    const recentMetrics = this.metrics.slice(-20); // Last 20 metrics

    const averageRenderTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) /
          recentMetrics.length
        : 0;

    const averageFrameRate =
      this.frameRateBuffer.length > 0
        ? this.frameRateBuffer.reduce((sum, rate) => sum + rate, 0) /
          this.frameRateBuffer.length
        : 0;

    const memoryUsage = this.getMemoryUsage();

    const effectsPerformance: Record<string, any> = {};
    this.effectMetrics.forEach((data, effectType) => {
      const recentData = data.slice(-10); // Last 10 records per effect
      effectsPerformance[effectType] = {
        averageRenderTime:
          recentData.reduce((sum, d) => sum + d.renderTime, 0) /
          recentData.length,
        averageDuration:
          recentData.reduce((sum, d) => sum + d.duration, 0) /
          recentData.length,
        count: recentData.length,
      };
    });

    return {
      averageRenderTime,
      averageFrameRate,
      memoryUsage,
      effectsPerformance,
    };
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    const stats = this.getPerformanceStats();

    // Consider performance degraded if:
    // - Frame rate is below 30 FPS
    // - Average render time is above 16ms (60 FPS threshold)
    // - Memory usage is above 100MB
    return (
      stats.averageFrameRate < 30 ||
      stats.averageRenderTime > 16 ||
      stats.memoryUsage > 100 * 1024 * 1024 // 100MB
    );
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getPerformanceStats();

    if (stats.averageFrameRate < 30) {
      recommendations.push(
        'Consider reducing the number of simultaneous visual effects'
      );
    }

    if (stats.averageRenderTime > 16) {
      recommendations.push(
        'Optimize rendering performance by reducing effect complexity'
      );
    }

    if (stats.memoryUsage > 50 * 1024 * 1024) {
      // 50MB
      recommendations.push(
        'Monitor memory usage - consider implementing effect pooling'
      );
    }

    // Check individual effect performance
    Object.entries(stats.effectsPerformance).forEach(([effectType, perf]) => {
      if (perf.averageRenderTime > 10) {
        recommendations.push(
          `Optimize ${effectType} effect rendering performance`
        );
      }
    });

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.effectMetrics.clear();
    this.frameRateBuffer = [];
  }

  /**
   * Start monitoring frame rate
   */
  private startFrameRateMonitoring(): void {
    const measureFrameRate = (currentTime: number) => {
      if (this.lastFrameTime > 0) {
        const deltaTime = currentTime - this.lastFrameTime;
        const frameRate = 1000 / deltaTime; // Convert to FPS

        this.frameRateBuffer.push(frameRate);

        // Keep only last 60 frame rate measurements
        if (this.frameRateBuffer.length > 60) {
          this.frameRateBuffer = this.frameRateBuffer.slice(-60);
        }
      }

      this.lastFrameTime = currentTime;

      if (this.isMonitoring) {
        requestAnimationFrame(measureFrameRate);
      }
    };

    requestAnimationFrame(measureFrameRate);
  }

  /**
   * Get current memory usage (if available)
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render performance
 */
export function usePerformanceMonitor(_componentName: string) {
  const startTime = performance.now();

  return {
    recordRender: (effectsCount = 0) => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.recordMetric({
        renderTime,
        effectsCount,
        memoryUsage: performanceMonitor['getMemoryUsage'](),
      });
    },
  };
}

/**
 * Decorator for measuring function performance
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();

    console.debug(`${name} took ${endTime - startTime}ms`);

    return result;
  }) as T;
}

/**
 * Bundle size monitoring utilities
 */
export const bundleMonitor = {
  /**
   * Log bundle size information (development only)
   */
  logBundleInfo: () => {
    if (import.meta.env.DEV) {
      console.group('Bundle Information');
      console.log('Environment:', import.meta.env.MODE);
      console.log('Build timestamp:', new Date().toISOString());

      // Log loaded modules count
      if ('webpackChunkName' in window) {
        console.log(
          'Webpack chunks loaded:',
          Object.keys((window as any).webpackChunkName || {}).length
        );
      }

      console.groupEnd();
    }
  },

  /**
   * Monitor lazy loading performance
   */
  measureLazyLoad: async <T>(
    importFn: () => Promise<T>,
    componentName: string
  ): Promise<T> => {
    const startTime = performance.now();

    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;

      console.debug(`Lazy loaded ${componentName} in ${loadTime}ms`);

      return module;
    } catch (error) {
      console.error(`Failed to lazy load ${componentName}:`, error);
      throw error;
    }
  },
};
