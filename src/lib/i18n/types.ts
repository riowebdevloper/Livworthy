import { CurrencyCode } from '../../types/money';

export type Tier1Locale =
  | 'en'
  | 'es'
  | 'fr'
  | 'ar'
  | 'de'
  | 'pt'
  | 'hi'
  | 'ur'
  | 'zh'
  | 'ja';

export type SupportedLocale = Tier1Locale;

export type TextDirection = 'ltr' | 'rtl';

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: TextDirection;
  flag: string;
  script: string;
  tier: 1 | 2 | 3;
  intlLocale: string;
}

export interface I18nCommonTranslations {
  brand: string;
  tagline: string;
  livingIntelligence: string;
  calculating: string;
  calculate: string;
  annual: string;
  monthly: string;
  year: string;
  month: string;
  share: string;
  copied: string;
  home: string;
  back: string;
  next: string;
  close: string;
  disclaimer: string;
  verifiedTaxBaseline: string;
  tier1SourcesBadge: string;
  singleAdult: string;
  couple: string;
  family: string;
  action: string;
  evidence: string;
  methodology: string;
  diagnostics: string;
}

export interface I18nNavTranslations {
  howItWorks: string;
  sources: string;
  coverage: string;
  relocation: string;
  jobOfferComparison: string;
  reports: string;
  guides: string;
  compare: string;
  tabSalaryWorth: string;
  tabSalaryNeeded: string;
  tabSalaryAfterTax: string;
  tabCostOfLiving: string;
  tabCompare: string;
  tabJobOffers: string;
  tabGuides: string;
}

export interface I18nCalculatorTranslations {
  chooseCity: string;
  annualSalary: string;
  salaryHelp: string;
  statutoryJurisdiction: string;
  popularScenarios: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroSupporting: string;
  householdType: string;
  rentOverride: string;
  rentOverridePlaceholder: string;
  rentOverrideHelp: string;
  taxYearLabel: string;
  filingStatusLabel: string;
  dependentsLabel: string;
  btnCalculate: string;
  quickScenarios: {
    nyc100k: string;
    london60k: string;
    dubai300k: string;
    toronto90k: string;
  };
}

export interface I18nResultsTranslations {
  summaryTitle: string;
  annualGross: string;
  annualTakeHome: string;
  monthlyTakeHome: string;
  monthlyLivingCosts: string;
  monthlyDisposable: string;
  savingsCapacity: string;
  savingsRate: string;
  effectiveTaxRate: string;
  housingBurden: string;
  taxesAndDeductions: string;
  essentialLiving: string;
  discretionaryLiving: string;
  spendableSurplus: string;
  deficitWarning: string;
  healthySurplus: string;
  taxPending: string;
  shareSummaryTitle: string;
  estimatedLivingCosts: string;
  benchmarkContext: string;
  customizeAssumptions: string;
}

export interface I18nSalaryNeededTranslations {
  headline: string;
  subheadline: string;
  targetSavings: string;
  desiredLifestyle: string;
  requiredGross: string;
  requiredNet: string;
  calculatedGrossSalary: string;
  explorePlan: string;
}

export interface I18nSalaryAfterTaxTranslations {
  headline: string;
  subheadline: string;
  federalTax: string;
  stateLocalTax: string;
  socialSecurity: string;
  medicare: string;
  totalDeductions: string;
  netTakeHome: string;
  effectiveTaxNote: string;
}

export interface I18nCostOfLivingTranslations {
  headline: string;
  subheadline: string;
  housingRent: string;
  groceriesFood: string;
  diningOut: string;
  utilitiesInternet: string;
  publicTransit: string;
  totalMonthlyLiving: string;
  householdTypeSelect: string;
}

export interface I18nCompareTranslations {
  headline: string;
  subheadline: string;
  cityA: string;
  cityB: string;
  salaryA: string;
  equivalentSalary: string;
  purchasingPowerDelta: string;
  verdictLabel: string;
}

export interface I18nJobOffersTranslations {
  headline: string;
  subheadline: string;
  offerA: string;
  offerB: string;
  offerVerdict: string;
  higherRealIncome: string;
}

export interface I18nErrorsTranslations {
  TAX_CALCULATION_UNAVAILABLE: string;
  INVALID_SALARY: string;
  CITY_NOT_SUPPORTED: string;
  DATA_STALE: string;
  FX_UNAVAILABLE: string;
  NETWORK_ERROR: string;
}

export interface I18nFooterTranslations {
  aboutDesc: string;
  calculatorsTitle: string;
  intelligenceTitle: string;
  institutionalTitle: string;
  cityComparisons: string;
  empiricalReports: string;
  editorialPolicy: string;
  dataPolicy: string;
  corrections: string;
  terms: string;
  privacy: string;
  copyright: string;
}

export interface I18nLanguageSelectorTranslations {
  title: string;
  searchPlaceholder: string;
  currentLanguage: string;
  switchSuggestion: string;
  switchCta: string;
  dismiss: string;
  allLanguages: string;
}

export interface I18nReportsTranslations {
  hubTitle: string;
  hubSubtitle: string;
  instituteBadge: string;
  modelBadge: string;
  globalSalaryWorthTitle: string;
  purchasingPowerTitle: string;
  salaryToRentTitle: string;
  relocationGapTitle: string;
  takeHomePayTitle: string;
  downloadCsv: string;
  downloadJson: string;
  methodologyHeading: string;
  sourcesHeading: string;
  citationHeading: string;
}

export interface I18nDictionary {
  locale: SupportedLocale;
  common: I18nCommonTranslations;
  nav: I18nNavTranslations;
  calculator: I18nCalculatorTranslations;
  results: I18nResultsTranslations;
  salaryNeeded: I18nSalaryNeededTranslations;
  salaryAfterTax: I18nSalaryAfterTaxTranslations;
  costOfLiving: I18nCostOfLivingTranslations;
  compare: I18nCompareTranslations;
  jobOffers: I18nJobOffersTranslations;
  errors: I18nErrorsTranslations;
  footer: I18nFooterTranslations;
  languageSelector: I18nLanguageSelectorTranslations;
  reports: I18nReportsTranslations;
}
