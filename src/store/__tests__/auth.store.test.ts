import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../auth.store';
import { authService } from '@/services/auth.service';

// Mock the auth service
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    getToken: vi.fn(),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle successful login', async () => {
    const mockAuthResponse = { access_token: 'test-token', token_type: 'bearer' };
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', is_active: true, is_admin: false, created_at: '2023-01-01' };
    
    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    const { login } = useAuthStore.getState();
    
    await login({ username: 'testuser', password: 'password' });
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('test-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials');
    vi.mocked(authService.login).mockRejectedValue(mockError);

    const { login } = useAuthStore.getState();
    
    await expect(login({ username: 'testuser', password: 'wrong' })).rejects.toThrow('Invalid credentials');
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });

  it('should handle logout', () => {
    // Set authenticated state
    useAuthStore.setState({
      user: { id: 1, username: 'testuser', email: 'test@example.com', is_active: true, is_admin: false, created_at: '2023-01-01' },
      token: 'test-token',
      isAuthenticated: true,
    });

    const { logout } = useAuthStore.getState();
    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should clear error', () => {
    useAuthStore.setState({ error: 'Test error' });
    
    const { clearError } = useAuthStore.getState();
    clearError();
    
    const state = useAuthStore.getState();
    expect(state.error).toBeNull();
  });
});