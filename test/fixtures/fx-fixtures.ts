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
    JPY: 152.3,
    KRW: 1380.0,
    NOK: 10.95,
    SEK: 10.82,
    DKK: 6.85,
    ILS: 3.65,
    HKD: 7.78,
    BRL: 5.62,
    MXN: 19.85,
    IDR: 15850.0,
    MYR: 4.42,
    PHP: 58.2,
    ZAR: 18.25,
    PLN: 3.98,
    CZK: 23.4,
    THB: 34.8,
    VND: 25400.0,
  },
  timestamp: '2025-01-15T00:00:00Z',
  source: 'Unit Test Deterministic Fixture (Non-authoritative)',
};
