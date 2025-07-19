import { test, expect } from '@playwright/test';

test.describe('Awards and Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
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

    // Mock user awards
    await page.route('**/api/v1/awards/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            user_id: 1,
            template_id: 1,
            tier: 1,
            progress: {},
            granted_at: '2024-01-01T10:00:00Z',
            template: {
              id: 1,
              name: 'First Reaction',
              description: 'Complete your first chemical reaction',
              category: 'discovery',
              icon: '🧪',
              criteria: {}
            }
          },
          {
            id: 2,
            user_id: 1,
            template_id: 2,
            tier: 2,
            progress: {},
            granted_at: '2024-01-02T15:30:00Z',
            template: {
              id: 2,
              name: 'Explorer',
              description: 'Discover 10 different reactions',
              category: 'discovery',
              icon: '🔍',
              criteria: {}
            }
          }
        ])
      });
    });

    // Mock available awards
    await page.route('**/api/v1/awards/available', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 3,
            name: 'Master Chemist',
            description: 'Complete 100 reactions',
            category: 'achievement',
            icon: '👨‍🔬',
            criteria: { reactions_needed: 100 },
            progress: { current_reactions: 25, percentage: 25 }
          },
          {
            id: 4,
            name: 'World Discoverer',
            description: 'Make 5 world-first discoveries',
            category: 'discovery',
            icon: '🌍',
            criteria: { discoveries_needed: 5 },
            progress: { current_discoveries: 1, percentage: 20 }
          }
        ])
      });
    });

    // Mock leaderboard
    await page.route('**/api/v1/awards/leaderboard/overall', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            rank: 1,
            user_id: 2,
            username: 'topuser',
            award_count: 15,
            total_points: 450
          },
          {
            rank: 2,
            user_id: 1,
            username: 'testuser',
            award_count: 2,
            total_points: 30
          },
          {
            rank: 3,
            user_id: 3,
            username: 'thirduser',
            award_count: 1,
            total_points: 10
          }
        ])
      });
    });

    // Mock user rank
    await page.route('**/api/v1/awards/leaderboard/my-rank', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          rank: 2,
          user_id: 1,
          username: 'testuser',
          award_count: 2,
          total_points: 30
        })
      });
    });

    // Mock reaction stats
    await page.route('**/api/v1/reactions/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_reactions: 25,
          world_first_discoveries: 1,
          favorite_environment: 'Earth (Normal)',
          most_used_chemical: 'Water'
        })
      });
    });

    // Set auth token
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    await page.goto('/dashboard');
  });

  test('should display user dashboard', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Welcome, testuser')).toBeVisible();
  });

  test('should display earned awards', async ({ page }) => {
    await expect(page.getByText('Your Awards')).toBeVisible();
    await expect(page.getByText('First Reaction')).toBeVisible();
    await expect(page.getByText('Explorer')).toBeVisible();
    
    // Should show award icons
    await expect(page.getByText('🧪')).toBeVisible();
    await expect(page.getByText('🔍')).toBeVisible();
  });

  test('should display progress toward unearned awards', async ({ page }) => {
    await expect(page.getByText('Progress')).toBeVisible();
    await expect(page.getByText('Master Chemist')).toBeVisible();
    await expect(page.getByText('World Discoverer')).toBeVisible();
    
    // Should show progress bars
    await expect(page.getByRole('progressbar')).toHaveCount(2);
    
    // Should show progress percentages
    await expect(page.getByText('25%')).toBeVisible();
    await expect(page.getByText('20%')).toBeVisible();
  });

  test('should display user statistics', async ({ page }) => {
    await expect(page.getByText('Statistics')).toBeVisible();
    await expect(page.getByText('25')).toBeVisible(); // Total reactions
    await expect(page.getByText('1')).toBeVisible(); // World-first discoveries
    await expect(page.getByText('Earth (Normal)')).toBeVisible(); // Favorite environment
    await expect(page.getByText('Water')).toBeVisible(); // Most used chemical
  });

  test('should filter awards by category', async ({ page }) => {
    // Click on discovery category filter
    await page.getByText('Discovery').click();
    
    // Should show only discovery awards
    await expect(page.getByText('First Reaction')).toBeVisible();
    await expect(page.getByText('Explorer')).toBeVisible();
    
    // Click on achievement category
    await page.getByText('Achievement').click();
    
    // Should show progress toward achievement awards
    await expect(page.getByText('Master Chemist')).toBeVisible();
  });

  test('should open award detail modal', async ({ page }) => {
    // Click on an award
    await page.getByText('First Reaction').click();
    
    // Should open modal with award details
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Complete your first chemical reaction')).toBeVisible();
    await expect(page.getByText('Granted on')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display celebration animation for new awards', async ({ page }) => {
    // Mock new award notification
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('newAward', {
        detail: {
          id: 5,
          name: 'Quick Learner',
          description: 'Complete 5 reactions in one session',
          icon: '⚡'
        }
      }));
    });
    
    // Should show celebration animation
    await expect(page.getByTestId('celebration-animation')).toBeVisible();
    await expect(page.getByText('New Award Earned!')).toBeVisible();
    await expect(page.getByText('Quick Learner')).toBeVisible();
  });

  test('should navigate to leaderboard', async ({ page }) => {
    await page.getByText('Leaderboard').click();
    
    await expect(page).toHaveURL('/leaderboard');
    await expect(page.getByText('Overall Leaderboard')).toBeVisible();
  });

  test('should display leaderboard rankings', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Should show leaderboard table
    await expect(page.getByText('Rank')).toBeVisible();
    await expect(page.getByText('Username')).toBeVisible();
    await expect(page.getByText('Awards')).toBeVisible();
    await expect(page.getByText('Points')).toBeVisible();
    
    // Should show user rankings
    await expect(page.getByText('topuser')).toBeVisible();
    await expect(page.getByText('testuser')).toBeVisible();
    await expect(page.getByText('thirduser')).toBeVisible();
    
    // Should highlight current user
    const userRow = page.getByText('testuser').locator('..');
    await expect(userRow).toHaveClass(/highlight/);
  });

  test('should filter leaderboard by category', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Mock category leaderboard
    await page.route('**/api/v1/awards/leaderboard/discovery', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            rank: 1,
            user_id: 1,
            username: 'testuser',
            award_count: 2,
            total_points: 20
          }
        ])
      });
    });
    
    // Select discovery category
    await page.getByRole('combobox').selectOption('discovery');
    
    // Should show filtered leaderboard
    await expect(page.getByText('Discovery Leaderboard')).toBeVisible();
  });

  test('should display user rank prominently', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Should show user's current rank
    await expect(page.getByText('Your Rank: #2')).toBeVisible();
    await expect(page.getByText('30 points')).toBeVisible();
  });

  test('should handle empty states', async ({ page }) => {
    // Mock empty awards response
    await page.route('**/api/v1/awards/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.reload();
    
    // Should show empty state message
    await expect(page.getByText('No awards yet')).toBeVisible();
    await expect(page.getByText('Start experimenting to earn your first award!')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/awards/me', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.reload();
    
    // Should show loading spinner
    await expect(page.getByTestId('loading-spinner')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route('**/api/v1/awards/me', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      });
    });
    
    await page.reload();
    
    // Should show error message
    await expect(page.getByText('Failed to load awards')).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should display mobile-optimized layout
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Awards should be in a responsive grid
    const awardsGrid = page.getByTestId('awards-grid');
    await expect(awardsGrid).toHaveClass(/grid-cols-1/); // Single column on mobile
    
    // Navigation should be mobile-friendly
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through awards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should focus on first award
    const firstAward = page.getByText('First Reaction');
    await expect(firstAward).toBeFocused();
    
    // Press Enter to open modal
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Press Escape to close modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});