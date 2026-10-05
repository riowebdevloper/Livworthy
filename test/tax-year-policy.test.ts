import assert from 'node:assert/strict';
import { createMoney } from '../src/lib/money';
import {
  LATEST_VERIFIED_TAX_YEAR,
  isFutureUnverifiedTaxYear,
  resolveTaxYear,
} from '../src/lib/tax-year-policy';
import { TaxRegistry } from '../src/engines/tax/tax-registry';

assert.equal(LATEST_VERIFIED_TAX_YEAR, 2026);
assert.equal(resolveTaxYear(undefined), 2026);
assert.equal(resolveTaxYear('2027'), 2027);
assert.equal(resolveTaxYear('invalid'), 2026);
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
