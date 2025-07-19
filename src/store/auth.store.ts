import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import type { AuthStore } from '@/types/store.types';

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: async credentials => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(credentials);
            const user = await authService.getCurrentUser();

            set({
              user,
              token: response.access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                typeof error.message === 'string'
                  ? error.message
                  : 'Login failed',
            });
            throw error;
          }
        },

        register: async userData => {
          set({ isLoading: true, error: null });
          try {
            await authService.register(userData);
            // After successful registration, automatically log in
            await get().login({
              username: userData.username,
              password: userData.password,
            });
          } catch (error: any) {
            set({
              isLoading: false,
              error:
                typeof error.message === 'string'
                  ? error.message
                  : 'Registration failed',
            });
            throw error;
          }
        },

        logout: () => {
          authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        },

        refreshToken: async () => {
          try {
            const response = await authService.refreshToken();
            set({
              token: response.access_token,
              error: null,
            });
          } catch (error: any) {
            // If refresh fails, logout the user
            get().logout();
            throw error;
          }
        },

        getCurrentUser: async () => {
          set({ isLoading: true, error: null });
          try {
            const user = await authService.getCurrentUser();
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                typeof error.message === 'string'
                  ? error.message
                  : 'Failed to get user information',
            });
            throw error;
          }
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Initialize auth state from localStorage on app start
export const initializeAuth = () => {
  const token = authService.getToken();
  const isAuthenticated = authService.isAuthenticated();

  if (token && isAuthenticated) {
    useAuthStore.setState({
      token,
      isAuthenticated: true,
    });

    // Try to get current user info
    useAuthStore
      .getState()
      .getCurrentUser()
      .catch(() => {
        // If getting user info fails, logout
        useAuthStore.getState().logout();
      });
  }
};
