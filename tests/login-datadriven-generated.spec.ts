import { test, expect } from '@playwright/test';

// Test data for login scenarios
const loginTestData = [
  {
    username: 'Admin',
    password: 'admin123',
    expectedResult: 'success',
    description: 'Valid Admin credentials - Dashboard should be visible'
  },
  {
    username: 'fakeuser',
    password: 'fakepass',
    expectedResult: 'error',
    description: 'Invalid credentials - Error message should appear'
  },
  {
    username: 'ESSUser1',
    password: 'ess123',
    expectedResult: 'error',
    description: 'Invalid ESS credentials - Error message should appear'
  }
];

test.describe('OrangeHRM Login Data-Driven Tests', () => {
  
  loginTestData.forEach((testCase, index) => {
    test(`Login Test ${index + 1}: ${testCase.description}`, async ({ page }) => {
      // Step 1: Navigate to the login page
      await page.goto('https://opensource-demo.orangehrmlive.com');
      
      // Wait for the page to load completely
      await page.waitForLoadState('networkidle');
      
      // Step 2: Enter username
      await page.fill('input[name="username"]', testCase.username);
      
      // Step 3: Enter password  
      await page.fill('input[name="password"]', testCase.password);
      
      // Step 4: Click login button
      await page.click('button[type="submit"]');
      
      // Wait for navigation or error response
      await page.waitForTimeout(2000);
      
      // Step 5: Verify expected result
      if (testCase.expectedResult === 'success') {
        // Verify successful login - Dashboard should be visible
        await expect(page).toHaveURL(/.*dashboard.*/);
        
        // Verify dashboard heading is present
        await expect(page.locator('h6')).toContainText('Dashboard');
        
        // Step 6: Logout process - Click on User dropdown
        await page.click('.oxd-userdropdown-tab');
        
        // Wait for dropdown menu to appear
        await page.waitForSelector('.oxd-dropdown-menu', { state: 'visible' });
        
        // Click Logout
        await page.click('text=Logout');
        
        // Verify we're back to login page
        await expect(page).toHaveURL(/.*auth\/login.*/);
        
      } else {
        // Verify error message for invalid credentials
        const errorAlert = page.locator('.oxd-alert-content-text');
        await expect(errorAlert).toBeVisible();
        await expect(errorAlert).toContainText('Invalid credentials');
        
        // Verify we stayed on login page
        await expect(page).toHaveURL(/.*auth\/login.*/);
      }
    });
  });

});
