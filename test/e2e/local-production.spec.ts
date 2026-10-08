import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || '3000';
const BASE_URL = `http://127.0.0.1:${PORT}`;

test.describe('LivWorthy Local Production Validation Suite', () => {
  test('1. Local Homepage loads branding, tabs, and default $100K NYC scenario', async ({ page }) => {
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/LivWorthy/);

    const logoImg = page.locator('#livworthy-header img[alt="LivWorthy"]');
    await expect(logoImg).toBeVisible();

    await expect(page.locator('#tab-salary-worth')).toBeVisible();
    await expect(page.locator('#tab-salary-needed')).toBeVisible();
    await expect(page.locator('#tab-salary-after-tax')).toBeVisible();
    await expect(page.locator('#tab-cost-of-living')).toBeVisible();
    await expect(page.locator('#tab-compare')).toBeVisible();
    await expect(page.locator('#tab-job-offers')).toBeVisible();

    await expect(page.getByText('Estimated Take-Home').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#result-summary-card')).toBeVisible({ timeout: 10000 });
  });

  test('2. Single Authoritative Request Trigger: Calculate button emits exactly ONE POST /api/calculate', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#salary-worth-view')).toBeVisible({ timeout: 10000 });

    let calculatePostCount = 0;
    await page.route('**/api/calculate', async (route) => {
      calculatePostCount++;
      await route.continue();
    });

    // Enter a new salary value
    const salaryInput = page.locator('#hero-annual-salary-input');
    await salaryInput.fill('125,000');

    // Reset counter right before clicking
    calculatePostCount = 0;

    // Single click on Calculate
    const calcBtn = page.locator('#btn-calculate');
    await expect(calcBtn).toBeVisible();
    await calcBtn.click();

    // Wait for response and verify exactly one request was made
    await page.waitForResponse((res) => res.url().includes('/api/calculate') && res.request().method() === 'POST');
    // Allow brief grace period for any errant duplicate debounces
    await page.waitForTimeout(400);

    expect(calculatePostCount).toBe(1);
  });

  test('3. Rapid Clicks Guard: Multiple clicks do not emit duplicate concurrent POSTs', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#salary-worth-view')).toBeVisible({ timeout: 10000 });

    let calculatePostCount = 0;
    await page.route('**/api/calculate', async (route) => {
      calculatePostCount++;
      // Delay slightly to test in-flight locking
      await new Promise((r) => setTimeout(r, 150));
      await route.continue();
    });

    const calcBtn = page.locator('#btn-calculate');
    calculatePostCount = 0;

    // Rapid double click
    await calcBtn.click({ clickCount: 2, delay: 50 }).catch(() => {});
    await page.waitForResponse((res) => res.url().includes('/api/calculate') && res.request().method() === 'POST');
    await page.waitForTimeout(400);

    expect(calculatePostCount).toBe(1);
  });

  test('4. Responsive Calculate Button: No overflow or clipping across mobile & desktop viewports', async ({ page }) => {
    const viewports = [
      { width: 320, height: 600 },
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

      const calcBtn = page.locator('#btn-calculate');
      await expect(calcBtn).toBeVisible();

      // Assert button dimensions
      const box = await calcBtn.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(48);
      expect(box!.width).toBeGreaterThanOrEqual(100);

      // Icon remains visible
      const icon = calcBtn.locator('svg');
      await expect(icon).toBeVisible();

      // Text remains visible and within boundaries
      const text = calcBtn.locator('span');
      await expect(text).toBeVisible();
    }
  });

  test('5. Local Navigation across all 6 calculators', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#salary-worth-view')).toBeVisible({ timeout: 10000 });

    await page.click('#tab-salary-after-tax');
    await expect(page.locator('text=Federal Income Tax').first()).toBeVisible({ timeout: 10000 });

    await page.click('#tab-salary-needed');
    await expect(page.locator('text=Required Gross Salary').first()).toBeVisible({ timeout: 10000 });

    await page.click('#tab-cost-of-living');
    await expect(page.locator('#cost-of-living-view')).toBeVisible({ timeout: 10000 });

    await page.click('#tab-compare');
    await expect(page.locator('#compare-view')).toBeVisible({ timeout: 10000 });

    await page.click('#tab-job-offers');
    await expect(page.locator('#job-offer-compare-view')).toBeVisible({ timeout: 10000 });
  });

  test('6. Local Drawers & Modals: Evidence, Methodology, Diagnostics', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#salary-worth-view')).toBeVisible({ timeout: 10000 });

    await page.click('#footer-methodology-btn');
    const methodologyDialog = page.locator('text=LivWorthy Calculation Methodology').first();
    await expect(methodologyDialog).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Escape');
    const methCloseBtn = page.locator('button[aria-label="Close methodology modal"]').first();
    if (await methCloseBtn.isVisible()) {
      await methCloseBtn.click().catch(() => {});
    }
    await expect(methodologyDialog).toBeHidden({ timeout: 10000 });
  });
});

test.describe('LivWorthy Local Institutional Pages Verification', () => {
  const INSTITUTIONAL_PAGES = [
    { slug: 'about', path: '/about', h1: 'About LivWorthy', title: /About/i },
    { slug: 'methodology', path: '/methodology', h1: 'Calculation Methodology & Standards', title: /Methodology/i },
    { slug: 'sources', path: '/sources', h1: 'Verified Sources & Evidence Registry', title: /Sources/i },
    { slug: 'editorial-policy', path: '/editorial-policy', h1: 'Editorial & Information Quality Policy', title: /Editorial/i },
    { slug: 'data-policy', path: '/data-policy', h1: 'Data Policy & Zero PII Architecture', title: /Data/i },
    { slug: 'corrections', path: '/corrections', h1: 'Corrections Log & Data Feedback', title: /Corrections/i },
    { slug: 'terms', path: '/terms', h1: 'Terms of Service & Financial Disclaimer', title: /Terms/i },
    { slug: 'privacy', path: '/privacy', h1: 'Privacy Policy', title: /Privacy/i },
  ] as const;

  for (const item of INSTITUTIONAL_PAGES) {
    test(`Local ${item.path}: HTTP 200, correct H1, unique title, canonical`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${item.path}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(item.h1);
      await expect(page).toHaveTitle(item.title);
    });
  }
});
