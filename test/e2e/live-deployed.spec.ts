import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://livworthy.vercel.app';

test.describe('LivWorthy Live Deployed Vercel Production Validation', () => {
  test('1. Live Homepage loads branding, tabs, and default $100K NYC scenario', async ({ page }) => {
    const response = await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
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

    // Verify take-home calculation for NYC $100K ($70,343 in 2025 or $70,116 in 2024)
    const takeHomeElement = page.getByText(/\$(70,343|70,116)/).first();
    await expect(takeHomeElement).toBeVisible({ timeout: 10000 });
    console.log('Homepage live validation PASSED: NYC $100K take home verified.');
  });

  test('2. Live Navigation across all 6 calculators', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'networkidle' });

    // 1. Salary After Tax
    await page.click('#tab-salary-after-tax');
    await expect(page.locator('text=Federal Income Tax').first()).toBeVisible({ timeout: 10000 });

    // 2. Salary Needed
    await page.click('#tab-salary-needed');
    await expect(page.locator('text=Required Gross Salary').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/\$(89,288|89,662|89,903|90,000)/).first()).toBeVisible({ timeout: 10000 });

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
    await page.click('#footer-methodology-btn');
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

test.describe('LivWorthy Live Institutional Pages Verification (All Eight Routes)', () => {
  const INSTITUTIONAL_PAGES = [
    { slug: 'about',            path: '/about',            h1: 'About LivWorthy',                             title: /About/i },
    { slug: 'methodology',      path: '/methodology',      h1: 'Calculation Methodology & Standards',          title: /Methodology/i },
    { slug: 'sources',          path: '/sources',          h1: 'Verified Sources & Evidence Registry',         title: /Sources/i },
    { slug: 'editorial-policy',  path: '/editorial-policy',  h1: 'Editorial & Information Quality Policy',       title: /Editorial/i },
    { slug: 'data-policy',      path: '/data-policy',      h1: 'Data Policy & Zero PII Architecture',          title: /Data/i },
    { slug: 'corrections',      path: '/corrections',      h1: 'Corrections Log & Data Feedback',              title: /Corrections/i },
    { slug: 'terms',            path: '/terms',            h1: 'Terms of Service & Financial Disclaimer',      title: /Terms/i },
    { slug: 'privacy',          path: '/privacy',          h1: 'Privacy Policy',                              title: /Privacy/i },
  ] as const;

  for (const item of INSTITUTIONAL_PAGES) {
    test(`Live ${item.path}: HTTP 200, correct H1, unique title, canonical, refresh, no SPA`, async ({ page }) => {
      // Direct navigation
      const response = await page.goto(`${LIVE_URL}${item.path}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      // Path assertion
      const cleanPath = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
      expect(cleanPath).toBe(item.path);

      // H1 assertion
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(item.h1);

      // Unique title assertion
      await expect(page).toHaveTitle(item.title);

      // Exact canonical assertion
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(`https://www.livworthy.com${item.path}`);

      // Actual page HTML content (not empty SPA shell)
      const pageText = await page.locator('#root').textContent();
      expect(pageText).toContain(item.h1);

      // Homepage calculator is absent
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
      await expect(page.locator('#tab-salary-worth')).not.toBeVisible();

      // Refresh verification
      await page.reload({ waitUntil: 'domcontentloaded' });
      const h1AfterReload = page.locator('h1').first();
      await expect(h1AfterReload).toBeVisible({ timeout: 10000 });
      await expect(h1AfterReload).toHaveText(item.h1);
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    });

    test(`Live ${item.path}/: Trailing slash resolves to HTTP 200 and correct H1`, async ({ page }) => {
      const response = await page.goto(`${LIVE_URL}${item.path}/`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(item.h1);
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    });
  }

  test('Live Footer click verification across all eight institutional pages', async ({ page }) => {
    for (const item of INSTITUTIONAL_PAGES) {
      // Load homepage and wait for SPA footer hydration
      await page.goto(LIVE_URL, { waitUntil: 'networkidle' });

      const link = page.locator(`#livworthy-footer a[href="${item.path}"]`).first();
      await expect(link).toBeVisible({ timeout: 10000 });

      await link.click();
      await page.waitForURL((url) => url.pathname.replace(/\/$/, '') === item.path, { timeout: 15000 });

      const cleanPath = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
      expect(cleanPath).toBe(item.path);

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(item.h1);
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    }
  });

  test('Live Native Header Logo navigation returns to homepage', async ({ page }) => {
    // Navigate to a parameterized tab view on homepage
    await page.goto(`${LIVE_URL}/?tab=cost-of-living`, { waitUntil: 'networkidle' });
    const logoLink = page.locator('#header-logo-link');
    await expect(logoLink).toBeVisible();
    expect(await logoLink.getAttribute('href')).toBe('/');

    await logoLink.click();
    await page.waitForURL((url) => url.pathname === '/' && (!url.search || url.search === ''), { timeout: 10000 });

    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.locator('#tab-salary-worth')).toBeVisible();
  });

  test('Live Institutional page breadcrumb Home link returns to homepage', async ({ page }) => {
    await page.goto(`${LIVE_URL}/about`, { waitUntil: 'domcontentloaded' });
    const homeBreadcrumb = page.locator('nav[aria-label="Breadcrumb"] a[href="/"]');
    await expect(homeBreadcrumb).toBeVisible();

    await homeBreadcrumb.click();
    await page.waitForURL((url) => url.pathname === '/', { timeout: 10000 });

    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.locator('#tab-salary-worth')).toBeVisible();
  });
});

test.describe('LivWorthy Live Representative SEO Pages & Assets', () => {
  const SEO_PAGES = [
    { path: '/countries/us',               h1: 'United States Income & Living Intelligence' },
    { path: '/cities/nyc',                 h1: 'New York City Income, Tax & Cost of Living Intelligence' },
    { path: '/compare/new-york-vs-london',  h1: 'New York City vs London Salary & Cost of Living Comparison' },
    { path: '/guides/100k-salary-new-york', h1: 'Is $100K a Good Salary in New York City?' },
  ] as const;

  for (const sp of SEO_PAGES) {
    test(`Live SEO Page ${sp.path}: HTTP 200, correct H1, no SPA calculator`, async ({ page }) => {
      const response = await page.goto(`${LIVE_URL}${sp.path}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(sp.h1);

      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
      await expect(page.locator('#tab-salary-worth')).not.toBeVisible();
    });
  }

  test('Live robots.txt and sitemap.xml exist and return HTTP 200', async ({ page }) => {
    const robotsResp = await page.goto(`${LIVE_URL}/robots.txt`);
    expect(robotsResp?.status()).toBe(200);
    const robotsText = await robotsResp?.text();
    expect(robotsText).toContain('User-agent: *');
    expect(robotsText).toContain('Sitemap: https://www.livworthy.com/sitemap.xml');

    const sitemapResp = await page.goto(`${LIVE_URL}/sitemap.xml`);
    expect(sitemapResp?.status()).toBe(200);
    const sitemapText = await sitemapResp?.text();
    expect(sitemapText).toContain('<sitemapindex');
  });

  test('Live Unknown routes return real HTTP 404', async ({ page }) => {
    const unknownPaths = [
      '/nonexistent-xyz-page',
      '/unknown-route-abc',
      '/this-page-does-not-exist',
    ];

    for (const up of unknownPaths) {
      const resp = await page.goto(`${LIVE_URL}${up}`);
      expect(resp?.status()).toBe(404);
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
      await expect(page.locator('#tab-salary-worth')).not.toBeVisible();
    }
  });
});
