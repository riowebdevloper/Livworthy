export type LivWorthyLocale = 'en' | 'es' | 'fr' | 'ar';

export interface LocalizedHubContent {
  locale: LivWorthyLocale;
  languageName: string;
  direction: 'ltr' | 'rtl';
  title: string;
  description: string;
  kicker: string;
  h1: string;
  intro: string;
  trustTitle: string;
  trustBody: string;
  calculatorTitle: string;
  calculators: Array<{ label: string; tab: string; description: string }>;
  exploreTitle: string;
  exploreBody: string;
  countriesLabel: string;
  citiesLabel: string;
  guidesLabel: string;
  methodologyLabel: string;
  sourcesLabel: string;
  languageLabel: string;
}

export const LOCALIZED_HUBS: Record<LivWorthyLocale, LocalizedHubContent> = {
  en: {
    locale: 'en',
    languageName: 'English',
    direction: 'ltr',
    title: 'LivWorthy Global Salary, Tax & Cost of Living Intelligence',
    description: 'Compare salary value, after-tax income, living costs, savings capacity and relocation economics across global markets.',
    kicker: 'Global Income & Living Intelligence',
    h1: 'Know what your income is really worth.',
    intro: 'LivWorthy combines deterministic tax calculations, local living-cost benchmarks and cross-border salary comparisons so you can judge a job offer or relocation decision with transparent assumptions.',
    trustTitle: 'Verified calculations, explicit limits',
    trustBody: 'Financial calculations use versioned statutory tax rules and source-backed cost benchmarks. When a jurisdiction or future tax year is not verified, LivWorthy shows that limitation instead of inventing a result.',
    calculatorTitle: 'Start with a calculator',
    calculators: [
      { label: 'Is My Salary Enough?', tab: 'salary-worth', description: 'See take-home pay, living costs and savings capacity.' },
      { label: 'How Much Should I Earn?', tab: 'salary-needed', description: 'Work backward from your lifestyle and savings target.' },
      { label: 'Salary After Tax', tab: 'salary-after-tax', description: 'Estimate statutory net income for supported jurisdictions.' },
      { label: 'Compare Cities', tab: 'compare', description: 'Compare purchasing power across two cities.' },
      { label: 'Compare Job Offers', tab: 'job-offers', description: 'Evaluate offers across currencies and locations.' },
    ],
    exploreTitle: 'Explore the global dataset',
    exploreBody: 'Browse country, city and salary-guide pages to inspect supported markets, evidence and calculation coverage.',
    countriesLabel: 'Countries',
    citiesLabel: 'Cities',
    guidesLabel: 'Salary Guides',
    methodologyLabel: 'Methodology',
    sourcesLabel: 'Sources',
    languageLabel: 'Language',
  },
  es: {
    locale: 'es',
    languageName: 'Español',
    direction: 'ltr',
    title: 'LivWorthy — Salario, impuestos y coste de vida internacional',
    description: 'Compara salario neto, impuestos, coste de vida, capacidad de ahorro y decisiones de reubicación entre mercados internacionales.',
    kicker: 'Inteligencia global sobre ingresos y coste de vida',
    h1: 'Descubre cuánto vale realmente tu salario.',
    intro: 'LivWorthy combina cálculos fiscales deterministas, referencias locales de coste de vida y comparaciones salariales internacionales para evaluar ofertas de trabajo y decisiones de mudanza con supuestos transparentes.',
    trustTitle: 'Cálculos verificados y límites explícitos',
    trustBody: 'Los cálculos financieros utilizan reglas fiscales versionadas y datos de coste de vida respaldados por fuentes. Si una jurisdicción o un año fiscal futuro no está verificado, LivWorthy lo indica en lugar de inventar un resultado.',
    calculatorTitle: 'Empieza con una calculadora',
    calculators: [
      { label: '¿Mi salario es suficiente?', tab: 'salary-worth', description: 'Consulta salario neto, gastos y capacidad de ahorro.' },
      { label: '¿Cuánto debería ganar?', tab: 'salary-needed', description: 'Calcula el salario necesario según tu estilo de vida y ahorro.' },
      { label: 'Salario después de impuestos', tab: 'salary-after-tax', description: 'Estima ingresos netos legales en jurisdicciones compatibles.' },
      { label: 'Comparar ciudades', tab: 'compare', description: 'Compara poder adquisitivo entre dos ciudades.' },
      { label: 'Comparar ofertas de empleo', tab: 'job-offers', description: 'Evalúa ofertas entre monedas y ubicaciones.' },
    ],
    exploreTitle: 'Explora los datos globales',
    exploreBody: 'Consulta países, ciudades y guías salariales para revisar mercados, fuentes y cobertura de cálculo.',
    countriesLabel: 'Países',
    citiesLabel: 'Ciudades',
    guidesLabel: 'Guías salariales',
    methodologyLabel: 'Metodología',
    sourcesLabel: 'Fuentes',
    languageLabel: 'Idioma',
  },
  fr: {
    locale: 'fr',
    languageName: 'Français',
    direction: 'ltr',
    title: 'LivWorthy — Salaire, fiscalité et coût de la vie à l’international',
    description: 'Comparez revenu net, fiscalité, coût de la vie, capacité d’épargne et économie d’une relocalisation entre marchés internationaux.',
    kicker: 'Intelligence mondiale sur les revenus et le coût de la vie',
    h1: 'Découvrez ce que vaut réellement votre salaire.',
    intro: 'LivWorthy associe des calculs fiscaux déterministes, des références locales de coût de la vie et des comparaisons salariales internationales pour évaluer une offre ou une relocalisation avec des hypothèses transparentes.',
    trustTitle: 'Calculs vérifiés, limites explicites',
    trustBody: 'Les calculs financiers utilisent des règles fiscales versionnées et des données de coût de la vie sourcées. Lorsqu’une juridiction ou une année fiscale future n’est pas vérifiée, LivWorthy l’indique au lieu d’inventer un résultat.',
    calculatorTitle: 'Commencer avec un calculateur',
    calculators: [
      { label: 'Mon salaire est-il suffisant ?', tab: 'salary-worth', description: 'Analysez revenu net, dépenses et capacité d’épargne.' },
      { label: 'Combien devrais-je gagner ?', tab: 'salary-needed', description: 'Calculez le salaire requis selon votre mode de vie et votre objectif d’épargne.' },
      { label: 'Salaire après impôts', tab: 'salary-after-tax', description: 'Estimez le revenu net légal dans les juridictions prises en charge.' },
      { label: 'Comparer des villes', tab: 'compare', description: 'Comparez le pouvoir d’achat de deux villes.' },
      { label: 'Comparer des offres d’emploi', tab: 'job-offers', description: 'Évaluez des offres entre devises et lieux.' },
    ],
    exploreTitle: 'Explorer les données mondiales',
    exploreBody: 'Parcourez les pays, villes et guides salariaux pour consulter les marchés, les sources et la couverture des calculs.',
    countriesLabel: 'Pays',
    citiesLabel: 'Villes',
    guidesLabel: 'Guides salariaux',
    methodologyLabel: 'Méthodologie',
    sourcesLabel: 'Sources',
    languageLabel: 'Langue',
  },
  ar: {
    locale: 'ar',
    languageName: 'العربية',
    direction: 'rtl',
    title: 'LivWorthy — الرواتب والضرائب وتكلفة المعيشة عالميًا',
    description: 'قارن صافي الراتب والضرائب وتكلفة المعيشة والقدرة على الادخار والانتقال بين الأسواق العالمية.',
    kicker: 'معلومات عالمية عن الدخل وتكلفة المعيشة',
    h1: 'اعرف القيمة الحقيقية لراتبك.',
    intro: 'يجمع LivWorthy بين حسابات ضريبية حتمية وبيانات محلية لتكلفة المعيشة ومقارنات رواتب دولية لمساعدتك على تقييم عرض عمل أو قرار انتقال بافتراضات واضحة.',
    trustTitle: 'حسابات موثقة وحدود واضحة',
    trustBody: 'تستخدم الحسابات المالية قواعد ضريبية محددة الإصدار وبيانات تكلفة معيشة مدعومة بمصادر. إذا لم تكن الولاية أو السنة الضريبية المستقبلية موثقة، يعرض LivWorthy هذا القيد بدلًا من اختلاق نتيجة.',
    calculatorTitle: 'ابدأ بأداة حساب',
    calculators: [
      { label: 'هل راتبي كافٍ؟', tab: 'salary-worth', description: 'اعرض صافي الدخل وتكاليف المعيشة والقدرة على الادخار.' },
      { label: 'كم يجب أن أكسب؟', tab: 'salary-needed', description: 'احسب الراتب المطلوب حسب نمط حياتك وهدف الادخار.' },
      { label: 'الراتب بعد الضريبة', tab: 'salary-after-tax', description: 'قدّر صافي الدخل النظامي في الجهات المدعومة.' },
      { label: 'مقارنة المدن', tab: 'compare', description: 'قارن القوة الشرائية بين مدينتين.' },
      { label: 'مقارنة عروض العمل', tab: 'job-offers', description: 'قيّم العروض بين العملات والمواقع المختلفة.' },
    ],
    exploreTitle: 'استكشف البيانات العالمية',
    exploreBody: 'تصفح صفحات الدول والمدن وأدلة الرواتب لمراجعة الأسواق والمصادر ونطاق التغطية.',
    countriesLabel: 'الدول',
    citiesLabel: 'المدن',
    guidesLabel: 'أدلة الرواتب',
    methodologyLabel: 'المنهجية',
    sourcesLabel: 'المصادر',
    languageLabel: 'اللغة',
  },
};

export const LIVWORTHY_LOCALES: LivWorthyLocale[] = ['en', 'es', 'fr', 'ar'];
