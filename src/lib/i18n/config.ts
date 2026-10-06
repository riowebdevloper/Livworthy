import { LocaleConfig, SupportedLocale, Tier1Locale } from './types';

export const TIER_1_LOCALES: Tier1Locale[] = [
  'en',
  'es',
  'fr',
  'ar',
  'de',
  'pt',
  'hi',
  'ur',
  'zh',
  'ja',
];

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
    script: 'Latn',
    tier: 1,
    intlLocale: 'en-US',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
    flag: '🇪🇸',
    script: 'Latn',
    tier: 1,
    intlLocale: 'es-ES',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    flag: '🇫🇷',
    script: 'Latn',
    tier: 1,
    intlLocale: 'fr-FR',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇦🇪',
    script: 'Arab',
    tier: 1,
    intlLocale: 'ar-AE',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    dir: 'ltr',
    flag: '🇩🇪',
    script: 'Latn',
    tier: 1,
    intlLocale: 'de-DE',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    dir: 'ltr',
    flag: '🇧🇷',
    script: 'Latn',
    tier: 1,
    intlLocale: 'pt-BR',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    flag: '🇮🇳',
    script: 'Deva',
    tier: 1,
    intlLocale: 'hi-IN',
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    dir: 'rtl',
    flag: '🇵🇰',
    script: 'Arab',
    tier: 1,
    intlLocale: 'ur-PK',
  },
  zh: {
    code: 'zh',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    dir: 'ltr',
    flag: '🇨🇳',
    script: 'Hans',
    tier: 1,
    intlLocale: 'zh-CN',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    dir: 'ltr',
    flag: '🇯🇵',
    script: 'Jpan',
    tier: 1,
    intlLocale: 'ja-JP',
  },
};

/**
 * Metadata for Tier 2 languages in queue for expansion.
 * Registered in configuration to allow zero-architectural-rewrite scaling.
 */
export const TIER_2_LOCALE_METADATA: Record<string, Omit<LocaleConfig, 'code' | 'tier'> & { tier: 2 }> = {
  it: { name: 'Italian', nativeName: 'Italiano', dir: 'ltr', flag: '🇮🇹', script: 'Latn', tier: 2, intlLocale: 'it-IT' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr', flag: '🇳🇱', script: 'Latn', tier: 2, intlLocale: 'nl-NL' },
  ko: { name: 'Korean', nativeName: '한국어', dir: 'ltr', flag: '🇰🇷', script: 'Kore', tier: 2, intlLocale: 'ko-KR' },
  ru: { name: 'Russian', nativeName: 'Русский', dir: 'ltr', flag: '🇷🇺', script: 'Cyrl', tier: 2, intlLocale: 'ru-RU' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', flag: '🇹🇷', script: 'Latn', tier: 2, intlLocale: 'tr-TR' },
  pl: { name: 'Polish', nativeName: 'Polski', dir: 'ltr', flag: '🇵🇱', script: 'Latn', tier: 2, intlLocale: 'pl-PL' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', flag: '🇮🇩', script: 'Latn', tier: 2, intlLocale: 'id-ID' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr', flag: '🇻🇳', script: 'Latn', tier: 2, intlLocale: 'vi-VN' },
};

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function isSupportedLocale(code: string): code is SupportedLocale {
  return code in SUPPORTED_LOCALES;
}

export function isRtlLocale(locale: SupportedLocale): boolean {
  return SUPPORTED_LOCALES[locale]?.dir === 'rtl';
}

export function getLocaleConfig(locale: SupportedLocale): LocaleConfig {
  return SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en;
}
