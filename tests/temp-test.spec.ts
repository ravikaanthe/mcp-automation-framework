import { test, expect } from '@playwright/test';

// Generated from: Simple Login Test

test.describe('Simple Login Test', () => {
  test('Login functionality', async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
    await expect(page.locator('h6')).toContainText('Dashboard');
  });
});