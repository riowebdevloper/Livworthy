import assert from 'node:assert';
import { SALARY_GUIDES } from '../src/data/salary-guides';
import { SEO_LANDING_PAGES } from '../src/data/seo-clusters';
import { VERIFIED_CITY_EDITORIAL } from '../src/data/city-editorial';
import { LOCALIZED_CITIES } from '../src/lib/i18n/content/cities';
import { LOCALIZED_GUIDES } from '../src/lib/i18n/content/guides';
import {
  getGlobalSalaryWorthIndexReport,
  getPurchasingPowerComparisonReport,
  getSalaryToRentIndexReport,
  ALL_EMPIRICAL_REPORTS,
} from '../src/data/reports-data';
import { TaxRegistry } from '../src/engines/tax/tax-registry';
import { CostOfLivingEngine } from '../src/engines/col/col-engine';
import { createMoney, toMajor } from '../src/lib/money';
import { PLATFORM_IDENTITY, AUTHORITATIVE_SOURCES } from '../src/data/transparency';

console.log('=== RUNNING FINANCIAL CONSISTENCY & ADSENSE QA REGRESSION SUITE ===\n');

// 1. NYC $100K CANONICAL CONSISTENCY
{
  console.log('Test 1: NYC $100K 2026 TaxRegistry & CostOfLivingEngine');
  const taxRes = TaxRegistry.calculate(
    createMoney(100000, 'USD'),
    { filingStatus: 'single', taxYear: 2026, dependentsCount: 0 },
    { countryId: 'US', cityId: 'nyc', taxYear: 2026 }
  );

  const netAnnual = Math.round(toMajor(taxRes.netIncome));
  const netMonthly = Math.round(netAnnual / 12);
  const effectiveTaxRate = Number((taxRes.effectiveTaxRate * 100).toFixed(1));

  assert.strictEqual(netAnnual, 70879, 'TaxRegistry NYC $100K netAnnual must be 70879');
  assert.strictEqual(netMonthly, 5907, 'TaxRegistry NYC $100K netMonthly must be 5907');
  assert.strictEqual(effectiveTaxRate, 29.1, 'TaxRegistry NYC $100K effectiveTaxRate must be 29.1%');

  const colRes = CostOfLivingEngine.calculate('nyc', {
    adults: 1,
    children: 0,
    housingType: '1-bedroom',
    areaType: 'typical',
    transportMode: 'public_transit',
    carsCount: 0,
    lifestyleLevel: 'moderate',
    preset: 'single',
  });

  const rentMonthly = toMajor(colRes.housingMonthly);
  assert.strictEqual(rentMonthly, 2655, 'CostOfLivingEngine NYC 1-bed rent must be 2655 (HUD FY2026 FMR)');
  console.log('  ✓ NYC $100K engine output confirmed ($70,879 net, $5,907/mo, 29.1% tax, $2,655 HUD FMR)');
}

{
  console.log('Test 2: salary-guides.ts nyc-100k canonical values');
  const guide = SALARY_GUIDES['nyc-100k'];
  assert.ok(guide, 'nyc-100k guide must exist');
  assert.strictEqual(guide.salaryMajor, 100000);
  assert.ok(guide.lifestyleContext.includes('$5,907/month'), 'Must include $5,907/month');
  assert.ok(guide.lifestyleContext.includes('$70,879/year'), 'Must include $70,879/year');
  assert.ok(guide.lifestyleContext.includes('29.1%'), 'Must include 29.1% effective tax');
  assert.ok(guide.lifestyleContext.includes('$2,655'), 'Must include $2,655 HUD FMR');
  assert.ok(guide.lifestyleContext.includes('~$1,660/month'), 'Must include ~$1,660/month uncommitted savings');
  console.log('  ✓ salary-guides.ts nyc-100k confirmed');
}

{
  console.log('Test 3: seo-clusters.ts nyc-100k has zero legacy values');
  const cluster = SEO_LANDING_PAGES['nyc-100k'];
  assert.ok(cluster, 'nyc-100k SEO cluster must exist');
  assert.ok(cluster.directAnswer.includes('$5,907 per month'), 'Must contain $5,907 per month');
  assert.ok(cluster.directAnswer.includes('$70,879 annually'), 'Must contain $70,879 annually');
  assert.ok(cluster.directAnswer.includes('$2,655'), 'Must contain HUD FMR $2,655');
  assert.ok(!cluster.directAnswer.includes('$5,862'), 'Must not contain legacy $5,862');
  assert.ok(!cluster.directAnswer.includes('$70,340'), 'Must not contain legacy $70,340');
  assert.ok(!cluster.directAnswer.includes('$2,350'), 'Must not contain legacy $2,350');
  console.log('  ✓ seo-clusters.ts nyc-100k confirmed');
}

{
  console.log('Test 4: city-editorial.ts nyc profile');
  const nyc = VERIFIED_CITY_EDITORIAL['nyc'];
  assert.ok(nyc, 'nyc city editorial must exist');
  assert.ok(nyc.takeHomePayAnalysis.includes('$5,907 ($70,879 a year)'), 'Must include $5,907 ($70,879 a year)');
  assert.ok(nyc.takeHomePayAnalysis.includes('29.1%'), 'Must include 29.1% effective tax');
  assert.ok(nyc.housingMarketContext.includes('$2,655'), 'Must include HUD FMR $2,655');
  assert.ok(nyc.housingMarketContext.includes('$106,200'), 'Must include 40x rule $106,200');
  assert.ok(nyc.transportAndMobility.includes('$35 rolling 7-day cap'), 'Must include OMNY $35 cap');
  assert.ok(!nyc.takeHomePayAnalysis.includes('$5,862'), 'Must not include legacy $5,862');
  assert.ok(!nyc.takeHomePayAnalysis.includes('$70,340'), 'Must not include legacy $70,340');
  console.log('  ✓ city-editorial.ts nyc profile confirmed');
}

{
  console.log('Test 5: localized cities.ts nyc content across all 10 locales');
  const locales = Object.keys(LOCALIZED_CITIES.nyc);
  assert.ok(locales.length >= 8, 'Must have at least 8 locales');

  for (const loc of locales) {
    const text = JSON.stringify(LOCALIZED_CITIES.nyc[loc]);
    assert.ok(!text.includes('70,340') && !text.includes('70.340'), `Locale ${loc} must not contain legacy 70,340`);
    assert.ok(!text.includes('5,862') && !text.includes('5.862'), `Locale ${loc} must not contain legacy 5,862`);
    assert.ok(!text.includes('2,350') && !text.includes('2.350'), `Locale ${loc} must not contain legacy 2,350`);
  }
  console.log(`  ✓ localized cities.ts verified across all ${locales.length} locales`);
}

{
  console.log('Test 6: localized guides.ts nyc-100k content across all locales');
  const locales = Object.keys(LOCALIZED_GUIDES['nyc-100k']);
  assert.ok(locales.length >= 8, 'Must have at least 8 locales');

  for (const loc of locales) {
    const text = JSON.stringify(LOCALIZED_GUIDES['nyc-100k'][loc]);
    assert.ok(!text.includes('70,340') && !text.includes('70.340'), `Guide locale ${loc} must not contain legacy 70,340`);
    assert.ok(!text.includes('5,862') && !text.includes('5.862'), `Guide locale ${loc} must not contain legacy 5,862`);
    assert.ok(!text.includes('2,350') && !text.includes('2.350'), `Guide locale ${loc} must not contain legacy 2,350`);
    assert.ok(!text.includes('132'), `Guide locale ${loc} must not contain legacy 132 MTA`);
  }
  console.log(`  ✓ localized guides.ts nyc-100k verified across all ${locales.length} locales`);
}

// 2. LONDON & EUROPEAN SALARY CONSISTENCY
{
  console.log('Test 7: London £75K and £100K 2026 HMRC consistency');
  const tax75 = TaxRegistry.calculate(
    createMoney(75000, 'GBP'),
    { filingStatus: 'single', taxYear: 2026, dependentsCount: 0 },
    { countryId: 'GB', cityId: 'london', taxYear: 2026 }
  );
  assert.strictEqual(Math.round(toMajor(tax75.netIncome)), 54057);
  assert.strictEqual(Number((tax75.effectiveTaxRate * 100).toFixed(1)), 27.9);

  const tax100 = TaxRegistry.calculate(
    createMoney(100000, 'GBP'),
    { filingStatus: 'single', taxYear: 2026, dependentsCount: 0 },
    { countryId: 'GB', cityId: 'london', taxYear: 2026 }
  );
  assert.strictEqual(Math.round(toMajor(tax100.netIncome)), 68557);
  assert.strictEqual(Math.round(toMajor(tax100.netIncome) / 12), 5713);
  assert.strictEqual(Number((tax100.effectiveTaxRate * 100).toFixed(1)), 31.4);

  const guide = SALARY_GUIDES['london-100k'];
  assert.ok(guide.lifestyleContext.includes('£5,713/month'), 'Must include £5,713/month');
  assert.ok(guide.lifestyleContext.includes('£68,557/year'), 'Must include £68,557/year');
  assert.ok(guide.lifestyleContext.includes('31.4%'), 'Must include 31.4% effective tax');

  const cluster = SEO_LANDING_PAGES['london-100k'];
  assert.ok(cluster.directAnswer.includes('£5,713 per month'));
  assert.ok(cluster.directAnswer.includes('£68,557 annually'));
  assert.ok(cluster.directAnswer.includes('31.4%'));
  console.log('  ✓ London £75K and £100K numbers confirmed');
}

{
  console.log('Test 8: Berlin €80K 2026 Steuerklasse 1 consistency');
  const guide = SALARY_GUIDES['berlin-80k'];
  assert.ok(guide.lifestyleContext.includes('€3,471/month'), 'Must include €3,471/month');
  assert.ok(guide.lifestyleContext.includes('€41,656/year'), 'Must include €41,656/year');
  assert.ok(guide.lifestyleContext.includes('47.9%'), 'Must include 47.9% effective tax');

  const cluster = SEO_LANDING_PAGES['berlin-80k'];
  assert.ok(cluster.directAnswer.includes('€3,471 in monthly net take-home pay'));
  assert.ok(cluster.directAnswer.includes('47.9%'));
  console.log('  ✓ Berlin €80K numbers confirmed');
}

// 3. EMPIRICAL REPORTS SYNCHRONIZATION
{
  console.log('Test 9: Report A: Global Salary Worth Index deterministic synchronization');
  const repA = getGlobalSalaryWorthIndexReport();
  const rows = repA.tableRows;

  // Dubai row
  const dubaiRow = rows.find((r) => String(r[0]).includes('Dubai'));
  assert.ok(dubaiRow, 'Dubai row must exist');
  assert.strictEqual(dubaiRow[7], '60%');
  assert.strictEqual(dubaiRow[6], 'AED 208,640');
  assert.ok(repA.summaryInsights[0].includes('60% savings rate on 350,000 AED'));
  assert.ok(repA.summaryInsights[0].includes('208,640 AED'));

  // NYC row
  const nycRow = rows.find((r) => String(r[0]).includes('New York'));
  assert.ok(nycRow, 'NYC row must exist');
  assert.strictEqual(nycRow[2], '29.1%');
  assert.strictEqual(nycRow[3], 'USD 70,879');
  assert.strictEqual(nycRow[7], '28%');
  assert.ok(repA.summaryInsights[1].includes('29.1% effective rate on $100K'));
  assert.ok(repA.summaryInsights[1].includes('$70,879 net'));

  // London row
  const londonRow = rows.find((r) => String(r[0]).includes('London'));
  assert.ok(londonRow, 'London row must exist');
  assert.strictEqual(londonRow[2], '27.9%');
  assert.strictEqual(londonRow[3], 'GBP 54,057');
  assert.strictEqual(londonRow[7], '30%');
  assert.ok(repA.summaryInsights[2].includes('£54,057 net'));
  assert.ok(repA.summaryInsights[2].includes('30% savings rate'));

  // Zurich row
  const zurichRow = rows.find((r) => String(r[0]).includes('Zurich'));
  assert.ok(zurichRow, 'Zurich row must exist');
  assert.strictEqual(zurichRow[2], '22.8%');
  assert.strictEqual(zurichRow[7], '48%');
  assert.ok(repA.summaryInsights[3].includes('48% disposable savings capacity'));
  console.log('  ✓ Report A table rows and summary insights synchronized 100%');
}

{
  console.log('Test 10: Report B & Report C synchronization');
  const repB = getPurchasingPowerComparisonReport();
  const rowsB = repB.tableRows;
  const torontoRow = rowsB.find((r) => String(r[0]).includes('Toronto vs Vancouver'));
  assert.strictEqual(torontoRow![3], '+6%');
  assert.ok(String(torontoRow![4]).includes('+6%'));

  const sydneyRow = rowsB.find((r) => String(r[0]).includes('Sydney vs Melbourne'));
  assert.strictEqual(sydneyRow![3], '-20%');
  assert.ok(String(sydneyRow![4]).includes('-20%'));

  const repC = getSalaryToRentIndexReport();
  const rowsC = repC.tableRows;
  const austinRow = rowsC.find((r) => String(r[0]).includes('Austin'));
  const nycRow = rowsC.find((r) => String(r[0]).includes('New York'));
  const londonRow = rowsC.find((r) => String(r[0]).includes('London'));

  assert.strictEqual(austinRow![4], '30%');
  assert.strictEqual(nycRow![4], '57%');
  assert.strictEqual(londonRow![4], '55%');

  assert.ok(repC.summaryInsights[0].includes('Austin (30%)'));
  assert.ok(repC.summaryInsights[1].includes('57% and 55%'));
  assert.ok(repC.summaryInsights[2].includes('Austin provides substantially lower rent burdens (30%)'));
  console.log('  ✓ Report B and Report C findings verified');
}

// 4. UNSUPPORTED MARKETS QUALIFICATION
{
  console.log('Test 11: Unsupported Tax Markets Qualification (India, Japan)');
  const indiaSlugs = ['mumbai-25lakh', 'bengaluru-25lakh', 'mumbai-15lakh'];
  for (const slug of indiaSlugs) {
    const guide = SALARY_GUIDES[slug];
    assert.ok(guide, `Guide ${slug} must exist`);
    assert.ok(
      guide.benchmarkContext.includes('statutory tax withholding remains in verification status'),
      `${slug} must contain explicit qualification in benchmarkContext`
    );
    assert.ok(
      guide.lifestyleContext.includes('under verification'),
      `${slug} must state under verification in lifestyleContext`
    );
  }

  const japanGuide = SALARY_GUIDES['tokyo-12m'];
  assert.ok(japanGuide, 'tokyo-12m guide must exist');
  assert.ok(
    japanGuide.benchmarkContext.includes('statutory tax withholding remains in verification status'),
    'tokyo-12m must contain explicit qualification in benchmarkContext'
  );
  assert.ok(
    japanGuide.lifestyleContext.includes('under verification'),
    'tokyo-12m must state under verification in lifestyleContext'
  );
  console.log('  ✓ Unsupported markets explicitly qualified');
}

// 5. INSTITUTIONAL TRANSPARENCY
{
  console.log('Test 12: Institutional Transparency (E-E-A-T & Zero Synthetic Personas)');
  assert.strictEqual(PLATFORM_IDENTITY.name, 'LivWorthy');
  assert.strictEqual(PLATFORM_IDENTITY.publisher, 'LivWorthy Financial Research & Intelligence Team');
  assert.strictEqual(PLATFORM_IDENTITY.primaryDomain, 'https://www.livworthy.com');
  assert.ok(PLATFORM_IDENTITY.zeroAiMathPolicy.includes('strictly prohibits using generative AI'));

  assert.ok(AUTHORITATIVE_SOURCES.length >= 5, 'Must have verified authoritative government sources');
  for (const s of AUTHORITATIVE_SOURCES) {
    assert.ok(s.id && s.name && s.officialUrl && s.tier, `Source ${s.id} must have valid fields`);
    assert.ok(s.officialUrl.startsWith('https://'), `Source ${s.id} must have official HTTPS URL`);
  }
  console.log(`  ✓ Institutional identity and ${AUTHORITATIVE_SOURCES.length} official government/statistical sources verified`);
}

console.log('\n================================================================');
console.log('ALL FINANCIAL CONSISTENCY & ADSENSE QA TESTS PASSED SUCCESSFULLY!');
console.log('================================================================\n');
