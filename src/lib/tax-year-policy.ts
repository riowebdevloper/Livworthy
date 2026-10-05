export const LATEST_VERIFIED_TAX_YEAR = 2026;

export const TAX_YEAR_OPTIONS = [2026, 2027] as const;

export type SupportedTaxYearOption = (typeof TAX_YEAR_OPTIONS)[number];

export function parseTaxYear(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 2000 && value <= 2100 ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^\d{4}$/.test(trimmed)) return null;
    const parsed = Number(trimmed);
    return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100 ? parsed : null;
  }

  return null;
}

export function resolveTaxYear(value: unknown): number {
  return parseTaxYear(value) ?? LATEST_VERIFIED_TAX_YEAR;
}

export function isFutureUnverifiedTaxYear(year: number): boolean {
  return year > LATEST_VERIFIED_TAX_YEAR;
}
