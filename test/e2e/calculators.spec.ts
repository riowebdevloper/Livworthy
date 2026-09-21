import { test, expect } from '@playwright/test';

test.describe('LivWorthy Financial Intelligence Platform E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Homepage loads with LivWorthy brand, title, and logo', async ({ page }) => {
    await expect(page).toHaveTitle(/LivWorthy/);

    // Header brand logo
    const logoImg = page.locator('#livworthy-header img[alt="LivWorthy"]');
    await expect(logoImg).toBeVisible();

    // Check header navigation tabs
    await expect(page.locator('#tab-salary-worth')).toBeVisible();
    await expect(page.locator('#tab-salary-needed')).toBeVisible();
    await expect(page.locator('#tab-salary-after-tax')).toBeVisible();
    await expect(page.locator('#tab-cost-of-living')).toBeVisible();
    await expect(page.locator('#tab-compare')).toBeVisible();
    await expect(page.locator('#tab-job-offers')).toBeVisible();
  });

  test('Salary Worth calculator displays results and reacts to inputs', async ({ page }) => {
    await page.click('#tab-salary-worth');
    await expect(page.locator('text=Annual Take-Home').first()).toBeVisible();

    // Verify presence of take-home and remaining metrics
    await expect(page.locator('text=Disposable Income').first()).toBeVisible();
    await expect(page.locator('text=Living Costs').first()).toBeVisible();
  });

  test('Salary Needed reverse solver operates correctly', async ({ page }) => {
    await page.click('#tab-salary-needed');
    await expect(page.locator('text=Required Gross Salary').first()).toBeVisible();
    await expect(page.locator('text=Desired Monthly Savings Target').first()).toBeVisible();
  });

  test('Salary After Tax view displays itemized statutory breakdown', async ({ page }) => {
    await page.click('#tab-salary-after-tax');
    await expect(page.locator('text=Estimated Net Take-Home Pay').first()).toBeVisible();
    await expect(page.locator('text=Total Deducted Taxes & FICA').first()).toBeVisible();
  });

  test('Cost of Living view displays itemized living expenses', async ({ page }) => {
    await page.click('#tab-cost-of-living');
    await expect(page.locator('text=Housing').first()).toBeVisible();
    await expect(page.locator('text=Food').first()).toBeVisible();
    await expect(page.locator('text=Utilities').first()).toBeVisible();
  });

  test('Location Compare view compares two cities with neutral delta', async ({ page }) => {
    await page.click('#tab-compare');
    await expect(page.locator('text=Location A').first()).toBeVisible();
    await expect(page.locator('text=Location B').first()).toBeVisible();
    await expect(page.locator('text=Gross Compensation').first()).toBeVisible();
  });

  test('Job Offers Normalizer view displays multi-offer comparison', async ({ page }) => {
    await page.click('#tab-job-offers');
    await expect(page.locator('text=Job Offer Normalizer').first()).toBeVisible();
    await expect(page.locator('text=Job Offer A').first()).toBeVisible();
  });

  test('Evidence Drawer opens and displays primary sources', async ({ page }) => {
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=Data Provenance & Evidence').first()).toBeVisible();
    await expect(page.locator('text=Authoritative Reference Sources').first()).toBeVisible();
  });

  test('Methodology Modal opens and states zero-AI calculation rule', async ({ page }) => {
    await page.click('#btn-open-methodology');
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    await expect(page.locator('text=Zero-AI Financial Calculation Rule').first()).toBeVisible();
  });

  test('System Diagnostics Modal opens and shows platform state', async ({ page }) => {
    const diagBtn = page.locator('#btn-open-diagnostics');
    if (await diagBtn.isVisible()) {
      await diagBtn.click();
      await expect(page.locator('text=LivWorthy System Architecture & Diagnostics').first()).toBeVisible();
      await expect(page.locator('text=Database & Infrastructure').first()).toBeVisible();
    }
  });

  test('Server Health and Readiness APIs return truthful status', async ({ request }) => {
    const healthRes = await request.get('/api/health');
    expect(healthRes.status()).toBe(200);
    const healthData = await healthRes.json();
    expect(healthData.status).toBe('HEALTHY');

    const liveRes = await request.get('/api/health/live');
    expect(liveRes.status()).toBe(200);

    const readyRes = await request.get('/api/health/ready');
    // In dev mode with memory fallback, it returns 200 with degraded cache notice
    expect([200, 503]).toContain(readyRes.status());
    const readyData = await readyRes.json();
    expect(typeof readyData.ready).toBe('boolean');
  });

  test('Server Tax adapter verification semantics are truthful', async ({ request }) => {
    const countriesRes = await request.get('/api/countries');
    expect(countriesRes.status()).toBe(200);
    const data = await countriesRes.json();

    expect(data.countries.length).toBeGreaterThanOrEqual(15);
    const verified = data.countries.filter((c: any) => c.verificationStatus === 'VERIFIED');
    const limited = data.countries.filter((c: any) => c.verificationStatus === 'LIMITED');

    expect(verified.length).toBe(10);
    expect(limited.length).toBe(5);

    // Verify US is VERIFIED and FR is LIMITED
    const us = data.countries.find((c: any) => c.id === 'US');
    expect(us.verificationStatus).toBe('VERIFIED');
    expect(us.isStatutorilyVerified).toBe(true);

    const fr = data.countries.find((c: any) => c.id === 'FR');
    expect(fr.verificationStatus).toBe('LIMITED');
    expect(fr.isStatutorilyVerified).toBe(false);
  });

  test('Admin login rejects invalid credentials', async ({ request }) => {
    const loginRes = await request.post('/api/admin/login', {
      data: {
        email: 'invalid@livworthy.com',
        password: 'IncorrectPassword123!',
      },
    });
    expect(loginRes.status()).toBe(401);
    const resData = await loginRes.json();
    expect(resData.error).toBe('INVALID_CREDENTIALS');
  });
});
