import { test, expect } from '@playwright/test';

test.describe('Add Employee Verification', () => {
  test('should successfully add a new employee and verify profile display', async ({ page }) => {
    // Step 1: Navigate to the OrangeHRM login page
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Step 2: Login with Admin credentials
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Step 3: Navigate to PIM module
    await page.click('a[href="/web/index.php/pim/viewPimModule"]');
    await page.waitForLoadState('networkidle');

    // Step 4: Click on "Add Employee" button
    await page.click('a:has-text("Add Employee")');
    await page.waitForLoadState('networkidle');

    // Step 5: Enter employee details
    // Wait for the form to be ready
    await page.waitForSelector('input[placeholder="First Name"]');
    
    // Fill First Name
    await page.fill('input[placeholder="First Name"]', 'John123');
    
    // Fill Last Name  
    await page.fill('input[placeholder="Last Name"]', 'Doe456');
    
    // Step 6: Save the employee
    await page.click('button:has-text("Save")');
    
    // Wait for save operation and potential redirect
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 7: Verify that the employee profile page is displayed
    // Check if we're redirected to the personal details page
    await expect(page).toHaveURL(/.*\/pim\/viewPersonalDetails\/empNumber\/\d+/);

    // Step 8: Confirm that 'John123 Doe456' is shown on the top
    await expect(page.locator('h6:has-text("John123 Doe456")')).toBeVisible();
    
    // Additional verifications
    // Verify the employee data is displayed correctly in the form
    await expect(page.locator('input[placeholder="First Name"]')).toHaveValue('John123');
    await expect(page.locator('input[placeholder="Last Name"]')).toHaveValue('Doe456');
    
    // Verify we're on the Personal Details tab
    await expect(page.locator('a:has-text("Personal Details")')).toBeVisible();
    
    console.log(`Successfully created employee: John123 Doe456`);
  });

  test.afterEach(async ({ page }) => {
    // Optional: Logout after each test
    try {
      // Click on user dropdown
      await page.click('span.oxd-userdropdown-tab');
      await page.waitForTimeout(1000);
      // Click logout
      await page.click('a:has-text("Logout")');
    } catch (error) {
      console.log('Logout failed or already logged out:', error.message);
    }
  });
});
