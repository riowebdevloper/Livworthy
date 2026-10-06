import React from 'react';

export type RuntimeLocale = 'en' | 'es' | 'fr' | 'ar';

type RuntimeMessages = {
  howItWorks: string;
  sources: string;
  salaryWorth: string;
  salaryNeeded: string;
  salaryAfterTax: string;
  livingCosts: string;
  compareCities: string;
  compareOffers: string;
  guide: string;
  language: string;
};

const MESSAGES: Record<RuntimeLocale, RuntimeMessages> = {
  en: {
    howItWorks: 'How It Works',
    sources: 'Sources',
    salaryWorth: 'Is My Salary Enough?',
    salaryNeeded: 'How Much Should I Earn?',
    salaryAfterTax: 'Salary After Tax',
    livingCosts: 'Living Costs',
    compareCities: 'Compare Cities',
    compareOffers: 'Compare Job Offers',
    guide: '$100K in NYC Guide',
    language: 'Language',
  },
  es: {
    howItWorks: 'Cómo funciona',
    sources: 'Fuentes',
    salaryWorth: '¿Mi salario es suficiente?',
    salaryNeeded: '¿Cuánto debería ganar?',
    salaryAfterTax: 'Salario después de impuestos',
    livingCosts: 'Coste de vida',
    compareCities: 'Comparar ciudades',
    compareOffers: 'Comparar ofertas',
    guide: 'Guía de $100K en NYC',
    language: 'Idioma',
  },
  fr: {
    howItWorks: 'Fonctionnement',
    sources: 'Sources',
    salaryWorth: 'Mon salaire est-il suffisant ?',
    salaryNeeded: 'Combien devrais-je gagner ?',
    salaryAfterTax: 'Salaire après impôts',
    livingCosts: 'Coût de la vie',
    compareCities: 'Comparer les villes',
    compareOffers: 'Comparer les offres',
    guide: 'Guide 100K$ à NYC',
    language: 'Langue',
  },
  ar: {
    howItWorks: 'كيف يعمل',
    sources: 'المصادر',
    salaryWorth: 'هل راتبي كافٍ؟',
    salaryNeeded: 'كم يجب أن أكسب؟',
    salaryAfterTax: 'الراتب بعد الضريبة',
    livingCosts: 'تكلفة المعيشة',
    compareCities: 'مقارنة المدن',
    compareOffers: 'مقارنة عروض العمل',
    guide: 'دليل 100 ألف دولار في نيويورك',
    language: 'اللغة',
  },
};

const LocaleContext = React.createContext<{
  locale: RuntimeLocale;
  messages: RuntimeMessages;
  setLocale: (locale: RuntimeLocale) => void;
}>({
  locale: 'en',
  messages: MESSAGES.en,
  setLocale: () => {},
});

function readInitialLocale(): RuntimeLocale {
  if (typeof window === 'undefined') return 'en';
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (fromQuery === 'en' || fromQuery === 'es' || fromQuery === 'fr' || fromQuery === 'ar') return fromQuery;
  const stored = window.localStorage.getItem('livworthy_locale');
  if (stored === 'en' || stored === 'es' || stored === 'fr' || stored === 'ar') return stored;
  return 'en';
}

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = React.useState<RuntimeLocale>(readInitialLocale);

  const setLocale = React.useCallback((next: RuntimeLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem('livworthy_locale', next);
      const params = new URLSearchParams(window.location.search);
      params.set('lang', next);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    } catch {}
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, messages: MESSAGES[locale], setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export function useLocale() {
  return React.useContext(LocaleContext);
}
