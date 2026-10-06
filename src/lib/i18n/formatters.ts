import { CurrencyCode, Money } from '../../types/money';
import { toMajor } from '../money';
import { getLocaleConfig } from './config';
import { SupportedLocale } from './types';

/**
 * Formats a number according to the specified locale rules using standard Intl API.
 * e.g., German 1.234,56 vs English 1,234.56 vs French 1 234,56
 */
export function formatLocalizedNumber(
  value: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions
): string {
  const cfg = getLocaleConfig(locale);
  try {
    return new Intl.NumberFormat(cfg.intlLocale, options).format(value);
  } catch {
    return value.toLocaleString();
  }
}

/**
 * Formats monetary amounts using locale-specific rules and currency conventions.
 * Maintains financial mathematical precision while adhering to local display norms.
 */
export function formatLocalizedCurrency(
  money: Money,
  locale: SupportedLocale,
  options?: {
    hideDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const major = toMajor(money);
  const cfg = getLocaleConfig(locale);

  const formatterOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: options?.hideDecimals ? 0 : 0,
    maximumFractionDigits: options?.hideDecimals ? 0 : 2,
  };

  if (options?.compact && Math.abs(major) >= 1000) {
    formatterOptions.notation = 'compact';
    formatterOptions.maximumFractionDigits = 1;
  }

  try {
    return new Intl.NumberFormat(cfg.intlLocale, formatterOptions).format(major);
  } catch {
    // Fallback if environment doesn't recognize complex intl locale
    return `${money.currency} ${formatLocalizedNumber(major, locale, {
      maximumFractionDigits: options?.hideDecimals ? 0 : 2,
    })}`;
  }
}

/**
 * Formats a date using locale-appropriate conventions via Intl.DateTimeFormat.
 */
export function formatLocalizedDate(
  date: Date | string | number,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date);
  const cfg = getLocaleConfig(locale);
  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  try {
    return new Intl.DateTimeFormat(cfg.intlLocale, defaultOptions).format(d);
  } catch {
    return d.toISOString().split('T')[0];
  }
}

/**
 * Evaluates the grammatical plural category for a count and locale.
 */
export function getPluralCategory(
  count: number,
  locale: SupportedLocale
): Intl.LDMLPluralRule {
  const cfg = getLocaleConfig(locale);
  try {
    const pr = new Intl.PluralRules(cfg.intlLocale);
    return pr.select(count);
  } catch {
    return count === 1 ? 'one' : 'other';
  }
}

/**
 * Interpolates variables in a translation string (e.g., "Offers {delta} higher").
 */
export function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}
