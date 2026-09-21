import { CurrencyCode } from '../types/money';

export interface SalaryGuide {
  slug: string;
  title: string;
  cityId: string;
  countryId: string;
  salaryMajor: number;
  currency: CurrencyCode;
  headlineSummary: string;
  lifestyleContext: string;
  benchmarkContext: string;
}

export const SALARY_GUIDES: Record<string, SalaryGuide> = {
  'nyc-100k': {
    slug: 'nyc-100k',
    title: 'Is $100K a Good Salary in New York City?',
    cityId: 'nyc',
    countryId: 'US',
    salaryMajor: 100_000,
    currency: 'USD',
    headlineSummary: 'For a single earner living independently in a typical 1-bedroom apartment, $100,000 is a viable, moderate salary in New York City.',
    lifestyleContext: 'Yields approximately $5,843/month in net take-home after federal, NYS, and NYC resident income taxes. After median housing, food, and MTA transit, you retain ~$1,521/month in discretionary savings.',
    benchmarkContext: 'Exceeds the median individual worker earnings in NYC (~$65,000) while positioning earners comfortably above essential baseline expenses.',
  },
  'sf-150k': {
    slug: 'sf-150k',
    title: 'Is $150K a Good Salary in San Francisco?',
    cityId: 'sf',
    countryId: 'US',
    salaryMajor: 150_000,
    currency: 'USD',
    headlineSummary: 'In the high-cost San Francisco Bay Area, $150,000 provides a comfortable living standard for single professionals.',
    lifestyleContext: 'Yields roughly $8,600/month after California and federal taxes. After rent in popular neighborhoods (~$2,900) and tech hub living costs, monthly surplus remains strong (~$3,200).',
    benchmarkContext: 'Aligned with mid-level tech compensation while well above the citywide individual median.',
  },
  'london-75k': {
    slug: 'london-75k',
    title: 'Is £75K a Good Salary in London?',
    cityId: 'london',
    countryId: 'GB',
    salaryMajor: 75_000,
    currency: 'GBP',
    headlineSummary: 'A £75,000 annual salary puts you in the top 10% of individual income earners in London.',
    lifestyleContext: 'Results in approximately £4,505/month net pay under HMRC PAYE and NI Class 1. After typical Zone 2 rent (£1,950), TfL transit, and council tax, discretionary savings average ~£1,340/month.',
    benchmarkContext: 'More than 70% higher than the London median full-time wage (~£44,000), affording good financial flexibility.',
  },
  'dubai-300k': {
    slug: 'dubai-300k',
    title: 'Is 300K AED a Good Salary in Dubai?',
    cityId: 'dubai',
    countryId: 'AE',
    salaryMajor: 300_000,
    currency: 'AED',
    headlineSummary: 'With 0% statutory personal income tax, 300,000 AED/year (25,000 AED/month) offers an exceptional quality of life in Dubai.',
    lifestyleContext: 'Full 25,000 AED remains 100% tax-free. After comfortable modern accommodation (7,500 AED), utilities, car leasing, and lifestyle dining, monthly uncommitted savings exceed 10,000 AED.',
    benchmarkContext: 'Represents a senior managerial or professional tier package in the UAE corporate landscape.',
  },
  'toronto-100k': {
    slug: 'toronto-100k',
    title: 'Is CA$100K a Good Salary in Toronto?',
    cityId: 'toronto',
    countryId: 'CA',
    salaryMajor: 100_000,
    currency: 'CAD',
    headlineSummary: 'CA$100,000 is a solid above-average milestone in the Greater Toronto Area.',
    lifestyleContext: 'Delivers approximately CA$6,150/month take-home under CRA federal and Ontario tax tables. After 1-bedroom downtown rent (~CA$2,400) and TTC transit, single earners retain ~CA$1,850/month.',
    benchmarkContext: 'Sits substantially above Ontario median individual income (~CA$58,000), though homeownership requires dual income.',
  },
  'sydney-120k': {
    slug: 'sydney-120k',
    title: 'Is A$120K a Good Salary in Sydney?',
    cityId: 'sydney',
    countryId: 'AU',
    salaryMajor: 120_000,
    currency: 'AUD',
    headlineSummary: 'A$120,000 is an upper-middle income in Australia, offering solid financial comfort in Sydney.',
    lifestyleContext: 'Generates roughly A$7,340/month net after ATO revised Stage 3 tax and Medicare levy. After typical Eastern Suburbs or Inner West rent (~A$2,800/mo) and Opal transit, monthly surplus is ~A$2,200.',
    benchmarkContext: 'Significantly higher than national full-time average wage (~A$98,000).',
  },
  'berlin-80k': {
    slug: 'berlin-80k',
    title: 'Is €80K a Good Salary in Berlin?',
    cityId: 'berlin',
    countryId: 'DE',
    salaryMajor: 80_000,
    currency: 'EUR',
    headlineSummary: '€80,000 per year is an excellent upper-tier professional salary in Berlin.',
    lifestyleContext: 'Produces approximately €4,050/month net under Tax Class 1 after German statutory income tax and full social insurance (health, pension, unemployment, nursing). With Berlin rent (~€1,400), savings exceed €1,500/month.',
    benchmarkContext: 'Far above the Berlin median wage (~€48,000), offering high purchasing power and cultural lifestyle flexibility.',
  },
  'singapore-120k': {
    slug: 'singapore-120k',
    title: 'Is S$120K a Good Salary in Singapore?',
    cityId: 'singapore',
    countryId: 'SG',
    salaryMajor: 120_000,
    currency: 'SGD',
    headlineSummary: 'Due to Singapore’s ultra-low progressive tax brackets, S$120,000 per year delivers massive take-home pay.',
    lifestyleContext: 'Effective IRAS tax is only ~6.5%, leaving over S$9,350/month. After condo rental (~S$3,600) and MRT transit, single professionals retain over S$3,500/month in net savings.',
    benchmarkContext: 'Well above Singapore median resident monthly income (~S$5,200), providing premier expatriate living standards.',
  },
  'mumbai-25lakh': {
    slug: 'mumbai-25lakh',
    title: 'Is ₹25 Lakh a Good Salary in Mumbai?',
    cityId: 'mumbai',
    countryId: 'IN',
    salaryMajor: 2_500_000,
    currency: 'INR',
    headlineSummary: '₹25,00,000 annually places an earner in the top 3% of income earners in urban India.',
    lifestyleContext: 'Under Section 115BAC New Tax Regime, monthly take-home is roughly ₹1,68,000. In prime Western Suburbs or Navi Mumbai, rent (₹45,000) and living expenses leave upwards of ₹85,000/month for long-term investments.',
    benchmarkContext: 'Substantially above typical corporate starting brackets, supporting domestic help, private healthcare, and international travel.',
  },
  'zurich-130k': {
    slug: 'zurich-130k',
    title: 'Is CHF 130K a Good Salary in Zurich?',
    cityId: 'zurich',
    countryId: 'CH',
    salaryMajor: 130_000,
    currency: 'CHF',
    headlineSummary: 'CHF 130,000 is a very competitive salary in Switzerland, yielding massive global disposable savings.',
    lifestyleContext: 'Under federal and Zurich cantonal tax schedules, net monthly salary exceeds CHF 8,700. Even with Zurich high living costs (CHF 2,500 rent, CHF 450 health insurance), monthly savings reach CHF 3,500+.',
    benchmarkContext: 'Matches senior professional benchmarks in one of the world’s most prosperous economies.',
  },
  'dublin-65k': {
    slug: 'dublin-65k',
    title: 'Is €65K a Good Salary in Dublin?',
    cityId: 'dublin',
    countryId: 'IE',
    salaryMajor: 65_000,
    currency: 'EUR',
    headlineSummary: '€65,000 is a solid tech and finance mid-senior salary in Ireland.',
    lifestyleContext: 'Under Irish Revenue Commissioners PAYE/USC/PRSI, net take-home is ~€3,800/month. In Dublin where rents average €2,100, careful budgeting provides ~€700-1,000 in monthly savings.',
    benchmarkContext: 'Comfortably above the Irish national average wage (~€45,000).',
  },
  'tokyo-12m': {
    slug: 'tokyo-12m',
    title: 'Is ¥12M a Good Salary in Tokyo?',
    cityId: 'tokyo',
    countryId: 'JP',
    salaryMajor: 12_000_000,
    currency: 'JPY',
    headlineSummary: '¥12,000,000 per year places an individual in the top 5% of all income earners in Japan.',
    lifestyleContext: 'Net take-home after Japanese national tax, resident tax, and social health/pension is ~¥680,000/month. With Tokyo rent (~¥200,000 for a 1LDK in Minato or Shibuya), discretionary surplus exceeds ¥300,000/month.',
    benchmarkContext: 'Substantially above Tokyo average salary (~¥5,500,000), enabling high luxury and savings.',
  },
};

export const POPULAR_GUIDES_LIST = Object.values(SALARY_GUIDES);
