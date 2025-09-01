import { test, expect } from '@playwright/test';

test('Logout and verify login page', async ({ page }) => {
  // 1. Login
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await page.getByRole('textbox', { name: 'Username' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // 2. Click on the user profile icon in the top-right corner
  await page.getByRole('banner').getByRole('img', { name: 'profile picture' }).click();

  // 3. Click on "Logout"
  await page.getByRole('menuitem', { name: 'Logout' }).click();

  // 4. Verify that the login page is displayed and contains "Username"
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
});
