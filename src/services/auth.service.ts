import { apiClient } from './api';
import { createApiWrapper } from './error.service';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserResponse,
} from '@/types/api.types';

export class AuthService {
  private loginWrapper = createApiWrapper(
    this._login.bind(this),
    'AuthService.login',
    { showToast: true, logError: true }
  );

  private registerWrapper = createApiWrapper(
    this._register.bind(this),
    'AuthService.register',
    { showToast: true, logError: true }
  );

  private getCurrentUserWrapper = createApiWrapper(
    this._getCurrentUser.bind(this),
    'AuthService.getCurrentUser',
    { 
      showToast: false, // Don't show toast for user fetch errors
      logError: true,
      retryConfig: { maxRetries: 2, baseDelay: 1000, maxDelay: 5000, backoffFactor: 2 }
    }
  );

  private refreshTokenWrapper = createApiWrapper(
    this._refreshToken.bind(this),
    'AuthService.refreshToken',
    { 
      showToast: false, // Don't show toast for token refresh errors
      logError: true,
      retryConfig: { maxRetries: 1, baseDelay: 500, maxDelay: 2000, backoffFactor: 1.5 }
    }
  );

  /**
   * Authenticate user with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.loginWrapper(credentials);
  }

  /**
   * Register a new user account
   */
  async register(userData: RegisterData): Promise<UserResponse> {
    return this.registerWrapper(userData);
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<UserResponse> {
    return this.getCurrentUserWrapper();
  }

  /**
   * Refresh the current JWT token
   */
  async refreshToken(): Promise<AuthResponse> {
    return this.refreshTokenWrapper();
  }

  /**
   * Logout user by clearing stored authentication data
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Private methods that contain the actual API calls
  private async _login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<AuthResponse>(
      '/auth/token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Store token in localStorage for automatic inclusion in future requests
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
    }

    return response;
  }

  private async _register(userData: RegisterData): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(
      '/auth/register',
      userData
    );
    return response;
  }

  private async _getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response;
  }

  private async _refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');

    // Update stored token
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
    }

    return response;
  }
}

export const authService = new AuthService();
