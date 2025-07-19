import React from 'react';

interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId: string;
  /** Text to display in the skip link */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skip link component for keyboard navigation accessibility
 * Allows users to skip to main content or other important sections
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  children,
  className = '',
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    const target = document.getElementById(targetId);
    if (target) {
      // Set focus to the target element
      target.focus();
      
      // If the target is not naturally focusable, make it focusable temporarily
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        
        // Remove tabindex after focus is lost
        const handleBlur = () => {
          target.removeAttribute('tabindex');
          target.removeEventListener('blur', handleBlur);
        };
        target.addEventListener('blur', handleBlur);
      }
      
      // Smooth scroll to the target
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-primary-600 text-white px-4 py-2 rounded-md z-50 
        font-medium transition-all duration-200
        focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </a>
  );
};

/**
 * Skip links container component
 * Provides common skip links for the application
 */
export const SkipLinks: React.FC = () => {
  return (
    <div className="skip-links">
      <SkipLink targetId="main-content">
        Skip to main content
      </SkipLink>
      <SkipLink targetId="main-navigation">
        Skip to navigation
      </SkipLink>
      <SkipLink targetId="search">
        Skip to search
      </SkipLink>
    </div>
  );
};