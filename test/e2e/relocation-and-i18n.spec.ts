import { test, expect } from '@playwright/test';

test.describe('Relocation Intelligence, Job Offer Authority, and Localization Suite', () => {

  test('Localized entry routes render authentic copy, correct lang, and Arabic RTL', async ({ page }) => {
    // English
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('h1')).toContainText('What is your salary really worth?');

    // Spanish
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('h1')).toContainText('¿Cuánto vale realmente tu salario?');

    // French
    await page.goto('/fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('h1')).toContainText('Que vaut réellement votre salaire ?');

    // Arabic
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toContainText('ما هي القيمة الفعلية لراتبك بعد الضرائب والمعيشة؟');
  });

  test('Language selector UI switches language dynamically', async ({ page }) => {
    await page.goto('/');
    const langBtn = page.locator('#lang-selector-btn');
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    const esOption = page.locator('button:has-text("Español")');
    await expect(esOption).toBeVisible();
    await esOption.click();

    // Verify HTML lang updated to es
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('#tab-salary-worth')).toContainText('¿Alcanza Mi Salario?');
  });

  test('Relocation hub (/relocation) lists major corridors and links to detailed guides', async ({ page }) => {
    await page.goto('/relocation');
    await expect(page.locator('h1')).toContainText('Global Relocation Intelligence');

    // Verify key corridor links exist
    const nycLondonLink = page.locator('a[href="/relocation/new-york-to-london"]').first();
    await expect(nycLondonLink).toBeVisible();

    const londonDubaiLink = page.locator('a[href="/relocation/london-to-dubai"]').first();
    await expect(londonDubaiLink).toBeVisible();

    const sfSeattleLink = page.locator('a[href="/relocation/san-francisco-to-seattle"]').first();
    await expect(sfSeattleLink).toBeVisible();
  });

  test('Relocation corridor page (NYC to London) has correct canonical, CTAs, and no horizontal overflow', async ({ page }) => {
    await page.goto('/relocation/new-york-to-london');
    await expect(page.locator('h1')).toContainText('Relocating from New York City to London');

    // Canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://www.livworthy.com/relocation/new-york-to-london');

    // CTAs exist
    const compareLink = page.locator('a[href="/compare/new-york-vs-london"]');
    await expect(compareLink).toBeVisible();

    const jobOfferLink = page.locator('a[href="/job-offer-comparison"]');
    await expect(jobOfferLink).toBeVisible();

    const coverageLink = page.locator('a[href="/coverage"]');
    await expect(coverageLink).toBeVisible();

    // Verify no document horizontal scroll
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Job Offer Comparison authority page (/job-offer-comparison) deep-links to interactive tool', async ({ page }) => {
    await page.goto('/job-offer-comparison');
    await expect(page.locator('h1')).toContainText('How to Compare Job Offers Across Cities and Countries');

    // Canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://www.livworthy.com/job-offer-comparison');

    // Deep link to interactive calculator
    const interactiveCta = page.locator('a[href="/?tab=job-offers"]').first();
    await expect(interactiveCta).toBeVisible();
  });

  test('Global Market Coverage page (/coverage) details market tiers and tax safety', async ({ page }) => {
    await page.goto('/coverage');
    await expect(page.locator('h1')).toContainText('Global Market & Tax Coverage Transparency');

    // Stats are visible
    await expect(page.locator('body')).toContainText('39');
    await expect(page.locator('body')).toContainText('65');
    await expect(page.locator('body')).toContainText('Verified Tax Adapters');
    await expect(page.locator('body')).toContainText('TAX_CALCULATION_UNAVAILABLE');

    // Canonical link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://www.livworthy.com/coverage');
  });

  test('Mobile viewport (375px) has zero document horizontal overflow across key pages', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const routesToTest = [
      '/',
      '/relocation',
      '/relocation/london-to-dubai',
      '/job-offer-comparison',
      '/coverage',
      '/ar'
    ];

    for (const route of routesToTest) {
      await page.goto(route);
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow, `Route ${route} should not have horizontal overflow on 375px`).toBe(false);
    }
  });

});
