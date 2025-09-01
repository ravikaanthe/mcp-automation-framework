

import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import path from 'path';

// Define the type for each row in the Excel file
type UserRow = {
  username: string;
  password: string;
  prompt: string;
};

// Read Excel file
function getTestData(): UserRow[] {
  const filePath = path.resolve(__dirname, '../testdata/testdata.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet) as UserRow[];
}

const testData = getTestData();

test.describe('OrangeHRM Login - Data Driven', () => {
  for (const row of testData) {
    const username = row['username'];
    const password = row['password'];
    const prompt = row['prompt'];

    test(`Login as ${username} and verify: ${prompt}`, async ({ page }) => {
      await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      await page.getByRole('textbox', { name: 'Username' }).fill(username);
      await page.getByRole('textbox', { name: 'Password' }).fill(password);
      await page.getByRole('button', { name: 'Login' }).click();

      // Dynamic verification based on prompt
      if (prompt && prompt.toLowerCase().includes('dashboard')) {
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      } else if (prompt && prompt.toLowerCase().includes('invalid')) {
        await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
      } else if (prompt) {
        await expect(page.getByText(new RegExp(prompt, 'i'))).toBeVisible();
      }
    });
  }
});
