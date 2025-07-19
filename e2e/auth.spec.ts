import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should switch to registration form', async ({ page }) => {
    await page.getByText(/don't have an account/i).click();
    
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('should validate login form', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/username is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should validate registration form', async ({ page }) => {
    await page.getByText(/don't have an account/i).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/username is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.getByText(/don't have an account/i).click();
    
    const passwordInput = page.getByPlaceholder(/password/i);
    await passwordInput.fill('weak');
    
    await expect(page.getByText(/weak/i)).toBeVisible();
    
    await passwordInput.fill('StrongPassword123!');
    await expect(page.getByText(/strong/i)).toBeVisible();
  });

  test('should handle login attempt with invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/username/i).fill('testuser');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message (assuming API returns 401)
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should handle successful login', async ({ page }) => {
    // Mock successful login response
    await page.route('**/api/v1/auth/token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          token_type: 'bearer'
        })
      });
    });

    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: true,
          is_admin: false,
          created_at: '2024-01-01T00:00:00Z'
        })
      });
    });

    await page.getByPlaceholder(/username/i).fill('testuser');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should handle successful registration', async ({ page }) => {
    // Mock successful registration response
    await page.route('**/api/v1/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'newuser',
          email: 'new@example.com',
          is_active: true,
          is_admin: false,
          created_at: '2024-01-01T00:00:00Z'
        })
      });
    });

    await page.getByText(/don't have an account/i).click();
    
    await page.getByPlaceholder(/username/i).fill('newuser');
    await page.getByPlaceholder(/email/i).fill('new@example.com');
    await page.getByPlaceholder(/password/i).fill('StrongPassword123!');
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should show success message and switch to login
    await expect(page.getByText(/account created successfully/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // First login
    await page.route('**/api/v1/auth/token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          token_type: 'bearer'
        })
      });
    });

    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: true,
          is_admin: false,
          created_at: '2024-01-01T00:00:00Z'
        })
      });
    });

    await page.getByPlaceholder(/username/i).fill('testuser');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL('/dashboard');
    
    // Now logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/v1/auth/token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          token_type: 'bearer'
        })
      });
    });

    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_active: true,
          is_admin: false,
          created_at: '2024-01-01T00:00:00Z'
        })
      });
    });

    await page.getByPlaceholder(/username/i).fill('testuser');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL('/dashboard');
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
  });
});