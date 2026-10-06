import { test, expect } from '@playwright/test';

test('runtime locale selector translates navigation and persists query language', async ({ page }) => {
  await page.goto('/?lang=es');
  await expect(page.locator('#global-language-select')).toHaveValue('es');
  await expect(page.getByText('¿Mi salario es suficiente?')).toBeVisible();

  await page.locator('#global-language-select').selectOption('fr');
  await expect(page).toHaveURL(/lang=fr/);
  await expect(page.getByText('Comparer les villes')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  await page.locator('#global-language-select').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('مقارنة المدن')).toBeVisible();
});
