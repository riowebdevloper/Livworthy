import { I18nDictionary, TranslationCompletenessAudit } from './types';
import { enDictionary } from './locales/en';

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  if (!obj || typeof obj !== 'object') return result;

  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      result[fullKey] = val;
    } else if (typeof val === 'object' && val !== null) {
      Object.assign(result, flattenObject(val, fullKey));
    }
  }
  return result;
}

const ENGLISH_FLAT_KEYS = flattenObject(enDictionary);
// Whitelist of legitimate international proper nouns, brands, acronyms, or numbers
const BRAND_WHITELIST = new Set([
  'common.brand',
  'common.disclaimer', // mathematical disclaimer can reference universal terms
  'locale',
]);

export class TranslationAuditor {
  private static referenceKeys: Record<string, string> = ENGLISH_FLAT_KEYS;

  public static getRequiredKeyCount(): number {
    return Object.keys(this.referenceKeys).length;
  }

  public static auditDictionary(
    locale: string,
    dict: Partial<I18nDictionary>
  ): TranslationCompletenessAudit {
    const targetFlat = flattenObject(dict);
    const requiredKeyEntries = Object.entries(this.referenceKeys);
    const totalRequired = requiredKeyEntries.length;

    let translatedCount = 0;
    const missingKeys: string[] = [];
    const fallbackKeys: string[] = [];
    let englishLeakageCount = 0;

    for (const [key, enVal] of requiredKeyEntries) {
      const targetVal = targetFlat[key];

      if (!targetVal || targetVal.trim() === '') {
        missingKeys.push(key);
      } else {
        translatedCount++;
        // Check for untranslated English leakage in non-English locales
        if (
          locale !== 'en' &&
          locale !== 'en-US' &&
          locale !== 'en-GB' &&
          locale !== 'en-CA' &&
          locale !== 'en-AU' &&
          !BRAND_WHITELIST.has(key) &&
          targetVal.trim() === enVal.trim() &&
          enVal.trim().length > 3
        ) {
          fallbackKeys.push(key);
          englishLeakageCount++;
        }
      }
    }

    const completenessPct =
      totalRequired > 0
        ? Math.min(100, Math.round((translatedCount / totalRequired) * 100))
        : 0;

    return {
      locale,
      totalRequiredKeys: totalRequired,
      translatedKeys: translatedCount,
      missingKeys,
      fallbackKeys,
      completenessPct,
      isComplete: completenessPct >= 95 && englishLeakageCount === 0,
      englishLeakageCount,
    };
  }
}
