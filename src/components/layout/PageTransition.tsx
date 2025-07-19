import React, { Suspense } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  fallback,
}) => {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.3,
  };

  const defaultFallback = (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <span className="ml-3 text-gray-600">Loading page...</span>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

// Loading transition component for async operations
interface LoadingTransitionProps {
  isLoading: boolean;
  children: ReactNode;
  loadingComponent?: ReactNode;
  className?: string;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  loadingComponent,
  className = '',
}) => {
  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLoading ? 'loading' : 'content'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {isLoading ? loadingComponent || defaultLoadingComponent : children}
      </motion.div>
    </AnimatePresence>
  );
};
