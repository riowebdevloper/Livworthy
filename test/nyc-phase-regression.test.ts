import fs from 'node:fs';
import path from 'node:path';
import { TaxRegistry } from '../src/engines/tax/tax-registry';
import { createMoney, toMajor } from '../src/lib/money';
import { CITY_COL_BENCHMARKS } from '../src/data/city-benchmarks';
import { EVIDENCE_SOURCES } from '../src/data/evidence-registry';
import { CostOfLivingEngine } from '../src/engines/col/col-engine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

export function runNycPhaseRegressionTests() {
  console.log('\n======================================================');
  console.log('--- LIVWORTHY NYC PHASE 21 REGRESSION TEST SUITE ---');
  console.log('======================================================\n');

  const distDir = path.resolve(process.cwd(), 'dist');
  assert(fs.existsSync(distDir), 'Build dist directory must exist');

  const salaryPagePath = path.join(distDir, 'salary-after-tax/new-york/index.html');
  const colPagePath = path.join(distDir, 'cost-of-living/new-york/index.html');
  const guidePagePath = path.join(distDir, 'guides/nyc-100k/index.html');
  const comparePagePath = path.join(distDir, 'compare/new-york-vs-london/index.html');

  assert(fs.existsSync(salaryPagePath), 'salary-after-tax/new-york/index.html must exist');
  assert(fs.existsSync(colPagePath), 'cost-of-living/new-york/index.html must exist');
  assert(fs.existsSync(guidePagePath), 'guides/nyc-100k/index.html must exist');
  assert(fs.existsSync(comparePagePath), 'compare/new-york-vs-london/index.html must exist');

  const salaryHtml = fs.readFileSync(salaryPagePath, 'utf-8');
  const colHtml = fs.readFileSync(colPagePath, 'utf-8');
  const guideHtml = fs.readFileSync(guidePagePath, 'utf-8');
  const compareHtml = fs.readFileSync(comparePagePath, 'utf-8');
  const allTargetHtml = [salaryHtml, colHtml, guideHtml, compareHtml];

  // 1. /salary-after-tax/new-york contains a calculator UI
  assert(
    salaryHtml.includes('id="interactive-salary-calculator"'),
    '1. /salary-after-tax/new-york contains interactive calculator island container'
  );
  assert(
    salaryHtml.includes('Annual Gross Salary (USD)'),
    '1b. /salary-after-tax/new-york contains accessible salary input label'
  );
  assert(
    !salaryHtml.includes('pensionContribution') &&
      !salaryHtml.includes('healthDeduction') &&
      !salaryHtml.includes('Pre-tax 401(k)'),
    '1c. NYC calculator does NOT expose pension/401k or health-deduction controls'
  );
  assert(
    !salaryHtml.includes('married_filing_jointly') &&
      !salaryHtml.includes('head_of_household') &&
      !salaryHtml.includes('name="filingStatus"'),
    '1d. No married_filing_jointly or head_of_household selector is exposed on the NYC calculator'
  );

  // 2. core calculation does NOT require redirecting to homepage
  assert(
    !salaryHtml.includes('Open Interactive Calculator →'),
    '2. /salary-after-tax/new-york does NOT display redirect CTA banner to homepage'
  );

  // 3. default $100k output matches TaxRegistry
  const expected100k = TaxRegistry.calculate(
    createMoney(100000, 'USD'),
    { filingStatus: 'single', dependentsCount: 0, taxYear: 2026 },
    { countryId: 'US', regionId: 'US-NY', cityId: 'nyc', taxYear: 2026 }
  );
  const expNetMonthly = toMajor(expected100k.monthlyNetIncome).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const expNetAnnual = toMajor(expected100k.netIncome).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  assert(
    salaryHtml.includes(expNetMonthly),
    `3. default $100k output contains monthly take-home matching TaxRegistry ($${expNetMonthly})`
  );
  assert(
    salaryHtml.includes(expNetAnnual),
    `3b. default $100k output contains annual take-home matching TaxRegistry ($${expNetAnnual})`
  );

  // 4. salary tier table matches TaxRegistry
  const tiers = [40000, 60000, 80000, 100000, 120000, 150000, 200000, 250000];
  for (const tier of tiers) {
    const tierResult = TaxRegistry.calculate(
      createMoney(tier, 'USD'),
      { filingStatus: 'single', dependentsCount: 0, taxYear: 2026 },
      { countryId: 'US', regionId: 'US-NY', cityId: 'nyc', taxYear: 2026 }
    );
    const tierNetMonthly = toMajor(tierResult.monthlyNetIncome).toLocaleString();
    assert(
      salaryHtml.includes(`USD ${tier.toLocaleString()}`),
      `4. Salary tier table includes gross USD ${tier.toLocaleString()}`
    );
    assert(
      salaryHtml.includes(`USD ${tierNetMonthly}`),
      `4b. Salary tier table includes TaxRegistry monthly net USD ${tierNetMonthly} for gross ${tier}`
    );
  }

  // 5. page tax year = engine tax year
  assert(
    salaryHtml.includes('2026 Tax Year') || salaryHtml.includes('Tax Year 2026'),
    '5. salary-after-tax page tax year is 2026'
  );
  assert(
    guideHtml.includes('Tax Year 2026') || guideHtml.includes('2026 Tax Year'),
    '5b. guide page tax year is 2026'
  );

  // 6. source/evidence links are rendered
  assert(
    salaryHtml.includes('href="https://www.irs.gov'),
    '6. salary-after-tax renders crawlable IRS primary source link'
  );
  assert(
    salaryHtml.includes('href="https://www.tax.ny.gov'),
    '6b. salary-after-tax renders crawlable NYS Dept of Taxation and Finance primary source link'
  );
  assert(
    colHtml.includes('href="https://www.huduser.gov/portal/datasets/fmr.html"'),
    '6c. cost-of-living renders crawlable HUD Fair Market Rent primary source link'
  );
  assert(
    colHtml.includes('href="https://new.mta.info/fares"'),
    '6d. cost-of-living renders crawlable MTA fare schedule primary source link'
  );

  // 7. no AEO Direct Answer visible label
  for (const h of allTargetHtml) {
    assert(
      !h.includes('AEO Direct Answer &amp; Verdict') && !h.includes('AEO Direct Answer & Verdict'),
      '7. No visible "AEO Direct Answer & Verdict" label'
    );
  }

  // 8. no Passage Optimized visible label
  for (const h of allTargetHtml) {
    assert(
      !h.includes('Passage Optimized'),
      '8. No visible "Passage Optimized" engineering label'
    );
  }

  // 9. no outdated $132 MTA copy
  for (const h of allTargetHtml) {
    assert(
      !h.includes('$132/month') && !h.includes('$132 transit') && !h.includes('$132 MTA'),
      '9. No outdated $132 MTA pass claims'
    );
  }

  // 10. NYC COL source dates are available and distinct
  const nycBmk = CITY_COL_BENCHMARKS.nyc;
  assert(!!nycBmk.metadata, '10. NYC benchmark carries metadata breakdown');
  assert(
    nycBmk.metadata?.housing?.observationPeriod === 'FY 2026 (eff. 2025-10-01)',
    '10b. Housing metadata carries FY 2026 observation period'
  );
  assert(
    nycBmk.metadata?.transit?.observationPeriod === 'Effective 2026-01-04',
    '10c. Transit metadata carries MTA 2026 effective period'
  );
  assert(
    nycBmk.metadata?.food?.observationPeriod === '2023–24 (published 2026-01-06)',
    '10d. Food metadata carries BLS 2023–24 release'
  );
  assert(
    nycBmk.metadata?.childcare?.observationPeriod === '2024–2026 planning benchmark',
    '10e. Childcare metadata carries planning benchmark observation period'
  );
  const housingObs = nycBmk.metadata?.housing?.observationPeriod;
  const transitObs = nycBmk.metadata?.transit?.observationPeriod;
  const foodObs = nycBmk.metadata?.food?.observationPeriod;
  const childcareObs = nycBmk.metadata?.childcare?.observationPeriod;
  assert(
    housingObs !== transitObs && housingObs !== foodObs && transitObs !== foodObs && foodObs !== childcareObs,
    '10f. NYC category observation periods remain distinct across categories'
  );

  // 11. 2024 data is not silently labeled as observed in 2026
  const foodPeriod = nycBmk.metadata?.food?.observationPeriod || '';
  assert(
    foodPeriod.includes('2023–24') || foodPeriod.includes('2023-2024'),
    '11. Food observation period transparently specifies CEX base period'
  );

  // 12. FX snapshot is not called CURRENT/live if stale
  assert(
    !compareHtml.includes('live exchange rate snapshots') && !compareHtml.includes('real-time exchange rate'),
    '12. NYC vs London does NOT falsely claim live/real-time FX snapshots'
  );
  assert(
    compareHtml.includes('Benchmark FX: 2026-01-01') || compareHtml.includes('dated 2026-01-01'),
    '12b. NYC vs London clearly states dated benchmark FX snapshot'
  );

  // 13. all canonical URLs use www.livworthy.com
  for (const h of allTargetHtml) {
    const canonicalMatch = h.match(/<link\s+rel="canonical"\s+href="(.*?)"\s*\/?>/);
    assert(!!canonicalMatch, '13. Page must contain a canonical link');
    assert(
      canonicalMatch![1].startsWith('https://www.livworthy.com/'),
      `13b. Canonical URL must use https://www.livworthy.com/ (got ${canonicalMatch![1]})`
    );
  }

  // 14. page is index,follow
  for (const h of allTargetHtml) {
    const robotsMatch = h.match(/<meta\s+name="robots"\s+content="(.*?)"\s*\/?>/);
    assert(!!robotsMatch, '14. Page must declare robots meta');
    assert(
      robotsMatch![1].toLowerCase().includes('index') && robotsMatch![1].toLowerCase().includes('follow'),
      `14b. Page must be index, follow (got ${robotsMatch![1]})`
    );
  }

  // 15. verify standalone 404 page exists and invalid route returns non-existent path
  const notFoundPagePath = path.join(distDir, '404.html');
  assert(fs.existsSync(notFoundPagePath), '15. Standalone 404.html page must exist in build distribution');
  const nonExistentPath = path.join(distDir, 'non-existent-sample-page/index.html');
  assert(!fs.existsSync(nonExistentPath), '15b. Non-existent path does not generate a false static page');

  // 16. calculator works without breaking prerendered content
  assert(
    salaryHtml.includes('<script type="module"'),
    '16. salary-after-tax retains client JS module script for interactive hydration island'
  );
  assert(
    salaryHtml.includes('gross-salary-static') || salaryHtml.includes('Federal Income Tax'),
    '16b. salary-after-tax contains full prerendered HTML content before JS execution'
  );

  // 17. no duplicate canonical
  for (const h of allTargetHtml) {
    const canonicalCount = (h.match(/<link\s+rel="canonical"/g) || []).length;
    assert(canonicalCount === 1, `17. Exactly one canonical link per page (found ${canonicalCount})`);
  }

  // 18. no preview-domain metadata
  for (const h of allTargetHtml) {
    assert(!h.includes('vercel.app'), '18. No preview domain vercel.app in generated HTML');
  }

  // 19. all important internal links are direct canonical
  assert(
    salaryHtml.includes('href="/guides/nyc-100k"'),
    '19. salary-after-tax links directly to /guides/nyc-100k'
  );
  assert(
    salaryHtml.includes('href="/cost-of-living/new-york"'),
    '19b. salary-after-tax links directly to /cost-of-living/new-york'
  );
  assert(
    colHtml.includes('href="/salary-after-tax/new-york"'),
    '19c. cost-of-living links directly to /salary-after-tax/new-york'
  );
  assert(
    guideHtml.includes('href="/salary-after-tax/new-york"'),
    '19d. guides/nyc-100k links directly to /salary-after-tax/new-york'
  );
  assert(
    compareHtml.includes('href="/salary-after-tax/new-york"'),
    '19e. compare/new-york-vs-london links directly to /salary-after-tax/new-york'
  );

  // 20. unsupported NYC filing statuses are not presented as verified calculations
  assert(
    salaryHtml.includes('Single Filer') || salaryHtml.includes('single filer'),
    '20. NYC interactive calculator explicitly restricts verified scope to single filer'
  );
  assert(
    salaryHtml.includes('Form IT-2105-I') || salaryHtml.includes('IT-2105-I'),
    '20b. Scope note identifies statutory IT-2105-I worksheet verification'
  );

  // 21. Childcare does not use HUD evidence
  const colWithChild = CostOfLivingEngine.calculate('nyc', {
    adults: 2,
    children: 1,
    housingType: '2-bedroom',
    areaType: 'typical',
    transportMode: 'public_transit',
    carsCount: 0,
    lifestyleLevel: 'moderate',
    preset: 'family',
  });
  const childcareItem = colWithChild.categories
    .flatMap((c) => c.items)
    .find((i) => i.id === 'childcare-education');
  assert(!!childcareItem, '21. Childcare item exists for family household');
  assert(
    childcareItem!.evidenceSourceId === 'us-nyc-childcare-benchmark',
    `21b. Childcare uses us-nyc-childcare-benchmark (got ${childcareItem?.evidenceSourceId})`
  );
  assert(
    !childcareItem!.evidenceSourceId.includes('hud'),
    '21c. Childcare does NOT use HUD evidence'
  );

  // 22. $151.67 is labeled modeled, not official monthly MTA pass
  for (const h of allTargetHtml) {
    assert(
      !h.includes('official MTA monthly pass') && !h.includes('official monthly pass'),
      '22. No page claims $151.67 is an official MTA monthly pass'
    );
  }
  assert(
    EVIDENCE_SOURCES['us-mta-nyc-transit-2026'].notes.includes('modeled monthly equivalent'),
    '22b. MTA evidence source notes describe $151.67 as modeled monthly equivalent'
  );

  // 23. No "legally qualify" or "strictly enforce" 40x wording
  for (const h of allTargetHtml) {
    assert(
      !h.includes('legally qualify'),
      '23. No "legally qualify" wording on target pages'
    );
    assert(
      !h.includes('strictly enforce'),
      '23b. No "strictly enforce" wording on target pages'
    );
  }

  // 24. No fake Automated Statutory Verification Engine reviewer in new NYC evidence
  assert(
    !EVIDENCE_SOURCES['us-hud-nyc-fmr-2026'].verifiedBy,
    '24. No fake reviewer on us-hud-nyc-fmr-2026'
  );
  assert(
    !EVIDENCE_SOURCES['us-mta-nyc-transit-2026'].verifiedBy,
    '24b. No fake reviewer on us-mta-nyc-transit-2026'
  );

  console.log('\n======================================================');
  console.log('✅ ALL NYC PHASE REGRESSION TESTS PASSED (100%)!');
  console.log('======================================================\n');
}

runNycPhaseRegressionTests();
