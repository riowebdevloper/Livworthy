import { test, expect } from '@playwright/test';

const LIVE_URL = process.env.LIVE_URL;

test.describe('LivWorthy Live Production Verification Suite', () => {
  test.beforeEach(async () => {
    test.skip(!LIVE_URL, 'LIVE_URL environment variable is not defined. Skipping real live production tests.');
  });

  test('1. Core Live Endpoints Smoke Test (robots, sitemaps, health, key routes)', async ({ request }) => {
    const baseUrl = LIVE_URL!.replace(/\/$/, '');

    // Health endpoints
    const health = await request.get(`${baseUrl}/api/health`);
    expect(health.status()).toBe(200);

    const ready = await request.get(`${baseUrl}/api/health/ready`);
    expect(ready.status()).toBe(200);

    // Robots and sitemap
    const robots = await request.get(`${baseUrl}/robots.txt`);
    expect(robots.status()).toBe(200);
    const robotsText = await robots.text();
    expect(robotsText).toContain('User-agent');
    expect(robotsText).toContain('Sitemap:');

    const sitemap = await request.get(`${baseUrl}/sitemap.xml`);
    expect(sitemap.status()).toBe(200);

    // Key localized and programmatic pages
    const keyRoutes = [
      '/',
      '/en',
      '/es',
      '/ar',
      '/hi',
      '/cities/nyc',
      '/guides/100k-salary-new-york',
    ];

    for (const route of keyRoutes) {
      const res = await request.get(`${baseUrl}${route}`);
      expect(res.status(), `Route ${route} should return HTTP 200`).toBe(200);
    }
  });

  test('2. Live Stateless Tax Estimation API: POST /api/tax/estimate', async ({ request }) => {
    const baseUrl = LIVE_URL!.replace(/\/$/, '');

    const res = await request.post(`${baseUrl}/api/tax/estimate`, {
      data: {
        countryId: 'US',
        cityId: 'nyc',
        grossSalary: 100000,
        taxYear: '2026',
        filingStatus: 'single',
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.takeHome).toBeGreaterThan(0);
  });

  test('3. Live Stateless Calculate API: POST /api/calculate', async ({ request }) => {
    const baseUrl = LIVE_URL!.replace(/\/$/, '');

    const res = await request.post(`${baseUrl}/api/calculate`, {
      data: {
        location: {
          countryId: 'US',
          cityId: 'nyc',
          currency: 'USD',
        },
        financials: {
          baseSalary: 120000,
          additionalIncome: 0,
        },
        household: {
          size: 1,
          adults: 1,
          children: 0,
        },
        taxAssumptions: {
          taxYear: '2026',
          filingStatus: 'single',
        },
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(['SAVED', 'NOT_SAVED']).toContain(json.persistenceStatus);
    expect(json.data).toBeDefined();
    expect(json.data.takeHomePay).toBeGreaterThan(0);
  });

  test('4. Live Calculator UI Interaction & Single-POST Verification', async ({ page }) => {
    const baseUrl = LIVE_URL!.replace(/\/$/, '');

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/LivWorthy/);

    let calculatePostCount = 0;
    let postStatusCode = 0;

    await page.route('**/api/calculate', async (route) => {
      calculatePostCount++;
      const response = await route.fetch();
      postStatusCode = response.status();
      await route.fulfill({ response });
    });

    const salaryInput = page.locator('#hero-annual-salary-input');
    await salaryInput.fill('130,000');

    calculatePostCount = 0;
    const calcBtn = page.locator('#btn-calculate');
    await expect(calcBtn).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/api/calculate') && res.request().method() === 'POST',
        { timeout: 15000 }
      ),
      calcBtn.click(),
    ]);
    await page.waitForTimeout(400);

    // Assert: request returns 200, no 500/503
    expect(postStatusCode).toBe(200);
    // Exactly one request
    expect(calculatePostCount).toBe(1);

    // Result card updates
    await expect(page.locator('#result-summary-card')).toBeVisible();
    await expect(page.getByText('Estimated Take-Home').first()).toBeVisible();
  });
});
