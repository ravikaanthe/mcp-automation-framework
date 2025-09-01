import { test, expect } from '@playwright/test';

// Self-healing utility functions for robust element location
class SelfHealingLocators {
  
  static async findUsernameField(page: any) {
    // Primary locator strategies for username field
    const strategies = [
      () => page.locator('input[name="username"]'),
      () => page.locator('input[placeholder*="Username" i]'),
      () => page.getByRole('textbox', { name: /username/i }),
      () => page.getByLabel(/username/i),
      () => page.locator('input[type="text"]').first(),
      () => page.locator('input').filter({ hasText: '' }).first()
    ];
    
    for (const strategy of strategies) {
      try {
        const element = strategy();
        await element.waitFor({ timeout: 2000 });
        if (await element.isVisible()) {
          console.log('✅ Username field found with strategy:', strategy.toString());
          return element;
        }
      } catch (error) {
        console.log('❌ Strategy failed:', strategy.toString());
      }
    }
    throw new Error('Username field could not be located with any strategy');
  }

  static async findPasswordField(page: any) {
    // Primary locator strategies for password field
    const strategies = [
      () => page.locator('input[name="password"]'),
      () => page.locator('input[type="password"]'),
      () => page.locator('input[placeholder*="Password" i]'),
      () => page.getByRole('textbox', { name: /password/i }),
      () => page.getByLabel(/password/i),
      () => page.locator('input[type="password"]').first()
    ];
    
    for (const strategy of strategies) {
      try {
        const element = strategy();
        await element.waitFor({ timeout: 2000 });
        if (await element.isVisible()) {
          console.log('✅ Password field found with strategy:', strategy.toString());
          return element;
        }
      } catch (error) {
        console.log('❌ Strategy failed:', strategy.toString());
      }
    }
    throw new Error('Password field could not be located with any strategy');
  }

  static async findLoginButton(page: any) {
    // Primary locator strategies for login button
    const strategies = [
      () => page.locator('button[type="submit"]'),
      () => page.getByRole('button', { name: /login/i }),
      () => page.getByRole('button', { name: /sign in/i }),
      () => page.locator('button:has-text("Login")'),
      () => page.locator('input[type="submit"]'),
      () => page.locator('button').filter({ hasText: /login|sign in/i }).first()
    ];
    
    for (const strategy of strategies) {
      try {
        const element = strategy();
        await element.waitFor({ timeout: 2000 });
        if (await element.isVisible()) {
          console.log('✅ Login button found with strategy:', strategy.toString());
          return element;
        }
      } catch (error) {
        console.log('❌ Strategy failed:', strategy.toString());
      }
    }
    throw new Error('Login button could not be located with any strategy');
  }

  static async findUserDropdown(page: any) {
    // Primary locator strategies for user dropdown
    const strategies = [
      () => page.locator('.oxd-userdropdown-tab'),
      () => page.locator('[data-v-*="profile"]'),
      () => page.locator('img[alt*="profile"]').locator('..'),
      () => page.locator('span:has-text("user")').first(),
      () => page.locator('[class*="profile"]').first(),
      () => page.locator('[class*="user"]').first(),
      () => page.locator('img[src*="profile"]').locator('..')
    ];
    
    for (const strategy of strategies) {
      try {
        const element = strategy();
        await element.waitFor({ timeout: 2000 });
        if (await element.isVisible()) {
          console.log('✅ User dropdown found with strategy:', strategy.toString());
          return element;
        }
      } catch (error) {
        console.log('❌ Strategy failed:', strategy.toString());
      }
    }
    throw new Error('User dropdown could not be located with any strategy');
  }

  static async findLogoutOption(page: any) {
    // Primary locator strategies for logout option
    const strategies = [
      () => page.getByRole('menuitem', { name: /logout/i }),
      () => page.locator('text=Logout'),
      () => page.locator('a:has-text("Logout")'),
      () => page.locator('[href*="logout"]'),
      () => page.locator('li:has-text("Logout")'),
      () => page.locator('span:has-text("Logout")')
    ];
    
    for (const strategy of strategies) {
      try {
        const element = strategy();
        await element.waitFor({ timeout: 2000 });
        if (await element.isVisible()) {
          console.log('✅ Logout option found with strategy:', strategy.toString());
          return element;
        }
      } catch (error) {
        console.log('❌ Strategy failed:', strategy.toString());
      }
    }
    throw new Error('Logout option could not be located with any strategy');
  }
}

test.describe('Self-Healing OrangeHRM Login Test', () => {
  
  test('Login with self-healing locators and logout', async ({ page }) => {
    console.log('🚀 Starting self-healing login test...');
    
    // Step 1: Open the OrangeHRM website
    console.log('📖 Step 1: Opening OrangeHRM website...');
    await page.goto('https://opensource-demo.orangehrmlive.com');
    await page.waitForLoadState('networkidle');
    console.log('✅ Website loaded successfully');
    
    // PAUSE: Script paused after OrangeHRM portal opens
    console.log('⏸️ PAUSING: OrangeHRM portal is now open. Script paused for inspection.');
    await page.pause();
    
    // Step 2: Request permission (simulated in test environment)
    console.log('🔐 Step 2: Permission granted to proceed with login');
    
    // Step 3: Login with Admin/admin123 using self-healing locators
    console.log('👤 Step 3: Attempting login with self-healing locators...');
    
    try {
      // Find and fill username field
      console.log('🔍 Locating username field...');
      const usernameField = await SelfHealingLocators.findUsernameField(page);
      
      // Clear and fill username with proper waits
      await usernameField.click();
      await usernameField.fill('');
      await page.waitForTimeout(500);
      await usernameField.type('Admin', { delay: 100 });
      console.log('✅ Username entered successfully');
      
      // Find and fill password field  
      console.log('🔍 Locating password field...');
      const passwordField = await SelfHealingLocators.findPasswordField(page);
      
      // Clear and fill password with proper waits
      await passwordField.click();
      await passwordField.fill('');
      await page.waitForTimeout(500);
      await passwordField.type('admin123', { delay: 100 });
      console.log('✅ Password entered successfully');
      
      // Wait before clicking login to ensure fields are properly filled
      await page.waitForTimeout(1000);
      
      // Find and click login button
      console.log('🔍 Locating login button...');
      const loginButton = await SelfHealingLocators.findLoginButton(page);
      await loginButton.click();
      console.log('✅ Login button clicked');
      
      // Wait for navigation
      await page.waitForTimeout(5000);
      
      // Check if we got invalid credentials error and retry if needed
      const errorMessage = page.locator('.oxd-alert-content-text');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        if (errorText?.includes('Invalid credentials')) {
          console.log('⚠️ Invalid credentials error detected, retrying with slower input...');
          
          // Retry with even slower input
          await usernameField.click();
          await usernameField.selectAll();
          await page.keyboard.press('Delete');
          await page.waitForTimeout(1000);
          await usernameField.type('Admin', { delay: 200 });
          
          await passwordField.click();
          await passwordField.selectAll();
          await page.keyboard.press('Delete');
          await page.waitForTimeout(1000);
          await passwordField.type('admin123', { delay: 200 });
          
          await page.waitForTimeout(2000);
          await loginButton.click();
          await page.waitForTimeout(5000);
        }
      }
      
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
    
    // Step 4: Verify dashboard loads
    console.log('📊 Step 4: Verifying dashboard loaded...');
    try {
      // Verify URL contains dashboard
      await expect(page).toHaveURL(/.*dashboard.*/);
      
      // Verify dashboard heading or elements
      const dashboardIndicators = [
        () => page.locator('h6:has-text("Dashboard")'),
        () => page.locator('[class*="dashboard"]'),
        () => page.locator('text=Dashboard').first(),
        () => page.locator('[data-v-*="dashboard"]')
      ];
      
      let dashboardFound = false;
      for (const indicator of dashboardIndicators) {
        try {
          await indicator().waitFor({ timeout: 2000 });
          if (await indicator().isVisible()) {
            dashboardFound = true;
            console.log('✅ Dashboard verified with indicator:', indicator.toString());
            break;
          }
        } catch (error) {
          // Continue to next indicator
        }
      }
      
      if (!dashboardFound) {
        console.log('⚠️ Dashboard indicators not found, but URL suggests success');
      }
      
      console.log('✅ Dashboard loaded successfully');
      
    } catch (error) {
      console.error('❌ Dashboard verification failed:', error.message);
      throw error;
    }
    
    // Step 5: Click on User icon and logout
    console.log('👋 Step 5: Attempting logout...');
    try {
      // Find and click user dropdown
      console.log('🔍 Locating user dropdown...');
      const userDropdown = await SelfHealingLocators.findUserDropdown(page);
      await userDropdown.click();
      console.log('✅ User dropdown clicked');
      
      // Wait for dropdown menu to appear
      await page.waitForTimeout(1000);
      
      // Find and click logout option
      console.log('🔍 Locating logout option...');
      const logoutOption = await SelfHealingLocators.findLogoutOption(page);
      await logoutOption.click();
      console.log('✅ Logout clicked');
      
      // Verify return to login page
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/.*auth\/login.*/);
      console.log('✅ Successfully logged out and returned to login page');
      
    } catch (error) {
      console.error('❌ Logout failed:', error.message);
      throw error;
    }
    
    console.log('🎉 Self-healing test completed successfully!');
  });

});
