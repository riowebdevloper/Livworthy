/**
 * LivWorthy Long-Form Content Localization & Completeness Engine
 *
 * Implements Section 15, 21, 23 & 24:
 * - Unified export of localized city, country, guide, relocation, and report content
 * - Content lookups with transparent English fallbacks
 * - Long-Form Completeness Auditor measuring real localized fields vs expected
 */

import {
  LocalizedCityContent,
  LocalizedCountryContent,
  LocalizedGuideContent,
  LocalizedRelocationContent,
  LocalizedReportContent,
  LongFormCompletenessAudit,
} from '../types';

import { LOCALIZED_CITIES, getLocalizedCity } from './cities';
import { LOCALIZED_COUNTRIES, getLocalizedCountry } from './countries';
import { LOCALIZED_GUIDES, getLocalizedGuide } from './guides';
import { LOCALIZED_RELOCATIONS, getLocalizedRelocation } from './relocation';
import { LOCALIZED_REPORTS, getLocalizedReport } from './reports';

export {
  LOCALIZED_CITIES,
  getLocalizedCity,
  LOCALIZED_COUNTRIES,
  getLocalizedCountry,
  LOCALIZED_GUIDES,
  getLocalizedGuide,
  LOCALIZED_RELOCATIONS,
  getLocalizedRelocation,
  LOCALIZED_REPORTS,
  getLocalizedReport,
};

export class LongFormContentAuditor {
  /**
   * Audits long-form content completeness for a given locale across all canonical items.
   */
  public static auditLocale(locale: string): LongFormCompletenessAudit {
    const canonicalCityKeys = Object.keys(LOCALIZED_CITIES);
    const canonicalCountryKeys = Object.keys(LOCALIZED_COUNTRIES);
    const canonicalGuideKeys = Object.keys(LOCALIZED_GUIDES);
    const canonicalReportKeys = Object.keys(LOCALIZED_REPORTS);

    // Count translated items where locale specifically exists and status is 'PUBLISHED'
    const translatedCities = canonicalCityKeys.filter(
      (id) => LOCALIZED_CITIES[id][locale]?.status === 'PUBLISHED'
    ).length;

    const translatedCountries = canonicalCountryKeys.filter(
      (id) => LOCALIZED_COUNTRIES[id][locale]?.status === 'PUBLISHED'
    ).length;

    const translatedGuides = canonicalGuideKeys.filter(
      (id) => LOCALIZED_GUIDES[id][locale]?.status === 'PUBLISHED'
    ).length;

    const translatedReports = canonicalReportKeys.filter(
      (id) => LOCALIZED_REPORTS[id][locale]?.status === 'PUBLISHED'
    ).length;

    const totalRequiredItems =
      canonicalCityKeys.length +
      canonicalCountryKeys.length +
      canonicalGuideKeys.length +
      canonicalReportKeys.length;

    const totalTranslatedItems =
      translatedCities +
      translatedCountries +
      translatedGuides +
      translatedReports;

    const completenessPct =
      totalRequiredItems > 0
        ? Math.round((totalTranslatedItems / totalRequiredItems) * 100)
        : 0;

    const cityCoveragePct =
      canonicalCityKeys.length > 0
        ? Math.round((translatedCities / canonicalCityKeys.length) * 100)
        : 0;

    const countryCoveragePct =
      canonicalCountryKeys.length > 0
        ? Math.round((translatedCountries / canonicalCountryKeys.length) * 100)
        : 0;

    const guideCoveragePct =
      canonicalGuideKeys.length > 0
        ? Math.round((translatedGuides / canonicalGuideKeys.length) * 100)
        : 0;

    const reportCoveragePct =
      canonicalReportKeys.length > 0
        ? Math.round((translatedReports / canonicalReportKeys.length) * 100)
        : 0;

    // A locale is only publishable as fully indexable long-form content if it has >=80% content coverage
    const isPublishable = completenessPct >= 80;

    return {
      locale,
      totalRequiredFields: totalRequiredItems,
      translatedFields: totalTranslatedItems,
      completenessPct,
      cityCoveragePct,
      countryCoveragePct,
      guideCoveragePct,
      reportCoveragePct,
      isPublishable,
    };
  }

  /**
   * Audits all registered locales and returns their completeness matrix.
   */
  public static auditAllLocales(locales: string[]): Record<string, LongFormCompletenessAudit> {
    const results: Record<string, LongFormCompletenessAudit> = {};
    for (const loc of locales) {
      results[loc] = this.auditLocale(loc);
    }
    return results;
  }
}
