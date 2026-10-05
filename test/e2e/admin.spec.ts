import { test, expect } from '@playwright/test';

test('admin route serves a noindex login shell', async ({ page }) => {
  const response = await page.goto('/admin');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();

  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toContain('noindex');
  expect(robots).toContain('nofollow');
});
