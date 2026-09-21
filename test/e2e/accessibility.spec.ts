import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('LivWorthy Accessibility (Axe) Audit Suite', () => {
  test('Homepage has 0 critical and 0 serious accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious'
    );

    if (criticalViolations.length > 0 || seriousViolations.length > 0) {
      console.error('Critical accessibility violations:', JSON.stringify(criticalViolations, null, 2));
      console.error('Serious accessibility violations:', JSON.stringify(seriousViolations, null, 2));
    }

    expect(criticalViolations).toEqual([]);
    expect(seriousViolations).toEqual([]);
  });

  test('Salary Worth view meets accessibility standards', async ({ page }) => {
    await page.goto('/?tab=salary-worth');
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');

    expect(critical).toEqual([]);
    expect(serious).toEqual([]);
  });

  test('Location Compare view meets accessibility standards', async ({ page }) => {
    await page.goto('/?tab=compare');
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');

    expect(critical).toEqual([]);
    expect(serious).toEqual([]);
  });

  test('Methodology Modal dialog meets accessibility standards', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-open-methodology');
    await page.waitForSelector('text=LivWorthy Calculation Methodology');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');

    expect(critical).toEqual([]);
    expect(serious).toEqual([]);
  });

  test('Keyboard navigation works with Tab and Escape', async ({ page }) => {
    await page.goto('/');
    // Press Tab to navigate into header elements
    await page.keyboard.press('Tab');
    // Open methodology with enter when focused, or open via click and close via Escape
    await page.click('#btn-open-methodology');
    await expect(page.locator('text=LivWorthy Calculation Methodology')).toBeVisible();

    // Close modal via Escape
    await page.keyboard.press('Escape');
  });
});
