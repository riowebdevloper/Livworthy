export type SupportedLocale = 'en' | 'es' | 'fr' | 'ar';

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
    flag: '🇪🇸',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    flag: '🇫🇷',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇦🇪',
  },
};

export interface Translations {
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

export const TRANSLATIONS: Record<SupportedLocale, Translations> = {
  en: {
    siteTitle: 'LivWorthy — Global Salary, Tax & Living Intelligence',
    siteTagline: 'Know what your income is really worth.',
    livingIntelligence: 'Living Intelligence',
    navHowItWorks: 'How It Works',
    navSources: 'Sources',
    navCoverage: 'Coverage',
    navRelocation: 'Relocation',
    navJobOfferComparison: 'Offer Evaluator',
    tabSalaryWorth: 'Is My Salary Enough?',
    tabSalaryNeeded: 'How Much Should I Earn?',
    tabSalaryAfterTax: 'Salary After Tax',
    tabCostOfLiving: 'Cost of Living',
    tabCompare: 'Compare Cities',
    tabJobOffers: 'Compare Job Offers',
    tabGuides: 'City Salary Guides',
    heroHeadline: 'What is your salary really worth?',
    heroSubheadline: 'Enter your salary and city to see how much you could take home, spend and save.',
    heroSupporting: 'See if your salary covers living costs and allows you to save in your chosen city.',
    popularScenarios: 'Popular Scenarios:',
    grossSalaryLabel: 'Annual Gross Salary',
    cityLabel: 'Target Location / City',
    householdLabel: 'Household Assumptions',
    householdSingle: 'Single Adult',
    householdCouple: 'Couple / Dual Income',
    householdFamily: 'Family (2 Adults, 1 Child)',
    rentOverrideLabel: 'Actual Monthly Rent Override',
    calculateCta: 'Calculate Take-Home & Living Worth',
    takeHomeSummaryTitle: 'Estimated Net Take-Home & Disposable Income',
    annualGrossLabel: 'Annual Gross Salary',
    annualTakeHomeLabel: 'Annual Take-Home Pay',
    monthlyTakeHomeLabel: 'Monthly Take-Home Pay',
    monthlyLivingCostsLabel: 'Monthly Living Costs',
    monthlyDisposableLabel: 'Monthly Disposable Income',
    monthlySavingsCapacityLabel: 'Realistic Monthly Savings',
    savingsRateLabel: 'Projected Savings Rate',
    financialDisclaimer: 'Calculations are deterministic estimations based on official statutory tax schedules and verified statistical benchmarks. Not formal tax or investment advice.',
    dataFreshnessBadge: 'Statutory 2026 Verified Tax Baseline',
    coverageNotice: 'Verified across 39 international markets with Tier-1 statutory revenue sources.',
  },
  es: {
    siteTitle: 'LivWorthy — Inteligencia Global de Salarios, Impuestos y Costo de Vida',
    siteTagline: 'Descubre el valor real de tus ingresos.',
    livingIntelligence: 'Inteligencia de Vida',
    navHowItWorks: 'Cómo Funciona',
    navSources: 'Fuentes',
    navCoverage: 'Cobertura',
    navRelocation: 'Reubicación',
    navJobOfferComparison: 'Evaluar Ofertas',
    tabSalaryWorth: '¿Alcanza Mi Salario?',
    tabSalaryNeeded: '¿Cuánto Debería Ganar?',
    tabSalaryAfterTax: 'Salario Neto tras Impuestos',
    tabCostOfLiving: 'Costo de Vida',
    tabCompare: 'Comparar Ciudades',
    tabJobOffers: 'Comparar Ofertas Laborales',
    tabGuides: 'Guías de Salario por Ciudad',
    heroHeadline: '¿Cuánto vale realmente tu salario?',
    heroSubheadline: 'Ingresa tu salario y ciudad para calcular tus ingresos netos, gastos mensuales y capacidad real de ahorro.',
    heroSupporting: 'Verifica si tu salario cubre el costo de vida y permite ahorrar en tu ciudad de destino.',
    popularScenarios: 'Escenarios Populares:',
    grossSalaryLabel: 'Salario Bruto Anual',
    cityLabel: 'Ubicación / Ciudad',
    householdLabel: 'Composición del Hogar',
    householdSingle: 'Adulto Soltero',
    householdCouple: 'Pareja / Dos Ingresos',
    householdFamily: 'Familia (2 Adultos, 1 Hijo)',
    rentOverrideLabel: 'Alquiler Mensual Personalizado',
    calculateCta: 'Calcular Salario Neto y Poder Adquisitivo',
    takeHomeSummaryTitle: 'Ingreso Neto Estimado y Saldo Disponible',
    annualGrossLabel: 'Salario Bruto Anual',
    annualTakeHomeLabel: 'Salario Neto Anual',
    monthlyTakeHomeLabel: 'Salario Neto Mensual',
    monthlyLivingCostsLabel: 'Gastos Mensuales de Vida',
    monthlyDisposableLabel: 'Ingreso Disponible Mensual',
    monthlySavingsCapacityLabel: 'Capacidad de Ahorro Mensual',
    savingsRateLabel: 'Tasa Proyectada de Ahorro',
    financialDisclaimer: 'Cálculos deterministas basados en normativas fiscales oficiales e índices estadísticos verificados. No constituye asesoramiento fiscal.',
    dataFreshnessBadge: 'Base Fiscal 2026 Verificada por Normativa',
    coverageNotice: 'Verificado en 39 mercados internacionales con fuentes gubernamentales de Nivel 1.',
  },
  fr: {
    siteTitle: 'LivWorthy — Intelligence Mondiale des Salaires, Impôts et Coût de la Vie',
    siteTagline: 'Connaître la valeur réelle de vos revenus.',
    livingIntelligence: 'Intelligence de Vie',
    navHowItWorks: 'Comment ça marche',
    navSources: 'Sources',
    navCoverage: 'Couverture',
    navRelocation: 'Expatriation',
    navJobOfferComparison: 'Évaluer les Offres',
    tabSalaryWorth: 'Mon Salaire Est-il Suffisant ?',
    tabSalaryNeeded: 'Combien Devrais-je Gagner ?',
    tabSalaryAfterTax: 'Salaire Net Après Impôt',
    tabCostOfLiving: 'Coût de la Vie',
    tabCompare: 'Comparer les Villes',
    tabJobOffers: 'Comparer les Offres d’Emploi',
    tabGuides: 'Guides des Salaires par Ville',
    heroHeadline: 'Que vaut réellement votre salaire ?',
    heroSubheadline: 'Indiquez votre salaire et votre ville pour calculer votre revenu net, vos dépenses et votre épargne réelle.',
    heroSupporting: 'Déterminez si votre salaire couvre le coût de la vie et vous permet d’épargner sereinement.',
    popularScenarios: 'Scénarios Fréquents :',
    grossSalaryLabel: 'Salaire Brut Annuel',
    cityLabel: 'Ville / Emplacement',
    householdLabel: 'Composition du Foyer',
    householdSingle: 'Célibataire',
    householdCouple: 'Couple / Bi-Actif',
    householdFamily: 'Famille (2 Adultes, 1 Enfant)',
    rentOverrideLabel: 'Loyer Mensuel Estimé / Réel',
    calculateCta: 'Calculer le Salaire Net et le Pouvoir d’Achat',
    takeHomeSummaryTitle: 'Revenu Net Estimé et Reste à Vivre',
    annualGrossLabel: 'Salaire Brut Annuel',
    annualTakeHomeLabel: 'Salaire Net Annuel',
    monthlyTakeHomeLabel: 'Salaire Net Mensuel',
    monthlyLivingCostsLabel: 'Coût de la Vie Mensuel',
    monthlyDisposableLabel: 'Reste à Vivre Mensuel',
    monthlySavingsCapacityLabel: 'Capacité d’Épargne Mensuelle',
    savingsRateLabel: 'Taux d’Épargne Estimé',
    financialDisclaimer: 'Calculs déterministes basés sur les barèmes fiscaux officiels et les statistiques publiques vérifiées. Ne constitue pas un conseil financier.',
    dataFreshnessBadge: 'Barèmes Fiscaux 2026 Vérifiés par les Textes',
    coverageNotice: 'Couverture vérifiée sur 39 marchés internationaux avec des sources officielles de rang 1.',
  },
  ar: {
    siteTitle: 'ليف وورثي — المنظومة العالمية للرواتب والضرائب وتكاليف المعيشة',
    siteTagline: 'اعرف القيمة الحقيقية لراتبك ودخلك الفعلي.',
    livingIntelligence: 'ذكاء المعيشة المالي',
    navHowItWorks: 'كيف يعمل',
    navSources: 'المصادر المعتمدة',
    navCoverage: 'تغطية الأسواق',
    navRelocation: 'الانتقال والهجرة',
    navJobOfferComparison: 'مقارنة عروض العمل',
    tabSalaryWorth: 'هل راتبي كافٍ في المدينة؟',
    tabSalaryNeeded: 'كم يجب أن أتقاضى للعيش بارتياح؟',
    tabSalaryAfterTax: 'الراتب الصافي بعد الضرائب',
    tabCostOfLiving: 'تكاليف المعيشة',
    tabCompare: 'مقارنة المدن',
    tabJobOffers: 'مقارنة عروض العمل',
    tabGuides: 'أدلة الرواتب بالمدن',
    heroHeadline: 'ما هي القيمة الفعلية لراتبك بعد الضرائب والمعيشة؟',
    heroSubheadline: 'أدخل راتبك والمدينة لمعرفة صافي الدخل والمصروفات الشهرية والقدرة الحقيقية على الادخار.',
    heroSupporting: 'اكتشف ما إذا كان راتبك يغطي نفقات المعيشة ويوفر لك فائضاً مالياً حقيقياً.',
    popularScenarios: 'سيناريوهات شائعة:',
    grossSalaryLabel: 'الراتب الإجمالي السنوي (قبل الضريبة)',
    cityLabel: 'المدينة المستهدفة',
    householdLabel: 'تركيبة الأسرة والمسكن',
    householdSingle: 'فرد واحد (أعزب)',
    householdCouple: 'زوجان (دخل مشترك)',
    householdFamily: 'أسرة (بالغان وطفل)',
    rentOverrideLabel: 'تعديل الإيجار الشهري الفعلي',
    calculateCta: 'حساب الراتب الصافي والقوة الشرائية',
    takeHomeSummaryTitle: 'صافي الدخل الشهري والفائض المالي المتاح',
    annualGrossLabel: 'الراتب الإجمالي السنوي',
    annualTakeHomeLabel: 'صافي الراتب السنوي',
    monthlyTakeHomeLabel: 'صافي الراتب الشهري',
    monthlyLivingCostsLabel: 'تكاليف المعيشة الشهرية',
    monthlyDisposableLabel: 'الدخل المتاح بعد النفقات',
    monthlySavingsCapacityLabel: 'الادخار الشهري المتوقع',
    savingsRateLabel: 'معدل الادخار التقديري',
    financialDisclaimer: 'حسابات حتمية موثوقة تستند إلى جداول الضرائب الرسمية وبيانات الإحصاء الحكومية المعتمدة. لا تعد استشارة ضريبية خاصة.',
    dataFreshnessBadge: 'قواعد ضريبية معتمدة رسمياً لعام 2026',
    coverageNotice: 'تغطية رسمية لـ 39 سوقاً تجارياً استناداً إلى مصادر حكومية من الدرجة الأولى.',
  },
};

export const LOCALE_STORAGE_KEY = 'livworthy_preferred_locale';

export function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  
  // Check pathname first (e.g. /es, /fr, /ar)
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith('/es')) return 'es';
  if (path.startsWith('/fr')) return 'fr';
  if (path.startsWith('/ar')) return 'ar';
  if (path.startsWith('/en')) return 'en';

  // Check URL query param ?lang=es
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang')?.toLowerCase() as SupportedLocale | undefined;
  if (langParam && SUPPORTED_LOCALES[langParam]) {
    return langParam;
  }

  // Check stored preference
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale | null;
    if (stored && SUPPORTED_LOCALES[stored]) {
      return stored;
    }
  } catch {
    // ignore localStorage error
  }

  // Fallback to browser language if Spanish, French, or Arabic
  const navLang = navigator.language.slice(0, 2).toLowerCase();
  if (navLang === 'es') return 'es';
  if (navLang === 'fr') return 'fr';
  if (navLang === 'ar') return 'ar';

  return 'en';
}

export function setStoredLocale(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = SUPPORTED_LOCALES[locale].dir;
  } catch {
    // ignore storage errors
  }
}
