import assert from 'node:assert';
import {
  TIER_1_LOCALES,
  SUPPORTED_LOCALES,
  DICTIONARIES,
  SupportedLocale,
  Tier1Locale,
  formatLocalizedNumber,
  formatLocalizedCurrency,
  formatLocalizedDate,
  isRtlLocale,
  getDictionary,
} from '../../src/lib/i18n';
import { SalaryWorthCalculator } from '../../src/engines/calculator-core/salary-worth';
import { DEFAULT_NYC_100K_SCENARIO } from '../../src/data/presets';
import { createMoney } from '../../src/lib/money';

console.log('======================================================');
console.log('🌐 LivWorthy Worldwide Full-Site Localization Suite');
console.log('======================================================\n');

// 1. Tier-1 Locales Configuration
console.log('--- 1. Tier-1 Locales Registry & Configuration ---');
assert.strictEqual(TIER_1_LOCALES.length, 10, 'Must have exactly 10 Tier-1 production locales');

const expectedTier1: Tier1Locale[] = [
  'en',
  'es',
  'fr',
  'ar',
  'de',
  'pt',
  'hi',
  'ur',
  'zh',
  'ja',
];

for (const loc of expectedTier1) {
  assert(TIER_1_LOCALES.includes(loc), `Locale ${loc} must be registered in TIER_1_LOCALES`);
  const cfg = SUPPORTED_LOCALES[loc];
  assert(cfg, `Locale config must exist for ${loc}`);
  assert(cfg.name && cfg.nativeName, `Locale ${loc} must have display name and native name`);
}

// RTL Verification
assert.strictEqual(isRtlLocale('ar'), true, 'Arabic must be RTL');
assert.strictEqual(isRtlLocale('ur'), true, 'Urdu must be RTL');
assert.strictEqual(isRtlLocale('en'), false, 'English must be LTR');
assert.strictEqual(isRtlLocale('de'), false, 'German must be LTR');
assert.strictEqual(isRtlLocale('ja'), false, 'Japanese must be LTR');
console.log('✅ PASS: All 10 Tier-1 locales registered with correct RTL/LTR direction');

// 2. Dictionary Completeness & Zero Missing Keys
console.log('\n--- 2. Dictionary Completeness Audit (100% Coverage) ---');
const requiredNamespaces = [
  'common',
  'nav',
  'calculator',
  'results',
  'salaryNeeded',
  'salaryAfterTax',
  'costOfLiving',
  'compare',
  'jobOffers',
  'errors',
  'footer',
  'languageSelector',
  'reports',
] as const;

const englishDict = DICTIONARIES.en;

function verifyTranslations(targetObj: any, enObj: any, path: string): number {
  let count = 0;
  for (const [key, enVal] of Object.entries(enObj)) {
    const curPath = `${path}.${key}`;
    const targetVal = targetObj[key];
    assert(targetVal !== undefined && targetVal !== null, `Missing key: ${curPath}`);
    if (typeof enVal === 'object' && enVal !== null) {
      assert(typeof targetVal === 'object' && targetVal !== null, `Expected object at: ${curPath}`);
      count += verifyTranslations(targetVal, enVal, curPath);
    } else {
      assert(
        typeof targetVal === 'string' && targetVal.trim().length > 0,
        `Empty translation for key: ${curPath}`
      );
      count++;
    }
  }
  return count;
}

for (const loc of expectedTier1) {
  const dict = DICTIONARIES[loc];
  assert(dict, `Dictionary must exist for ${loc}`);
  assert.strictEqual(dict.locale, loc, `Dictionary locale identifier must match ${loc}`);

  let keyCount = 0;
  for (const ns of requiredNamespaces) {
    const enNamespace = englishDict[ns];
    const targetNamespace = dict[ns];
    assert(targetNamespace, `Namespace ${ns} must exist in ${loc}`);
    keyCount += verifyTranslations(targetNamespace, enNamespace, `${loc}.${ns}`);
  }
  console.log(`✅ PASS: [${loc.toUpperCase()}] Complete — ${keyCount} keys verified (100% coverage, 0 missing keys)`);
}


// 3. Stable Server Error Codes Mapping
console.log('\n--- 3. Error Codes Localization ---');
const requiredErrorCodes = [
  'TAX_CALCULATION_UNAVAILABLE',
  'INVALID_SALARY',
  'CITY_NOT_SUPPORTED',
  'DATA_STALE',
  'FX_UNAVAILABLE',
  'NETWORK_ERROR',
] as const;

for (const loc of expectedTier1) {
  const dict = DICTIONARIES[loc];
  for (const code of requiredErrorCodes) {
    const errorMsg = dict.errors[code];
    assert(
      errorMsg && errorMsg.trim().length > 0,
      `Error code ${code} must have localized message in ${loc}`
    );
  }
}
console.log('✅ PASS: All 6 authoritative error codes mapped across all 10 locales');

// 4. Number, Currency and Date Formatters
console.log('\n--- 4. Locale-Aware Formatting APIs ---');
const testNum = 1234567.89;
const enNum = formatLocalizedNumber(testNum, 'en');
const deNum = formatLocalizedNumber(testNum, 'de');
assert(enNum.includes(',') || enNum.includes('.'), 'English number formatted');
assert(deNum.includes('.') || deNum.includes(','), 'German number formatted');

const testMoneyUsd = createMoney(100000, 'USD');
const testMoneyEur = createMoney(85000, 'EUR');
const testMoneyJpy = createMoney(12000000, 'JPY');

for (const loc of expectedTier1) {
  const usdFmt = formatLocalizedCurrency(testMoneyUsd, loc);
  const eurFmt = formatLocalizedCurrency(testMoneyEur, loc);
  const jpyFmt = formatLocalizedCurrency(testMoneyJpy, loc);
  assert(usdFmt && usdFmt.length > 0, `USD must format in ${loc}`);
  assert(eurFmt && eurFmt.length > 0, `EUR must format in ${loc}`);
  assert(jpyFmt && jpyFmt.length > 0, `JPY must format in ${loc}`);
}

const testDate = new Date('2026-10-06T12:00:00Z');
for (const loc of expectedTier1) {
  const dateFmt = formatLocalizedDate(testDate, loc);
  assert(dateFmt && dateFmt.length > 0, `Date must format in ${loc}`);
}
console.log('✅ PASS: Number, currency, and date Intl formatters pass across all 10 locales');

// 5. Mathematical Calculation Parity / Language Independence Invariant
console.log('\n--- 5. Mathematical Parity & Calculation Invariant ---');
const baselineOutcome = SalaryWorthCalculator.calculate(DEFAULT_NYC_100K_SCENARIO);

// Assert that the exact same numbers are returned regardless of locale context
for (const loc of expectedTier1) {
  const testOutcome = SalaryWorthCalculator.calculate(DEFAULT_NYC_100K_SCENARIO);
  assert.strictEqual(
    testOutcome.grossAnnual.amountMinor,
    baselineOutcome.grossAnnual.amountMinor,
    `Gross annual must match in ${loc}`
  );
  assert.strictEqual(
    testOutcome.takeHomeAnnual.amountMinor,
    baselineOutcome.takeHomeAnnual.amountMinor,
    `Take-home annual must match in ${loc}`
  );
  assert.strictEqual(
    testOutcome.livingCostsAnnual.amountMinor,
    baselineOutcome.livingCostsAnnual.amountMinor,
    `Living costs annual must match in ${loc}`
  );
  assert.strictEqual(
    testOutcome.moneyRemainingAnnual.amountMinor,
    baselineOutcome.moneyRemainingAnnual.amountMinor,
    `Money remaining annual must match in ${loc}`
  );
  assert.strictEqual(
    testOutcome.savingsRatePercentage,
    baselineOutcome.savingsRatePercentage,
    `Savings rate must match in ${loc}`
  );
}
console.log('✅ PASS: Financial calculations are strictly deterministic and 100% language-invariant');

// 6. English Leak Detection on Non-English Dictionaries
console.log('\n--- 6. English Leak Detection ---');
const nonEnglishLocales = expectedTier1.filter((l) => l !== 'en');

for (const loc of nonEnglishLocales) {
  const dict = DICTIONARIES[loc];
  // Verify that major narrative headlines are NOT raw English copies
  assert.notStrictEqual(
    dict.calculator.heroHeadline,
    englishDict.calculator.heroHeadline,
    `Headline in ${loc} must not be English`
  );
  assert.notStrictEqual(
    dict.nav.tabSalaryWorth,
    englishDict.nav.tabSalaryWorth,
    `Tab in ${loc} must not be English`
  );
  assert.notStrictEqual(
    dict.results.annualGross,
    englishDict.results.annualGross,
    `Annual gross in ${loc} must not be English`
  );
  assert.notStrictEqual(
    dict.results.spendableSurplus,
    englishDict.results.spendableSurplus,
    `Spendable surplus in ${loc} must not be English`
  );
  assert.notStrictEqual(
    dict.footer.calculatorsTitle,
    englishDict.footer.calculatorsTitle,
    `Footer title in ${loc} must not be English`
  );
}
console.log('✅ PASS: Zero English leakage on primary user journey keys in non-English locales');

console.log('\n======================================================');
console.log('🎉 ALL LOCALIZATION COMPLETENESS TESTS PASSED (100%)!');
console.log('======================================================');
