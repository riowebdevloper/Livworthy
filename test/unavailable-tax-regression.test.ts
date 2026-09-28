import { COUNTRIES, CITIES } from '../src/data/locations';
import { TaxRegistry, LATEST_STATUTORY_TAX_YEAR } from '../src/engines/tax/tax-registry';
import { SalaryWorthCalculator } from '../src/engines/calculator-core/salary-worth';
import { SalaryNeededCalculator } from '../src/engines/calculator-core/salary-needed';
import { ComparisonEngine, RelocationProfile } from '../src/engines/calculator-core/compare';
import { createMoney, fromMinor } from '../src/lib/money';
import { LivWorthScenario } from '../src/types/scenario';
import { DEFAULT_NYC_100K_SCENARIO, DEFAULT_LONDON_SCENARIO } from '../src/data/presets';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

export function runUnavailableTaxRegressionTests() {
  console.log('--- LIVWORTHY UNAVAILABLE TAX CALCULATION REGRESSION TEST SUITE ---');

  // =========================================================================
  // 1. SALARY WORTH: UNAVAILABLE TAX INVARIANTS
  // =========================================================================
  console.log('\n[1/5] Testing Salary Worth with Unavailable Tax...');

  // 1A. Unsupported country (India / Mumbai)
  const mumbaiScenario: LivWorthScenario = {
    location: CITIES.mumbai || {
      id: 'mumbai',
      name: 'Mumbai',
      countryId: 'IN',
      currency: 'INR',
      metroAreaName: 'Mumbai Metropolitan',
      colIndexBase100NYC: 35,
      verificationStatus: 'PROVISIONAL',
    },
    compensation: {
      baseSalary: createMoney(2_000_000, 'INR'),
    },
    taxProfile: {
      filingStatus: 'single',
      dependentsCount: 0,
      taxYear: 2025,
    },
    household: {
      adults: 1,
      children: 0,
      housingType: '1-bedroom',
      areaType: 'typical',
      transportMode: 'public_transit',
      carsCount: 0,
      lifestyleLevel: 'moderate',
      preset: 'single',
    },
    displayCurrency: 'INR',
    calculationDate: new Date().toISOString(),
  };

  const mumbaiOutcome = SalaryWorthCalculator.calculate(mumbaiScenario);
  assert(
    mumbaiOutcome.tax.status === 'TAX_CALCULATION_UNAVAILABLE',
    `Unsupported country must return TAX_CALCULATION_UNAVAILABLE (got ${mumbaiOutcome.tax.status})`
  );
  assert(
    mumbaiOutcome.takeHomeAnnual.amountMinor === 0,
    `Never display gross compensation as calculated net income: takeHomeAnnual must be 0 when tax is unavailable (got ${mumbaiOutcome.takeHomeAnnual.amountMinor})`
  );
  assert(
    mumbaiOutcome.takeHomeMonthly.amountMinor === 0,
    `takeHomeMonthly must be 0 when tax is unavailable (got ${mumbaiOutcome.takeHomeMonthly.amountMinor})`
  );
  assert(
    mumbaiOutcome.savingsCapacityAnnual.amountMinor === 0,
    `Never derive savings capacity from unavailable tax: savingsCapacityAnnual must be 0 (got ${mumbaiOutcome.savingsCapacityAnnual.amountMinor})`
  );
  assert(
    mumbaiOutcome.savingsRatePercentage === 0,
    `savingsRatePercentage must be 0 when tax is unavailable (got ${mumbaiOutcome.savingsRatePercentage})`
  );
  assert(
    mumbaiOutcome.taxRuleVersion === undefined,
    `taxRuleVersion must be undefined when tax is unavailable (must not display verified rule version)`
  );
  assert(
    !mumbaiOutcome.evidenceSourceIds.some((id) => id.includes('tax') || id.includes('irs') || id.includes('hmrc')),
    `evidenceSourceIds must NOT contain tax sources when tax calculation is unavailable`
  );

  // 1B. Supported jurisdiction with future tax year (US / NYC TY 2026)
  const nyc2026Scenario: LivWorthScenario = {
    ...DEFAULT_NYC_100K_SCENARIO,
    taxProfile: {
      ...DEFAULT_NYC_100K_SCENARIO.taxProfile,
      taxYear: 2026,
    },
  };

  const nyc2026Outcome = SalaryWorthCalculator.calculate(nyc2026Scenario);
  assert(
    nyc2026Outcome.tax.status === 'TAX_CALCULATION_UNAVAILABLE',
    `TY 2026 request must return TAX_CALCULATION_UNAVAILABLE (got ${nyc2026Outcome.tax.status})`
  );
  assert(
    nyc2026Outcome.takeHomeAnnual.amountMinor === 0,
    `TY 2026 takeHomeAnnual must be 0 to prevent displaying gross as net (got ${nyc2026Outcome.takeHomeAnnual.amountMinor})`
  );
  assert(
    nyc2026Outcome.savingsCapacityAnnual.amountMinor === 0,
    `TY 2026 savingsCapacityAnnual must be 0 to prevent deriving savings from unverified forward taxes`
  );
  assert(
    nyc2026Outcome.taxRuleVersion === undefined,
    `TY 2026 outcome must NOT display a verified taxRuleVersion`
  );

  // =========================================================================
  // 2. SALARY NEEDED: UNAVAILABLE TAX INVARIANTS
  // =========================================================================
  console.log('\n[2/5] Testing Salary Needed with Unavailable Tax...');

  const targetSavings = createMoney(1000, 'INR');
  const neededMumbai = SalaryNeededCalculator.calculate(mumbaiScenario, targetSavings);

  assert(
    neededMumbai.status === 'TAX_CALCULATION_UNAVAILABLE',
    `SalaryNeededCalculator must return status 'TAX_CALCULATION_UNAVAILABLE' for unsupported jurisdiction (got ${neededMumbai.status})`
  );
  assert(
    neededMumbai.requiredGrossAnnual.amountMinor === 0,
    `SalaryNeededCalculator must return 0 required gross when tax is unavailable (got ${neededMumbai.requiredGrossAnnual.amountMinor})`
  );
  assert(
    neededMumbai.requiredNetAnnual.amountMinor === 0,
    `SalaryNeededCalculator must return 0 required net when tax is unavailable (got ${neededMumbai.requiredNetAnnual.amountMinor})`
  );
  assert(
    neededMumbai.threeTiers.essential.requiredGrossAnnual.amountMinor === 0,
    `Essential tier required gross must be 0 when tax is unavailable`
  );
  assert(
    neededMumbai.threeTiers.moderate.requiredGrossAnnual.amountMinor === 0,
    `Moderate tier required gross must be 0 when tax is unavailable`
  );
  assert(
    neededMumbai.threeTiers.target.requiredGrossAnnual.amountMinor === 0,
    `Target tier required gross must be 0 when tax is unavailable`
  );

  // 2B. Supported jurisdiction with TY 2026
  const neededNyc2026 = SalaryNeededCalculator.calculate(nyc2026Scenario, createMoney(1000, 'USD'));
  assert(
    neededNyc2026.status === 'TAX_CALCULATION_UNAVAILABLE',
    `SalaryNeededCalculator must return status 'TAX_CALCULATION_UNAVAILABLE' for TY 2026 (got ${neededNyc2026.status})`
  );
  assert(
    neededNyc2026.requiredGrossAnnual.amountMinor === 0,
    `SalaryNeededCalculator must return 0 required gross for TY 2026`
  );

  // =========================================================================
  // 3. COMPARISONS: UNAVAILABLE TAX INVARIANTS
  // =========================================================================
  console.log('\n[3/5] Testing Comparisons with Unavailable Tax...');

  // 3A. One city unsupported (NYC TY 2025 vs Mumbai TY 2025)
  const compOneUnsupported = ComparisonEngine.compare(
    DEFAULT_NYC_100K_SCENARIO,
    mumbaiScenario,
    'USD',
    undefined,
    { rates: { USD: 1.0, INR: 87.0 } }
  );

  assert(
    compOneUnsupported.status === 'TAX_CALCULATION_UNAVAILABLE',
    `Comparison with one unsupported tax city must return status 'TAX_CALCULATION_UNAVAILABLE' (got ${compOneUnsupported.status})`
  );
  assert(
    compOneUnsupported.convertedB.takeHomeAnnual.amountMinor === 0,
    `Converted takeHomeAnnual for unavailable city must be 0 (got ${compOneUnsupported.convertedB.takeHomeAnnual.amountMinor})`
  );
  assert(
    compOneUnsupported.convertedB.disposableAnnual.amountMinor === 0,
    `Converted disposableAnnual for unavailable city must be 0`
  );
  assert(
    compOneUnsupported.delta.takeHomeAnnualDiff.amountMinor === 0,
    `takeHomeAnnualDiff must be 0 when one city tax is unavailable (got ${compOneUnsupported.delta.takeHomeAnnualDiff.amountMinor})`
  );
  assert(
    compOneUnsupported.delta.disposableIncomeAnnualDiff.amountMinor === 0,
    `disposableIncomeAnnualDiff must be 0 when one city tax is unavailable (got ${compOneUnsupported.delta.disposableIncomeAnnualDiff.amountMinor})`
  );
  assert(
    compOneUnsupported.delta.summaryNarrative.includes('unavailable'),
    `summaryNarrative must explicitly state that comparative surplus cannot be derived when tax is unavailable`
  );

  // 3B. One city future tax year (NYC TY 2026 vs London TY 2025)
  const compFutureYear = ComparisonEngine.compare(
    nyc2026Scenario,
    DEFAULT_LONDON_SCENARIO,
    'USD',
    undefined,
    { rates: { USD: 1.0, GBP: 0.78 } }
  );

  assert(
    compFutureYear.status === 'TAX_CALCULATION_UNAVAILABLE',
    `Comparison with TY 2026 scenario must return status 'TAX_CALCULATION_UNAVAILABLE' (got ${compFutureYear.status})`
  );
  assert(
    compFutureYear.convertedA.takeHomeAnnual.amountMinor === 0,
    `Converted takeHomeAnnual for TY 2026 city must be 0`
  );
  assert(
    compFutureYear.delta.takeHomeAnnualDiff.amountMinor === 0,
    `takeHomeAnnualDiff must be 0 when TY 2026 tax is unverified`
  );
  assert(
    compFutureYear.delta.disposableIncomeAnnualDiff.amountMinor === 0,
    `disposableIncomeAnnualDiff must be 0 when TY 2026 tax is unverified`
  );

  // =========================================================================
  // 4. JOB OFFERS & RELOCATION: UNAVAILABLE TAX INVARIANTS
  // =========================================================================
  console.log('\n[4/5] Testing Job Offers & Relocation with Unavailable Tax...');

  const relocationOfferB: RelocationProfile = {
    flightsMinor: 2000_00,
    tempHousingMinor: 3000_00,
    securityDepositMinor: 2500_00,
    shippingFurnitureMinor: 1500_00,
    visaAdminMinor: 500_00,
    otherSetupMinor: 1000_00,
  };

  const compWithReloc = ComparisonEngine.compare(
    DEFAULT_NYC_100K_SCENARIO,
    mumbaiScenario,
    'USD',
    relocationOfferB,
    { rates: { USD: 1.0, INR: 87.0 } }
  );

  assert(
    compWithReloc.status === 'TAX_CALCULATION_UNAVAILABLE',
    `Relocation comparison with unavailable tax must return TAX_CALCULATION_UNAVAILABLE`
  );
  assert(
    compWithReloc.delta.year1NetDisposableDiff.amountMinor === 0,
    `Relocation adjustments must NOT compute fake net disposable when tax is unavailable (got ${compWithReloc.delta.year1NetDisposableDiff.amountMinor})`
  );

  // =========================================================================
  // 5. STATUTORY VERIFICATION FLAGS & YEAR-GATE INVARIANTS
  // =========================================================================
  console.log('\n[5/5] Testing Statutory Verification Flags & Year-Gates...');

  // Future year check across TaxRegistry
  const taxResult2026 = TaxRegistry.calculate(
    createMoney(100_000, 'USD'),
    { filingStatus: 'single', dependentsCount: 0, taxYear: 2026 },
    { countryId: 'US' }
  );

  assert(
    taxResult2026.status === 'TAX_CALCULATION_UNAVAILABLE',
    `TaxRegistry.calculate for 2026 must return status TAX_CALCULATION_UNAVAILABLE`
  );
  assert(
    Boolean(taxResult2026.warnings && taxResult2026.warnings.length > 0),
    `TaxRegistry.calculate for 2026 must include warning disclaiming extrapolation`
  );

  // Unsupported country check
  const inSupport = TaxRegistry.getCountrySupport('IN');
  assert(
    inSupport.isStatutorilyVerified === false,
    `India must NOT be marked isStatutorilyVerified=true`
  );
  assert(
    inSupport.verificationStatus === 'UNSUPPORTED',
    `India must have verificationStatus='UNSUPPORTED' (got ${inSupport.verificationStatus})`
  );

  // =========================================================================
  // 6. API RESPONSE CONTRACTS FOR UNAVAILABLE TAX RESULTS
  // =========================================================================
  console.log('\n[6/6] Testing API Response Contracts for Unavailable Tax...');

  // 6A. /api/tax/estimate simulation for unsupported country
  const simulateTaxEstimateApi = (countryId: string, grossSalaryMinor: number, taxYear: number) => {
    const curr = COUNTRIES[countryId]?.defaultCurrency || 'USD';
    const grossMoney = fromMinor(grossSalaryMinor, curr);
    const profile = { filingStatus: 'single' as const, dependentsCount: 0, taxYear };
    const location = { countryId };
    const result = TaxRegistry.calculate(grossMoney, profile, location);
    const support = TaxRegistry.getCountrySupport(countryId);
    const isUnavailable = result.status === 'TAX_CALCULATION_UNAVAILABLE';
    return {
      success: true,
      data: result,
      verificationStatus: isUnavailable ? 'UNDER_VERIFICATION' : support.verificationStatus,
      isStatutorilyVerified: isUnavailable ? false : support.isStatutorilyVerified,
      notes: isUnavailable ? (result.unsupportedExplanation || support.notes) : support.notes,
    };
  };

  const apiResUnsupported = simulateTaxEstimateApi('JP', 7500000, 2025);
  assert(
    apiResUnsupported.data.status === 'TAX_CALCULATION_UNAVAILABLE',
    `API response for unsupported country must have data.status 'TAX_CALCULATION_UNAVAILABLE'`
  );
  assert(
    apiResUnsupported.isStatutorilyVerified === false,
    `API response for unsupported country must have isStatutorilyVerified=false (got ${apiResUnsupported.isStatutorilyVerified})`
  );
  assert(
    apiResUnsupported.verificationStatus === 'UNDER_VERIFICATION',
    `API response for unsupported country must have verificationStatus='UNDER_VERIFICATION' (got ${apiResUnsupported.verificationStatus})`
  );

  // 6B. /api/tax/estimate simulation for future tax year (2026)
  const apiRes2026 = simulateTaxEstimateApi('US', 10000000, 2026);
  assert(
    apiRes2026.data.status === 'TAX_CALCULATION_UNAVAILABLE',
    `API response for TY 2026 must have data.status 'TAX_CALCULATION_UNAVAILABLE'`
  );
  assert(
    apiRes2026.isStatutorilyVerified === false,
    `API response for TY 2026 must have isStatutorilyVerified=false (never describe 2026 as verified)`
  );
  assert(
    apiRes2026.verificationStatus === 'UNDER_VERIFICATION',
    `API response for TY 2026 must have verificationStatus='UNDER_VERIFICATION'`
  );

  console.log('\n======================================================');
  console.log('ALL UNAVAILABLE TAX CALCULATION REGRESSION TESTS PASSED.');
  console.log('======================================================\n');
}

// Execute if run directly via tsx
runUnavailableTaxRegressionTests();
