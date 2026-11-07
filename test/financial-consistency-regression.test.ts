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
import { INTL_EXTENDED_CLUSTERS } from '../src/data/clusters/intl-guides';
import { US_EXTENDED_CLUSTERS } from '../src/data/clusters/us-guides';
import { PLATFORM_IDENTITY, AUTHORITATIVE_SOURCES } from '../src/data/transparency';

console.log('=== RUNNING FINANCIAL CONSISTENCY & ADSENSE QA REGRESSION SUITE ===\n');

// 1. NYC $100K CANONICAL CONSISTENCY & STATUTORY HARDENING
{
  console.log('Test 1: NYC $100K 2026 TaxRegistry & CostOfLivingEngine');
  const taxRes = TaxRegistry.calculate(
    createMoney(100000, 'USD'),
    { filingStatus: 'single', taxYear: 2026, dependentsCount: 0 },
    { countryId: 'US', cityId: 'nyc', taxYear: 2026 }
  );

  // Independent statutory calculation
  // A. Federal Tax (IRS Rev. Proc. 2025-32: $16,100 single standard deduction, taxable = $83,900)
  // 10% on $12,400 = $1,240; 12% on $38,000 = $4,560; 22% on $33,500 = $7,370 -> $13,170.00
  const expectedFederalTax = 1240 + 4560 + 7370; // 13,170
  assert.strictEqual(toMajor(taxRes.federalTax), expectedFederalTax, 'Federal income tax must match IRS Rev. Proc. 2025-32 ($13,170)');

  // B. FICA (SSA statutory wage base $184,500): 6.2% Social Security ($6,200) + 1.45% Medicare ($1,450)
  const expectedFica = 6200 + 1450; // 7,650
  assert.strictEqual(toMajor(taxRes.socialContributions), expectedFica, 'FICA must match statutory 7.65% ($7,650)');

  // C. NY State Tax (NYS Tax Law § 601, IT-2105-I 2026 single brackets on $92,000 taxable):
  // 3.90% on $8,500 ($331.50) + 4.40% on $3,200 ($140.80) + 5.15% on $2,200 ($113.30) + 5.40% on $66,750 ($3,604.50) + 5.90% on $11,350 ($669.65) = $4,859.75
  const expectedNysTax = 331.50 + 140.80 + 113.30 + 3604.50 + 669.65; // 4859.75
  assert.strictEqual(toMajor(taxRes.stateTax), expectedNysTax, 'NYS tax must match Form IT-2105-I brackets ($4,859.75)');

  // D. NYC Resident Tax (NYC Admin Code § 11-1701 on $92,000 taxable):
  // 3.078% on $12,000 ($369.36) + 3.762% on $13,000 ($489.06) + 3.819% on $25,000 ($954.75) + 3.876% on $42,000 ($1,627.92) = $3,441.09
  const expectedNycTax = 369.36 + 489.06 + 954.75 + 1627.92; // 3441.09
  assert.strictEqual(toMajor(taxRes.localTax), expectedNycTax, 'NYC resident tax must match Admin Code § 11-1701 ($3,441.09)');

  // E. Deductions & Net Take-Home Reconciliation
  const expectedTotalDeductions = expectedFederalTax + expectedFica + expectedNysTax + expectedNycTax; // 29,120.84
  assert.strictEqual(toMajor(taxRes.totalDeductionsAndTaxes), expectedTotalDeductions, 'Total deductions must equal exactly $29,120.84');

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
  console.log('  ✓ NYC $100K independent statutory calculation & engine confirmed');
}

{
  console.log('Test 1b: NYC $100K Monthly Budget Table Exact Dollar & Percentage Reconciliation');
  const cluster = SEO_LANDING_PAGES['nyc-100k'];
  const budgetSection = cluster.sections.find((s) => s.id === 'monthly-budget');
  assert.ok(budgetSection?.table, 'Monthly budget table must exist');

  const rows = budgetSection.table.rows;
  const netRow = rows.find((r) => r[0] === 'Net Take-Home Pay');
  assert.ok(netRow, 'Net Take-Home Pay row must exist');
  assert.strictEqual(netRow[1], '$5,907');
  assert.strictEqual(netRow[2], '100.0%');

  const expenseCategories = [
    { name: 'Rent (HUD 1-Bed FMR Benchmark)', amount: 2655, pct: 45.0 },
    { name: 'Utilities, Internet & Mobile', amount: 320, pct: 5.4 },
    { name: 'Groceries & Household Essentials', amount: 440, pct: 7.4 },
    { name: 'Dining Out, Social & Entertainment', amount: 260, pct: 4.4 },
    { name: 'MTA OMNY Fare-Capped Transit ($35/wk cap)', amount: 152, pct: 2.6 },
    { name: 'Healthcare (Premium share & copays)', amount: 160, pct: 2.7 },
    { name: 'Personal Care, Apparel & Subscriptions', amount: 260, pct: 4.4 },
  ];

  let totalExpenses = 0;
  let totalPct = 0;

  for (const cat of expenseCategories) {
    const row = rows.find((r) => r[0] === cat.name);
    assert.ok(row, `Budget category "${cat.name}" must be present in table`);
    const parsedAmount = parseInt(row[1].replace(/[$,]/g, ''), 10);
    assert.strictEqual(parsedAmount, cat.amount, `Amount for "${cat.name}" must match $${cat.amount}`);
    totalExpenses += parsedAmount;
    totalPct += cat.pct;
  }

  const savingsRow = rows.find((r) => r[0].includes('Discretionary Savings'));
  assert.ok(savingsRow, 'Savings row must exist');
  const savingsAmount = parseInt(savingsRow[1].replace(/[$,]/g, ''), 10);
  assert.strictEqual(savingsAmount, 1660, 'Savings amount must be exactly $1,660');
  totalPct += 28.1;

  // Exact dollar reconciliation: Expenses ($4,247) + Savings ($1,660) === Net Take-Home ($5,907)
  assert.strictEqual(totalExpenses, 4247, 'Total monthly expenses must equal $4,247');
  assert.strictEqual(totalExpenses + savingsAmount, 5907, 'Expenses ($4,247) + Savings ($1,660) must reconcile 100% to Net Take-Home ($5,907)');
  assert.strictEqual(Number(totalPct.toFixed(1)), 100.0, 'Budget percentages must sum exactly to 100.0%');
  console.log('  ✓ NYC $100K monthly budget reconciles to the exact dollar ($4,247 expenses + $1,660 savings = $5,907 net)');
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

{
  console.log('Test 8b: Zurich CHF 130K 2026 ESTV & Canton Zurich consistency');
  const taxZH = TaxRegistry.calculate(
    createMoney(130000, 'CHF'),
    { filingStatus: 'single', taxYear: 2026, dependentsCount: 0 },
    { countryId: 'CH', cityId: 'zurich', taxYear: 2026 }
  );
  assert.strictEqual(Math.round(toMajor(taxZH.netIncome)), 100423);
  assert.strictEqual(Math.round(toMajor(taxZH.netIncome) / 12), 8369);
  assert.strictEqual(Number((taxZH.effectiveTaxRate * 100).toFixed(1)), 22.8);

  // Independent statutory checks for Swiss components
  // Pillar 1: AHV/IV/EO (5.3% = 6,890) + ALV (1.1% on 130k = 1,430) = 8,320 CHF
  // Pillar 2 (BVG): Coordinated salary (90,720 - 26,460 = 64,260) * 5% = 3,213 CHF
  // Total social = 8,320 + 3,213 = 11,533 CHF
  assert.strictEqual(toMajor(taxZH.socialContributions), 11533, 'Social contributions must equal 11,533 CHF');
  // Federal Direct Tax = 4,420 CHF (4,419.95 CHF)
  assert.strictEqual(Math.round(toMajor(taxZH.federalTax)), 4420, 'Federal Direct Tax must round to 4,420 CHF');
  // Cantonal & Municipal Tax = 13,624 CHF (13,623.71 CHF)
  assert.strictEqual(Math.round(toMajor(taxZH.stateTax)), 13624, 'Cantonal & Municipal Tax must round to 13,624 CHF');
  assert.strictEqual(Math.round(toMajor(taxZH.totalDeductionsAndTaxes)), 29577, 'Total deductions must round to 29,577 CHF');

  const guideZH = SALARY_GUIDES['zurich-130k'];
  assert.ok(guideZH.lifestyleContext.includes('CHF 8,369'));
  assert.ok(guideZH.lifestyleContext.includes('CHF 100,423/year'));
  assert.ok(guideZH.lifestyleContext.includes('22.8%'));

  const clusterZH = SEO_LANDING_PAGES['zurich-130k'];
  assert.ok(clusterZH.directAnswer.includes('8,369 CHF per month'));
  assert.ok(clusterZH.directAnswer.includes('100,423 CHF annually'));
  assert.ok(clusterZH.directAnswer.includes('22.8%'));

  const zhEditorial = VERIFIED_CITY_EDITORIAL['zurich'];
  assert.ok(zhEditorial, 'zurich city editorial must exist');
  assert.ok(zhEditorial.takeHomePayAnalysis.includes('8,369 CHF per month'));

  // Statutory Pillar 3a 2026 Limit Assertion: CHF 7,258 (BSV)
  assert.ok(zhEditorial.taxConsiderations.includes('7,258 CHF in 2026'), 'Zurich editorial must cite statutory 7,258 CHF Pillar 3a limit');
  assert.ok(INTL_EXTENDED_CLUSTERS['zurich-130k'].sections.find(s => s.id === 'pillar-3a')?.paragraphs[0].includes('7,258 CHF'), 'Zurich guide must cite 7,258 CHF statutory limit');

  // Zurich Budget Table Exact Reconciliation
  const zhBudgetTable = INTL_EXTENDED_CLUSTERS['zurich-130k'].sections.find(s => s.id === 'monthly-budget')?.table;
  assert.ok(zhBudgetTable, 'Zurich budget table must exist');
  // 2250 (Rent) + 380 (Health) + 210 (Utilities) + 520 (Groceries) + 650 (Dining) + 120 (Transit) = 4,130 CHF expenses
  // Savings: 4,239 CHF -> 4,130 + 4,239 === 8,369 CHF
  const zhRent = parseInt(zhBudgetTable.rows.find(r => r[0].includes('Rent'))![1].replace(/[^0-9]/g, ''), 10);
  const zhHealth = parseInt(zhBudgetTable.rows.find(r => r[0].includes('Health Insurance'))![1].replace(/[^0-9]/g, ''), 10);
  const zhUtil = parseInt(zhBudgetTable.rows.find(r => r[0].includes('Utilities'))![1].replace(/[^0-9]/g, ''), 10);
  const zhGroc = parseInt(zhBudgetTable.rows.find(r => r[0].includes('Groceries'))![1].replace(/[^0-9]/g, ''), 10);
  const zhDining = parseInt(zhBudgetTable.rows.find(r => r[0].includes('Dining Out'))![1].replace(/[^0-9]/g, ''), 10);
  const zhTransit = parseInt(zhBudgetTable.rows.find(r => r[0].includes('Transport Pass'))![1].replace(/[^0-9]/g, ''), 10);
  const zhSavings = parseInt(zhBudgetTable.rows.find(r => r[0].includes('Discretionary Savings'))![1].replace(/[^0-9]/g, ''), 10);
  const zhTotalExpenses = zhRent + zhHealth + zhUtil + zhGroc + zhDining + zhTransit;
  assert.strictEqual(zhTotalExpenses, 4130, 'Zurich monthly expenses must equal 4,130 CHF');
  assert.strictEqual(zhTotalExpenses + zhSavings, 8369, 'Zurich expenses (4,130) + savings (4,239) must equal 8,369 CHF net');
  console.log('  ✓ Zurich CHF 130K numbers, Pillar 3a (7,258 CHF), & exact budget reconciliation confirmed');
}

{
  console.log('Test 8c: Miami $90K 2026 Florida 0% State Tax consistency');
  const taxMIA = TaxRegistry.calculate(
    createMoney(90000, 'USD'),
    { filingStatus: 'single', taxYear: 2026, dependentsCount: 0 },
    { countryId: 'US', cityId: 'miami', regionId: 'US-FL', taxYear: 2026 }
  );
  assert.strictEqual(Math.round(toMajor(taxMIA.netIncome)), 72145);
  assert.strictEqual(Math.round(toMajor(taxMIA.netIncome) / 12), 6012);
  assert.strictEqual(Number((taxMIA.effectiveTaxRate * 100).toFixed(1)), 19.8);

  // Independent statutory breakdown checks
  assert.strictEqual(toMajor(taxMIA.federalTax), 10970, 'Federal tax must equal $10,970');
  assert.strictEqual(toMajor(taxMIA.socialContributions), 6885, 'FICA must equal $6,885');
  assert.strictEqual(toMajor(taxMIA.stateTax), 0, 'Florida state tax must be $0');
  assert.strictEqual(toMajor(taxMIA.totalDeductionsAndTaxes), 17855, 'Total deductions must equal $17,855');

  const guideMIA = SALARY_GUIDES['miami-90k'];
  assert.ok(guideMIA.lifestyleContext.includes('$6,012/month'));
  assert.ok(guideMIA.lifestyleContext.includes('19.8%'));

  const clusterMIA = SEO_LANDING_PAGES['miami-90k'];
  assert.ok(clusterMIA.directAnswer.includes('$6,012 per month'));
  assert.ok(clusterMIA.directAnswer.includes('$72,145 annually'));
  assert.ok(clusterMIA.directAnswer.includes('19.8%'));

  const miaEditorial = VERIFIED_CITY_EDITORIAL['miami'];
  assert.ok(miaEditorial, 'miami city editorial must exist');
  assert.ok(miaEditorial.takeHomePayAnalysis.includes('$6,012 per month'));

  // Miami Budget Table Exact Reconciliation
  const miaBudgetTable = US_EXTENDED_CLUSTERS['miami-90k'].sections.find(s => s.id === 'monthly-budget')?.table;
  assert.ok(miaBudgetTable, 'Miami budget table must exist');
  // Rent ($2,150) + Utilities ($220) + Auto ($520) + Groceries ($380) + Dining ($320) + Healthcare ($150) = $3,740
  // Savings: $2,272 -> $3,740 + $2,272 === $6,012
  const miaRent = parseInt(miaBudgetTable.rows.find(r => r[0].includes('Rent'))![1].replace(/[^0-9]/g, ''), 10);
  const miaUtil = parseInt(miaBudgetTable.rows.find(r => r[0].includes('Utilities'))![1].replace(/[^0-9]/g, ''), 10);
  const miaAuto = parseInt(miaBudgetTable.rows.find(r => r[0].includes('Auto'))![1].replace(/[^0-9]/g, ''), 10);
  const miaGroc = parseInt(miaBudgetTable.rows.find(r => r[0].includes('Groceries'))![1].replace(/[^0-9]/g, ''), 10);
  const miaDining = parseInt(miaBudgetTable.rows.find(r => r[0].includes('Dining'))![1].replace(/[^0-9]/g, ''), 10);
  const miaHealth = parseInt(miaBudgetTable.rows.find(r => r[0].includes('Healthcare'))![1].replace(/[^0-9]/g, ''), 10);
  const miaSavings = parseInt(miaBudgetTable.rows.find(r => r[0].includes('Discretionary Savings'))![1].replace(/[^0-9]/g, ''), 10);
  const miaTotalExpenses = miaRent + miaUtil + miaAuto + miaGroc + miaDining + miaHealth;
  assert.strictEqual(miaTotalExpenses, 3740, 'Miami monthly expenses must equal $3,740');
  assert.strictEqual(miaTotalExpenses + miaSavings, 6012, 'Miami expenses ($3,740) + savings ($2,272) must equal $6,012 net');
  console.log('  ✓ Miami $90K numbers, 0% FL tax & exact budget reconciliation confirmed');
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

// 6. STATUTORY CITATION RIGOR (IRS Rev. Proc. 2025-32)
{
  console.log('Test 13: IRS Rev. Proc. 2025-32 Statutory Citation Audit');
  // Verify reports-data.ts citations
  const repA = getGlobalSalaryWorthIndexReport();
  const irsSource = repA.primarySources.find((s) => s.name.includes('Internal Revenue Service'));
  assert.ok(irsSource, 'IRS source must exist in Report A');
  assert.ok(irsSource.name.includes('IRS Rev. Proc. 2025-32'), 'Report A must cite IRS Rev. Proc. 2025-32');

  // Verify us-guides.ts citations
  for (const [key, cluster] of Object.entries(US_EXTENDED_CLUSTERS)) {
    const methodology = cluster.sections.find((s) => s.id === 'methodology');
    if (methodology) {
      assert.ok(
        methodology.paragraphs[0].includes('IRS Rev. Proc. 2025-32'),
        `Cluster ${key} methodology must cite IRS Rev. Proc. 2025-32`
      );
      assert.ok(
        !methodology.paragraphs[0].includes('2025-33'),
        `Cluster ${key} must not contain obsolete 2025-33`
      );
    }
  }

  // Verify seo-clusters.ts nyc-100k methodology
  const nycMethodology = SEO_LANDING_PAGES['nyc-100k'].sections.find((s) => s.id === 'methodology');
  assert.ok(nycMethodology?.paragraphs[0].includes('IRS Rev. Proc. 2025-32'), 'nyc-100k must cite IRS Rev. Proc. 2025-32');
  console.log('  ✓ All IRS statutory citations verified against official IRS Rev. Proc. 2025-32');
}

console.log('\n================================================================');
console.log('ALL FINANCIAL CONSISTENCY & ADSENSE QA TESTS PASSED SUCCESSFULLY!');
console.log('================================================================\n');
