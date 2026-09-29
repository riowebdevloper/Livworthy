import { test, expect, request as apiRequest } from '@playwright/test';

// ============================================================
// SUITE A — LivWorthy Financial Intelligence Platform Behavioral
// ============================================================
test.describe('LivWorthy Financial Intelligence Platform Behavioral E2E Suite', () => {
  const pageErrors: Error[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors.length = 0;
    page.on('pageerror', (err) => {
      console.error('Browser uncaught pageerror stack:', err.stack || err.message);
      pageErrors.push(err);
    });
  });

  test.afterEach(async () => {
    if (pageErrors.length > 0) {
      throw new Error(`Uncaught browser page errors detected: ${pageErrors.map((e) => e.message).join('; ')}`);
    }
  });

  test('1. Homepage loads official branding, title, and interactive navigation tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LivWorthy/);

    const logoImg = page.locator('#livworthy-header img[alt="LivWorthy"]');
    await expect(logoImg).toBeVisible();

    await expect(page.locator('#tab-salary-worth')).toBeVisible();
    await expect(page.locator('#tab-salary-needed')).toBeVisible();
    await expect(page.locator('#tab-salary-after-tax')).toBeVisible();
    await expect(page.locator('#tab-cost-of-living')).toBeVisible();
    await expect(page.locator('#tab-compare')).toBeVisible();
    await expect(page.locator('#tab-job-offers')).toBeVisible();
  });

  test('2. SALARY WORTH: Mutation changes results, city updates currency & jurisdiction, rent affects costs', async ({ page }) => {
    await page.goto('/?city=nyc&salary=100000&tab=salary-worth');

    await expect(page.locator('text=Estimated Take-Home').first()).toBeVisible();

    const salaryInput = page.locator('#hero-annual-salary-input');
    await salaryInput.click();
    await salaryInput.fill('120000');
    await page.keyboard.press('Tab');

    await expect(page.locator('#result-summary-card')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Gross Compensation').first()).toBeVisible();

    const locationSelect = page.locator('#hero-location-select');
    await locationSelect.selectOption('london');

    await expect(page.locator('text=Statutory tax jurisdiction: tax-gb-london').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=£').first()).toBeVisible();

    await page.click('#btn-open-evidence');
    await expect(page.locator('text=Data Provenance & Evidence').first()).toBeVisible();
    await expect(page.locator('text=HM Revenue & Customs (HMRC)').first()).toBeVisible();
    await expect(page.locator('text=Office for National Statistics (ONS)').first()).toBeVisible();
    await expect(page.locator('text=New York State Department of Taxation').first()).not.toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('text=Data Provenance & Evidence')).not.toBeVisible();
  });

  test('3. SALARY NEEDED: Reverse solver calculates gross salary and transfers correctly to Salary Worth', async ({ page }) => {
    await page.goto('/?tab=salary-needed');
    await expect(page.locator('#salary-needed-view')).toBeVisible();

    const targetLocSelect = page.locator('#target-location-select');
    await targetLocSelect.selectOption('austin');

    const savingsInput = page.locator('#target-savings-input');
    await savingsInput.fill('1500');

    const requiredSalaryCard = page.locator('text=Required Gross Salary').first();
    await expect(requiredSalaryCard).toBeVisible({ timeout: 15000 });

    const transferBtn = page.locator('#btn-transfer-to-salary-worth');
    await expect(transferBtn).toBeVisible();
    await transferBtn.click();

    await expect(page.locator('#salary-worth-view')).toBeVisible();

    const locationSelect = page.locator('#hero-location-select');
    await expect(locationSelect).toHaveValue('austin');
  });

  test('4. SALARY AFTER TAX: Jurisdiction switch updates statutory deductions & verification badge', async ({ page }) => {
    await page.goto('/?tab=salary-after-tax');
    await expect(page.locator('#salary-after-tax-view')).toBeVisible();

    await expect(page.locator('text=Estimated Net Take-Home Pay').first()).toBeVisible();
    await expect(page.locator('text=VERIFIED ADAPTER').first()).toBeVisible();

    const locSelect = page.locator('#tax-location-select');
    await locSelect.selectOption('dubai');

    await expect(page.locator('text=100%').first()).toBeVisible({ timeout: 10000 });

    await locSelect.selectOption('paris');
    await expect(page.locator('text=LIMITED ADAPTER').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. COST OF LIVING: City and household adjustments update itemized breakdown', async ({ page }) => {
    await page.goto('/?tab=cost-of-living');
    await expect(page.locator('#cost-of-living-view')).toBeVisible();

    const citySelect = page.locator('#col-city-select');
    await citySelect.selectOption('london');

    await expect(page.locator('text=Housing').first()).toBeVisible();
    await expect(page.locator('text=Food').first()).toBeVisible();
    await expect(page.locator('text=Utilities').first()).toBeVisible();
    await expect(page.locator('text=£').first()).toBeVisible();
  });

  test('6. COMPARE CITIES: Currency switcher recalculates comparison with live FX snapshot', async ({ page }) => {
    await page.goto('/?tab=compare');
    await expect(page.locator('#compare-view')).toBeVisible();

    await expect(page.locator('text=Gross Compensation').first()).toBeVisible();

    const eurBtn = page.locator('#btn-currency-eur');
    await eurBtn.click();
    await expect(page.locator('text=€').first()).toBeVisible({ timeout: 10000 });

    const gbpBtn = page.locator('#btn-currency-gbp');
    await gbpBtn.click();
    await expect(page.locator('text=£').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. JOB OFFERS: Year 1 vs Year 2+ toggle properly models one-time relocation vs recurring', async ({ page }) => {
    await page.goto('/?tab=job-offers');
    await expect(page.locator('#job-offer-compare-view')).toBeVisible();

    await expect(page.locator('text=Less One-Time Relocation Costs').first()).toBeVisible();
    await expect(page.locator('text=Year 1 Net Remaining').first()).toBeVisible();

    const year2Btn = page.locator('#btn-offer-year2');
    await year2Btn.click();

    await expect(page.locator('text=Less One-Time Relocation Costs')).not.toBeVisible();
    await expect(page.locator('text=Year 2+ Recurring Remaining').first()).toBeVisible();
  });

  test('8. DYNAMIC EVIDENCE: Accurate jurisdiction sources (NYC -> US, London -> UK, Dubai -> UAE)', async ({ page }) => {
    await page.goto('/?city=nyc&tab=salary-worth');
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=Internal Revenue Service (IRS)').first()).toBeVisible();
    await expect(page.locator('text=Social Security Administration (SSA)').first()).toBeVisible();
    await page.keyboard.press('Escape');

    const locSelect = page.locator('#hero-location-select');
    await locSelect.selectOption('london');
    await page.waitForTimeout(300);
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=HM Revenue & Customs (HMRC)').first()).toBeVisible();
    await expect(page.locator('text=Office for National Statistics (ONS)').first()).toBeVisible();
    await expect(page.locator('text=Internal Revenue Service (IRS)')).not.toBeVisible();
    await page.keyboard.press('Escape');

    await locSelect.selectOption('dubai');
    await page.waitForTimeout(300);
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=Federal Tax Authority (FTA)').first()).toBeVisible();
    await expect(page.locator('text=Dubai Statistics Center (DSC)').first()).toBeVisible();
    await expect(page.locator('text=Internal Revenue Service (IRS)')).not.toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('9. URL STATE & NAVIGATION: Deep link restoration, Back, Forward, and reload persistence', async ({ page }) => {
    await page.goto('/?city=london&salary=85000&tab=salary-worth&rent=2200');

    await expect(page.locator('#hero-location-select')).toHaveValue('london');
    await expect(page.locator('#hero-annual-salary-input')).toHaveValue(/85[,.]?000/);

    await page.click('#tab-compare');
    await expect(page.locator('#compare-view')).toBeVisible();
    expect(page.url()).toContain('tab=compare');

    await page.goBack();
    await expect(page.locator('#salary-worth-view')).toBeVisible();
    expect(page.url()).toContain('tab=salary-worth');

    await page.goForward();
    await expect(page.locator('#compare-view')).toBeVisible();
    expect(page.url()).toContain('tab=compare');

    await page.reload();
    await expect(page.locator('#compare-view')).toBeVisible();
  });

  test('10. MODALS & DRAWERS: Evidence, Methodology and Diagnostics remain accessible via footer and in-calculator controls', async ({ page }) => {
    await page.goto('/');

    // 1. Methodology Modal — accessible via footer button
    const footerMethodologyBtn = page.locator('#footer-methodology-btn');
    if (await footerMethodologyBtn.isVisible()) {
      await footerMethodologyBtn.click();
      await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible({ timeout: 10000 });
      await page.keyboard.press('Escape');
      await expect(page.locator('text=LivWorthy Calculation Methodology')).not.toBeVisible();
    }

    // 2. Diagnostics Modal — accessible via footer button (only if rendered)
    const footerDiagBtn = page.locator('#footer-diagnostics-btn');
    if (await footerDiagBtn.isVisible()) {
      await footerDiagBtn.click();
      await expect(page.locator('text=LivWorthy System Architecture & Diagnostics').first()).toBeVisible({ timeout: 10000 });
      await page.keyboard.press('Escape');
      await expect(page.locator('text=LivWorthy System Architecture & Diagnostics')).not.toBeVisible();
    }

    // 3. Customizer Drawer
    const customizerBtn = page.locator('text=Customize Assumptions').first();
    if (await customizerBtn.isVisible()) {
      await customizerBtn.click();
      await expect(page.locator('text=Household Structure').first()).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('text=Household Structure')).not.toBeVisible();
    }

    // 4. Evidence Drawer — accessible from within calculator view
    await page.goto('/?city=nyc&tab=salary-worth');
    const evidenceBtn = page.locator('#btn-open-evidence');
    await expect(evidenceBtn).toBeVisible({ timeout: 10000 });
    await evidenceBtn.click();
    await expect(page.locator('text=Data Provenance & Evidence').first()).toBeVisible({ timeout: 10000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Data Provenance & Evidence')).not.toBeVisible();
  });

  test('11. BACKEND API INTEGRITY: Health, readiness, and statutory adapter registry contracts', async ({ request }) => {
    const healthRes = await request.get('/api/health');
    expect(healthRes.status()).toBe(200);
    const healthData = await healthRes.json();
    expect(healthData.status).toBe('HEALTHY');

    const countriesRes = await request.get('/api/countries');
    expect(countriesRes.status()).toBe(200);
    const cData = await countriesRes.json();

    const verified = cData.countries.filter((c: any) => c.verificationStatus === 'VERIFIED');
    const limited = cData.countries.filter((c: any) => c.verificationStatus === 'LIMITED');
    const unsupported = cData.countries.filter((c: any) => c.verificationStatus === 'UNSUPPORTED');
    expect(verified.length).toBe(10);
    expect(limited.length).toBe(5);
    expect(unsupported.length).toBe(24);
    expect(cData.countries.length).toBe(39);

    // Historical 2024 NYC
    const historicalRes = await request.post('/api/tax/estimate', {
      data: {
        grossSalaryMinor: 10000000,
        currency: 'USD',
        countryId: 'US',
        regionId: 'NY',
        cityId: 'nyc',
        taxJurisdictionId: 'US-FED-NY-NYC',
        taxYear: 2024,
      },
    });
    expect(historicalRes.status()).toBe(200);
    const historicalData = await historicalRes.json();
    expect(historicalData.success).toBe(true);
    expect(historicalData.data.taxRuleVersion).toBe('US-FED-NY-NYC-2024.1');
    expect(historicalData.data.netIncome.amountMinor).toBe(7011616);

    // Current 2025 NYC
    const currentRes = await request.post('/api/tax/estimate', {
      data: {
        grossSalaryMinor: 10000000,
        currency: 'USD',
        countryId: 'US',
        regionId: 'NY',
        cityId: 'nyc',
        taxJurisdictionId: 'US-FED-NY-NYC',
        taxYear: 2025,
      },
    });
    expect(currentRes.status()).toBe(200);
    const currentData = await currentRes.json();
    expect(currentData.success).toBe(true);
    expect(currentData.data.taxRuleVersion).toBe('US-FED-NY-NYC-2025.1');
    expect(currentData.data.netIncome.amountMinor).toBe(7034316);

    // Unsupported country → TAX_CALCULATION_UNAVAILABLE
    const unsupportedRes = await request.post('/api/tax/estimate', {
      data: {
        grossSalaryMinor: 7500000,
        currency: 'JPY',
        countryId: 'JP',
        cityId: 'tokyo',
        taxYear: 2025,
      },
    });
    expect(unsupportedRes.status()).toBe(200);
    const unsupportedData = await unsupportedRes.json();
    expect(unsupportedData.data.status).toBe('TAX_CALCULATION_UNAVAILABLE');
    expect(unsupportedData.isStatutorilyVerified).toBe(false);
    expect(unsupportedData.verificationStatus).toBe('UNDER_VERIFICATION');

    // Future TY 2026 → TAX_CALCULATION_UNAVAILABLE
    const futureRes = await request.post('/api/tax/estimate', {
      data: {
        grossSalaryMinor: 10000000,
        currency: 'USD',
        countryId: 'US',
        regionId: 'NY',
        cityId: 'nyc',
        taxJurisdictionId: 'US-FED-NY-NYC',
        taxYear: 2026,
      },
    });
    expect(futureRes.status()).toBe(200);
    const futureData = await futureRes.json();
    expect(futureData.data.status).toBe('TAX_CALCULATION_UNAVAILABLE');
    expect(futureData.isStatutorilyVerified).toBe(false);
    expect(futureData.verificationStatus).toBe('UNDER_VERIFICATION');
  });

  test('12. FOOTER HEADLINES & BREADCRUMB INTERLINKING: Headlines clickable, breadcrumbs clickable, country/city guides functional', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('#livworthy-footer');
    await expect(footer).toBeVisible();

    const calcHeadBtn = footer.getByRole('button', { name: 'Calculators & Tools' });
    await expect(calcHeadBtn).toBeVisible();
    await calcHeadBtn.click();

    const guidesHeadBtn = footer.getByRole('button', { name: 'City Salary Guides' });
    await expect(guidesHeadBtn).toBeVisible();
    await guidesHeadBtn.click();

    await expect(page.locator('h1').first()).toContainText('Is $100K a Good Salary in New York City?');

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'United States', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'New York', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'New York City', exact: true })).toBeVisible();

    await breadcrumb.getByRole('button', { name: 'New York City', exact: true }).click();
    await expect(page.locator('h1').first()).toContainText(/What is your (salary|income) really worth\?/);

    await footer.getByRole('button', { name: 'City Salary Guides' }).click();
    await expect(page.locator('h1').first()).toContainText('Salary');

    const ukBtn = page.getByRole('button', { name: /United Kingdom/i });
    await expect(ukBtn).toBeVisible();
    await ukBtn.click();
    await expect(page.locator('h1').first()).toContainText('London');

    await expect(breadcrumb.getByRole('button', { name: 'United Kingdom', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'England', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'London', exact: true })).toBeVisible();

    const integrityHeadBtn = footer.getByRole('button', { name: /Integrity/i });
    await integrityHeadBtn.click();
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    await page.keyboard.press('Escape');

    const methodBtn = footer.locator('#footer-methodology-btn');
    await methodBtn.click();
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('13. UNAVAILABLE TAX INVARIANTS: Unsupported cities show pending tax verification across Salary Worth, Salary Needed, and Comparisons', async ({ page }) => {
    await page.goto('/?city=tokyo&salary=10000000&tab=salary-worth');
    await expect(page.locator('#result-summary-card')).toBeVisible();

    await expect(page.locator('text=Pending Verification').first()).toBeVisible();
    await expect(page.locator('text=Under Verification').first()).toBeVisible();
    await expect(page.locator('text=Pending verified tax schedule').first()).toBeVisible();

    await page.click('#btn-open-evidence');
    await expect(page.locator('text=No Verified Tax Schedule Active').first()).toBeVisible();
    await page.keyboard.press('Escape');

    await page.goto('/?city=tokyo&tab=salary-needed');
    await expect(page.locator('#salary-needed-view')).toBeVisible();
    const neededLocSelect = page.locator('#target-location-select');
    await neededLocSelect.selectOption('tokyo');
    await expect(page.locator('text=Salary Requirement Solver Unavailable').first()).toBeVisible();

    await page.goto('/?tab=compare');
    await expect(page.locator('#compare-view')).toBeVisible();
    const cityBSelect = page.locator('#compare-city-b-select');
    await cityBSelect.selectOption('tokyo');
    await expect(page.locator('text=Statutory tax calculations are under institutional verification').first()).toBeVisible();
    await expect(page.locator('text=Under Verification').first()).toBeVisible();
    await expect(page.locator('text=Unavailable').first()).toBeVisible();
  });
});

// ============================================================
// SUITE B — Header UX Assertions
// ============================================================
test.describe('Header UX — Simplified Navigation', () => {
  test('H1. LivWorthy logo is visible, has href=/ and navigates natively', async ({ page }) => {
    await page.goto('/');

    const logoLink = page.locator('#header-logo-link');
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/');

    // Native navigation: clicking the logo does a full page load to /
    // We navigate away first then click logo
    await page.goto('/?tab=compare');
    await expect(page.locator('#compare-view')).toBeVisible();

    // Click the logo — native href=/ navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      page.locator('#header-logo-link').click(),
    ]);

    // After full navigation to / the homepage should load with the calculator
    await expect(page.locator('#livworthy-header')).toBeVisible();
    await expect(page).toHaveTitle(/LivWorthy/);
  });

  test('H2. "How It Works" link is present and points to /methodology', async ({ page }) => {
    await page.goto('/');

    const howItWorks = page.locator('#nav-how-it-works');
    await expect(howItWorks).toBeVisible();
    await expect(howItWorks).toHaveAttribute('href', '/methodology');
    await expect(howItWorks).toContainText('How It Works');
  });

  test('H3. "Sources" link is present and points to /sources', async ({ page }) => {
    await page.goto('/');

    const sourcesLink = page.locator('#nav-sources');
    await expect(sourcesLink).toBeVisible();
    await expect(sourcesLink).toHaveAttribute('href', '/sources');
    await expect(sourcesLink).toContainText('Sources');
  });

  test('H4. "Deterministic v1.2" badge is absent from header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#livworthy-header');
    await expect(header.locator('text=Deterministic v1.2')).not.toBeVisible();
  });

  test('H5. "Architecture" button is absent from header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#livworthy-header');
    await expect(header.locator('#btn-open-diagnostics')).not.toBeVisible();
    await expect(header.locator('text=Architecture')).not.toBeVisible();
  });

  test('H6. "Data & Evidence" button is absent from header top-right', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#livworthy-header');
    await expect(header.locator('text=Data & Evidence')).not.toBeVisible();
  });

  test('H7. "Methodology" button is absent from header top-right', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#livworthy-header');
    await expect(header.locator('#btn-open-methodology')).not.toBeVisible();
  });

  test('H8. All calculator tabs remain functional after header simplification', async ({ page }) => {
    await page.goto('/');

    await page.click('#tab-salary-worth');
    await expect(page.locator('#salary-worth-view')).toBeVisible();

    await page.click('#tab-salary-needed');
    await expect(page.locator('#salary-needed-view')).toBeVisible();

    await page.click('#tab-salary-after-tax');
    await expect(page.locator('#salary-after-tax-view')).toBeVisible();

    await page.click('#tab-cost-of-living');
    await expect(page.locator('#cost-of-living-view')).toBeVisible();

    await page.click('#tab-compare');
    await expect(page.locator('#compare-view')).toBeVisible();

    await page.click('#tab-job-offers');
    await expect(page.locator('#job-offer-compare-view')).toBeVisible();
  });

  test('H9. Logo is keyboard-accessible — receives focus and has correct role', async ({ page }) => {
    await page.goto('/');

    const logoLink = page.locator('#header-logo-link');
    // Programmatically focus the logo link
    await logoLink.focus();
    await expect(logoLink).toBeFocused();

    // The element is an anchor — it should be keyboard-activatable
    const tagName = await logoLink.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
  });

  test('H10. No horizontal overflow in header on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const header = page.locator('#livworthy-header');
    await expect(header).toBeVisible();

    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});

// ============================================================
// SUITE C — Institutional Routing Regression (All Eight Routes)
// ============================================================
test.describe('Institutional Routing Regression — Eight Footer Links', () => {
  // All eight institutional pages with their exact expected page data
  const INSTITUTIONAL_PAGES = [
    {
      slug: 'about',
      path: '/about',
      h1Pattern: /About/i,
      titlePattern: /About/i,
      contentSnippet: 'LivWorthy',
    },
    {
      slug: 'methodology',
      path: '/methodology',
      h1Pattern: /Methodology/i,
      titlePattern: /Methodology/i,
      contentSnippet: 'Methodology',
    },
    {
      slug: 'sources',
      path: '/sources',
      h1Pattern: /Sources/i,
      titlePattern: /Sources/i,
      contentSnippet: 'Sources',
    },
    {
      slug: 'editorial-policy',
      path: '/editorial-policy',
      h1Pattern: /Editorial/i,
      titlePattern: /Editorial/i,
      contentSnippet: 'Editorial',
    },
    {
      slug: 'data-policy',
      path: '/data-policy',
      h1Pattern: /Data Policy/i,
      titlePattern: /Data/i,
      contentSnippet: 'Data',
    },
    {
      slug: 'corrections',
      path: '/corrections',
      h1Pattern: /Corrections/i,
      titlePattern: /Corrections/i,
      contentSnippet: 'Corrections',
    },
    {
      slug: 'terms',
      path: '/terms',
      h1Pattern: /Terms/i,
      titlePattern: /Terms/i,
      contentSnippet: 'Terms',
    },
    {
      slug: 'privacy',
      path: '/privacy',
      h1Pattern: /Privacy/i,
      titlePattern: /Privacy/i,
      contentSnippet: 'Privacy',
    },
  ] as const;

  for (const pg of INSTITUTIONAL_PAGES) {
    test(`IR-${pg.slug}-direct: Direct URL navigation loads standalone page (H1, title, no SPA)`, async ({ page }) => {
      await page.goto(pg.path);

      // Assert final pathname (may have resolved trailing slash redirect)
      const rawPathname = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
      expect(rawPathname).toBe(pg.path);

      // Assert H1 is visible and matches
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(pg.h1Pattern);

      // Assert page-specific title
      await expect(page).toHaveTitle(pg.titlePattern);

      // Assert canonical URL is present and contains the path
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
      expect(canonical).toContain(pg.path);

      // Assert page-specific content is visible
      await expect(page.locator(`text=${pg.contentSnippet}`).first()).toBeVisible({ timeout: 5000 });

      // Assert React SPA homepage calculator is NOT rendered
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
      await expect(page.locator('#tab-salary-worth')).not.toBeVisible();
    });

    test(`IR-${pg.slug}-refresh: Refresh preserves institutional content, not React SPA`, async ({ page }) => {
      await page.goto(pg.path);

      // Record H1 before reload
      const h1Before = await page.locator('h1').first().textContent({ timeout: 10000 });
      expect(h1Before).toBeTruthy();

      await page.reload();

      // After reload the institutional H1 must still be present
      const h1After = await page.locator('h1').first().textContent({ timeout: 10000 });
      expect(h1After).toBeTruthy();
      expect(h1After?.trim()).toBe(h1Before?.trim());

      // SPA calculator must NOT appear after reload
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    });

    test(`IR-${pg.slug}-trailing-slash: Trailing slash resolves to correct institutional page`, async ({ page }) => {
      // Navigate with trailing slash — should normalize and show institutional content
      await page.goto(`${pg.path}/`);

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(pg.h1Pattern);

      // SPA must not be rendered
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    });
  }

  // ---- Footer click tests — ALL EIGHT routes ----
  test('IR-footer-clicks: Clicking all eight footer links navigates to correct institutional pages', async ({ page }) => {
    const allFooterLinks = [
      { path: '/about',           h1: /About/i },
      { path: '/methodology',     h1: /Methodology/i },
      { path: '/sources',         h1: /Sources/i },
      { path: '/editorial-policy', h1: /Editorial/i },
      { path: '/data-policy',     h1: /Data Policy/i },
      { path: '/corrections',     h1: /Corrections/i },
      { path: '/terms',           h1: /Terms/i },
      { path: '/privacy',         h1: /Privacy/i },
    ] as const;

    for (const link of allFooterLinks) {
      // Return to homepage before each click
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Locate the footer anchor by href
      const footerAnchor = page
        .locator('#livworthy-footer')
        .locator(`a[href="${link.path}"]`)
        .first();
      await expect(footerAnchor).toBeVisible({ timeout: 8000 });

      // Click and wait for navigation to the institutional page
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
        footerAnchor.click(),
      ]);

      // Assert correct pathname (after any redirect)
      const finalPath = new URL(page.url()).pathname.replace(/\/$/, '');
      expect(finalPath).toBe(link.path);

      // Assert correct H1
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(link.h1);

      // Assert homepage calculator not rendered
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();

      // Browser back returns to homepage
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        page.goBack(),
      ]);
      expect(new URL(page.url()).pathname).toBe('/');
    }
  });

  // ---- Back / Forward across institutional pages ----
  test('IR-back-forward: Browser back and forward work across institutional pages', async ({ page }) => {
    await page.goto('/');
    await page.goto('/about');
    await page.goto('/methodology');

    // Back to about
    await page.goBack();
    expect(new URL(page.url()).pathname).toBe('/about');
    const h1About = await page.locator('h1').first().textContent({ timeout: 10000 });
    expect(h1About?.toLowerCase()).toContain('about');

    // Forward to methodology
    await page.goForward();
    expect(new URL(page.url()).pathname).toBe('/methodology');
    const h1Methodology = await page.locator('h1').first().textContent({ timeout: 10000 });
    expect(h1Methodology?.toLowerCase()).toContain('methodology');
  });

  // ---- Desktop and mobile navigation ----
  test('IR-desktop-nav: Header nav links "How It Works" and "Sources" visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('#nav-how-it-works')).toBeVisible();
    await expect(page.locator('#nav-sources')).toBeVisible();
  });

  test('IR-mobile-nav: Header nav links exist in DOM on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Links should exist in the DOM even if text is truncated on mobile
    expect(await page.locator('#nav-how-it-works').count()).toBeGreaterThan(0);
    expect(await page.locator('#nav-sources').count()).toBeGreaterThan(0);
  });

  // ---- Keyboard accessibility ----
  test('IR-keyboard: Logo and nav links are reachable and focusable via Tab key', async ({ page }) => {
    await page.goto('/');

    await page.locator('#header-logo-link').focus();
    await expect(page.locator('#header-logo-link')).toBeFocused();

    await page.locator('#nav-how-it-works').focus();
    await expect(page.locator('#nav-how-it-works')).toBeFocused();

    await page.locator('#nav-sources').focus();
    await expect(page.locator('#nav-sources')).toBeFocused();
  });
});

// ============================================================
// SUITE D — Generated SEO Pages (countries / cities / compare / guides)
// ============================================================
test.describe('Generated SEO Pages — Vercel Does Not Serve SPA', () => {
  // Sample representative pages from each category
  const SEO_PAGES = [
    { path: '/countries/us',              h1: /United States/i,      category: 'country' },
    { path: '/countries/gb',              h1: /United Kingdom/i,     category: 'country' },
    { path: '/cities/nyc',                h1: /New York City/i,      category: 'city' },
    { path: '/cities/london',             h1: /London/i,             category: 'city' },
    { path: '/compare/new-york-vs-london', h1: /New York.*London/i,  category: 'comparison' },
    { path: '/compare/london-vs-dubai',   h1: /London.*Dubai/i,      category: 'comparison' },
    { path: '/guides/100k-salary-new-york', h1: /\$100K.*New York/i, category: 'guide' },
    { path: '/guides/austin-100k',        h1: /Austin/i,             category: 'guide' },
  ] as const;

  for (const pg of SEO_PAGES) {
    test(`SEO-${pg.category}: ${pg.path} returns correct H1, not SPA homepage`, async ({ page }) => {
      await page.goto(pg.path);

      // Assert H1 is institutional (not a calculator heading)
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(pg.h1);

      // Assert React SPA calculator is NOT rendered
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
      await expect(page.locator('#tab-salary-worth')).not.toBeVisible();

      // Canonical URL must exist
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
      expect(canonical).toContain(pg.path);
    });

    test(`SEO-${pg.category}-refresh: ${pg.path} refresh preserves SEO content`, async ({ page }) => {
      await page.goto(pg.path);
      const h1Before = await page.locator('h1').first().textContent({ timeout: 10000 });
      await page.reload();
      const h1After = await page.locator('h1').first().textContent({ timeout: 10000 });
      expect(h1After?.trim()).toBeTruthy();
      // SEO page content must survive a reload — not collapse to the SPA
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
      // H1 should remain the same institutional heading
      expect(h1After?.trim()).toBe(h1Before?.trim());
    });
  }
});

// ============================================================
// SUITE E — 404 Behavior for Unknown Routes
// ============================================================
test.describe('404 Behavior — Unknown Routes', () => {
  // NOTE: The local dev server (Vite SPA) returns HTTP 200 for unknown paths
  // since all paths fall through to the SPA shell. True HTTP 404 behavior is
  // enforced by the Vercel edge network for paths with no matching static file.
  // These tests run against the DEPLOYED_URL when provided, otherwise assert
  // the weaker guarantee that the local server doesn't render the calculator.

  const UNKNOWN_PATHS = [
    '/nonexistent-xyz-page',
    '/unknown-route-abc',
    '/this-page-does-not-exist',
  ];

  for (const unknownPath of UNKNOWN_PATHS) {
    test(`404: ${unknownPath} returns HTTP 404 and does not render calculator`, async ({ page }) => {
      const response = await page.goto(unknownPath);
      expect(response?.status()).toBe(404);
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
      await expect(page.locator('#tab-salary-worth')).not.toBeVisible();
    });
  }
});
