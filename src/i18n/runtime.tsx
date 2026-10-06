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
  calculating: string;
  salaryWorthKicker: string;
  salaryWorthTitle: string;
  salaryWorthIntro: string;
  popularScenarios: string;
  chooseCity: string;
  annualSalary: string;
  calculate: string;
  salaryNeededKicker: string;
  salaryNeededTitlePrefix: string;
  salaryNeededTitleSuffix: string;
  salaryNeededIntro: string;
  targetLocation: string;
  monthlySavingsTarget: string;
  monthlySavingsHelp: string;
  salaryAfterTaxKicker: string;
  salaryAfterTaxTitle: string;
  salaryAfterTaxIntro: string;
  grossSalary: string;
  locationJurisdiction: string;
  taxYear: string;
  filingStatus: string;
  colKicker: string;
  colTitlePrefix: string;
  colTitleSuffix: string;
  colIntro: string;
  selectCity: string;
  customizeHousehold: string;
  verifiedData: string;
  compareKicker: string;
  compareTitle: string;
  compareIntro: string;
  displayIn: string;
  popularPairs: string;
  locationBaseline: string;
  locationTarget: string;
  selectCityA: string;
  selectCityB: string;
  jobOfferKicker: string;
  jobOfferTitle: string;
  jobOfferIntro: string;
  offerABaseline: string;
  offerBTarget: string;
  locationA: string;
  locationB: string;
  baseSalary: string;
  annualCashBonus: string;
  housingAllowance: string;
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
    calculating: 'Calculating…',
    salaryWorthKicker: 'Global Income & Living Intelligence',
    salaryWorthTitle: 'What is your salary really worth?',
    salaryWorthIntro: 'Enter your salary and city to see how much you could take home, spend and save.',
    popularScenarios: 'Popular Scenarios:',
    chooseCity: '1. Choose City / Location',
    annualSalary: '2. Annual Salary',
    calculate: 'Calculate',
    salaryNeededKicker: 'Reverse Financial Solver',
    salaryNeededTitlePrefix: 'How much do you need to earn in',
    salaryNeededTitleSuffix: '?',
    salaryNeededIntro: 'LivWorthy works backward through tax and living-cost engines to estimate the gross salary needed for your target savings.',
    targetLocation: 'Target Location',
    monthlySavingsTarget: 'Desired Monthly Savings Target',
    monthlySavingsHelp: 'How much you want to save every month after taxes and expenses.',
    salaryAfterTaxKicker: 'Precision Tax Calculator',
    salaryAfterTaxTitle: 'Salary After Tax Calculator',
    salaryAfterTaxIntro: 'Statutory breakdown of income tax and social contributions for supported jurisdictions.',
    grossSalary: 'Annual Gross Salary',
    locationJurisdiction: 'Location & Jurisdiction',
    taxYear: 'Tax Year',
    filingStatus: 'Filing Status',
    colKicker: 'Household Living Costs',
    colTitlePrefix: 'What would your household actually spend in',
    colTitleSuffix: '?',
    colIntro: 'Detailed local living-cost benchmarks with source dates and freshness disclosure.',
    selectCity: 'Select City',
    customizeHousehold: 'Customize Household & Bedrooms',
    verifiedData: 'Verified Data',
    compareKicker: 'Objective Location Intelligence',
    compareTitle: 'Compare Real Living Worth Between Cities',
    compareIntro: 'Compare two scenarios through the same tax, living-cost and currency framework.',
    displayIn: 'Display in:',
    popularPairs: 'Popular Pairs:',
    locationBaseline: 'Location A (Baseline)',
    locationTarget: 'Location B (Target)',
    selectCityA: 'Select City A',
    selectCityB: 'Select City B',
    jobOfferKicker: 'Compensation & Relocation Intelligence',
    jobOfferTitle: 'Job Offer & Relocation Comparison',
    jobOfferIntro: 'Separate spendable cash from benefits and compare first-year relocation costs with recurring disposable income.',
    offerABaseline: 'Job Offer A (Current / Baseline)',
    offerBTarget: 'Job Offer B (Target Opportunity)',
    locationA: 'Location A',
    locationB: 'Location B',
    baseSalary: 'Base Salary',
    annualCashBonus: 'Annual Cash Bonus',
    housingAllowance: 'Housing Allowance / Relocation Stipend (Annual)',
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
    calculating: 'Calculando…',
    salaryWorthKicker: 'Inteligencia global sobre ingresos y coste de vida',
    salaryWorthTitle: '¿Cuánto vale realmente tu salario?',
    salaryWorthIntro: 'Introduce tu salario y ciudad para ver cuánto podrías recibir, gastar y ahorrar.',
    popularScenarios: 'Escenarios populares:',
    chooseCity: '1. Elige ciudad / ubicación',
    annualSalary: '2. Salario anual',
    calculate: 'Calcular',
    salaryNeededKicker: 'Calculadora inversa',
    salaryNeededTitlePrefix: '¿Cuánto necesitas ganar en',
    salaryNeededTitleSuffix: '?',
    salaryNeededIntro: 'LivWorthy calcula hacia atrás con impuestos y coste de vida para estimar el salario bruto necesario para tu objetivo de ahorro.',
    targetLocation: 'Ubicación objetivo',
    monthlySavingsTarget: 'Objetivo de ahorro mensual',
    monthlySavingsHelp: 'Cuánto quieres ahorrar cada mes después de impuestos y gastos.',
    salaryAfterTaxKicker: 'Calculadora fiscal de precisión',
    salaryAfterTaxTitle: 'Calculadora de salario después de impuestos',
    salaryAfterTaxIntro: 'Desglose legal de impuestos y cotizaciones sociales para jurisdicciones compatibles.',
    grossSalary: 'Salario bruto anual',
    locationJurisdiction: 'Ubicación y jurisdicción',
    taxYear: 'Año fiscal',
    filingStatus: 'Estado de declaración',
    colKicker: 'Costes del hogar',
    colTitlePrefix: '¿Cuánto gastaría realmente tu hogar en',
    colTitleSuffix: '?',
    colIntro: 'Referencias locales de coste de vida con fechas de fuente y estado de actualización.',
    selectCity: 'Seleccionar ciudad',
    customizeHousehold: 'Personalizar hogar y dormitorios',
    verifiedData: 'Datos verificados',
    compareKicker: 'Inteligencia objetiva de ubicación',
    compareTitle: 'Compara el valor real de vivir entre ciudades',
    compareIntro: 'Compara dos escenarios con el mismo marco de impuestos, coste de vida y moneda.',
    displayIn: 'Mostrar en:',
    popularPairs: 'Comparaciones populares:',
    locationBaseline: 'Ubicación A (base)',
    locationTarget: 'Ubicación B (objetivo)',
    selectCityA: 'Seleccionar ciudad A',
    selectCityB: 'Seleccionar ciudad B',
    jobOfferKicker: 'Inteligencia de compensación y reubicación',
    jobOfferTitle: 'Comparación de ofertas y reubicación',
    jobOfferIntro: 'Separa efectivo y beneficios y compara costes iniciales de mudanza con ingreso disponible recurrente.',
    offerABaseline: 'Oferta A (actual / base)',
    offerBTarget: 'Oferta B (oportunidad objetivo)',
    locationA: 'Ubicación A',
    locationB: 'Ubicación B',
    baseSalary: 'Salario base',
    annualCashBonus: 'Bono anual en efectivo',
    housingAllowance: 'Ayuda de vivienda / reubicación (anual)',
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
    calculating: 'Calcul en cours…',
    salaryWorthKicker: 'Intelligence mondiale sur les revenus et le coût de la vie',
    salaryWorthTitle: 'Que vaut réellement votre salaire ?',
    salaryWorthIntro: 'Saisissez votre salaire et votre ville pour estimer revenu net, dépenses et épargne.',
    popularScenarios: 'Scénarios populaires :',
    chooseCity: '1. Choisir une ville / localisation',
    annualSalary: '2. Salaire annuel',
    calculate: 'Calculer',
    salaryNeededKicker: 'Calculateur financier inversé',
    salaryNeededTitlePrefix: 'Combien devez-vous gagner à',
    salaryNeededTitleSuffix: ' ?',
    salaryNeededIntro: 'LivWorthy remonte les calculs fiscaux et de coût de la vie pour estimer le salaire brut nécessaire à votre objectif d’épargne.',
    targetLocation: 'Localisation cible',
    monthlySavingsTarget: 'Objectif d’épargne mensuelle',
    monthlySavingsHelp: 'Montant à épargner chaque mois après impôts et dépenses.',
    salaryAfterTaxKicker: 'Calculateur fiscal de précision',
    salaryAfterTaxTitle: 'Calculateur de salaire après impôts',
    salaryAfterTaxIntro: 'Ventilation réglementaire des impôts et cotisations sociales pour les juridictions prises en charge.',
    grossSalary: 'Salaire brut annuel',
    locationJurisdiction: 'Localisation et juridiction',
    taxYear: 'Année fiscale',
    filingStatus: 'Situation fiscale',
    colKicker: 'Coût de vie du foyer',
    colTitlePrefix: 'Combien votre foyer dépenserait-il réellement à',
    colTitleSuffix: ' ?',
    colIntro: 'Références locales de coût de la vie avec dates de source et indication de fraîcheur.',
    selectCity: 'Choisir une ville',
    customizeHousehold: 'Personnaliser foyer et chambres',
    verifiedData: 'Données vérifiées',
    compareKicker: 'Intelligence objective de localisation',
    compareTitle: 'Comparer la valeur réelle entre les villes',
    compareIntro: 'Comparez deux scénarios avec le même cadre fiscal, de coût de la vie et de devise.',
    displayIn: 'Afficher en :',
    popularPairs: 'Paires populaires :',
    locationBaseline: 'Localisation A (référence)',
    locationTarget: 'Localisation B (cible)',
    selectCityA: 'Choisir la ville A',
    selectCityB: 'Choisir la ville B',
    jobOfferKicker: 'Intelligence rémunération et relocalisation',
    jobOfferTitle: 'Comparaison d’offres et de relocalisation',
    jobOfferIntro: 'Séparez l’argent disponible des avantages et comparez les coûts de relocalisation de la première année au revenu disponible récurrent.',
    offerABaseline: 'Offre A (actuelle / référence)',
    offerBTarget: 'Offre B (opportunité cible)',
    locationA: 'Localisation A',
    locationB: 'Localisation B',
    baseSalary: 'Salaire de base',
    annualCashBonus: 'Prime annuelle en espèces',
    housingAllowance: 'Allocation logement / relocalisation (annuelle)',
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
    calculating: 'جارٍ الحساب…',
    salaryWorthKicker: 'معلومات عالمية عن الدخل وتكلفة المعيشة',
    salaryWorthTitle: 'ما القيمة الحقيقية لراتبك؟',
    salaryWorthIntro: 'أدخل راتبك ومدينتك لمعرفة صافي الدخل والإنفاق والادخار المتوقع.',
    popularScenarios: 'سيناريوهات شائعة:',
    chooseCity: '1. اختر المدينة / الموقع',
    annualSalary: '2. الراتب السنوي',
    calculate: 'احسب',
    salaryNeededKicker: 'حاسبة مالية عكسية',
    salaryNeededTitlePrefix: 'كم تحتاج أن تكسب في',
    salaryNeededTitleSuffix: '؟',
    salaryNeededIntro: 'يعمل LivWorthy عكسيًا عبر الضرائب وتكلفة المعيشة لتقدير الراتب الإجمالي المطلوب لهدف الادخار.',
    targetLocation: 'الموقع المستهدف',
    monthlySavingsTarget: 'هدف الادخار الشهري',
    monthlySavingsHelp: 'المبلغ الذي تريد ادخاره كل شهر بعد الضرائب والمصروفات.',
    salaryAfterTaxKicker: 'حاسبة ضرائب دقيقة',
    salaryAfterTaxTitle: 'حاسبة الراتب بعد الضريبة',
    salaryAfterTaxIntro: 'تفصيل نظامي للضرائب والمساهمات الاجتماعية في الجهات المدعومة.',
    grossSalary: 'الراتب الإجمالي السنوي',
    locationJurisdiction: 'الموقع والاختصاص الضريبي',
    taxYear: 'السنة الضريبية',
    filingStatus: 'حالة الإقرار',
    colKicker: 'تكاليف معيشة الأسرة',
    colTitlePrefix: 'كم ستنفق أسرتك فعليًا في',
    colTitleSuffix: '؟',
    colIntro: 'بيانات محلية لتكلفة المعيشة مع تواريخ المصادر وحالة حداثتها.',
    selectCity: 'اختر المدينة',
    customizeHousehold: 'تخصيص الأسرة وغرف النوم',
    verifiedData: 'بيانات موثقة',
    compareKicker: 'معلومات موضوعية عن المواقع',
    compareTitle: 'قارن القيمة الحقيقية للمعيشة بين المدن',
    compareIntro: 'قارن سيناريوهين باستخدام نفس إطار الضرائب وتكلفة المعيشة والعملات.',
    displayIn: 'العرض بعملة:',
    popularPairs: 'مقارنات شائعة:',
    locationBaseline: 'الموقع أ (الأساس)',
    locationTarget: 'الموقع ب (الهدف)',
    selectCityA: 'اختر المدينة أ',
    selectCityB: 'اختر المدينة ب',
    jobOfferKicker: 'معلومات التعويض والانتقال',
    jobOfferTitle: 'مقارنة عروض العمل والانتقال',
    jobOfferIntro: 'افصل النقد المتاح عن المزايا وقارن تكاليف الانتقال في السنة الأولى بالدخل المتاح المتكرر.',
    offerABaseline: 'العرض أ (الحالي / الأساس)',
    offerBTarget: 'العرض ب (الفرصة المستهدفة)',
    locationA: 'الموقع أ',
    locationB: 'الموقع ب',
    baseSalary: 'الراتب الأساسي',
    annualCashBonus: 'المكافأة النقدية السنوية',
    housingAllowance: 'بدل السكن / الانتقال (سنوي)',
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
