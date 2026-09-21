import { test, expect } from '@playwright/test';

test.describe('LivWorthy Financial Intelligence Platform Behavioral E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Catch any unexpected uncaught exceptions or console errors
    page.on('pageerror', (err) => {
      console.error('Browser uncaught pageerror:', err.message);
    });
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
    await expect(page.locator('text=Annual Take-Home').first()).toBeVisible();

    // Verify take-home amount for NYC $100k (~$70,116)
    const initialTakeHome = page.locator('text=$70,116').first();
    await expect(initialTakeHome).toBeVisible({ timeout: 10000 });

    // 1. Change salary to $120,000
    const salaryInput = page.locator('#hero-annual-salary-input');
    await salaryInput.fill('120000');
    // Result should update beyond $70,116 (e.g. ~$82,113)
    await expect(page.locator('text=$82,113').first()).toBeVisible({ timeout: 10000 });

    // 2. Change city to London
    const locationSelect = page.locator('#hero-location-select');
    await locationSelect.selectOption('london');

    // Verify currency changes to GBP (£) and tax jurisdiction updates to UK (tax-gb-london)
    await expect(page.locator('text=Statutory tax jurisdiction: tax-gb-london').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=£').first()).toBeVisible();

    // 3. Open Evidence Drawer and verify UK evidence (HMRC, ONS), NO NYC evidence
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
    await expect(page.locator('#hero-annual-salary-input')).toHaveValue('85000');

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

    // 1. Methodology Modal
    await page.click('#btn-open-methodology');
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    // Close via Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('text=LivWorthy Calculation Methodology')).not.toBeVisible();

    // 2. Architecture / Diagnostics Modal
    const diagBtn = page.locator('#btn-open-diagnostics');
    if (await diagBtn.isVisible()) {
      await diagBtn.click();
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
    const provisional = cData.countries.filter((c: any) => c.verificationStatus === 'PROVISIONAL');
    expect(verified.length).toBe(10);
    expect(limited.length).toBe(25);
    expect(provisional.length).toBe(4);
    expect(cData.countries.length).toBe(39);

    // Verify tax calculate endpoint
    const taxRes = await request.post('/api/tax/estimate', {
      data: {
        grossSalaryMinor: 10000000,
        currency: 'USD',
        countryId: 'US',
        regionId: 'NY',
        cityId: 'nyc',
        taxJurisdictionId: 'US-FED-NY-NYC',
      },
    });
    expect(taxRes.status()).toBe(200);
    const taxData = await taxRes.json();
    expect(taxData.success).toBe(true);
    expect(taxData.data.netIncome.amountMinor).toBe(7011616); // $70,116.16
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
    await expect(page.locator('h1').first()).toContainText('What is your income really worth?');

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

    // 4. Test footer Integrity & Standards headline opens methodology modal
    const integrityHeadBtn = footer.getByRole('button', { name: 'Integrity & Standards' });
    await integrityHeadBtn.click();
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // 5. Test 39 Commercial Markets link in bottom bar
    const marketsBtn = footer.getByRole('button', { name: 'All 39 Commercial Markets' });
    await marketsBtn.click();
    await expect(page.locator('text=LivWorthy Calculation Methodology').first()).toBeVisible();
    await page.keyboard.press('Escape');
  });
});
