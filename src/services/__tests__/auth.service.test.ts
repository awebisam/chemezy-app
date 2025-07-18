import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../auth.service';
import { apiClient } from '../api';

// Mock the API client
vi.mock('../api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const credentials = {
        username: 'testuser',
        password: 'testpass',
      };

      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/token',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_token',
        'test-token'
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass',
      };

      const result = await authService.register(userData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        access_token: 'new-token',
        token_type: 'bearer',
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_token',
        'new-token'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear stored authentication data', () => {
      authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      vi.mocked(localStorageMock.getItem).mockReturnValue('test-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should return false when token does not exist', () => {
      vi.mocked(localStorageMock.getItem).mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return stored token', () => {
      vi.mocked(localStorageMock.getItem).mockReturnValue('test-token');

      const result = authService.getToken();

      expect(result).toBe('test-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });
});
