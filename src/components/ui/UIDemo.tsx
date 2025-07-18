import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';
import { ToastProvider, useToastHelpers } from './Toast';

const DemoContent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const toast = useToastHelpers();

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      setInputError('This field is required');
      return;
    }
    
    setInputError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Success!', 'Your action was completed successfully.');
    }, 2000);
  };

  const showToasts = () => {
    toast.info('Info', 'This is an informational message');
    setTimeout(() => toast.warning('Warning', 'This is a warning message'), 1000);
    setTimeout(() => toast.error('Error', 'This is an error message'), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">UI Component Library Demo</h1>
      
      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button isLoading={isLoading} onClick={handleSubmit} loadingText="Processing...">
            {isLoading ? 'Processing...' : 'Submit Form'}
          </Button>
          <Button disabled>Disabled Button</Button>
        </div>
      </section>

      {/* Input Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Input Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Required Field"
            placeholder="Enter some text..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            error={inputError}
            isRequired
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            helperText="We'll never share your email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
          />
          <Input
            label="Disabled Input"
            placeholder="This is disabled"
            disabled
          />
        </div>
      </section>

      {/* Loading Spinners Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Loading Spinners</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <LoadingSpinner size="sm" />
            <p className="mt-2 text-sm text-gray-600">Small</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="mt-2 text-sm text-gray-600">Medium</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-gray-600">Large</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="mt-2 text-sm text-gray-600">Extra Large</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <LoadingSpinner color="primary" />
            <p className="mt-2 text-sm text-gray-600">Primary</p>
          </div>
          <div className="text-center">
            <LoadingSpinner color="secondary" />
            <p className="mt-2 text-sm text-gray-600">Secondary</p>
          </div>
          <div className="text-center">
            <LoadingSpinner color="gray" />
            <p className="mt-2 text-sm text-gray-600">Gray</p>
          </div>
          <div className="text-center bg-gray-800 p-4 rounded">
            <LoadingSpinner color="white" />
            <p className="mt-2 text-sm text-white">White</p>
          </div>
        </div>
      </section>

      {/* Modal Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This is an example modal with proper accessibility features including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Keyboard navigation (Tab/Shift+Tab)</li>
              <li>Escape key to close</li>
              <li>Focus management</li>
              <li>ARIA labels and roles</li>
              <li>Backdrop click to close</li>
            </ul>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </section>

      {/* Toast Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Toast Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => toast.success('Success!', 'Operation completed successfully')}>
            Show Success Toast
          </Button>
          <Button onClick={() => toast.error('Error!', 'Something went wrong')}>
            Show Error Toast
          </Button>
          <Button onClick={() => toast.warning('Warning!', 'Please check your input')}>
            Show Warning Toast
          </Button>
          <Button onClick={() => toast.info('Info', 'Here is some information')}>
            Show Info Toast
          </Button>
          <Button onClick={showToasts}>
            Show Multiple Toasts
          </Button>
        </div>
      </section>
    </div>
  );
};

export const UIDemo: React.FC = () => {
  return (
    <ToastProvider>
      <DemoContent />
    </ToastProvider>
  );
};