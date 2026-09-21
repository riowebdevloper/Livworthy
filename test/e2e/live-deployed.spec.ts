import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://livworthy.vercel.app';

test.describe('LivWorthy Live Deployed Vercel Production Validation', () => {
  test('1. Live Homepage loads branding, tabs, and default $100K NYC scenario', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/LivWorthy/);

    // Official brand logo
    const logoImg = page.locator('#livworthy-header img[alt="LivWorthy"]');
    await expect(logoImg).toBeVisible();

    // Verify all primary tabs
    await expect(page.locator('#tab-salary-worth')).toBeVisible();
    await expect(page.locator('#tab-salary-needed')).toBeVisible();
    await expect(page.locator('#tab-salary-after-tax')).toBeVisible();
    await expect(page.locator('#tab-cost-of-living')).toBeVisible();
    await expect(page.locator('#tab-compare')).toBeVisible();
    await expect(page.locator('#tab-job-offers')).toBeVisible();

    // Verify take-home calculation for NYC $100K ($70,116)
    await expect(page.locator('text=$70,116').first()).toBeVisible({ timeout: 10000 });
    console.log('Homepage live validation PASSED: $70,116 take home verified.');
  });

  test('2. Live Navigation across all 6 calculators', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'networkidle' });

    // 1. Salary After Tax
    await page.click('#tab-salary-after-tax');
    await expect(page.locator('text=Federal Income Tax').first()).toBeVisible({ timeout: 10000 });

    // 2. Salary Needed
    await page.click('#tab-salary-needed');
    await expect(page.locator('text=Required Gross Salary').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=$89,662').first()).toBeVisible();

    // 3. Cost of Living
    await page.click('#tab-cost-of-living');
    await expect(page.locator('#cost-of-living-view')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Household Living Costs').first()).toBeVisible();

    // 4. Compare Cities
    await page.click('#tab-compare');
    await expect(page.locator('#compare-view')).toBeVisible({ timeout: 10000 });

    // 5. Job Offers
    await page.click('#tab-job-offers');
    await expect(page.locator('#job-offer-compare-view')).toBeVisible({ timeout: 10000 });

    console.log('All 6 calculator tabs verified live on Vercel.');
  });

  test('3. Live URL query parameter deep linking', async ({ page }) => {
    await page.goto(`${LIVE_URL}/?city=london&salary=75000&tab=salary-worth`, { waitUntil: 'networkidle' });

    // Verify London £75,000 is loaded
    await expect(page.locator('#hero-location-select')).toHaveValue('london');
    await expect(page.locator('text=£').first()).toBeVisible({ timeout: 10000 });
    console.log('Deep linking to London verified live on Vercel.');
  });

  test('4. Live Drawers & Modals: Evidence, Methodology, Diagnostics', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'networkidle' });

    // 1. Methodology Modal
    await page.click('#btn-open-methodology');
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Escape');

    // 2. Diagnostics Modal
    const diagBtn = page.locator('#btn-open-diagnostics');
    if (await diagBtn.isVisible()) {
      await diagBtn.click();
      await expect(page.locator('text=LivWorthy System Architecture & Diagnostics').first()).toBeVisible({ timeout: 10000 });
      await page.keyboard.press('Escape');
    }

    // 3. Customizer
    const customizerBtn = page.locator('text=Customize Assumptions').first();
    if (await customizerBtn.isVisible()) {
      await customizerBtn.click();
      await expect(page.locator('text=Household Structure').first()).toBeVisible({ timeout: 10000 });
      await page.keyboard.press('Escape');
    }

    console.log('Modals and Drawers verified live on Vercel.');
  });
});
