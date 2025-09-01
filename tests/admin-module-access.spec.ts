import { test, expect } from '@playwright/test';

test('Verify Admin Module Access', async ({ page }) => {
  // 1. Login
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.getByRole('textbox', { name: 'Username' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // 2. Click on the "Admin" tab in the left navigation
  await page.getByRole('link', { name: 'Admin' }).click();

  // 3. Verify the page contains "System Users"
  await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();

  // 4. Verify that the "Add" button is visible
  await expect(page.getByRole('button', { name: /Add/ })).toBeVisible();
});
