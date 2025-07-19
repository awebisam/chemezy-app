import { test, expect } from '@playwright/test';

test.describe('Lab Interface', () => {
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

    // Mock chemicals API
    await page.route('**/api/v1/chemicals/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 1,
              molecular_formula: 'H2O',
              common_name: 'Water',
              state_of_matter: 'liquid',
              color: 'colorless',
              density: 1.0,
              properties: {}
            },
            {
              id: 2,
              molecular_formula: 'NaCl',
              common_name: 'Salt',
              state_of_matter: 'solid',
              color: 'white',
              density: 2.16,
              properties: {}
            },
            {
              id: 3,
              molecular_formula: 'H2SO4',
              common_name: 'Sulfuric Acid',
              state_of_matter: 'liquid',
              color: 'colorless',
              density: 1.84,
              properties: {}
            }
          ],
          total: 3,
          page: 1,
          size: 50,
          pages: 1
        })
      });
    });

    // Set auth token in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    await page.goto('/lab');
  });

  test('should display chemical inventory', async ({ page }) => {
    await expect(page.getByText('Chemical Inventory')).toBeVisible();
    await expect(page.getByText('Water')).toBeVisible();
    await expect(page.getByText('Salt')).toBeVisible();
    await expect(page.getByText('Sulfuric Acid')).toBeVisible();
  });

  test('should display lab bench', async ({ page }) => {
    await expect(page.getByText('Lab Bench')).toBeVisible();
    await expect(page.getByText('Drop chemicals here')).toBeVisible();
  });

  test('should display environment selector', async ({ page }) => {
    await expect(page.getByText('Environment')).toBeVisible();
    await expect(page.getByText('Earth (Normal)')).toBeVisible();
  });

  test('should search chemicals', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search chemicals/i);
    await searchInput.fill('water');
    
    await expect(page.getByText('Water')).toBeVisible();
    // Other chemicals should be filtered out
    await expect(page.getByText('Salt')).not.toBeVisible();
  });

  test('should add chemical to lab bench via drag and drop', async ({ page }) => {
    // Get the chemical card and lab bench
    const waterCard = page.getByTestId('chemical-card-1');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    
    // Perform drag and drop
    await waterCard.dragTo(labBench);
    
    // Should see chemical in lab bench
    await expect(page.getByText('Water').nth(1)).toBeVisible(); // Second instance in lab bench
    await expect(page.getByRole('spinbutton')).toBeVisible(); // Quantity input
  });

  test('should change environment', async ({ page }) => {
    await page.getByText('Earth (Normal)').click();
    await page.getByText('Vacuum').click();
    
    await expect(page.getByText('Vacuum')).toBeVisible();
  });

  test('should trigger reaction', async ({ page }) => {
    // Mock reaction API
    await page.route('**/api/v1/reactions/react', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              chemical_id: 4,
              molecular_formula: 'H2O',
              common_name: 'Steam',
              quantity: 1.0,
              state_of_matter: 'gas',
              color: 'colorless'
            }
          ],
          effects: [
            {
              effect_type: 'gas_production',
              gas_type: 'steam',
              color: '#ffffff',
              intensity: 0.8,
              duration: 3
            }
          ],
          explanation: 'Water heated to produce steam',
          is_world_first: false,
          state_of_product: 'gas'
        })
      });
    });

    // Add chemicals to lab bench first
    const waterCard = page.getByTestId('chemical-card-1');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    await waterCard.dragTo(labBench);
    
    // Trigger reaction
    await page.getByRole('button', { name: /react/i }).click();
    
    // Should show loading state
    await expect(page.getByText(/reacting/i)).toBeVisible();
    
    // Should show results
    await expect(page.getByText('Steam')).toBeVisible();
    await expect(page.getByText('Water heated to produce steam')).toBeVisible();
  });

  test('should display world-first discovery', async ({ page }) => {
    // Mock world-first reaction
    await page.route('**/api/v1/reactions/react', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              chemical_id: 999,
              molecular_formula: 'XYZ',
              common_name: 'Unknown Compound',
              quantity: 1.0,
              state_of_matter: 'solid',
              color: 'purple'
            }
          ],
          effects: [],
          explanation: 'A new compound has been discovered!',
          is_world_first: true,
          state_of_product: 'solid'
        })
      });
    });

    // Add chemicals and trigger reaction
    const waterCard = page.getByTestId('chemical-card-1');
    const saltCard = page.getByTestId('chemical-card-2');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    
    await waterCard.dragTo(labBench);
    await saltCard.dragTo(labBench);
    
    await page.getByRole('button', { name: /react/i }).click();
    
    // Should show world-first celebration
    await expect(page.getByText(/world.first/i)).toBeVisible();
    await expect(page.getByText(/congratulations/i)).toBeVisible();
  });

  test('should handle reaction errors', async ({ page }) => {
    // Mock error response
    await page.route('**/api/v1/reactions/react', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Invalid reaction parameters'
        })
      });
    });

    // Add chemical and trigger reaction
    const waterCard = page.getByTestId('chemical-card-1');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    await waterCard.dragTo(labBench);
    
    await page.getByRole('button', { name: /react/i }).click();
    
    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible();
    await expect(page.getByText(/invalid reaction parameters/i)).toBeVisible();
  });

  test('should remove chemicals from lab bench', async ({ page }) => {
    // Add chemical to lab bench
    const waterCard = page.getByTestId('chemical-card-1');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    await waterCard.dragTo(labBench);
    
    // Should see remove button
    const removeButton = page.getByRole('button', { name: /remove/i });
    await expect(removeButton).toBeVisible();
    
    // Remove chemical
    await removeButton.click();
    
    // Chemical should be removed from lab bench
    await expect(page.getByText('Drop chemicals here')).toBeVisible();
  });

  test('should adjust chemical quantities', async ({ page }) => {
    // Add chemical to lab bench
    const waterCard = page.getByTestId('chemical-card-1');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    await waterCard.dragTo(labBench);
    
    // Find quantity input
    const quantityInput = page.getByRole('spinbutton');
    await expect(quantityInput).toHaveValue('1');
    
    // Change quantity
    await quantityInput.fill('2.5');
    await expect(quantityInput).toHaveValue('2.5');
  });

  test('should display visual effects during reaction', async ({ page }) => {
    // Mock reaction with effects
    await page.route('**/api/v1/reactions/react', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [],
          effects: [
            {
              effect_type: 'light_emission',
              color: '#ffff00',
              intensity: 0.9,
              radius: 2.0,
              duration: 2
            },
            {
              effect_type: 'gas_production',
              gas_type: 'oxygen',
              color: '#00ff00',
              intensity: 0.7,
              duration: 3
            }
          ],
          explanation: 'Reaction with visual effects',
          is_world_first: false
        })
      });
    });

    // Add chemical and trigger reaction
    const waterCard = page.getByTestId('chemical-card-1');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    await waterCard.dragTo(labBench);
    
    await page.getByRole('button', { name: /react/i }).click();
    
    // Should see effects renderer
    await expect(page.getByTestId('effects-renderer')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should still display main elements
    await expect(page.getByText('Chemical Inventory')).toBeVisible();
    await expect(page.getByText('Lab Bench')).toBeVisible();
    
    // Touch interactions should work
    const waterCard = page.getByTestId('chemical-card-1');
    const labBench = page.getByTestId('lab-bench-drop-zone');
    
    // Simulate touch drag
    await waterCard.tap();
    await labBench.tap();
    
    // Should add chemical to lab bench
    await expect(page.getByText('Water').nth(1)).toBeVisible();
  });
});