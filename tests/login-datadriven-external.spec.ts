import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Interface for CSV data structure
interface LoginTestData {
  Username: string;
  Password: string;
  Expected: string;
}

// Function to read and parse CSV file
function readCSVData(filePath: string): LoginTestData[] {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data: LoginTestData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: LoginTestData = {
      Username: values[0].trim(),
      Password: values[1].trim(),
      Expected: values[2].trim()
    };
    data.push(row);
  }
  
  return data;
}

test.describe('OrangeHRM Login Data-Driven Tests with External CSV', () => {
  
  // Read test data from external CSV file
  const csvFilePath = path.join(__dirname, '..', 'test-data', 'loginData.csv');
  const testData = readCSVData(csvFilePath);
  
  testData.forEach((data, index) => {
    test(`CSV Row ${index + 1}: Login test for ${data.Username} - Expected: ${data.Expected}`, async ({ page }) => {
      
      console.log(`\n🧪 Testing Row ${index + 1}:`);
      console.log(`   Username: ${data.Username}`);
      console.log(`   Password: ${data.Password}`);
      console.log(`   Expected: ${data.Expected}`);
      
      // Step 1: Navigate to the OrangeHRM login page
      await page.goto('https://opensource-demo.orangehrmlive.com');
      
      // Wait for page to load completely
      await page.waitForLoadState('networkidle');
      
      // Step 2: Enter username from CSV data
      await page.fill('input[name="username"]', data.Username);
      
      // Step 3: Enter password from CSV data
      await page.fill('input[name="password"]', data.Password);
      
      // Step 4: Click the Login button
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Step 5: Verify expected result based on CSV data
      if (data.Expected === 'Dashboard') {
        // Verify successful login - Dashboard should be visible
        await expect(page).toHaveURL(/.*dashboard.*/);
        await expect(page.locator('h6')).toContainText('Dashboard');
        
        console.log(`   ✅ PASS: Dashboard is visible as expected`);
        
        // Logout to clean up for next test
        await page.click('.oxd-userdropdown-tab');
        await page.waitForSelector('.oxd-dropdown-menu', { state: 'visible' });
        await page.click('text=Logout');
        await expect(page).toHaveURL(/.*auth\/login.*/);
        
      } else if (data.Expected === 'Invalid credentials') {
        // Verify error message for invalid credentials
        const errorAlert = page.locator('.oxd-alert-content-text');
        await expect(errorAlert).toBeVisible();
        await expect(errorAlert).toContainText('Invalid credentials');
        
        // Verify we stayed on login page
        await expect(page).toHaveURL(/.*auth\/login.*/);
        
        console.log(`   ✅ PASS: "Invalid credentials" error message displayed as expected`);
      } else {
        console.log(`   ❌ FAIL: Unexpected expected value: ${data.Expected}`);
        throw new Error(`Unexpected expected value: ${data.Expected}`);
      }
    });
  });

});
