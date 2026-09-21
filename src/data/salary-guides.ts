import { CurrencyCode } from '../types/money';

export interface SalaryGuide {
  slug: string;
  title: string;
  cityId: string;
  countryId: string;
  regionId?: string;
  salaryMajor: number;
  currency: CurrencyCode;
  headlineSummary: string;
  lifestyleContext: string;
  benchmarkContext: string;
}

export const SALARY_GUIDES: Record<string, SalaryGuide> = {
  // ==========================================
  // UNITED STATES
  // ==========================================
  'nyc-100k': {
    slug: 'nyc-100k',
    title: 'Is $100K a Good Salary in New York City?',
    cityId: 'nyc',
    countryId: 'US',
    regionId: 'US-NY',
    salaryMajor: 100_000,
    currency: 'USD',
    headlineSummary: 'For a single earner living independently in a typical 1-bedroom apartment, $100,000 is a viable, moderate salary in New York City.',
    lifestyleContext: 'Yields approximately $5,843/month in net take-home after federal, NYS, and NYC resident income taxes. After median housing, food, and MTA transit, you retain ~$1,521/month in discretionary savings.',
    benchmarkContext: 'Exceeds the median individual worker earnings in NYC (~$65,000) while positioning earners comfortably above essential baseline expenses.',
  },
  'nyc-150k': {
    slug: 'nyc-150k',
    title: 'Is $150K a Good Salary in New York City?',
    cityId: 'nyc',
    countryId: 'US',
    regionId: 'US-NY',
    salaryMajor: 150_000,
    currency: 'USD',
    headlineSummary: 'At $150,000, a single professional can live comfortably in prime Manhattan, Brooklyn, or Queens neighborhoods while saving aggressively.',
    lifestyleContext: 'Delivers ~$8,350/month net take-home pay. After a prime 1-bedroom (~$3,600/month), monthly uncommitted cash flow exceeds $2,800 for investing and leisure.',
    benchmarkContext: 'Places an earner in the top 20% of individual income earners in the NYC metro area.',
  },
  'sf-150k': {
    slug: 'sf-150k',
    title: 'Is $150K a Good Salary in San Francisco?',
    cityId: 'sf',
    countryId: 'US',
    regionId: 'US-CA',
    salaryMajor: 150_000,
    currency: 'USD',
    headlineSummary: 'In the high-cost San Francisco Bay Area, $150,000 provides a comfortable living standard for single professionals.',
    lifestyleContext: 'Yields roughly $8,600/month after California and federal taxes. After rent in popular neighborhoods (~$2,900) and tech hub living costs, monthly surplus remains strong (~$3,200).',
    benchmarkContext: 'Aligned with mid-level tech compensation while well above the citywide individual median.',
  },
  'sf-200k': {
    slug: 'sf-200k',
    title: 'Is $200K a Good Salary in San Francisco?',
    cityId: 'sf',
    countryId: 'US',
    regionId: 'US-CA',
    salaryMajor: 200_000,
    currency: 'USD',
    headlineSummary: '$200,000 is an upper-tier income in San Francisco, enabling high 401(k) funding, luxury housing, and substantial disposable wealth creation.',
    lifestyleContext: 'Generates ~$11,100/month in statutory take-home pay. Easily accommodates modern high-rise rentals ($3,800/mo) with over $4,500/month left for investing.',
    benchmarkContext: 'Common for senior engineering, legal, or product management roles in Silicon Valley and SF.',
  },
  'austin-100k': {
    slug: 'austin-100k',
    title: 'Is $100K a Good Salary in Austin?',
    cityId: 'austin',
    countryId: 'US',
    regionId: 'US-TX',
    salaryMajor: 100_000,
    currency: 'USD',
    headlineSummary: 'Benefiting from 0% Texas state personal income tax, $100,000 goes substantially further in Austin than in coastal metros.',
    lifestyleContext: 'Delivers ~$6,650/month in net pay. With average 1-bedroom rents around $1,650, single professionals retain over $3,200/month in surplus savings.',
    benchmarkContext: 'Far above the Austin median worker income (~$56,000), offering an enviable balance of tech-hub career growth and affordability.',
  },
  'chicago-100k': {
    slug: 'chicago-100k',
    title: 'Is $100K a Good Salary in Chicago?',
    cityId: 'chicago',
    countryId: 'US',
    regionId: 'US-IL',
    salaryMajor: 100_000,
    currency: 'USD',
    headlineSummary: '$100,000 is a very strong salary in Chicago, providing access to premier neighborhoods like Lincoln Park or West Loop.',
    lifestyleContext: 'Yields ~$6,180/month net after federal and Illinois flat (4.95%) tax. After rent (~$1,950/mo) and CTA transit, monthly savings comfortably top $2,200.',
    benchmarkContext: 'Well above the Chicago individual median full-time income (~$52,000).',
  },
  'seattle-130k': {
    slug: 'seattle-130k',
    title: 'Is $130K a Good Salary in Seattle?',
    cityId: 'seattle',
    countryId: 'US',
    regionId: 'US-WA',
    salaryMajor: 130_000,
    currency: 'USD',
    headlineSummary: 'With no Washington state personal income tax, $130,000 provides high take-home power in the Pacific Northwest tech capital.',
    lifestyleContext: 'Retains ~$8,420/month in net income. Even after typical South Lake Union or Capitol Hill rent (~$2,250), single earners have over $3,800 in monthly disposable income.',
    benchmarkContext: 'Sits near mid-level engineering benchmarks across Microsoft and Amazon ecosystems.',
  },
  'la-120k': {
    slug: 'la-120k',
    title: 'Is $120K a Good Salary in Los Angeles?',
    cityId: 'la',
    countryId: 'US',
    regionId: 'US-CA',
    salaryMajor: 120_000,
    currency: 'USD',
    headlineSummary: '$120,000 enables a comfortable lifestyle in Southern California, though car ownership and housing choices require conscious budgeting.',
    lifestyleContext: 'Produces ~$7,100/month in net pay after California progressive tax brackets. After rent in Santa Monica, Culver City, or Silver Lake (~$2,450) and auto expenses, savings total ~$2,100/mo.',
    benchmarkContext: 'Outpaces the LA county individual median wage (~$49,000) by more than 2x.',
  },
  'boston-110k': {
    slug: 'boston-110k',
    title: 'Is $110K a Good Salary in Boston?',
    cityId: 'boston',
    countryId: 'US',
    regionId: 'US-MA',
    salaryMajor: 110_000,
    currency: 'USD',
    headlineSummary: '$110,000 provides financial security in Boston\'s biotech, higher-ed, and financial hub.',
    lifestyleContext: 'Delivers ~$6,650/month net under Massachusetts 5% flat income tax. After Back Bay or Cambridge rent (~$2,600/mo) and MBTA costs, monthly discretionary buffer is ~$1,900.',
    benchmarkContext: 'Strong professional wage exceeding the metro area median earner by roughly 45%.',
  },
  'miami-90k': {
    slug: 'miami-90k',
    title: 'Is $90K a Good Salary in Miami?',
    cityId: 'miami',
    countryId: 'US',
    regionId: 'US-FL',
    salaryMajor: 90_000,
    currency: 'USD',
    headlineSummary: 'With 0% Florida state income tax, $90,000 is a solid compensation tier in South Florida.',
    lifestyleContext: 'Takes home ~$6,050/month net. With Brickell and Downtown rents averaging $2,300, single professionals retain ~$1,750/month in savings.',
    benchmarkContext: 'Comfortably above the Miami-Dade median household wage.',
  },

  // ==========================================
  // UNITED KINGDOM
  // ==========================================
  'london-75k': {
    slug: 'london-75k',
    title: 'Is £75K a Good Salary in London?',
    cityId: 'london',
    countryId: 'GB',
    regionId: 'GB-ENG',
    salaryMajor: 75_000,
    currency: 'GBP',
    headlineSummary: 'A £75,000 annual salary puts you in the top 10% of individual income earners in London.',
    lifestyleContext: 'Results in approximately £4,505/month net pay under HMRC PAYE and NI Class 1. After typical Zone 2 rent (£1,950), TfL transit, and council tax, discretionary savings average ~£1,340/month.',
    benchmarkContext: 'More than 70% higher than the London median full-time wage (~£44,000), affording good financial flexibility.',
  },
  'london-100k': {
    slug: 'london-100k',
    title: 'Is £100K a Good Salary in London?',
    cityId: 'london',
    countryId: 'GB',
    regionId: 'GB-ENG',
    salaryMajor: 100_000,
    currency: 'GBP',
    headlineSummary: 'Crossing the six-figure £100,000 milestone places an individual in the top 4% of UK taxpayers.',
    lifestyleContext: 'Generates ~£5,650/month net take-home (taking into account the personal allowance reduction taper above £100k). Affords prime central housing and over £2,200/mo in savings.',
    benchmarkContext: 'Benchmark compensation for senior bankers, corporate solicitors, and lead tech architects.',
  },
  'manchester-50k': {
    slug: 'manchester-50k',
    title: 'Is £50K a Good Salary in Manchester?',
    cityId: 'manchester',
    countryId: 'GB',
    regionId: 'GB-ENG',
    salaryMajor: 50_000,
    currency: 'GBP',
    headlineSummary: '£50,000 provides an excellent, high-comfort standard of living in the North West of England.',
    lifestyleContext: 'Net pay is ~£3,250/month. With modern Ancoats or City Centre 1-bedroom apartments costing ~£1,100/mo, earners retain ~£1,400/mo in uncommitted cash flow.',
    benchmarkContext: 'Significantly higher than the Greater Manchester median salary (~£33,000).',
  },
  'birmingham-45k': {
    slug: 'birmingham-45k',
    title: 'Is £45K a Good Salary in Birmingham?',
    cityId: 'birmingham',
    countryId: 'GB',
    regionId: 'GB-ENG',
    salaryMajor: 45_000,
    currency: 'GBP',
    headlineSummary: '£45,000 is an enviable salary in the West Midlands, offering high purchasing power.',
    lifestyleContext: 'Takes home ~£2,980/month. With city-centre rents around £950/mo, earners enjoy strong leisure spending and savings exceeding £1,200/month.',
    benchmarkContext: 'Well above the regional full-time median (~£31,500).',
  },
  'edinburgh-55k': {
    slug: 'edinburgh-55k',
    title: 'Is £55K a Good Salary in Edinburgh?',
    cityId: 'edinburgh',
    countryId: 'GB',
    regionId: 'GB-SCT',
    salaryMajor: 55_000,
    currency: 'GBP',
    headlineSummary: '£55,000 is an upper-middle income in Scotland\'s financial and legal capital.',
    lifestyleContext: 'Delivers ~£3,420/month under Scottish Income Tax bands. After New Town or Leith rent (~£1,250) and Edinburgh living costs, monthly savings average ~£1,350.',
    benchmarkContext: 'Comfortably outpaces the Scottish median earnings (~£34,000).',
  },

  // ==========================================
  // UNITED ARAB EMIRATES
  // ==========================================
  'dubai-300k': {
    slug: 'dubai-300k',
    title: 'Is 300K AED a Good Salary in Dubai?',
    cityId: 'dubai',
    countryId: 'AE',
    regionId: 'AE-DXB',
    salaryMajor: 300_000,
    currency: 'AED',
    headlineSummary: 'With 0% statutory personal income tax, 300,000 AED/year (25,000 AED/month) offers an exceptional quality of life in Dubai.',
    lifestyleContext: 'Full 25,000 AED remains 100% tax-free. After comfortable modern accommodation (7,500 AED), utilities, car leasing, and lifestyle dining, monthly uncommitted savings exceed 10,000 AED.',
    benchmarkContext: 'Represents a senior managerial or professional tier package in the UAE corporate landscape.',
  },
  'dubai-500k': {
    slug: 'dubai-500k',
    title: 'Is 500K AED a Good Salary in Dubai?',
    cityId: 'dubai',
    countryId: 'AE',
    regionId: 'AE-DXB',
    salaryMajor: 500_000,
    currency: 'AED',
    headlineSummary: '500,000 AED/year (~41,666 AED/month tax-free) is an elite executive compensation package in the Gulf region.',
    lifestyleContext: 'Allows luxury villa or Downtown penthouse living (15,000 AED/mo), private school tuition, premium travel, and monthly savings surpassing 20,000 AED.',
    benchmarkContext: 'Director, VP, and specialized consulting compensation tier.',
  },
  'abudhabi-350k': {
    slug: 'abudhabi-350k',
    title: 'Is 350K AED a Good Salary in Abu Dhabi?',
    cityId: 'abudhabi',
    countryId: 'AE',
    regionId: 'AE-AUH',
    salaryMajor: 350_000,
    currency: 'AED',
    headlineSummary: 'At ~29,166 AED/month completely tax-free, 350,000 AED enables upper-echelon living in the UAE capital.',
    lifestyleContext: 'Rental apartments on Al Reem Island or Saadiyat cost ~8,000 AED/month, leaving over 14,000 AED/month in discretionary wealth accumulation.',
    benchmarkContext: 'Common for senior government advisory, energy sector, and aviation professionals.',
  },

  // ==========================================
  // CANADA
  // ==========================================
  'toronto-100k': {
    slug: 'toronto-100k',
    title: 'Is CA$100K a Good Salary in Toronto?',
    cityId: 'toronto',
    countryId: 'CA',
    regionId: 'CA-ON',
    salaryMajor: 100_000,
    currency: 'CAD',
    headlineSummary: 'CA$100,000 is a solid above-average milestone in the Greater Toronto Area.',
    lifestyleContext: 'Delivers approximately CA$6,150/month take-home under CRA federal and Ontario tax tables. After 1-bedroom downtown rent (~CA$2,400) and TTC transit, single earners retain ~CA$1,850/month.',
    benchmarkContext: 'Sits substantially above Ontario median individual income (~CA$58,000), though homeownership requires dual income.',
  },
  'vancouver-100k': {
    slug: 'vancouver-100k',
    title: 'Is CA$100K a Good Salary in Vancouver?',
    cityId: 'vancouver',
    countryId: 'CA',
    regionId: 'CA-BC',
    salaryMajor: 100_000,
    currency: 'CAD',
    headlineSummary: 'CA$100,000 affords a comfortable lifestyle in British Columbia, though high housing costs require careful budgeting.',
    lifestyleContext: 'Net pay is ~CA$6,220/month under federal and BC provincial tax. After Downtown or Kitsilano rent (~CA$2,500/mo), monthly savings average ~CA$1,700.',
    benchmarkContext: 'Surpasses the Vancouver full-time median income (~CA$61,000).',
  },
  'calgary-90k': {
    slug: 'calgary-90k',
    title: 'Is CA$90K a Good Salary in Calgary?',
    cityId: 'calgary',
    countryId: 'CA',
    regionId: 'CA-AB',
    salaryMajor: 90_000,
    currency: 'CAD',
    headlineSummary: 'Benefiting from Alberta\'s low provincial tax and reasonable housing, CA$90,000 yields exceptional purchasing power.',
    lifestyleContext: 'Net monthly pay is ~CA$5,600. With 1-bedroom apartments renting for ~CA$1,600, single professionals retain over CA$2,400/month in net savings.',
    benchmarkContext: 'Above Calgary median earnings, providing superior disposable income compared to Toronto or Vancouver.',
  },

  // ==========================================
  // AUSTRALIA
  // ==========================================
  'sydney-120k': {
    slug: 'sydney-120k',
    title: 'Is A$120K a Good Salary in Sydney?',
    cityId: 'sydney',
    countryId: 'AU',
    regionId: 'AU-NSW',
    salaryMajor: 120_000,
    currency: 'AUD',
    headlineSummary: 'A$120,000 is an upper-middle income in Australia, offering solid financial comfort in Sydney.',
    lifestyleContext: 'Generates roughly A$7,340/month net after ATO revised Stage 3 tax and Medicare levy. After typical Eastern Suburbs or Inner West rent (~A$2,800/mo) and Opal transit, monthly surplus is ~A$2,200.',
    benchmarkContext: 'Significantly higher than national full-time average wage (~A$98,000).',
  },
  'melbourne-100k': {
    slug: 'melbourne-100k',
    title: 'Is A$100K a Good Salary in Melbourne?',
    cityId: 'melbourne',
    countryId: 'AU',
    regionId: 'AU-VIC',
    salaryMajor: 100_000,
    currency: 'AUD',
    headlineSummary: 'A$100,000 provides a great balance of cultural lifestyle, dining, and savings in Victoria\'s capital.',
    lifestyleContext: 'Net take-home is ~A$6,320/month. With rents in South Yarra or Fitzroy averaging A$2,100/month, single earners save over A$2,200/month.',
    benchmarkContext: 'Exceeds the Victorian median wage by over 25%.',
  },

  // ==========================================
  // GERMANY
  // ==========================================
  'berlin-80k': {
    slug: 'berlin-80k',
    title: 'Is €80K a Good Salary in Berlin?',
    cityId: 'berlin',
    countryId: 'DE',
    regionId: 'DE-BE',
    salaryMajor: 80_000,
    currency: 'EUR',
    headlineSummary: '€80,000 per year is an excellent upper-tier professional salary in Berlin.',
    lifestyleContext: 'Produces approximately €4,050/month net under Tax Class 1 after German statutory income tax and full social insurance. With Berlin rent (~€1,400), savings exceed €1,500/month.',
    benchmarkContext: 'Far above the Berlin median wage (~€48,000), offering high purchasing power and cultural lifestyle flexibility.',
  },
  'munich-90k': {
    slug: 'munich-90k',
    title: 'Is €90K a Good Salary in Munich?',
    cityId: 'munich',
    countryId: 'DE',
    regionId: 'DE-BY',
    salaryMajor: 90_000,
    currency: 'EUR',
    headlineSummary: '€90,000 is a competitive senior salary in Germany\'s wealthiest major city and industrial center.',
    lifestyleContext: 'Yields ~€4,450/month net. Even with Munich premium rents (~€1,750 for 1-room flat), monthly discretionary savings reach ~€1,400.',
    benchmarkContext: 'Matches senior engineering and corporate consulting benchmarks in Bavaria.',
  },

  // ==========================================
  // FRANCE
  // ==========================================
  'paris-65k': {
    slug: 'paris-65k',
    title: 'Is €65K a Good Salary in Paris?',
    cityId: 'paris',
    countryId: 'FR',
    regionId: 'FR-IDF',
    salaryMajor: 65_000,
    currency: 'EUR',
    headlineSummary: '€65,000 per year places an individual well within the top 15% of income earners in France.',
    lifestyleContext: 'Yields approximately €3,550/month net after French social charges and income tax withholding. After Paris intra-muros rent (~€1,450) and Navigo pass, monthly savings average ~€1,100.',
    benchmarkContext: 'Significantly higher than the French national median net wage (~€2,200/month).',
  },

  // ==========================================
  // NETHERLANDS
  // ==========================================
  'amsterdam-75k': {
    slug: 'amsterdam-75k',
    title: 'Is €75K a Good Salary in Amsterdam?',
    cityId: 'amsterdam',
    countryId: 'NL',
    regionId: 'NL-NH',
    salaryMajor: 75_000,
    currency: 'EUR',
    headlineSummary: '€75,000 is an upper-middle professional wage in the Netherlands tech and corporate capital.',
    lifestyleContext: 'Yields ~€4,150/month net under Box 1 personal income tax and healthcare contributions. With Amsterdam rents around €1,900/mo, earners retain ~€1,200/mo in savings.',
    benchmarkContext: 'Far above the Dutch modal salary (modaal inkomen ~€44,000).',
  },

  // ==========================================
  // IRELAND
  // ==========================================
  'dublin-65k': {
    slug: 'dublin-65k',
    title: 'Is €65K a Good Salary in Dublin?',
    cityId: 'dublin',
    countryId: 'IE',
    regionId: 'IE-LEI',
    salaryMajor: 65_000,
    currency: 'EUR',
    headlineSummary: '€65,000 is a solid tech and finance mid-senior salary in Ireland.',
    lifestyleContext: 'Under Irish Revenue Commissioners PAYE/USC/PRSI, net take-home is ~€3,800/month. In Dublin where rents average €2,100, careful budgeting provides ~€700-1,000 in monthly savings.',
    benchmarkContext: 'Comfortably above the Irish national average wage (~€45,000).',
  },

  // ==========================================
  // SWITZERLAND
  // ==========================================
  'zurich-130k': {
    slug: 'zurich-130k',
    title: 'Is CHF 130K a Good Salary in Zurich?',
    cityId: 'zurich',
    countryId: 'CH',
    regionId: 'CH-ZH',
    salaryMajor: 130_000,
    currency: 'CHF',
    headlineSummary: 'CHF 130,000 is a very competitive salary in Switzerland, yielding massive global disposable savings.',
    lifestyleContext: 'Under federal and Zurich cantonal tax schedules, net monthly salary exceeds CHF 8,700. Even with Zurich high living costs (CHF 2,500 rent, CHF 450 health insurance), monthly savings reach CHF 3,500+.',
    benchmarkContext: 'Matches senior professional benchmarks in one of the world’s most prosperous economies.',
  },

  // ==========================================
  // SINGAPORE
  // ==========================================
  'singapore-120k': {
    slug: 'singapore-120k',
    title: 'Is S$120K a Good Salary in Singapore?',
    cityId: 'singapore',
    countryId: 'SG',
    regionId: 'SG-SG',
    salaryMajor: 120_000,
    currency: 'SGD',
    headlineSummary: 'Due to Singapore’s ultra-low progressive tax brackets, S$120,000 per year delivers massive take-home pay.',
    lifestyleContext: 'Effective IRAS tax is only ~6.5%, leaving over S$9,350/month. After condo rental (~S$3,600) and MRT transit, single professionals retain over S$3,500/month in net savings.',
    benchmarkContext: 'Well above Singapore median resident monthly income (~S$5,200), providing premier expatriate living standards.',
  },
  'singapore-180k': {
    slug: 'singapore-180k',
    title: 'Is S$180K a Good Salary in Singapore?',
    cityId: 'singapore',
    countryId: 'SG',
    regionId: 'SG-SG',
    salaryMajor: 180_000,
    currency: 'SGD',
    headlineSummary: 'S$180,000 per year represents an elite expat and leadership compensation package in Southeast Asia\'s financial hub.',
    lifestyleContext: 'Delivers ~S$13,700/month take-home. Accommodates prime central condo living (S$5,000/mo) while banking over S$5,500/month in liquid investments.',
    benchmarkContext: 'Senior management and banking director compensation tier.',
  },

  // ==========================================
  // INDIA
  // ==========================================
  'mumbai-25lakh': {
    slug: 'mumbai-25lakh',
    title: 'Is ₹25 Lakh a Good Salary in Mumbai?',
    cityId: 'mumbai',
    countryId: 'IN',
    regionId: 'IN-MH',
    salaryMajor: 2_500_000,
    currency: 'INR',
    headlineSummary: '₹25,00,000 annually places an earner in the top 3% of income earners in urban India.',
    lifestyleContext: 'Under Section 115BAC New Tax Regime, monthly take-home is roughly ₹1,68,000. In prime Western Suburbs or Navi Mumbai, rent (₹45,000) and living expenses leave upwards of ₹85,000/month for long-term investments.',
    benchmarkContext: 'Substantially above typical corporate starting brackets, supporting domestic help, private healthcare, and international travel.',
  },
  'bengaluru-25lakh': {
    slug: 'bengaluru-25lakh',
    title: 'Is ₹25 Lakh a Good Salary in Bengaluru?',
    cityId: 'bengaluru',
    countryId: 'IN',
    regionId: 'IN-KA',
    salaryMajor: 2_500_000,
    currency: 'INR',
    headlineSummary: '₹25 Lakh is a premier tech salary in Bengaluru (India\'s Silicon Valley), enabling affluent living in Indiranagar, HSR Layout, or Koramangala.',
    lifestyleContext: 'Yields ~₹1,68,000/month net. With spacious 2BHK rents around ₹38,000, tech professionals easily save over ₹90,000/month.',
    benchmarkContext: 'Standard for senior software engineers (SDE-2 / SDE-3) and engineering managers.',
  },
  'mumbai-15lakh': {
    slug: 'mumbai-15lakh',
    title: 'Is ₹15 Lakh a Good Salary in Mumbai?',
    cityId: 'mumbai',
    countryId: 'IN',
    regionId: 'IN-MH',
    salaryMajor: 1_500_000,
    currency: 'INR',
    headlineSummary: '₹15,00,000 annually provides a respectable, comfortable middle-class living in India\'s financial capital.',
    lifestyleContext: 'Yields ~₹1,07,000/month net take-home after standard deduction and Sec 115BAC slabs. Covers a 1BHK apartment in suburban Mumbai (~₹28,000) with ₹40,000+ left for SIPs and savings.',
    benchmarkContext: 'Upper quartile of early-to-mid career corporate professionals in Mumbai.',
  },

  // ==========================================
  // JAPAN
  // ==========================================
  'tokyo-12m': {
    slug: 'tokyo-12m',
    title: 'Is ¥12M a Good Salary in Tokyo?',
    cityId: 'tokyo',
    countryId: 'JP',
    regionId: 'JP-TK',
    salaryMajor: 12_000_000,
    currency: 'JPY',
    headlineSummary: '¥12,000,000 per year places an individual in the top 5% of all income earners in Japan.',
    lifestyleContext: 'Net take-home after Japanese national tax, resident tax, and social health/pension is ~¥680,000/month. With Tokyo rent (~¥200,000 for a 1LDK in Minato or Shibuya), discretionary surplus exceeds ¥300,000/month.',
    benchmarkContext: 'Substantially above Tokyo average salary (~¥5,500,000), enabling high luxury and savings.',
  },

  // ==========================================
  // SPAIN
  // ==========================================
  'madrid-50k': {
    slug: 'madrid-50k',
    title: 'Is €50K a Good Salary in Madrid?',
    cityId: 'madrid',
    countryId: 'ES',
    regionId: 'ES-MD',
    salaryMajor: 50_000,
    currency: 'EUR',
    headlineSummary: '€50,000 puts an individual in the top 15% of salary earners in Spain, affording high quality of life in Madrid.',
    lifestyleContext: 'Net monthly pay is ~€2,850 after IRPF and Seguridad Social. With Chamberí or Salamanca rent (~€1,200/mo), savings easily exceed €900/month.',
    benchmarkContext: 'Far above the Spanish national average wage (~€27,000).',
  },
};

export const POPULAR_GUIDES_LIST = Object.values(SALARY_GUIDES);

export function getGuidesByCountry(countryId: string): SalaryGuide[] {
  return POPULAR_GUIDES_LIST.filter((g) => g.countryId.toUpperCase() === countryId.toUpperCase());
}

export function getGuidesByCity(cityId: string): SalaryGuide[] {
  return POPULAR_GUIDES_LIST.filter((g) => g.cityId.toLowerCase() === cityId.toLowerCase());
}

export function getGuidesByRegion(regionId: string): SalaryGuide[] {
  return POPULAR_GUIDES_LIST.filter((g) => g.regionId === regionId);
}
