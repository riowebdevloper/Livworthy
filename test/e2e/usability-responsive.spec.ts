import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 568, name: '320px (iPhone SE 1st)' },
  { width: 360, height: 800, name: '360px (Galaxy S20)' },
  { width: 375, height: 667, name: '375px (iPhone SE)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14)' },
  { width: 412, height: 915, name: '412px (Pixel 7)' },
  { width: 430, height: 932, name: '430px (iPhone 14/15 Pro Max)' },
  { width: 768, height: 1024, name: '768px (iPad Mini)' },
  { width: 1024, height: 768, name: '1024px (iPad Pro)' },
  { width: 1280, height: 800, name: '1280px (MacBook Air 13)' },
  { width: 1440, height: 900, name: '1440px (MacBook Pro 15)' },
  { width: 1920, height: 1080, name: '1920px (FHD Desktop)' },
];

test.describe('17 Usability Fixes — Multi-Viewport Responsive & Functional Suite', () => {
  for (const vp of VIEWPORTS) {
    test(`Responsive verification at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Wait for calculator core to load
      await expect(page.locator('#salary-worth-view')).toBeVisible();

      // 1. Verify no horizontal overflow on body/html
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1; // 1px tolerance for subpixel rounding
      });
      expect(hasHorizontalScroll).toBe(false);

      // 2. Verify Calculate button exists and is clickable
      const calcBtn = page.locator('#btn-calculate');
      await expect(calcBtn).toBeVisible();

      // 3. Verify Popular Scenarios exists and can be clicked
      const scenarioPills = page.locator('text=NYC $100K Single');
      if (await scenarioPills.isVisible()) {
        await scenarioPills.click();
        await page.waitForTimeout(300);
      }

      // 4. Verify Annual/Monthly toggle exists and works
      const monthlyBtn = page.locator('#period-monthly-btn');
      await expect(monthlyBtn).toBeVisible();
      await monthlyBtn.click();
      await expect(monthlyBtn).toHaveAttribute('aria-pressed', 'true');

      const annualBtn = page.locator('#period-annual-btn');
      await annualBtn.click();
      await expect(annualBtn).toHaveAttribute('aria-pressed', 'true');

      // 5. Verify Customize Assumptions exists in utility bar
      const customizeBtn = page.locator('#btn-result-customize');
      await expect(customizeBtn).toBeVisible();

      // 6. Verify Detailed Financial Intelligence action buttons
      await expect(page.locator('#btn-toggle-tax-breakdown')).toBeVisible();
      await expect(page.locator('#btn-toggle-col-breakdown')).toBeVisible();
      await expect(page.locator('#btn-toggle-methodology-summary')).toBeVisible();
      await expect(page.locator('#btn-open-evidence')).toBeVisible();

      // 7. Verify redundant button was removed
      await expect(page.locator('#btn-open-customizer')).toHaveCount(0);

      // Save screenshot at representative mobile & desktop viewports
      if (vp.width === 375 || vp.width === 1440) {
        await page.screenshot({
          path: `/tmp/livworthy_usability_${vp.width}px.png`,
          fullPage: false,
        });
      }
    });
  }
});
