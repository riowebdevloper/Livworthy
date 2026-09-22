import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Responsive Money Display & Currency Overlap Regression Suite', () => {
  const screenshotsDir = path.join(process.cwd(), 'test-results', 'money-screenshots');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const viewports = [
    { name: 'mobile-360', width: 360, height: 800 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-412', width: 412, height: 915 },
    { name: 'desktop-1440', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`1. Dubai AED 350,000 at ${vp.name} (${vp.width}x${vp.height}) - No overlap, no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/?city=dubai&salary=350000&tab=salary-worth');
      await page.waitForLoadState('domcontentloaded');

      // Wait for primary result card to appear
      const resultCard = page.locator('#result-summary-card');
      await expect(resultCard).toBeVisible({ timeout: 15000 });

      // Check for horizontal overflow of document
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow, `Document has horizontal scrollbar at ${vp.name}`).toBe(false);

      // Verify currency input spacing
      const salaryInput = page.locator('#hero-annual-salary-input');
      await expect(salaryInput).toBeVisible();
      const inputValue = await salaryInput.inputValue();
      expect(inputValue).toContain('350,000');

      // Verify exact result values are visible and rendered
      await expect(page.locator('text=Gross Compensation').first()).toBeVisible();
      await expect(page.locator('text=AED').first()).toBeVisible();

      // Check card bounding box vs viewport
      const cardBox = await resultCard.boundingBox();
      expect(cardBox).not.toBeNull();
      if (cardBox) {
        expect(cardBox.x).toBeGreaterThanOrEqual(0);
        expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(vp.width + 2); // allowing minor subpixel margin
      }

      // Check that Living Costs row amount and label do not intersect
      const livingCostLabel = page.locator('text=Estimated Living Costs').first();
      const livingCostAmount = page.locator('#result-summary-card').locator('text=/−AED/').first();
      await expect(livingCostLabel).toBeVisible();
      await expect(livingCostAmount).toBeVisible();

      const labelBox = await livingCostLabel.boundingBox();
      const amountBox = await livingCostAmount.boundingBox();

      if (labelBox && amountBox) {
        // If on same vertical row (desktop), horizontally separated; if stacked (mobile), vertically separated
        const verticallySeparated = labelBox.y + labelBox.height <= amountBox.y || amountBox.y + amountBox.height <= labelBox.y;
        const horizontallySeparated = labelBox.x + labelBox.width <= amountBox.x || amountBox.x + amountBox.width <= labelBox.x;
        expect(verticallySeparated || horizontallySeparated, 'Label and Amount bounding boxes must not intersect').toBe(true);
      }

      // Verify Disposable Income monthly equivalent row
      const monthlyEquiv = page.locator('#result-summary-card').locator('text=/Equivalent to AED/').first();
      await expect(monthlyEquiv).toBeVisible();

      // Capture element screenshot of result card for visual inspection
      await resultCard.screenshot({
        path: path.join(screenshotsDir, `dubai-350k-card-${vp.name}.png`),
      });
    });
  }

  test('2. Very Large Salary: Dubai AED 10,000,000 on Mobile (375x667) & Desktop (1440x900)', async ({ page }) => {
    // Test on constrained mobile screen
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?city=dubai&salary=10000000&tab=salary-worth');
    await page.waitForLoadState('domcontentloaded');

    const resultCard = page.locator('#result-summary-card');
    await expect(resultCard).toBeVisible({ timeout: 15000 });

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow, 'Document must not have horizontal overflow for 10M AED').toBe(false);

    // Capture screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'dubai-10m-mobile.png'),
    });

    // Test on desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'dubai-10m-desktop.png'),
    });
  });

  test('3. Visual Regression Across Key Global Currencies', async ({ page }) => {
    const testCases = [
      { name: 'dubai-1m', city: 'dubai', salary: '1000000' },
      { name: 'tokyo-25m', city: 'tokyo', salary: '25000000' },
      { name: 'india-10m', city: 'mumbai', salary: '10000000' },
      { name: 'zurich-250k', city: 'zurich', salary: '250000' },
    ];

    for (const tc of testCases) {
      // Desktop
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/?city=${tc.city}&salary=${tc.salary}&tab=salary-worth`);
      await page.waitForLoadState('domcontentloaded');
      const card = page.locator('#result-summary-card');
      await expect(card).toBeVisible({ timeout: 15000 });
      await card.screenshot({
        path: path.join(screenshotsDir, `${tc.name}-card-desktop.png`),
      });

      // Mobile
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await card.screenshot({
        path: path.join(screenshotsDir, `${tc.name}-card-mobile.png`),
      });
    }
  });

  test('4. All Calculators Regression Check (Dubai AED)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Salary Needed
    await page.goto('/?city=dubai&tab=salary-needed');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#salary-needed-view')).toBeVisible({ timeout: 15000 });
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    // Salary After Tax
    await page.goto('/?city=dubai&salary=350000&tab=salary-after-tax');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#salary-after-tax-view')).toBeVisible({ timeout: 15000 });
    overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    // Cost of Living
    await page.goto('/?city=dubai&tab=cost-of-living');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#cost-of-living-view')).toBeVisible({ timeout: 15000 });
    overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    // Compare
    await page.goto('/?tab=compare');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#compare-view')).toBeVisible({ timeout: 15000 });
    overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    // Job Offers
    await page.goto('/?tab=job-offers');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('#job-offer-compare-view')).toBeVisible({ timeout: 15000 });
    overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
});
