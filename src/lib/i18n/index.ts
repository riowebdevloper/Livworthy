import { DEFAULT_LOCALE, isRtlLocale, isSupportedLocale, SUPPORTED_LOCALES } from './config';
import { enDictionary } from './locales/en';
import { esDictionary } from './locales/es';
import { frDictionary } from './locales/fr';
import { arDictionary } from './locales/ar';
import { deDictionary } from './locales/de';
import { ptDictionary } from './locales/pt';
import { hiDictionary } from './locales/hi';
import { urDictionary } from './locales/ur';
import { zhDictionary } from './locales/zh';
import { jaDictionary } from './locales/ja';
import { itDictionary } from './locales/it';
import { nlDictionary } from './locales/nl';
import { koDictionary } from './locales/ko';
import { ruDictionary } from './locales/ru';
import { trDictionary } from './locales/tr';
import { plDictionary } from './locales/pl';
import { idDictionary } from './locales/id';
import { viDictionary } from './locales/vi';
import { bnDictionary } from './locales/bn';
import { paDictionary } from './locales/pa';
import { msDictionary } from './locales/ms';
import { thDictionary } from './locales/th';
import { tlDictionary } from './locales/tl';
import { I18nDictionary, SupportedLocale } from './types';

export * from './types';
export * from './config';
export * from './formatters';
export * from './audit';
export * from './content';

export const DICTIONARIES: Record<string, I18nDictionary> = {
  en: enDictionary,
  es: esDictionary,
  fr: frDictionary,
  ar: arDictionary,
  de: deDictionary,
  pt: ptDictionary,
  hi: hiDictionary,
  ur: urDictionary,
  zh: zhDictionary,
  ja: jaDictionary,
  it: itDictionary,
  nl: nlDictionary,
  ko: koDictionary,
  ru: ruDictionary,
  tr: trDictionary,
  pl: plDictionary,
  id: idDictionary,
  vi: viDictionary,
  bn: bnDictionary,
  pa: paDictionary,
  ms: msDictionary,
  th: thDictionary,
  tl: tlDictionary,
};

export function getDictionary(locale: string): I18nDictionary {
  return DICTIONARIES[locale] || DICTIONARIES.en;
}

/**
 * Route-preserving language switcher (Requirement 54):
 * Preserves the current path (e.g. /cities/london -> /ar/cities/london or /es/guides/nyc-100k -> /de/guides/nyc-100k)
 */
export function getLocalizedRoute(currentPath: string, targetLocale: string): string {
  if (!currentPath) return targetLocale === DEFAULT_LOCALE ? '/' : `/${targetLocale}`;
  const [pathname, search] = currentPath.split('?');
  const query = search ? `?${search}` : '';
  const segments = pathname.split('/').filter(Boolean);

  let basePath = pathname;
  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    basePath = '/' + segments.slice(1).join('/');
  }
  if (!basePath.startsWith('/')) basePath = '/' + basePath;
  if (basePath === '/') basePath = '';

  if (targetLocale === DEFAULT_LOCALE) {
    return (basePath || '/') + query;
  }
  return `/${targetLocale}${basePath}` + query;
}

export const LOCALE_STORAGE_KEY = 'livworthy_preferred_locale';

/**
 * Language resolution priority per specification:
 * 1. URL locale prefix (e.g., /es, /ar, /de, /ja)
 * 2. URL query param (?lang=es)
 * 3. Stored user preference in localStorage
 * 4. Browser navigator.language (matching Tier-1 languages)
 * 5. English fallback
 */
export function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  // 1. Check pathname prefix: /es/..., /ar/..., /de/..., etc.
  const path = window.location.pathname.toLowerCase();
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0) {
    const firstSegment = segments[0] as SupportedLocale;
    if (isSupportedLocale(firstSegment)) {
      return firstSegment;
    }
  }

  // 2. Check query param: ?lang=es
  try {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang')?.toLowerCase();
    if (langParam && isSupportedLocale(langParam)) {
      return langParam;
    }
  } catch {}

  // 3. Check localStorage stored preference
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) {
      return stored;
    }
  } catch {}

  // 4. Check navigator.language
  try {
    const browserCode = (navigator.language || '').toLowerCase();
    const primary = browserCode.split('-')[0] as SupportedLocale;
    if (isSupportedLocale(primary)) {
      return primary;
    }
  } catch {}

  return DEFAULT_LOCALE;
}

/**
 * Persists user's selected language and updates document lang + dir.
 */
export function setStoredLocale(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
  } catch {}
}

/**
 * Backward compatibility translations interface for existing consumers
 */
export interface LegacyTranslations {
  siteTitle: string;
  siteTagline: string;
  livingIntelligence: string;
  navHowItWorks: string;
  navSources: string;
  navCoverage: string;
  navRelocation: string;
  navJobOfferComparison: string;
  tabSalaryWorth: string;
  tabSalaryNeeded: string;
  tabSalaryAfterTax: string;
  tabCostOfLiving: string;
  tabCompare: string;
  tabJobOffers: string;
  tabGuides: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroSupporting: string;
  popularScenarios: string;
  grossSalaryLabel: string;
  cityLabel: string;
  householdLabel: string;
  householdSingle: string;
  householdCouple: string;
  householdFamily: string;
  rentOverrideLabel: string;
  calculateCta: string;
  takeHomeSummaryTitle: string;
  annualGrossLabel: string;
  annualTakeHomeLabel: string;
  monthlyTakeHomeLabel: string;
  monthlyLivingCostsLabel: string;
  monthlyDisposableLabel: string;
  monthlySavingsCapacityLabel: string;
  savingsRateLabel: string;
  financialDisclaimer: string;
  dataFreshnessBadge: string;
  coverageNotice: string;
}

function createLegacyBridge(dict: I18nDictionary): LegacyTranslations {
  return {
    siteTitle: `${dict.common.brand} — ${dict.common.tagline}`,
    siteTagline: dict.common.tagline,
    livingIntelligence: dict.common.livingIntelligence,
    navHowItWorks: dict.nav.howItWorks,
    navSources: dict.nav.sources,
    navCoverage: dict.nav.coverage,
    navRelocation: dict.nav.relocation,
    navJobOfferComparison: dict.nav.jobOfferComparison,
    tabSalaryWorth: dict.nav.tabSalaryWorth,
    tabSalaryNeeded: dict.nav.tabSalaryNeeded,
    tabSalaryAfterTax: dict.nav.tabSalaryAfterTax,
    tabCostOfLiving: dict.nav.tabCostOfLiving,
    tabCompare: dict.nav.tabCompare,
    tabJobOffers: dict.nav.tabJobOffers,
    tabGuides: dict.nav.tabGuides,
    heroHeadline: dict.calculator.heroHeadline,
    heroSubheadline: dict.calculator.heroSubheadline,
    heroSupporting: dict.calculator.heroSupporting,
    popularScenarios: dict.calculator.popularScenarios,
    grossSalaryLabel: dict.calculator.annualSalary,
    cityLabel: dict.calculator.chooseCity,
    householdLabel: dict.calculator.householdType,
    householdSingle: dict.common.singleAdult,
    householdCouple: dict.common.couple,
    householdFamily: dict.common.family,
    rentOverrideLabel: dict.calculator.rentOverride,
    calculateCta: dict.calculator.btnCalculate,
    takeHomeSummaryTitle: dict.results.summaryTitle,
    annualGrossLabel: dict.results.annualGross,
    annualTakeHomeLabel: dict.results.annualTakeHome,
    monthlyTakeHomeLabel: dict.results.monthlyTakeHome,
    monthlyLivingCostsLabel: dict.results.monthlyLivingCosts,
    monthlyDisposableLabel: dict.results.monthlyDisposable,
    monthlySavingsCapacityLabel: dict.results.savingsCapacity,
    savingsRateLabel: dict.results.savingsRate,
    financialDisclaimer: dict.common.disclaimer,
    dataFreshnessBadge: dict.common.verifiedTaxBaseline,
    coverageNotice: dict.common.tier1SourcesBadge,
  };
}

export const TRANSLATIONS: Record<string, LegacyTranslations> = {
  en: createLegacyBridge(DICTIONARIES.en),
  es: createLegacyBridge(DICTIONARIES.es),
  fr: createLegacyBridge(DICTIONARIES.fr),
  ar: createLegacyBridge(DICTIONARIES.ar),
  de: createLegacyBridge(DICTIONARIES.de),
  pt: createLegacyBridge(DICTIONARIES.pt),
  hi: createLegacyBridge(DICTIONARIES.hi),
  ur: createLegacyBridge(DICTIONARIES.ur),
  zh: createLegacyBridge(DICTIONARIES.zh),
  ja: createLegacyBridge(DICTIONARIES.ja),
};
