/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false, // Disable error overlay to reduce re-renders
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react';
          }
          // Animation libraries chunk
          if (id.includes('framer-motion')) {
            return 'vendor-animation';
          }
          // Utility libraries chunk
          if (id.includes('axios') || id.includes('zustand') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'vendor-utils';
          }
          // Effects engine chunk - local components
          if (id.includes('/src/components/effects/')) {
            return 'effects';
          }
          // UI components chunk - local components
          if (id.includes('/src/components/ui/')) {
            return 'ui';
          }
          // Services and stores chunk
          if (id.includes('/src/services/') || id.includes('/src/store/')) {
            return 'services';
          }
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Performance budgets
    chunkSizeWarningLimit: 1000, // 1MB warning limit
    assetsInlineLimit: 4096, // 4KB inline limit for assets
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
