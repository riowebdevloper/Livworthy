import { ComparisonEngine } from '../src/engines/calculator-core/compare';
import { SalaryNeededCalculator } from '../src/engines/calculator-core/salary-needed';
import { SalaryWorthCalculator } from '../src/engines/calculator-core/salary-worth';
import { TaxRegistry } from '../src/engines/tax/tax-registry';
import { createMoney, formatMoney, toMajor } from '../src/lib/money';
import { DEFAULT_AUSTIN_SCENARIO, DEFAULT_NYC_100K_SCENARIO } from '../src/data/presets';
import { calculateNysTax2026Single } from '../src/engines/tax/us/us-adapter';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

function runTests() {
  console.log('--- LIVWORTHY FINANCIAL ENGINE TEST SUITE ---');

  // Test 1: Money minor-unit arithmetic
  const m1 = createMoney(100.5, 'USD');
  const m2 = createMoney(49.5, 'USD');
  assert(m1.amountMinor === 10050, 'Money minor units: $100.50 should be 10050 cents');
  assert(m2.amountMinor === 4950, 'Money minor units: $49.50 should be 4950 cents');

  // Test 2: Current Statutory 2026 - $100,000 in New York City (Single, 2026)
  const nycOutcome = SalaryWorthCalculator.calculate(DEFAULT_NYC_100K_SCENARIO);
  const tax = nycOutcome.tax;
  const fedMajor = toMajor(tax.federalTax);
  const ficaMajor = toMajor(tax.socialContributions);
  const nysMajor = toMajor(tax.stateTax);
  const nycMajor = toMajor(tax.localTax);
  const netMajor = toMajor(tax.netIncome);

  console.log(`NYC $100K 2026 Results: Federal: $${fedMajor}, FICA: $${ficaMajor}, NYS: $${nysMajor}, NYC Local: $${nycMajor}, Net Take-Home: $${netMajor}`);

  assert(Math.abs(fedMajor - 13170) <= 1, `2026 Federal tax should be ~$13,170 (actual: $${fedMajor})`);
  assert(Math.abs(ficaMajor - 7650) <= 1, `2026 FICA should be exact $7,650 (actual: $${ficaMajor})`);
  // 2026 NYS enacted lower-bracket rates: 3.90%/4.40%/5.15%/5.40%/5.90% (Rev. NYS Tax Law § 601 2026)
  // NYS taxable=92000: 3.90%×8500+4.40%×3200+5.15%×2200+5.40%×66750+5.90%×11350 = 4859.75
  assert(Math.abs(nysMajor - 4860) <= 2, `2026 NYS tax should be ~$4,860 (actual: $${nysMajor})`);
  assert(Math.abs(nycMajor - 3441) <= 2, `2026 NYC resident local tax should be ~$3,441 (actual: $${nycMajor})`);
  assert(Math.abs(netMajor - 70879) <= 5, `2026 Take home should be ~$70,879 (actual: $${netMajor})`);

  // Test 2b: Historical Isolation - $100,000 in New York City (Single, 2024)
  const nyc2024Outcome = SalaryWorthCalculator.calculate({
    ...DEFAULT_NYC_100K_SCENARIO,
    taxProfile: { ...DEFAULT_NYC_100K_SCENARIO.taxProfile, taxYear: 2024 },
  });
  const tax2024 = nyc2024Outcome.tax;
  assert(tax2024.taxRuleVersion === 'US-FED-NY-NYC-2024.1', '2024 scenario must select US-FED-NY-NYC-2024.1');
  assert(Math.abs(toMajor(tax2024.federalTax) - 13841) <= 1, `2024 Federal tax should be ~$13,841 (actual: $${toMajor(tax2024.federalTax)})`);
  assert(Math.abs(toMajor(tax2024.netIncome) - 70116) <= 5, `2024 Take home should be ~$70,116 (actual: $${toMajor(tax2024.netIncome)})`);

  // Test 2c: 2026 NYS High-Income Tax Computation Worksheets (Form IT-2105-I / NYS Tax Law § 601(d))
  // Scenarios: $100,000 | $150,000 | $200,000 | $250,000
  const highIncomeCases = [
    { gross: 100_000, expectedNys: 4860, desc: '$100K (NYAGI <= $107,650: Normal Rate Schedule)' },
    { gross: 150_000, expectedNys: 8291, desc: '$150K (NYAGI $107,650-$157,650: IT-2105-I Worksheet 7 phase-in)' },
    { gross: 200_000, expectedNys: 11328, desc: '$200K (NYAGI >= $157,650: IT-2105-I Worksheet 7 flat 5.90%)' },
    { gross: 250_000, expectedNys: 15946, desc: '$250K (NYAGI > $215,400: IT-2105-I Worksheet 8 recapture to 6.85%)' },
  ];

  for (const hic of highIncomeCases) {
    const outcome = SalaryWorthCalculator.calculate({
      ...DEFAULT_NYC_100K_SCENARIO,
      compensation: { baseSalary: createMoney(hic.gross, 'USD') },
    });
    const actualNys = toMajor(outcome.tax.stateTax);
    console.log(`NYS 2026 ${hic.desc}: Actual State Tax = $${actualNys}`);
    assert(
      Math.abs(actualNys - hic.expectedNys) <= 2,
      `NYS 2026 high-income worksheet for ${hic.desc}: expected ~$${hic.expectedNys}, got $${actualNys}`
    );
  }

  // Test 2d: 2026 NYS Form IT-2105-I High-Income Worksheet Boundary Regression Tests
  // Verifies explicit boundaries for NYAGI and Taxable Income:
  // - NYAGI $107,649, $107,650, $107,651 (Graduated Schedule vs Worksheet 7)
  // - NYAGI $157,649, $157,650, $157,651 (Worksheet 7 Phase-In vs Flat 5.90%)
  // - NYAGI $215,399, $215,400, $215,401 (Worksheet 7 vs Worksheet 8 phase-in)
  // - NYAGI $25,000,000, $25,000,001 (Worksheet 10 vs Worksheet 11 flat 10.90%)
  // - Taxable Income boundaries ($215,400, $1,077,550, $5,000,000)
  const b107649 = calculateNysTax2026Single(107_649_00, 99_649_00);
  assert(b107649.worksheetApplied === undefined, 'NYS Boundary: NYAGI $107,649 uses normal graduated schedule');
  const b107650 = calculateNysTax2026Single(107_650_00, 99_650_00);
  assert(b107650.worksheetApplied === undefined, 'NYS Boundary: NYAGI $107,650 uses normal graduated schedule at boundary');
  const b107651 = calculateNysTax2026Single(107_651_00, 99_651_00);
  assert(b107651.worksheetApplied === 'Worksheet 7', 'NYS Boundary: NYAGI $107,651 applies Worksheet 7');

  const b157649 = calculateNysTax2026Single(157_649_00, 149_649_00);
  assert(b157649.worksheetApplied === 'Worksheet 7', 'NYS Boundary: NYAGI $157,649 applies Worksheet 7 phase-in');
  const b157650 = calculateNysTax2026Single(157_650_00, 149_650_00);
  assert(b157650.worksheetApplied === 'Worksheet 7' && b157650.taxMinor === Math.round(149_650_00 * 0.0590), 'NYS Boundary: NYAGI $157,650 applies flat 5.90%');
  const b157651 = calculateNysTax2026Single(157_651_00, 149_651_00);
  assert(b157651.worksheetApplied === 'Worksheet 7' && b157651.taxMinor === Math.round(149_651_00 * 0.0590), 'NYS Boundary: NYAGI $157,651 applies flat 5.90%');

  const b215399 = calculateNysTax2026Single(215_399_00, 207_399_00);
  assert(b215399.worksheetApplied === 'Worksheet 7', 'NYS Boundary: NYAGI $215,399 applies Worksheet 7');
  const b215400 = calculateNysTax2026Single(215_400_00, 207_400_00);
  assert(b215400.worksheetApplied === 'Worksheet 7', 'NYS Boundary: NYAGI $215,400 applies Worksheet 7');
  const b215401 = calculateNysTax2026Single(215_401_00, 207_401_00);
  assert(b215401.worksheetApplied === 'Worksheet 7', 'NYS Boundary: NYAGI $215,401 applies Worksheet 7');

  // Taxable income boundary at $215,400 with NYAGI > $215,400:
  const bTax215400 = calculateNysTax2026Single(250_000_00, 215_400_00);
  assert(bTax215400.worksheetApplied === 'Worksheet 7', 'NYS Boundary: Taxable income $215,400 uses Worksheet 7');
  const bTax215401 = calculateNysTax2026Single(250_000_00, 215_401_00);
  assert(bTax215401.worksheetApplied === 'Worksheet 8', 'NYS Boundary: Taxable income $215,401 uses Worksheet 8');

  // Taxable income boundary at $1,077,550 with NYAGI $1.5M:
  const bTax1077550 = calculateNysTax2026Single(1_500_000_00, 1_077_550_00);
  assert(bTax1077550.worksheetApplied === 'Worksheet 8', 'NYS Boundary: Taxable income $1,077,550 uses Worksheet 8');
  const bTax1077551 = calculateNysTax2026Single(1_500_000_00, 1_077_551_00);
  assert(bTax1077551.worksheetApplied === 'Worksheet 9', 'NYS Boundary: Taxable income $1,077,551 uses Worksheet 9');

  // Taxable income boundary at $5,000,000 with NYAGI $10M:
  const bTax5M = calculateNysTax2026Single(10_000_000_00, 5_000_000_00);
  assert(bTax5M.worksheetApplied === 'Worksheet 9', 'NYS Boundary: Taxable income $5,000,000 uses Worksheet 9');
  const bTax5M_plus = calculateNysTax2026Single(10_000_000_00, 5_000_001_00);
  assert(bTax5M_plus.worksheetApplied === 'Worksheet 10', 'NYS Boundary: Taxable income $5,000,001 uses Worksheet 10');

  // NYAGI $25,000,000 vs $25,000,001:
  // At exactly $25,000,000: MUST NOT use Worksheet 11
  const b25M = calculateNysTax2026Single(25_000_000_00, 24_992_000_00);
  assert(b25M.worksheetApplied === 'Worksheet 10', 'NYS Boundary: NYAGI $25,000,000 uses Worksheet 10, NOT Worksheet 11');
  assert(b25M.topMarginalRate === 0.1030, 'NYS Boundary: NYAGI $25,000,000 top marginal rate is 10.30%');

  // Above $25,000,000: Uses Worksheet 11 (flat 10.90% on entire taxable income)
  const b25M_plus = calculateNysTax2026Single(25_000_001_00, 24_992_001_00);
  assert(b25M_plus.worksheetApplied === 'Worksheet 11', 'NYS Boundary: NYAGI $25,000,001 uses Worksheet 11');
  assert(b25M_plus.topMarginalRate === 0.1090, 'NYS Boundary: NYAGI $25,000,001 top marginal rate is 10.90%');
  assert(b25M_plus.taxMinor === Math.round(24_992_001_00 * 0.1090), 'NYS Boundary: NYAGI $25,000,001 tax is exactly taxable * 10.90%');

  // Test 3: NYC Living costs and money remaining
  const monthlyLiving = toMajor(nycOutcome.livingCostsMonthly);
  const monthlyRemaining = toMajor(nycOutcome.moneyRemainingMonthly);
  console.log(`NYC $100K Living Costs: $${monthlyLiving}/mo, Remaining: $${monthlyRemaining}/mo`);
  assert(monthlyLiving > 3000 && monthlyLiving < 4800, `NYC 1-bed moderate living costs should be ~$3,800-4,300/mo (actual: $${monthlyLiving})`);
  assert(nycOutcome.moneyRemainingAnnual.amountMinor === nycOutcome.takeHomeAnnual.amountMinor - nycOutcome.livingCostsAnnual.amountMinor, 'moneyRemaining must strictly equal takeHome - livingCosts');

  // Test 4: Invariant 1 - Salary Needed Invariant
  // If Salary Needed returns gross salary X for desired savings S, then Salary Worth with X should yield savings >= S
  const targetSavings = createMoney(1000, 'USD'); // $1,000/mo target savings
  const neededResult = SalaryNeededCalculator.calculate(DEFAULT_NYC_100K_SCENARIO, targetSavings);
  const reqGrossMajor = toMajor(neededResult.requiredGrossAnnual);
  console.log(`Required Gross in NYC for $1,000/mo savings: $${reqGrossMajor.toLocaleString()}`);

  const testWorth = SalaryWorthCalculator.calculate({
    ...DEFAULT_NYC_100K_SCENARIO,
    compensation: { baseSalary: neededResult.requiredGrossAnnual },
  });
  const actualSavingsMonthlyMajor = toMajor(testWorth.savingsCapacityMonthly);
  assert(
    Math.abs(actualSavingsMonthlyMajor - 1000) <= 25,
    `Salary Needed Invariant: Required salary of $${reqGrossMajor} must produce approximately $1,000/mo savings (actual: $${actualSavingsMonthlyMajor})`
  );

  // Test 5: Invariant 2 - Compare Consistency
  const comparison = ComparisonEngine.compare(
    DEFAULT_NYC_100K_SCENARIO,
    DEFAULT_AUSTIN_SCENARIO,
    'USD'
  );
  assert(
    comparison.outcomeA.takeHomeAnnual.amountMinor === nycOutcome.takeHomeAnnual.amountMinor,
    'Compare Consistency: Scenario A inside comparison must exactly equal standalone outcome A'
  );
  assert(
    comparison.delta.summaryNarrative.length > 10,
    'Comparison delta must produce objective neutral narrative'
  );

  // Test 6: Rent Override
  const overriddenScenario = {
    ...DEFAULT_NYC_100K_SCENARIO,
    overrides: { actualRentMonthlyMinor: 2000_00 }, // Overridden to $2,000
  };
  const overriddenOutcome = SalaryWorthCalculator.calculate(overriddenScenario);
  const overriddenRentMajor = toMajor(overriddenOutcome.costOfLiving.housingMonthly);
  assert(overriddenRentMajor === 2000, `Rent override must take precedence: expected $2000, got $${overriddenRentMajor}`);

  console.log('ALL 6 FINANCIAL ENGINE INVARIANT TESTS PASSED SUCCESSFULLY.');
}

runTests();
