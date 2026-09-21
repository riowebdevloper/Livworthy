import { ComparisonEngine } from '../src/engines/calculator-core/compare';
import { SalaryNeededCalculator } from '../src/engines/calculator-core/salary-needed';
import { SalaryWorthCalculator } from '../src/engines/calculator-core/salary-worth';
import { TaxRegistry } from '../src/engines/tax/tax-registry';
import { createMoney, formatMoney, toMajor } from '../src/lib/money';
import { DEFAULT_AUSTIN_SCENARIO, DEFAULT_NYC_100K_SCENARIO } from '../src/data/presets';

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

  // Test 2: Golden Fixture - $100,000 in New York City (Single, 2024)
  const nycOutcome = SalaryWorthCalculator.calculate(DEFAULT_NYC_100K_SCENARIO);
  const tax = nycOutcome.tax;
  const fedMajor = toMajor(tax.federalTax);
  const ficaMajor = toMajor(tax.socialContributions);
  const nysMajor = toMajor(tax.stateTax);
  const nycMajor = toMajor(tax.localTax);
  const netMajor = toMajor(tax.netIncome);

  console.log(`NYC $100K Results: Federal: $${fedMajor}, FICA: $${ficaMajor}, NYS: $${nysMajor}, NYC Local: $${nycMajor}, Net Take-Home: $${netMajor}`);

  assert(Math.abs(fedMajor - 13841) <= 1, `Federal tax should be ~$13,841 (actual: $${fedMajor})`);
  assert(Math.abs(ficaMajor - 7650) <= 1, `FICA should be exact $7,650 (actual: $${ficaMajor})`);
  assert(Math.abs(nysMajor - 4952) <= 2, `NYS tax should be ~$4,952 (actual: $${nysMajor})`);
  assert(Math.abs(nycMajor - 3441) <= 2, `NYC resident local tax should be ~$3,441 (actual: $${nycMajor})`);
  assert(Math.abs(netMajor - 70116) <= 5, `Take home should be ~$70,116 (actual: $${netMajor})`);

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
