import { vi } from 'vitest';
import { performanceMonitor, measurePerformance, bundleMonitor } from '../performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  describe('PerformanceMonitor', () => {
    it('should start and stop monitoring', () => {
      expect(() => {
        performanceMonitor.startMonitoring();
        performanceMonitor.stopMonitoring();
      }).not.toThrow();
    });

    it('should record metrics', () => {
      performanceMonitor.startMonitoring();
      
      performanceMonitor.recordMetric({
        renderTime: 10,
        effectsCount: 2,
        memoryUsage: 1024 * 1024, // 1MB
      });

      const stats = performanceMonitor.getPerformanceStats();
      expect(stats.averageRenderTime).toBe(10);
    });

    it('should record effect performance', () => {
      performanceMonitor.startMonitoring();
      
      performanceMonitor.recordEffectPerformance({
        effectType: 'gas_production',
        duration: 2000,
        renderTime: 5,
        memoryDelta: 512,
      });

      const stats = performanceMonitor.getPerformanceStats();
      expect(stats.effectsPerformance.gas_production).toBeDefined();
      expect(stats.effectsPerformance.gas_production.averageRenderTime).toBe(5);
    });

    it('should detect performance degradation', () => {
      performanceMonitor.startMonitoring();
      
      // Record poor performance metrics
      performanceMonitor.recordMetric({
        renderTime: 50, // > 16ms threshold
        effectsCount: 10,
        memoryUsage: 200 * 1024 * 1024, // 200MB
      });

      expect(performanceMonitor.isPerformanceDegraded()).toBe(true);
    });

    it('should provide performance recommendations', () => {
      performanceMonitor.startMonitoring();
      
      // Record poor performance metrics
      performanceMonitor.recordMetric({
        renderTime: 50,
        effectsCount: 10,
        memoryUsage: 200 * 1024 * 1024,
      });

      const recommendations = performanceMonitor.getPerformanceRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('rendering performance'))).toBe(true);
    });

    it('should clear metrics', () => {
      performanceMonitor.startMonitoring();
      
      performanceMonitor.recordMetric({
        renderTime: 10,
        effectsCount: 1,
      });

      let stats = performanceMonitor.getPerformanceStats();
      expect(stats.averageRenderTime).toBe(10);

      performanceMonitor.clearMetrics();
      stats = performanceMonitor.getPerformanceStats();
      expect(stats.averageRenderTime).toBe(0);
    });
  });

  describe('measurePerformance decorator', () => {
    it('should measure function execution time', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      const testFunction = (x: number) => x * 2;
      const measuredFunction = measurePerformance(testFunction, 'testFunction');
      
      const result = measuredFunction(5);
      
      expect(result).toBe(10);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('testFunction took')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('bundleMonitor', () => {
    it('should log bundle info in development', () => {
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      // Mock development environment
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;
      
      bundleMonitor.logBundleInfo();
      
      expect(consoleSpy).toHaveBeenCalledWith('Bundle Information');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
      
      // Restore environment
      (import.meta.env as any).DEV = originalEnv;
      
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it('should measure lazy load performance', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      const mockImport = () => Promise.resolve({ default: 'test-component' });
      
      const result = await bundleMonitor.measureLazyLoad(mockImport, 'TestComponent');
      
      expect(result).toEqual({ default: 'test-component' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Lazy loaded TestComponent in')
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle lazy load errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockImport = () => Promise.reject(new Error('Load failed'));
      
      await expect(
        bundleMonitor.measureLazyLoad(mockImport, 'TestComponent')
      ).rejects.toThrow('Load failed');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to lazy load TestComponent:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
});