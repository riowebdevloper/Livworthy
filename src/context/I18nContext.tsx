import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  DEFAULT_LOCALE,
  DICTIONARIES,
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  getDictionary,
  getInitialLocale,
  getLocaleConfig,
  interpolate,
  isRtlLocale,
  isSupportedLocale,
  LOCALE_STORAGE_KEY,
  setStoredLocale,
  SupportedLocale,
  TIER_1_LOCALES,
  I18nDictionary,
  LocaleConfig,
} from '../lib/i18n';
import { CurrencyCode, Money } from '../types/money';

interface I18nContextType {
  locale: SupportedLocale;
  dict: I18nDictionary;
  config: LocaleConfig;
  dir: 'ltr' | 'rtl';
  isRtl: boolean;
  setLocale: (newLocale: SupportedLocale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (money: Money, options?: { hideDecimals?: boolean; compact?: boolean }) => string;
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  suggestedLocale: SupportedLocale | null;
  dismissSuggestion: () => void;
  acceptSuggestion: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const SUGGESTION_DISMISSED_KEY = 'livworthy_lang_suggestion_dismissed';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(getInitialLocale);
  const [suggestedLocale, setSuggestedLocale] = useState<SupportedLocale | null>(null);

  const dict = useMemo(() => getDictionary(locale), [locale]);
  const config = useMemo(() => getLocaleConfig(locale), [locale]);
  const dir = config.dir;
  const isRtl = dir === 'rtl';

  // Synchronize <html> attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  // Check browser suggestion on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const dismissed = sessionStorage.getItem(SUGGESTION_DISMISSED_KEY);
      if (dismissed) return;

      const browserPrimary = (navigator.language || '').slice(0, 2).toLowerCase() as SupportedLocale;
      if (isSupportedLocale(browserPrimary) && browserPrimary !== locale) {
        setSuggestedLocale(browserPrimary);
      }
    } catch {}
  }, [locale]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (!isSupportedLocale(newLocale)) return;
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
    setSuggestedLocale(null);

    // Update URL route while preserving current pathname and search params
    if (typeof window !== 'undefined') {
      try {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const segments = currentPath.split('/').filter(Boolean);

        // Check if current path already has a locale prefix
        let restPath = currentPath;
        if (segments.length > 0 && isSupportedLocale(segments[0])) {
          restPath = '/' + segments.slice(1).join('/');
        }

        // Construct new URL: if newLocale is 'en', we can route to / or /en
        // For crawlable routes: prefix non-empty path with newLocale
        let newPath = '';
        if (newLocale === DEFAULT_LOCALE && (restPath === '' || restPath === '/')) {
          newPath = '/';
        } else {
          newPath = `/${newLocale}${restPath === '/' ? '' : restPath}`;
        }

        const params = new URLSearchParams(currentSearch);
        params.set('lang', newLocale);

        const targetUrl = `${newPath}?${params.toString()}`;
        window.history.pushState(null, '', targetUrl);
      } catch {}
    }
  }, []);

  const dismissSuggestion = useCallback(() => {
    setSuggestedLocale(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SUGGESTION_DISMISSED_KEY, '1');
      } catch {}
    }
  }, []);

  const acceptSuggestion = useCallback(() => {
    if (suggestedLocale) {
      setLocale(suggestedLocale);
    }
  }, [suggestedLocale, setLocale]);

  // Nested property lookup via dot notation: e.g. "calculator.chooseCity"
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      let current: any = dict;

      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          // Fallback to English dictionary
          let fallback: any = DICTIONARIES.en;
          for (const fbKey of keys) {
            if (fallback && typeof fallback === 'object' && fbKey in fallback) {
              fallback = fallback[fbKey];
            } else {
              return path; // Key completely missing
            }
          }
          current = fallback;
          break;
        }
      }

      if (typeof current === 'string') {
        return interpolate(current, params);
      }
      return path;
    },
    [dict]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return formatLocalizedNumber(value, locale, options);
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (money: Money, options?: { hideDecimals?: boolean; compact?: boolean }) => {
      return formatLocalizedCurrency(money, locale, options);
    },
    [locale]
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      return formatLocalizedDate(date, locale, options);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      dict,
      config,
      dir,
      isRtl,
      setLocale,
      t,
      formatNumber,
      formatCurrency,
      formatDate,
      suggestedLocale,
      dismissSuggestion,
      acceptSuggestion,
    }),
    [
      locale,
      dict,
      config,
      dir,
      isRtl,
      setLocale,
      t,
      formatNumber,
      formatCurrency,
      formatDate,
      suggestedLocale,
      dismissSuggestion,
      acceptSuggestion,
    ]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Provide a resilient fallback for tests or components rendered outside provider
    const fallbackLocale = DEFAULT_LOCALE;
    const fallbackDict = DICTIONARIES.en;
    const fallbackConfig = getLocaleConfig(fallbackLocale);
    return {
      locale: fallbackLocale,
      dict: fallbackDict,
      config: fallbackConfig,
      dir: 'ltr',
      isRtl: false,
      setLocale: () => {},
      t: (path: string, params?: Record<string, string | number>) => {
        const keys = path.split('.');
        let current: any = fallbackDict;
        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k];
          } else {
            return path;
          }
        }
        return typeof current === 'string' ? interpolate(current, params) : path;
      },
      formatNumber: (val: number, opts?: Intl.NumberFormatOptions) =>
        formatLocalizedNumber(val, fallbackLocale, opts),
      formatCurrency: (money: Money, opts?: { hideDecimals?: boolean; compact?: boolean }) =>
        formatLocalizedCurrency(money, fallbackLocale, opts),
      formatDate: (d: Date | string | number, opts?: Intl.DateTimeFormatOptions) =>
        formatLocalizedDate(d, fallbackLocale, opts),
      suggestedLocale: null,
      dismissSuggestion: () => {},
      acceptSuggestion: () => {},
    };
  }
  return context;
}
