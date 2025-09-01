import { test, expect } from '@playwright/test';

test.describe('OrangeHRM PIM Page Verification', () => {
  test('Verify PIM Employee Information page functionality', async ({ page }) => {
    // Step 1: Navigate to OrangeHRM demo site
    await page.goto('https://opensource-demo.orangehrmlive.com');

    // Step 2: Login with provided credentials
    await page.getByRole('textbox', { name: 'Username' }).fill('Admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Step 3: Wait for dashboard to be visible after login
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Step 4: Click on "PIM" in the left sidebar menu
    await page.getByRole('link', { name: 'PIM' }).click();

    // Step 5: Verify that the "Employee Information" page is displayed
    await expect(page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();

    // Step 6: Check that both "Add" and "Search" buttons are visible on the page
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();

    // Step 7: Click the user icon in the top right corner
    await page.locator('span').filter({ hasText: 'FirstName LastName' }).click();

    // Step 8: Click the "Logout" option
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    // Step 9: Verify that the login page is displayed again
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();

    // Additional verification: Check that we're on the login URL
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
