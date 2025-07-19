import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance';

interface PerformanceMonitorProps {
  /** Show the monitor in development mode only */
  showInDev?: boolean;
  /** Position of the monitor */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showInDev = true,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof performanceMonitor.getPerformanceStats> | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Only show in development mode if specified
  const shouldShow = !showInDev || import.meta.env.DEV;

  useEffect(() => {
    if (!shouldShow) return;

    performanceMonitor.startMonitoring();

    const interval = setInterval(() => {
      const currentStats = performanceMonitor.getPerformanceStats();
      const currentRecommendations = performanceMonitor.getPerformanceRecommendations();
      
      setStats(currentStats);
      setRecommendations(currentRecommendations);
    }, 2000); // Update every 2 seconds

    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, [shouldShow]);

  if (!shouldShow || !stats) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const isDegraded = performanceMonitor.isPerformanceDegraded();

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="relative">
        {/* Toggle button */}
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`
            w-12 h-12 rounded-full shadow-lg transition-colors duration-200
            ${isDegraded 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
            }
          `}
          title="Performance Monitor"
          aria-label={`Performance Monitor - ${isDegraded ? 'Issues Detected' : 'Good Performance'}`}
        >
          <span className="text-xs font-bold">
            {Math.round(stats.averageFrameRate)}
          </span>
        </button>

        {/* Performance panel */}
        {isVisible && (
          <div className="absolute bottom-14 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close performance monitor"
              >
                ×
              </button>
            </div>

            {/* Performance metrics */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Frame Rate:</span>
                <span className={stats.averageFrameRate < 30 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                  {Math.round(stats.averageFrameRate)} FPS
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Render Time:</span>
                <span className={stats.averageRenderTime > 16 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                  {Math.round(stats.averageRenderTime)}ms
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Memory:</span>
                <span className={stats.memoryUsage > 50 * 1024 * 1024 ? 'text-yellow-600 font-semibold' : 'text-green-600'}>
                  {Math.round(stats.memoryUsage / 1024 / 1024)}MB
                </span>
              </div>
            </div>

            {/* Effects performance */}
            {Object.keys(stats.effectsPerformance).length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Effects Performance</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(stats.effectsPerformance).map(([effectType, perf]) => (
                    <div key={effectType} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate">{effectType}:</span>
                      <span className={perf.averageRenderTime > 10 ? 'text-red-600' : 'text-green-600'}>
                        {Math.round(perf.averageRenderTime)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">⚠️ Recommendations</h4>
                <ul className="space-y-1 text-xs text-red-600">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="leading-tight">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => performanceMonitor.clearMetrics()}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Clear Data
              </button>
              <button
                onClick={() => {
                  const data = JSON.stringify(stats, null, 2);
                  console.log('Performance Data:', data);
                }}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              >
                Log Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Bundle size monitor component for development
 */
export const BundleSizeMonitor: React.FC = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    totalSize: number;
    chunkCount: number;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Simulate bundle analysis (in a real app, this would come from build tools)
      const mockBundleInfo = {
        totalSize: Math.random() * 2000 + 500, // 500KB - 2.5MB
        chunkCount: Math.floor(Math.random() * 10) + 3, // 3-12 chunks
        timestamp: new Date().toISOString(),
      };
      
      setBundleInfo(mockBundleInfo);
    }
  }, []);

  if (!import.meta.env.DEV || !bundleInfo) return null;

  const isLarge = bundleInfo.totalSize > 1500; // 1.5MB threshold

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className={`
        px-3 py-2 rounded-lg shadow-lg text-xs font-mono
        ${isLarge ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}
      `}>
        <div>Bundle: {Math.round(bundleInfo.totalSize)}KB</div>
        <div>Chunks: {bundleInfo.chunkCount}</div>
        {isLarge && (
          <div className="text-red-600 font-semibold mt-1">
            ⚠️ Large bundle size
          </div>
        )}
      </div>
    </div>
  );
};