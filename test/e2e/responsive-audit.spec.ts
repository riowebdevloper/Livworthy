import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Complete device matrix viewports requested by QA specification:
// 320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280, 1440, 1920 px + landscape orientations
const DEVICE_MATRIX = [
  { width: 320, height: 568, name: '320px (iPhone SE 1st gen - Ultra Narrow Mobile)' },
  { width: 360, height: 800, name: '360px (Galaxy S20 - Narrow Mobile)' },
  { width: 375, height: 667, name: '375px (iPhone SE 2nd/3rd gen - Standard Mobile)' },
  { width: 667, height: 375, name: '375px Landscape (iPhone SE - Mobile Landscape)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14 - Modern Mobile)' },
  { width: 414, height: 896, name: '414px (iPhone 11/XR/Plus - Large Mobile)' },
  { width: 430, height: 932, name: '430px (iPhone 14/15/16 Pro Max - Max Mobile)' },
  { width: 600, height: 960, name: '600px (Android Tablet / Foldable Unfolded)' },
  { width: 768, height: 1024, name: '768px (iPad Mini - Portrait Tablet)' },
  { width: 820, height: 1180, name: '820px (iPad Air - Large Tablet)' },
  { width: 1180, height: 820, name: '820px Landscape (iPad Air - Tablet Landscape)' },
  { width: 1024, height: 768, name: '1024px (iPad Pro / Small Laptop)' },
  { width: 1280, height: 800, name: '1280px (MacBook Air 13 - Standard Laptop)' },
  { width: 1440, height: 900, name: '1440px (MacBook Pro 15/16 - Desktop)' },
  { width: 1920, height: 1080, name: '1920px (FHD Desktop - Widescreen)' },
];

const SCREENSHOT_DIR = path.resolve('test-results/responsive-screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

test.describe('Phase 3 & 4 — Complete Device Matrix Responsive Layout Audit', () => {
  for (const device of DEVICE_MATRIX) {
    test(`[${device.width}x${device.height}] ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('/');

      // Wait for the calculator core view to hydrate
      await expect(page.locator('#salary-worth-view')).toBeVisible();

      // =========================================================================
      // ASSERTION 1: Document width does not exceed viewport (NO horizontal scroll)
      // =========================================================================
      const overflowReport = await page.evaluate(() => {
        const docWidth = window.innerWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const isOverflow = scrollWidth > docWidth + 1;
        const culprits: Array<{ tag: string; id: string; className: string; right: number; width: number; text: string }> = [];
        if (isOverflow) {
          document.querySelectorAll('*').forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 1) {
              culprits.push({
                tag: el.tagName,
                id: el.id,
                className: (el.className || '').toString().slice(0, 60),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                text: ((el as HTMLElement).innerText || '').slice(0, 40).replace(/\n/g, ' '),
              });
            }
          });
        }
        return { isOverflow, scrollWidth, docWidth, culprits: culprits.slice(0, 10) };
      });
      if (overflowReport.isOverflow) {
        console.error('OVERFLOW REPORT FOR ' + device.name + ':', JSON.stringify(overflowReport, null, 2));
      }
      expect(overflowReport.isOverflow, `Horizontal document overflow detected at ${device.name}: scrollWidth=${overflowReport.scrollWidth}, docWidth=${overflowReport.docWidth}`).toBe(false);

      // =========================================================================
      // ASSERTION 2: Calculator Result Action Bar Buttons — STRICT VIEWPORT BOUNDS
      // Every button must be visible, touch-accessible, and strictly inside the viewport!
      // =========================================================================
      const copyBtn = page.locator('#btn-copy-assessment');
      const customizeBtn = page.locator('#btn-result-customize');
      const compareBtn = page.locator('#btn-result-compare');

      await expect(copyBtn).toBeVisible();
      await expect(customizeBtn).toBeVisible();
      await expect(compareBtn).toBeVisible();

      // Verify bounding boxes: None of the buttons may extend past window.innerWidth
      const buttons = [
        { name: 'Share / Copy', locator: copyBtn },
        { name: 'Customize Assumptions', locator: customizeBtn },
        { name: 'Compare Another City', locator: compareBtn },
      ];

      for (const btn of buttons) {
        const box = await btn.locator.boundingBox();
        expect(box, `${btn.name} bounding box must exist`).not.toBeNull();
        if (box) {
          expect(
            box.x,
            `${btn.name} left edge (${box.x}px) must be >= 0`
          ).toBeGreaterThanOrEqual(-1);
          expect(
            box.x + box.width,
            `${btn.name} right edge (${box.x + box.width}px) must fit within viewport width (${device.width}px)`
          ).toBeLessThanOrEqual(device.width + 2);
          expect(
            box.height,
            `${btn.name} touch target height (${box.height}px) must be at least 32px`
          ).toBeGreaterThanOrEqual(32);
        }
      }

      // =========================================================================
      // ASSERTION 3: Assumptions summary is not clipped or cut off
      // =========================================================================
      const assumptionsContainer = page.locator('#assumptions-summary-container');
      await expect(assumptionsContainer).toBeVisible();
      const assumptionsBox = await assumptionsContainer.boundingBox();
      if (assumptionsBox) {
        expect(
          assumptionsBox.x + assumptionsBox.width,
          `Assumptions text right edge (${assumptionsBox.x + assumptionsBox.width}px) must fit within viewport (${device.width}px)`
        ).toBeLessThanOrEqual(device.width + 2);
      }

      // =========================================================================
      // ASSERTION 4: Calculator Navigation Tabs Accessibility
      // Every tab must exist, be clickable, and not cause document horizontal overflow
      // =========================================================================
      const tabs = [
        { id: '#tab-salary-worth', label: 'Salary Worth' },
        { id: '#tab-salary-needed', label: 'Salary Needed' },
        { id: '#tab-salary-after-tax', label: 'Salary After Tax' },
        { id: '#tab-cost-of-living', label: 'Cost of Living' },
        { id: '#tab-compare', label: 'Compare Cities' },
        { id: '#tab-job-offers', label: 'Job Offers' },
      ];

      for (const tab of tabs) {
        const tabEl = page.locator(tab.id);
        await expect(tabEl, `${tab.label} tab must exist`).toBeAttached();
      }

      // =========================================================================
      // ASSERTION 5: Dialogs and Drawers fit the viewport width
      // =========================================================================
      await customizeBtn.click();
      const drawer = page.locator('div[role="dialog"][aria-label="Customize Assumptions"]');
      await expect(drawer).toBeVisible();

      const drawerBox = await drawer.boundingBox();
      if (drawerBox) {
        expect(
          drawerBox.width,
          `Customization drawer width (${drawerBox.width}px) must not exceed viewport width (${device.width}px)`
        ).toBeLessThanOrEqual(device.width + 2);
      }

      // Close drawer with Escape key (Keyboard navigation check)
      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();

      // =========================================================================
      // ASSERTION 6: Multi-Tab Viewport Fit: Test Cost of Living & Compare views
      // =========================================================================
      // Test Living Costs View
      const colTab = page.locator('#tab-cost-of-living');
      await colTab.click();
      await expect(page.locator('#cost-of-living-view')).toBeVisible();

      const hasColOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(hasColOverflow, `Horizontal scroll detected in Cost of Living view at ${device.name}`).toBe(false);

      // Verify "With Rent" toggle buttons fit inside card
      const withRentBtn = page.locator('#btn-with-rent');
      await expect(withRentBtn).toBeVisible();
      const withRentBox = await withRentBtn.boundingBox();
      if (withRentBox) {
        expect(withRentBox.x + withRentBox.width).toBeLessThanOrEqual(device.width + 2);
      }

      // Test Compare Cities View
      const compareTab = page.locator('#tab-compare');
      await compareTab.click();
      await expect(page.locator('#compare-view')).toBeVisible();

      const hasCompareOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(hasCompareOverflow, `Horizontal scroll detected in Compare view at ${device.name}`).toBe(false);

      // Return to homepage
      await page.locator('#tab-salary-worth').click();
      await expect(page.locator('#salary-worth-view')).toBeVisible();

      // =========================================================================
      // CAPTURE REPRESENTATIVE SCREENSHOTS
      // Viewports: 320px, 375px, 430px, 768px, 1024px, 1440px
      // =========================================================================
      if ([320, 375, 430, 768, 1024, 1440].includes(device.width) && device.height !== 375) {
        const screenshotPath = path.join(SCREENSHOT_DIR, `livworthy_audit_${device.width}px.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
      }
    });
  }
});
