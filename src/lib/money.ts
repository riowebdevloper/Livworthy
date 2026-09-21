import { CurrencyCode, Money } from '../types/money';
export type { CurrencyCode, Money };

const CURRENCY_MINOR_UNITS: Record<CurrencyCode, number> = {
  USD: 100,
  GBP: 100,
  EUR: 100,
  CAD: 100,
  AED: 100,
  AUD: 100,
  SAR: 100,
  CHF: 100,
  SGD: 100,
  QAR: 100,
  NZD: 100,
  INR: 100,
  JPY: 1,
  KRW: 1,
  NOK: 100,
  SEK: 100,
  DKK: 100,
  ILS: 100,
  HKD: 100,
  BRL: 100,
  MXN: 100,
  IDR: 100,
  MYR: 100,
  PHP: 100,
  ZAR: 100,
  PLN: 100,
  CZK: 100,
  THB: 100,
  VND: 1,
};

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'de-DE',
  CAD: 'en-CA',
  AED: 'en-AE',
  AUD: 'en-AU',
  SAR: 'ar-SA',
  CHF: 'de-CH',
  SGD: 'en-SG',
  QAR: 'ar-QA',
  NZD: 'en-NZ',
  INR: 'en-IN',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  NOK: 'nb-NO',
  SEK: 'sv-SE',
  DKK: 'da-DK',
  ILS: 'he-IL',
  HKD: 'zh-HK',
  BRL: 'pt-BR',
  MXN: 'es-MX',
  IDR: 'id-ID',
  MYR: 'ms-MY',
  PHP: 'en-PH',
  ZAR: 'en-ZA',
  PLN: 'pl-PL',
  CZK: 'cs-CZ',
  THB: 'th-TH',
  VND: 'vi-VN',
};

export function createMoney(amountMajor: number, currency: CurrencyCode): Money {
  const factor = CURRENCY_MINOR_UNITS[currency] || 100;
  return {
    amountMinor: Math.round(amountMajor * factor),
    currency,
  };
}

export function fromMinor(amountMinor: number, currency: CurrencyCode): Money {
  return {
    amountMinor: Math.round(amountMinor),
    currency,
  };
}

export function toMajor(money: Money): number {
  const factor = CURRENCY_MINOR_UNITS[money.currency] || 100;
  return money.amountMinor / factor;
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch in addMoney: ${a.currency} vs ${b.currency}`);
  }
  return {
    amountMinor: a.amountMinor + b.amountMinor,
    currency: a.currency,
  };
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch in subtractMoney: ${a.currency} vs ${b.currency}`);
  }
  return {
    amountMinor: a.amountMinor - b.amountMinor,
    currency: a.currency,
  };
}

export function multiplyMoney(money: Money, multiplier: number): Money {
  return {
    amountMinor: Math.round(money.amountMinor * multiplier),
    currency: money.currency,
  };
}

export function sumMoney(items: Money[], currency: CurrencyCode): Money {
  const totalMinor = items.reduce((acc, item) => {
    if (item.currency !== currency) {
      throw new Error(`Currency mismatch in sumMoney: expected ${currency}, got ${item.currency}`);
    }
    return acc + item.amountMinor;
  }, 0);
  return {
    amountMinor: totalMinor,
    currency,
  };
}

export function formatMoney(
  money: Money,
  options?: {
    hideDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const major = toMajor(money);
  const locale = CURRENCY_LOCALES[money.currency] || 'en-US';
  
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

  return new Intl.NumberFormat(locale, formatterOptions).format(major);
}

export function formatMajorAmount(amountMajor: number, currency: CurrencyCode, hideDecimals: boolean = true): string {
  return formatMoney(createMoney(amountMajor, currency), { hideDecimals });
}
