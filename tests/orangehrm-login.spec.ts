import { test, expect } from '@playwright/test';

test('OrangeHRM login and dashboard verification', async ({ page }) => {
  // 1. Navigate to login page
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

  // 2. Enter username
  await page.getByRole('textbox', { name: 'Username' }).fill('Admin');

  // 3. Enter password
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');

  // 4. Click on "Login"
  await page.getByRole('button', { name: 'Login' }).click();

  // 5. Verify that the URL contains "dashboard"
  await expect(page).toHaveURL(/dashboard/);

  // 6. Verify that the page contains "Dashboard"
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
