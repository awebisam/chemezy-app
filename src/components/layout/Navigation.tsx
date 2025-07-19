import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useAuthStore } from '@/store/auth.store';

interface NavigationProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showUserMenu?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  className = '',
  variant = 'horizontal',
  showUserMenu = true,
}) => {
  const { navigationRoutes, isActive, navigateTo } = useNavigation();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigateTo('/auth');
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const baseNavClasses =
    variant === 'horizontal'
      ? 'flex items-center space-x-8'
      : 'flex flex-col space-y-2';

  return (
    <nav
      className={`${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Desktop Navigation */}
      <div className={`hidden md:flex ${baseNavClasses}`}>
        {navigationRoutes.map(route => (
          <Link
            key={route.path}
            to={route.path}
            className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isActive(route.path)
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-current={isActive(route.path) ? 'page' : undefined}
            title={route.description}
          >
            {route.label}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation Button */}
      <div className="flex items-center md:hidden">
        <button
          onClick={toggleMobileMenu}
          onKeyDown={e => handleKeyDown(e, toggleMobileMenu)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle mobile menu"
          aria-controls="mobile-menu"
        >
          <span className="sr-only">Open main menu</span>
          {!isMobileMenuOpen ? (
            <svg
              className="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          ) : (
            <svg
              className="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>
      </div>

      {/* User Menu */}
      {showUserMenu && (
        <div className="hidden sm:flex sm:items-center sm:space-x-4">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              onKeyDown={e => handleKeyDown(e, toggleUserMenu)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <span className="text-sm text-gray-700 truncate max-w-32 lg:max-w-none mr-2">
                Welcome, {user?.username || user?.email || 'User'}!
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <button
                  onClick={handleLogout}
                  onKeyDown={e => handleKeyDown(e, handleLogout)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-200"
                  role="menuitem"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          {navigationRoutes.map(route => (
            <Link
              key={route.path}
              to={route.path}
              onClick={closeMobileMenu}
              className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 ${
                isActive(route.path)
                  ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              aria-current={isActive(route.path) ? 'page' : undefined}
            >
              {route.label}
            </Link>
          ))}

          {/* Mobile user info and logout */}
          {showUserMenu && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4">
                <div className="text-base font-medium text-gray-800 truncate">
                  {user?.username || user?.email || 'User'}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  onKeyDown={e =>
                    handleKeyDown(e, () => {
                      closeMobileMenu();
                      handleLogout();
                    })
                  }
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
