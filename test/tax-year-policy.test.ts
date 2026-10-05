import assert from 'node:assert/strict';
import { createMoney } from '../src/lib/money';
import {
  LATEST_VERIFIED_TAX_YEAR,
  isFutureUnverifiedTaxYear,
  parseTaxYear,
  resolveTaxYear,
} from '../src/lib/tax-year-policy';
import { TaxRegistry } from '../src/engines/tax/tax-registry';

assert.equal(LATEST_VERIFIED_TAX_YEAR, 2026);
assert.equal(resolveTaxYear(undefined), 2026);
assert.equal(resolveTaxYear('2027'), 2027);
assert.equal(resolveTaxYear('invalid'), 2026);
assert.equal(parseTaxYear('2026oops'), null);
assert.equal(parseTaxYear('2026'), 2026);
assert.equal(parseTaxYear(' 2026 '), 2026);
assert.equal(isFutureUnverifiedTaxYear(2026), false);
assert.equal(isFutureUnverifiedTaxYear(2027), true);

const result2027 = TaxRegistry.calculate(
  createMoney(100000, 'USD'),
  { filingStatus: 'single', dependentsCount: 0, taxYear: 2027 },
  { countryId: 'US', regionId: 'US-NY', cityId: 'nyc', taxYear: 2027 }
);

assert.equal(result2027.status, 'TAX_CALCULATION_UNAVAILABLE');
assert.equal(result2027.taxRuleVersion, 'FUTURE-YEAR-UNVERIFIED-2027');
assert.match(result2027.unsupportedExplanation || '', /2027/);
assert.match(result2027.unsupportedExplanation || '', /2026/);

console.log('tax-year-policy.test.ts: PASS');

const result2000 = TaxRegistry.calculate(
  createMoney(100000, 'USD'),
  { filingStatus: 'single', dependentsCount: 0, taxYear: 2000 },
  { countryId: 'US', regionId: 'US-NY', cityId: 'nyc', taxYear: 2000 }
);

assert.equal(result2000.status, 'TAX_CALCULATION_UNAVAILABLE');
assert.equal(result2000.taxRuleVersion, 'TAX-YEAR-UNAVAILABLE-US-2000');
assert.deepEqual(TaxRegistry.getSupportedTaxYears('US'), [2024, 2025, 2026]);
assert.equal(TaxRegistry.supportsTaxYear('US', 2000), false);
assert.equal(TaxRegistry.supportsTaxYear('US', 2026), true);
