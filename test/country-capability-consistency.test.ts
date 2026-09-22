import { COUNTRIES, CITIES } from '../src/data/locations';
import { TaxRegistry } from '../src/engines/tax/tax-registry';
import { CapabilityResolver } from '../src/engines/capabilities/capability-resolver';
import { SalaryWorthCalculator } from '../src/engines/calculator-core/salary-worth';
import { createMoney } from '../src/lib/money';
import { DEFAULT_NYC_100K_SCENARIO, DEFAULT_LONDON_SCENARIO, DEFAULT_DUBAI_SCENARIO } from '../src/data/presets';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

export function runCountryCapabilityConsistencyTests() {
  console.log('--- LIVWORTHY 39-MARKET CAPABILITY & CONSISTENCY TEST SUITE ---');

  const allCapabilities = CapabilityResolver.getAllCapabilities();
  assert(allCapabilities.length === 39, `Must evaluate all 39 commercial markets (got ${allCapabilities.length})`);

  // 1. VERIFY ADAPTER INVENTORY & REAL CAPABILITY
  const supportedTaxCountryIds = TaxRegistry.getSupportedCountryIds();
  const loadedCount = TaxRegistry.getLoadedAdapterCount();

  console.log(`Registered Tax Adapters: ${loadedCount}`);
  console.log(`Tax Calculation Supported Markets: ${supportedTaxCountryIds.join(', ')}`);

  assert(loadedCount === 15, `Exactly 15 executable tax adapters must be registered (got ${loadedCount})`);
  assert(
    supportedTaxCountryIds.length === 15,
    `getSupportedCountryIds() must return exactly 15 countries (got ${supportedTaxCountryIds.length})`
  );

  // 2. CAPABILITY INTEGRITY INVARIANT: No tax calculation support without an executable adapter
  for (const cap of allCapabilities) {
    const isSupported = TaxRegistry.isSupported(cap.countryId);
    const supportsTax = TaxRegistry.supportsTaxCalculation(cap.countryId);
    const hasAdapter = CapabilityResolver.hasDedicatedTaxAdapter(cap.countryId);

    assert(
      isSupported === hasAdapter,
      `Capability Invariant: ${cap.countryName} (${cap.countryId}) isSupported (${isSupported}) must match hasDedicatedTaxAdapter (${hasAdapter})`
    );

    assert(
      supportsTax === hasAdapter,
      `Capability Invariant: ${cap.countryName} (${cap.countryId}) supportsTaxCalculation (${supportsTax}) must match hasDedicatedTaxAdapter (${hasAdapter})`
    );

    if (!hasAdapter) {
      assert(
        !cap.supportsTaxCalculation,
        `Integrity Invariant: ${cap.countryName} (${cap.countryId}) has no adapter and MUST NOT report supportsTaxCalculation=true`
      );

      // Verify that querying tax returns TAX_CALCULATION_UNAVAILABLE
      const gross = createMoney(100000, COUNTRIES[cap.countryId]?.defaultCurrency || 'USD');
      const taxResult = TaxRegistry.calculate(gross, { filingStatus: 'single', dependentsCount: 0, taxYear: 2024 }, {
        countryId: cap.countryId,
      });

      assert(
        taxResult.status === 'TAX_CALCULATION_UNAVAILABLE',
        `Unsupported Market Invariant: Tax calculation for ${cap.countryName} must return status 'TAX_CALCULATION_UNAVAILABLE' (got ${taxResult.status})`
      );

      assert(
        taxResult.evidenceSourceIds.length === 0,
        `Zero Fabrication Invariant: Unsupported country ${cap.countryName} must NOT receive fabricated tax evidence sources (got ${taxResult.evidenceSourceIds.length})`
      );
    }
  }

  // 3. EVIDENCE ISOLATION & PROVENANCE TESTS
  console.log('\n--- VERIFYING EVIDENCE ISOLATION ACROSS JURISDICTIONS ---');

  // 3.1: NYC (US) produces US/NY/NYC evidence
  const nycOutcome = SalaryWorthCalculator.calculate(DEFAULT_NYC_100K_SCENARIO);
  const nycSources = nycOutcome.evidenceSourceIds;
  assert(nycSources.some((s) => s.includes('irs')), 'NYC calculation must include IRS federal tax evidence');
  assert(nycSources.some((s) => s.includes('nys') || s.includes('nyc')), 'NYC calculation must include NY state/city tax evidence');
  assert(!nycSources.some((s) => s.includes('hmrc') || s.includes('fta')), 'NYC calculation must NOT contain UK or UAE evidence');

  // 3.2: London (GB) produces UK/HMRC evidence
  const londonOutcome = SalaryWorthCalculator.calculate(DEFAULT_LONDON_SCENARIO);
  const londonSources = londonOutcome.evidenceSourceIds;
  assert(londonSources.some((s) => s.includes('hmrc')), 'London calculation must include HMRC evidence');
  assert(!londonSources.some((s) => s.includes('irs') || s.includes('nyc')), 'London calculation must NOT contain US/NYC evidence');

  // 3.3: Dubai (AE) produces UAE/FTA evidence
  const dubaiOutcome = SalaryWorthCalculator.calculate(DEFAULT_DUBAI_SCENARIO);
  const dubaiSources = dubaiOutcome.evidenceSourceIds;
  assert(dubaiSources.some((s) => s.includes('fta') || s.includes('uae')), 'Dubai calculation must include UAE FTA evidence');
  assert(!dubaiSources.some((s) => s.includes('irs') || s.includes('hmrc')), 'Dubai calculation must NOT contain US or UK evidence');

  // 3.4: Toronto (CA) produces CRA/Ontario evidence
  const torontoCity = CITIES['toronto'];
  assert(!!torontoCity, 'Toronto city benchmark must exist');
  const torontoScenario = {
    ...DEFAULT_NYC_100K_SCENARIO,
    location: torontoCity,
    compensation: { baseSalary: createMoney(120000, 'CAD') },
  };
  const torontoOutcome = SalaryWorthCalculator.calculate(torontoScenario);
  const torontoSources = torontoOutcome.evidenceSourceIds;
  assert(torontoSources.some((s) => s.includes('cra') || s.includes('ontario')), 'Toronto calculation must include Canada CRA/Ontario evidence');
  assert(!torontoSources.some((s) => s.includes('irs')), 'Toronto calculation must NOT contain US IRS evidence');

  // 3.5: Unsupported Jurisdiction (e.g. India - Mumbai, Japan - Tokyo)
  const tokyoCity = CITIES['tokyo'];
  assert(!!tokyoCity, 'Tokyo city benchmark must exist');
  const tokyoScenario = {
    ...DEFAULT_NYC_100K_SCENARIO,
    location: tokyoCity,
    compensation: { baseSalary: createMoney(15000000, 'JPY') },
  };
  const tokyoOutcome = SalaryWorthCalculator.calculate(tokyoScenario);
  assert(tokyoOutcome.tax.status === 'TAX_CALCULATION_UNAVAILABLE', 'Tokyo tax status must be TAX_CALCULATION_UNAVAILABLE');
  assert(
    !tokyoOutcome.tax.evidenceSourceIds.length,
    'Tokyo tax must not have fabricated statutory tax evidence'
  );
  // Cost of living evidence remains valid and present
  assert(tokyoOutcome.costOfLiving.evidenceSourceIds.length > 0, 'Tokyo COL evidence must be available');

  console.log('ALL COUNTRY CAPABILITY & EVIDENCE ISOLATION TESTS PASSED SUCCESSFULLY.\n');
}

runCountryCapabilityConsistencyTests();
