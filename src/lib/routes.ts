/**
 * Authoritative Single Route Registry for LivWorthy
 *
 * Implements Part 4 (Items 13 & 14):
 * - Eliminates drift across page generators, sitemaps, route audits, internal links, and tests.
 * - Enforces pluralized route standards (/countries/, /cities/, /guides/, /relocation/, /reports/, /compare/).
 */

export function buildHomePath(locale: string = 'en'): string {
  return locale === 'en' ? '/' : `/${locale}`;
}

export function buildCountryPath(locale: string = 'en', countryId: string): string {
  const c = countryId.toLowerCase();
  return locale === 'en' ? `/countries/${c}` : `/${locale}/countries/${c}`;
}

export function buildCityPath(locale: string = 'en', cityId: string): string {
  const c = cityId.toLowerCase();
  return locale === 'en' ? `/cities/${c}` : `/${locale}/cities/${c}`;
}

export function buildGuidePath(locale: string = 'en', slug: string): string {
  return locale === 'en' ? `/guides/${slug}` : `/${locale}/guides/${slug}`;
}

export function buildRelocationPath(locale: string = 'en', slug: string): string {
  return locale === 'en' ? `/relocation/${slug}` : `/${locale}/relocation/${slug}`;
}

export function buildReportPath(locale: string = 'en', slug: string): string {
  return locale === 'en' ? `/reports/${slug}` : `/${locale}/reports/${slug}`;
}

export function buildComparePath(locale: string = 'en', slug: string): string {
  return locale === 'en' ? `/compare/${slug}` : `/${locale}/compare/${slug}`;
}

export function buildTaxCalculatorPath(cityId: string): string {
  return `/salary-after-tax/${cityId.toLowerCase()}`;
}

export function buildSalaryNeededPath(cityId: string): string {
  return `/salary-needed/${cityId.toLowerCase()}`;
}

export function buildCostOfLivingPath(cityId: string): string {
  return `/cost-of-living/${cityId.toLowerCase()}`;
}
