import { apiClient } from './api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserResponse,
} from '@/types/api.types';

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
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

  /**
   * Register a new user account
   */
  async register(userData: RegisterData): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(
      '/auth/register',
      userData
    );
    return response;
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response;
  }

  /**
   * Refresh the current JWT token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');

    // Update stored token
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
    }

    return response;
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
}

export const authService = new AuthService();
