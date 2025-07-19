import React, { useState } from 'react';
import { Button } from './Button';
import { LoadingState, LoadingOverlay, Skeleton } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useToastHelpers } from './Toast';

// Mock API functions for demonstration
const mockSuccessApi = (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve('Success! Data loaded.'), 2000);
  });
};

const mockErrorApi = (): Promise<string> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Network connection failed')), 1500);
  });
};

const mockRetryableApi = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.6) {
        resolve('Success after retry!');
      } else {
        reject({ message: 'Server temporarily unavailable', status: 503 });
      }
    }, 1000);
  });
};

// Component that throws an error for ErrorBoundary demo
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error for ErrorBoundary');
  }
  return <div className="text-green-600">No error thrown!</div>;
};

export const ErrorHandlingDemo: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [throwError, setThrowError] = useState(false);
  const toast = useToastHelpers();

  const successOperation = useAsyncOperation(mockSuccessApi);
  const errorOperation = useAsyncOperation(mockErrorApi);
  const retryOperation = useAsyncOperation(mockRetryableApi, {
    retryConfig: { maxRetries: 3, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
  });

  const handleOverlayDemo = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  const handleToastDemo = () => {
    toast.success('Success!', 'This is a success message');
    setTimeout(() => toast.error('Error!', 'This is an error message'), 1000);
    setTimeout(() => toast.warning('Warning!', 'This is a warning message'), 2000);
    setTimeout(() => toast.info('Info!', 'This is an info message'), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Error Handling & Loading States Demo
        </h1>
        <p className="text-gray-600">
          Comprehensive demonstration of error handling, loading states, and retry mechanisms
        </p>
      </div>

      {/* Loading States Demo */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Success Operation</h3>
            <LoadingState
              loading={successOperation.loading}
              error={successOperation.error?.message}
              onRetry={successOperation.retry}
            >
              <div className="p-4 bg-green-50 rounded border">
                {successOperation.data || 'Click button to load data'}
              </div>
            </LoadingState>
            <Button
              onClick={() => successOperation.execute()}
              disabled={successOperation.loading}
              className="mt-2 w-full"
            >
              Load Success Data
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-2">Error Operation</h3>
            <LoadingState
              loading={errorOperation.loading}
              error={errorOperation.error?.message}
              onRetry={errorOperation.retry}
            >
              <div className="p-4 bg-green-50 rounded border">
                {errorOperation.data || 'Click button to trigger error'}
              </div>
            </LoadingState>
            <Button
              onClick={() => errorOperation.execute()}
              disabled={errorOperation.loading}
              variant="secondary"
              className="mt-2 w-full"
            >
              Trigger Error
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-2">Retry Operation</h3>
            <LoadingState
              loading={retryOperation.loading}
              error={retryOperation.error?.message}
              onRetry={retryOperation.retry}
            >
              <div className="p-4 bg-green-50 rounded border">
                {retryOperation.data || 'Click button for retry demo'}
              </div>
            </LoadingState>
            <Button
              onClick={() => retryOperation.execute()}
              disabled={retryOperation.loading}
              variant="primary"
              className="mt-2 w-full"
            >
              Try Retryable Operation
            </Button>
          </div>
        </div>
      </section>

      {/* Skeleton Loading Demo */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Skeleton Loading</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton width={60} height={60} rounded />
            <div className="flex-1 space-y-2">
              <Skeleton height={20} width="60%" />
              <Skeleton height={16} width="40%" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton height={16} />
            <Skeleton height={16} width="80%" />
            <Skeleton height={16} width="90%" />
          </div>
        </div>
      </section>

      {/* Loading Overlay Demo */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Loading Overlay</h2>
        <Button onClick={handleOverlayDemo}>
          Show Loading Overlay (3 seconds)
        </Button>
        <LoadingOverlay
          isVisible={showOverlay}
          message="Processing your request..."
        />
      </section>

      {/* Toast Notifications Demo */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <Button onClick={handleToastDemo}>
          Show All Toast Types
        </Button>
      </section>

      {/* Error Boundary Demo */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Error Boundary</h2>
        <div className="space-y-4">
          <Button
            onClick={() => setThrowError(!throwError)}
            variant={throwError ? 'danger' : 'secondary'}
          >
            {throwError ? 'Fix Error' : 'Throw Error'}
          </Button>
          
          <ErrorBoundary
            fallback={
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-800">Custom Error Fallback</h3>
                <p className="text-red-600 mt-1">
                  This is a custom error boundary fallback UI.
                </p>
              </div>
            }
          >
            <div className="p-4 border rounded">
              <ErrorThrowingComponent shouldThrow={throwError} />
            </div>
          </ErrorBoundary>
        </div>
      </section>

      {/* Operation Status */}
      <section className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Operation Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Success Operation:</strong>
            <div>Loading: {successOperation.loading ? 'Yes' : 'No'}</div>
            <div>Error: {successOperation.error ? 'Yes' : 'No'}</div>
            <div>Data: {successOperation.data ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <strong>Error Operation:</strong>
            <div>Loading: {errorOperation.loading ? 'Yes' : 'No'}</div>
            <div>Error: {errorOperation.error ? 'Yes' : 'No'}</div>
            <div>Data: {errorOperation.data ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <strong>Retry Operation:</strong>
            <div>Loading: {retryOperation.loading ? 'Yes' : 'No'}</div>
            <div>Error: {retryOperation.error ? 'Yes' : 'No'}</div>
            <div>Data: {retryOperation.data ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </section>
    </div>
  );
};