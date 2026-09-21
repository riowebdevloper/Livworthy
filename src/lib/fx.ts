import { CurrencyCode, Money } from '../types/money';
import { createMoney, toMajor } from './money';

/**
 * Strict currency conversion function.
 * REQUIRES an active, validated snapshot.
 * Production calculations must not silently substitute unverified rates.
 */
export function convertMoney(
  amount: Money,
  targetCurrency: CurrencyCode,
  snapshot: { rates: Record<string, number> }
): Money {
  if (amount.currency === targetCurrency) {
    return amount;
  }

  if (!snapshot || !snapshot.rates) {
    throw new Error(
      `FX conversion requires an active validated FX snapshot. Production calculations must not silently substitute unverified rates.`
    );
  }

  const fromRate = snapshot.rates[amount.currency];
  const toRate = snapshot.rates[targetCurrency];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency conversion: ${amount.currency} to ${targetCurrency}`);
  }

  // Convert to base USD then to targetCurrency
  const majorFrom = toMajor(amount);
  const majorBase = majorFrom / fromRate;
  const majorTarget = majorBase * toRate;

  return createMoney(majorTarget, targetCurrency);
}
