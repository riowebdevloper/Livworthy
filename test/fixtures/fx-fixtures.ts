import { FxRateSnapshot } from '../../src/types/money';

/**
 * Deterministic test fixture snapshot.
 * STRICT POLICY: Allowed ONLY in unit tests and deterministic mocks.
 * This MUST NEVER be used as authoritative production FX.
 */
export const TEST_FIXTURE_FX_SNAPSHOT: FxRateSnapshot = {
  baseCurrency: 'USD',
  rates: {
    USD: 1.0,
    GBP: 0.782,
    EUR: 0.918,
    CAD: 1.358,
    AED: 3.6725,
    AUD: 1.524,
    SAR: 3.75,
    CHF: 0.884,
    SGD: 1.346,
    QAR: 3.64,
    NZD: 1.685,
    INR: 86.45,
  },
  timestamp: '2025-01-15T00:00:00Z',
  source: 'Unit Test Deterministic Fixture (Non-authoritative)',
};
