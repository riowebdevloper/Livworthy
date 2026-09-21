export type CurrencyCode =
  | 'USD'
  | 'GBP'
  | 'EUR'
  | 'AED'
  | 'CAD'
  | 'AUD'
  | 'SAR'
  | 'CHF'
  | 'SGD'
  | 'QAR'
  | 'NZD'
  | 'INR';

export interface Money {
  /**
   * Amount in integer minor units (e.g., cents, pence, fils).
   * 100_000 USD = 10_000_000 cents.
   */
  amountMinor: number;
  currency: CurrencyCode;
}

export interface FxRateSnapshot {
  baseCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  timestamp: string;
  source: string;
}
