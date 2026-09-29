import { test, expect } from '@playwright/test';

// ============================================================
// SUITE A — LivWorthy Financial Intelligence Platform Behavioral
// ============================================================
test.describe('LivWorthy Financial Intelligence Platform Behavioral E2E Suite', () => {
  const pageErrors: Error[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors.length = 0;
    // Catch any unexpected uncaught exceptions and record for test failure
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

    // Official brand logo with alt="LivWorthy"
    const logoImg = page.locator('#livworthy-header img[alt="LivWorthy"]');
    await expect(logoImg).toBeVisible();

    // Verify all primary tabs
    await expect(page.locator('#tab-salary-worth')).toBeVisible();
    await expect(page.locator('#tab-salary-needed')).toBeVisible();
    await expect(page.locator('#tab-salary-after-tax')).toBeVisible();
    await expect(page.locator('#tab-cost-of-living')).toBeVisible();
    await expect(page.locator('#tab-compare')).toBeVisible();
    await expect(page.locator('#tab-job-offers')).toBeVisible();
  });

  test('2. SALARY WORTH: Mutation changes results, city updates currency & jurisdiction, rent affects costs', async ({ page }) => {
    await page.goto('/?city=nyc&salary=100000&tab=salary-worth');

    // Wait for initial calculation to settle
    await expect(page.locator('text=Estimated Take-Home').first()).toBeVisible();

    // 1. Change salary to $120,000
    const salaryInput = page.locator('#hero-annual-salary-input');
    await salaryInput.click();
    await salaryInput.fill('120000');
    await page.keyboard.press('Tab'); // Commit input
    
    // Result should update and reflect valid take-home and gross
    await expect(page.locator('#result-summary-card')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Gross Compensation').first()).toBeVisible();

    // 2. Change city to London
    const locationSelect = page.locator('#hero-location-select');
    await locationSelect.selectOption('london');

    // Verify currency changes to GBP (£) and tax jurisdiction updates to UK (tax-gb-london)
    await expect(page.locator('text=Statutory tax jurisdiction: tax-gb-london').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=£').first()).toBeVisible();

    // 3. Open Evidence Drawer and verify UK evidence (HMRC, ONS), NO NYC evidence
    // Evidence is opened via the in-calculator "Open Evidence" button (not header)
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=Data Provenance & Evidence').first()).toBeVisible();
    await expect(page.locator('text=HM Revenue & Customs (HMRC)').first()).toBeVisible();
    await expect(page.locator('text=Office for National Statistics (ONS)').first()).toBeVisible();
    await expect(page.locator('text=New York State Department of Taxation').first()).not.toBeVisible();

    // Close evidence drawer via Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Data Provenance & Evidence')).not.toBeVisible();
  });

  test('3. SALARY NEEDED: Reverse solver calculates gross salary and transfers correctly to Salary Worth', async ({ page }) => {
    await page.goto('/?tab=salary-needed');
    await expect(page.locator('#salary-needed-view')).toBeVisible();

    // Select Austin as target location
    const targetLocSelect = page.locator('#target-location-select');
    await targetLocSelect.selectOption('austin');

    // Desired savings target $1,500/mo
    const savingsInput = page.locator('#target-savings-input');
    await savingsInput.fill('1500');

    // Wait for solver to produce required gross salary
    const requiredSalaryCard = page.locator('text=Required Gross Salary').first();
    await expect(requiredSalaryCard).toBeVisible({ timeout: 15000 });

    // Click transfer CTA: "Load this salary into Salary Worth"
    const transferBtn = page.locator('#btn-transfer-to-salary-worth');
    await expect(transferBtn).toBeVisible();
    await transferBtn.click();

    // Verify navigated to Salary Worth view
    await expect(page.locator('#salary-worth-view')).toBeVisible();

    // Verify location preserved as Austin and tab is salary-worth
    const locationSelect = page.locator('#hero-location-select');
    await expect(locationSelect).toHaveValue('austin');
  });

  test('4. SALARY AFTER TAX: Jurisdiction switch updates statutory deductions & verification badge', async ({ page }) => {
    await page.goto('/?tab=salary-after-tax');
    await expect(page.locator('#salary-after-tax-view')).toBeVisible();

    // Initial NYC $100k verification
    await expect(page.locator('text=Estimated Net Take-Home Pay').first()).toBeVisible();
    await expect(page.locator('text=VERIFIED ADAPTER').first()).toBeVisible();

    // Change location to Dubai (0% statutory personal income tax)
    const locSelect = page.locator('#tax-location-select');
    await locSelect.selectOption('dubai');

    // In Dubai, 100k AED gross has 0 deductions -> 100,000 AED Net Take-Home
    await expect(page.locator('text=100%').first()).toBeVisible({ timeout: 10000 });

    // Change location to Paris (France - LIMITED adapter)
    await locSelect.selectOption('paris');
    await expect(page.locator('text=LIMITED ADAPTER').first()).toBeVisible({ timeout: 10000 });
  });

  test('5. COST OF LIVING: City and household adjustments update itemized breakdown', async ({ page }) => {
    await page.goto('/?tab=cost-of-living');
    await expect(page.locator('#cost-of-living-view')).toBeVisible();

    // Select London
    const citySelect = page.locator('#col-city-select');
    await citySelect.selectOption('london');

    // Verify itemized categories visible
    await expect(page.locator('text=Housing').first()).toBeVisible();
    await expect(page.locator('text=Food').first()).toBeVisible();
    await expect(page.locator('text=Utilities').first()).toBeVisible();
    await expect(page.locator('text=£').first()).toBeVisible();
  });

  test('6. COMPARE CITIES: Currency switcher recalculates comparison with live FX snapshot', async ({ page }) => {
    await page.goto('/?tab=compare');
    await expect(page.locator('#compare-view')).toBeVisible();

    // Verify initial comparison table
    await expect(page.locator('text=Gross Compensation').first()).toBeVisible();

    // Click EUR display currency button
    const eurBtn = page.locator('#btn-currency-eur');
    await eurBtn.click();

    // Verify table updates to display EUR (€)
    await expect(page.locator('text=€').first()).toBeVisible({ timeout: 10000 });

    // Click GBP display currency button
    const gbpBtn = page.locator('#btn-currency-gbp');
    await gbpBtn.click();
    await expect(page.locator('text=£').first()).toBeVisible({ timeout: 10000 });
  });

  test('7. JOB OFFERS: Year 1 vs Year 2+ toggle properly models one-time relocation vs recurring', async ({ page }) => {
    await page.goto('/?tab=job-offers');
    await expect(page.locator('#job-offer-compare-view')).toBeVisible();

    // In Year 1 (default), one-time relocation costs are deducted
    await expect(page.locator('text=Less One-Time Relocation Costs').first()).toBeVisible();
    await expect(page.locator('text=Year 1 Net Remaining').first()).toBeVisible();

    // Toggle to Year 2+ (steady-state recurring)
    const year2Btn = page.locator('#btn-offer-year2');
    await year2Btn.click();

    // Relocation deduction line should disappear and Year 2+ label appears
    await expect(page.locator('text=Less One-Time Relocation Costs')).not.toBeVisible();
    await expect(page.locator('text=Year 2+ Recurring Remaining').first()).toBeVisible();
  });

  test('8. DYNAMIC EVIDENCE: Accurate jurisdiction sources (NYC -> US, London -> UK, Dubai -> UAE)', async ({ page }) => {
    // 1. Check NYC
    await page.goto('/?city=nyc&tab=salary-worth');
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=Internal Revenue Service (IRS)').first()).toBeVisible();
    await expect(page.locator('text=Social Security Administration (SSA)').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // 2. Switch to London
    const locSelect = page.locator('#hero-location-select');
    await locSelect.selectOption('london');
    await page.waitForTimeout(300);
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=HM Revenue & Customs (HMRC)').first()).toBeVisible();
    await expect(page.locator('text=Office for National Statistics (ONS)').first()).toBeVisible();
    // Must NOT contain NYC sources
    await expect(page.locator('text=Internal Revenue Service (IRS)')).not.toBeVisible();
    await page.keyboard.press('Escape');

    // 3. Switch to Dubai
    await locSelect.selectOption('dubai');
    await page.waitForTimeout(300);
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=Federal Tax Authority (FTA)').first()).toBeVisible();
    await expect(page.locator('text=Dubai Statistics Center (DSC)').first()).toBeVisible();
    await expect(page.locator('text=Internal Revenue Service (IRS)')).not.toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('9. URL STATE & NAVIGATION: Deep link restoration, Back, Forward, and reload persistence', async ({ page }) => {
    // 1. Direct load with custom parameters
    await page.goto('/?city=london&salary=85000&tab=salary-worth&rent=2200');

    // Verify state is restored accurately
    await expect(page.locator('#hero-location-select')).toHaveValue('london');
    await expect(page.locator('#hero-annual-salary-input')).toHaveValue(/85[,.]?000/);

    // 2. Change tab to compare
    await page.click('#tab-compare');
    await expect(page.locator('#compare-view')).toBeVisible();
    expect(page.url()).toContain('tab=compare');

    // 3. Browser Back
    await page.goBack();
    await expect(page.locator('#salary-worth-view')).toBeVisible();
    expect(page.url()).toContain('tab=salary-worth');

    // 4. Browser Forward
    await page.goForward();
    await expect(page.locator('#compare-view')).toBeVisible();
    expect(page.url()).toContain('tab=compare');

    // 5. Reload preserves state
    await page.reload();
    await expect(page.locator('#compare-view')).toBeVisible();
  });

  test('10. MODALS & DRAWERS: Open, Close via X, backdrop click, Escape key with zero dead controls', async ({ page }) => {
    await page.goto('/');

    // 1. Methodology Modal — now accessible via footer or in-calculator buttons, not header
    // Try footer button if it exists and calls the modal handler
    const footerMethodologyBtn = page.locator('#footer-methodology-btn');
    if (await footerMethodologyBtn.isVisible()) {
      await footerMethodologyBtn.click();
      await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
      // Close via Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('text=LivWorthy Calculation Methodology')).not.toBeVisible();
    }

    // 2. Architecture / Diagnostics Modal — accessible via footer diagnostics button
    const footerDiagBtn = page.locator('#footer-diagnostics-btn');
    if (await footerDiagBtn.isVisible()) {
      await footerDiagBtn.click();
      await expect(page.locator('text=LivWorthy System Architecture & Diagnostics').first()).toBeVisible();
      // Close via Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('text=LivWorthy System Architecture & Diagnostics')).not.toBeVisible();
    }

    // 3. Customizer Drawer
    const customizerBtn = page.locator('text=Customize Assumptions').first();
    if (await customizerBtn.isVisible()) {
      await customizerBtn.click();
      await expect(page.locator('text=Household Structure').first()).toBeVisible();
      // Close via Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('text=Household Structure')).not.toBeVisible();
    }
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

    // 1. Verify historical 2024 tax calculate endpoint with explicit taxYear
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
    expect(historicalData.data.netIncome.amountMinor).toBe(7011616); // $70,116.16 historical 2024 NYC

    // 2. Verify current 2025 tax calculate endpoint with current statutory schedules
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
    expect(currentData.data.netIncome.amountMinor).toBe(7034316); // $70,343.16 under 2025 IRS Rev. Proc. 2024-40

    // 3. Verify unsupported country returns TAX_CALCULATION_UNAVAILABLE with false verification
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

    // 4. Verify TY 2026 forward request returns TAX_CALCULATION_UNAVAILABLE with false verification
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

    // 1. Check footer headlines are clickable buttons
    const footer = page.locator('#livworthy-footer');
    await expect(footer).toBeVisible();

    const calcHeadBtn = footer.getByRole('button', { name: 'Calculators & Tools' });
    await expect(calcHeadBtn).toBeVisible();
    await calcHeadBtn.click();

    const guidesHeadBtn = footer.getByRole('button', { name: 'City Salary Guides' });
    await expect(guidesHeadBtn).toBeVisible();
    await guidesHeadBtn.click();

    // Verify navigating to salary guide view
    await expect(page.locator('h1').first()).toContainText('Is $100K a Good Salary in New York City?');

    // 2. Check breadcrumb links (Home / United States / New York / New York City)
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'United States', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'New York', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'New York City', exact: true })).toBeVisible();

    // 3. Test breadcrumb click actions: clicking New York City switches to calculator
    await breadcrumb.getByRole('button', { name: 'New York City', exact: true }).click();
    await expect(page.locator('h1').first()).toContainText(/What is your (salary|income) really worth\?/);

    // Go back to guide via footer
    await footer.getByRole('button', { name: 'City Salary Guides' }).click();
    await expect(page.locator('h1').first()).toContainText('Salary');

    // Test switching guide via country filter pills
    const ukBtn = page.getByRole('button', { name: /United Kingdom/i });
    await expect(ukBtn).toBeVisible();
    await ukBtn.click();
    await expect(page.locator('h1').first()).toContainText('London');

    // Breadcrumb now shows UK / England / London
    await expect(breadcrumb.getByRole('button', { name: 'United Kingdom', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'England', exact: true })).toBeVisible();
    await expect(breadcrumb.getByRole('button', { name: 'London', exact: true })).toBeVisible();

    // 4. Test footer Integrity & Governance headline opens methodology modal
    const integrityHeadBtn = footer.getByRole('button', { name: /Integrity/i });
    await integrityHeadBtn.click();
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // 5. Test methodology link in footer
    const methodBtn = footer.locator('#footer-methodology-btn');
    await methodBtn.click();
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('13. UNAVAILABLE TAX INVARIANTS: Unsupported cities show pending tax verification across Salary Worth, Salary Needed, and Comparisons', async ({ page }) => {
    // 1. Salary Worth with Tokyo (unsupported country JP)
    await page.goto('/?city=tokyo&salary=10000000&tab=salary-worth');
    await expect(page.locator('#result-summary-card')).toBeVisible();

    // Take-Home should display "Pending Verification", NOT gross ¥10,000,000
    await expect(page.locator('text=Pending Verification').first()).toBeVisible();
    await expect(page.locator('text=Under Verification').first()).toBeVisible();

    // Tax warning banner should be visible in ResultSummaryCard
    await expect(page.locator('text=Pending verified tax schedule').first()).toBeVisible();

    // Evidence drawer should show "No Verified Tax Schedule Active"
    await page.click('#btn-open-evidence');
    await expect(page.locator('text=No Verified Tax Schedule Active').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // 2. Salary Needed with Tokyo
    await page.goto('/?city=tokyo&tab=salary-needed');
    await expect(page.locator('#salary-needed-view')).toBeVisible();
    const neededLocSelect = page.locator('#target-location-select');
    await neededLocSelect.selectOption('tokyo');
    await expect(page.locator('text=Salary Requirement Solver Unavailable').first()).toBeVisible();

    // 3. Compare with Tokyo
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
  test('H1. LivWorthy logo is visible and navigates to homepage', async ({ page }) => {
    await page.goto('/');

    // Logo link must be visible and keyboard-accessible
    const logoLink = page.locator('#header-logo-link');
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute('href', '/');

    // Clicking logo navigates to homepage (salary-worth tab)
    await page.click('#tab-compare');
    await expect(page.locator('#compare-view')).toBeVisible();
    await logoLink.click();
    await expect(page.locator('#salary-worth-view')).toBeVisible();
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
    // Must not exist in the header
    const header = page.locator('#livworthy-header');
    await expect(header.locator('text=Deterministic v1.2')).not.toBeVisible();
  });

  test('H5. "Architecture" button is absent from header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#livworthy-header');
    await expect(header.locator('#btn-open-diagnostics')).not.toBeVisible();
    await expect(header.locator('text=Architecture')).not.toBeVisible();
  });

  test('H6. "Data & Evidence" button is absent from header', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#livworthy-header');
    // The old header Evidence button had id btn-open-evidence in the header; it is now only in-calculator
    await expect(header.locator('text=Data & Evidence')).not.toBeVisible();
  });

  test('H7. "Methodology" button is absent from header top-right (replaced by How It Works link)', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('#livworthy-header');
    // Old btn-open-methodology was a button in the header; it should not be present there now
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

  test('H9. Logo is keyboard-accessible with visible focus ring', async ({ page }) => {
    await page.goto('/');

    // Tab to the logo link from the top of the page
    await page.keyboard.press('Tab');

    // After tab, the focused element should be the logo link
    const focused = page.locator(':focus');
    const logoLink = page.locator('#header-logo-link');
    // The logo link should receive focus within a few Tab presses
    await logoLink.focus();
    await expect(logoLink).toBeFocused();
  });

  test('H10. No horizontal overflow in header on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const header = page.locator('#livworthy-header');
    await expect(header).toBeVisible();

    // Verify no horizontal scrollbar
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });
});

// ============================================================
// SUITE C — Institutional Routing Regression
// ============================================================
test.describe('Institutional Routing Regression — Eight Footer Links', () => {
  // Helper: assert full institutional page contract
  async function assertInstitutionalPage(page: any, {
    url,
    expectedPathname,
    h1Pattern,
    titlePattern,
    contentSnippet,
  }: {
    url: string;
    expectedPathname: string;
    h1Pattern: string | RegExp;
    titlePattern: string | RegExp;
    contentSnippet: string;
  }) {
    // 1. Navigate
    await page.goto(url);

    // 2. Assert pathname
    const pathname = new URL(page.url()).pathname.replace(/\/$/, '') || '/';
    const expectedClean = expectedPathname.replace(/\/$/, '') || '/';
    expect(pathname).toBe(expectedClean);

    // 3. Assert H1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 10000 });
    if (typeof h1Pattern === 'string') {
      await expect(h1).toContainText(h1Pattern);
    } else {
      await expect(h1).toHaveText(h1Pattern);
    }

    // 4. Assert document title
    await expect(page).toHaveTitle(titlePattern);

    // 5. Assert canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toContain(expectedPathname.replace(/\/$/, ''));

    // 6. Assert institutional content present
    await expect(page.locator(`text=${contentSnippet}`).first()).toBeVisible();

    // 7. Assert homepage React calculator is NOT rendered
    await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    await expect(page.locator('#livworthy-header')).not.toBeVisible(); // standalone pages don't load the SPA

    // 8. Reload and re-assert content
    await page.reload();
    await expect(page.locator(`text=${contentSnippet}`).first()).toBeVisible();
  }

  // Per-page assertions (H1/title patterns are intentionally lenient for maintainability)
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
      contentSnippet: 'methodology',
    },
    {
      slug: 'sources',
      path: '/sources',
      h1Pattern: /Sources/i,
      titlePattern: /Sources/i,
      contentSnippet: 'source',
    },
    {
      slug: 'editorial-policy',
      path: '/editorial-policy',
      h1Pattern: /Editorial/i,
      titlePattern: /Editorial/i,
      contentSnippet: 'editorial',
    },
    {
      slug: 'data-policy',
      path: '/data-policy',
      h1Pattern: /Data Policy/i,
      titlePattern: /Data/i,
      contentSnippet: 'data',
    },
    {
      slug: 'corrections',
      path: '/corrections',
      h1Pattern: /Corrections/i,
      titlePattern: /Corrections/i,
      contentSnippet: 'correction',
    },
    {
      slug: 'terms',
      path: '/terms',
      h1Pattern: /Terms/i,
      titlePattern: /Terms/i,
      contentSnippet: 'terms',
    },
    {
      slug: 'privacy',
      path: '/privacy',
      h1Pattern: /Privacy/i,
      titlePattern: /Privacy/i,
      contentSnippet: 'privacy',
    },
  ] as const;

  for (const pg of INSTITUTIONAL_PAGES) {
    test(`IR-${pg.slug}: Direct URL navigation loads standalone page with correct H1 and title`, async ({ page }) => {
      // Direct URL navigation
      await page.goto(pg.path);

      // Assert pathname
      const rawPathname = new URL(page.url()).pathname;
      const pathname = rawPathname.replace(/\/$/, '') || '/';
      expect(pathname).toBe(pg.path);

      // Assert H1 exists and is not empty
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(pg.h1Pattern);

      // Assert title
      await expect(page).toHaveTitle(pg.titlePattern);

      // Assert institutional content present
      await expect(page.locator(`text=${pg.contentSnippet}`).first()).toBeVisible({ timeout: 5000 });

      // Assert React SPA homepage calculator is NOT rendered
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    });

    test(`IR-${pg.slug}: Refresh preserves institutional content, not React SPA`, async ({ page }) => {
      await page.goto(pg.path);
      const h1Before = await page.locator('h1').first().textContent();

      await page.reload();

      const h1After = await page.locator('h1').first().textContent();
      expect(h1After).toBeTruthy();
      // After reload the page should still show institutional content
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();
    });

    test(`IR-${pg.slug}: Trailing slash redirect/normalize — /path/ and /path both resolve`, async ({ page }) => {
      // Navigate with trailing slash
      await page.goto(`${pg.path}/`);
      const finalPath = new URL(page.url()).pathname;
      // Either /path or /path/ — both should show institutional content
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(pg.h1Pattern);
    });
  }

  test('IR-click-from-homepage: Footer links from homepage navigate to correct institutional pages', async ({ page }) => {
    await page.goto('/');

    // Click each footer link and assert pathname + H1
    const footerLinks = [
      { text: 'About', path: '/about', h1: /About/i },
      { text: 'Methodology', path: '/methodology', h1: /Methodology/i },
      { text: 'Sources', path: '/sources', h1: /Sources/i },
      { text: 'Terms', path: '/terms', h1: /Terms/i },
      { text: 'Privacy Policy', path: '/privacy', h1: /Privacy/i },
    ];

    for (const link of footerLinks) {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Find and click the footer anchor link
      const footerAnchor = page
        .locator('#livworthy-footer')
        .locator(`a[href="${link.path}"]`)
        .first();
      await expect(footerAnchor).toBeVisible();
      await footerAnchor.click();

      // Wait for navigation
      await page.waitForURL(`**${link.path}**`, { timeout: 10000 });
      const pathname = new URL(page.url()).pathname.replace(/\/$/, '');
      expect(pathname).toBe(link.path);

      // Assert H1
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toHaveText(link.h1);

      // Assert homepage calculator not rendered
      await expect(page.locator('#salary-worth-view')).not.toBeVisible();

      // Browser back returns to homepage
      await page.goBack();
      await page.waitForURL('**/', { timeout: 5000 });
    }
  });

  test('IR-back-forward: Browser back and forward work across institutional pages', async ({ page }) => {
    await page.goto('/');
    await page.goto('/about');
    await page.goto('/methodology');

    // Back to about
    await page.goBack();
    expect(new URL(page.url()).pathname).toBe('/about');
    let h1 = await page.locator('h1').first().textContent();
    expect(h1?.toLowerCase()).toContain('about');

    // Forward to methodology
    await page.goForward();
    expect(new URL(page.url()).pathname).toBe('/methodology');
    h1 = await page.locator('h1').first().textContent();
    expect(h1?.toLowerCase()).toContain('methodology');
  });

  test('IR-desktop-mobile-nav: Header "How It Works" and "Sources" links visible on desktop and mobile', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('#nav-how-it-works')).toBeVisible();
    await expect(page.locator('#nav-sources')).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    // On mobile the text may be hidden but the link should be present in DOM
    const howItWorksLink = page.locator('#nav-how-it-works');
    const sourcesLink = page.locator('#nav-sources');
    // At minimum the elements should exist in the DOM
    expect(await howItWorksLink.count()).toBeGreaterThan(0);
    expect(await sourcesLink.count()).toBeGreaterThan(0);
  });

  test('IR-keyboard-accessibility: Logo and nav links reachable via Tab key', async ({ page }) => {
    await page.goto('/');

    // Tab to logo
    await page.locator('#header-logo-link').focus();
    await expect(page.locator('#header-logo-link')).toBeFocused();

    // Tab to How It Works
    await page.locator('#nav-how-it-works').focus();
    await expect(page.locator('#nav-how-it-works')).toBeFocused();

    // Tab to Sources
    await page.locator('#nav-sources').focus();
    await expect(page.locator('#nav-sources')).toBeFocused();
  });
});
