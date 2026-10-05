export const LATEST_VERIFIED_TAX_YEAR = 2026;

export const TAX_YEAR_OPTIONS = [2026, 2027] as const;

export type SupportedTaxYearOption = (typeof TAX_YEAR_OPTIONS)[number];

export function resolveTaxYear(value: unknown): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100) {
    return parsed;
  }

  return LATEST_VERIFIED_TAX_YEAR;
}

export function isFutureUnverifiedTaxYear(year: number): boolean {
  return year > LATEST_VERIFIED_TAX_YEAR;
}
