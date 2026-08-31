import { test, expect } from '@playwright/test';

test('loads, searches and opens a company record', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('global marine industry');
  await expect(page.locator('.company-card')).toHaveCount(24);
  await page.getByPlaceholder('Company, product, sector or market…').fill('Brunswick Corporation');
  await expect(page.locator('.company-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'View company' }).click();
  await expect(page.getByRole('dialog')).toContainText('Brunswick Corporation');
});

