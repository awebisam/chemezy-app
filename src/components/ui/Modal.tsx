import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { useFocusManagement } from '@/utils/focus';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  /** Accessible description for the modal */
  'aria-describedby'?: string;
  /** Custom aria-label for the modal */
  'aria-label'?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  showCloseButton = true,
  initialFocus,
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
}) => {
  const {
    elementRef: modalRef,
    trapFocusInElement,
    restoreFocus,
  } = useFocusManagement<HTMLDivElement>();
  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    let cleanupFocus: (() => void) | undefined;

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Set up focus trapping
      cleanupFocus = trapFocusInElement();

      // Focus initial element if specified
      if (initialFocus?.current) {
        initialFocus.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';

      if (cleanupFocus) {
        cleanupFocus();
      }

      if (!isOpen) {
        restoreFocus();
      }
    };
  }, [isOpen, onClose, initialFocus, trapFocusInElement, restoreFocus]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={ariaDescribedby}
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-lg shadow-xl w-full',
          sizes[size],
          'max-h-[90vh] overflow-y-auto'
        )}
        onClick={e => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
