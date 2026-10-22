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
    lifestyleContext: 'Yields $5,907/month ($70,879/year) in net take-home pay after federal, NY State, and NYC resident income taxes (29.1% effective rate). After baseline housing ($2,655/mo HUD FY2026 Fair Market Rent), food, and transit, you retain ~$1,660/month in uncommitted discretionary savings.',
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
    lifestyleContext: 'Delivers $8,343/month ($100,121/year) in net take-home pay under 2026 statutory tax law (33.3% effective rate). After a 1-bedroom apartment ($2,655 HUD FMR to $3,250 prime), monthly uncommitted cash flow exceeds $2,500 for investing and leisure.',
    benchmarkContext: 'Places an earner in the top 15% of individual income earners in the NYC metro area.',
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
    lifestyleContext: 'Yields roughly $8,641/month after California state and federal taxes (30.9% effective rate). After rent in popular neighborhoods (~$2,650/mo) and tech hub living costs, monthly surplus remains strong (~$4,500/mo).',
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
    lifestyleContext: 'Generates ~$11,181/month in statutory take-home pay (32.9% effective rate). Easily accommodates modern rentals ($2,650–$3,800/mo) with over $5,000/month left for investing and wealth building.',
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
    lifestyleContext: 'Delivers approximately $6,598/month in net pay (20.8% effective tax rate). With median 1-bedroom rents around $1,650/mo, single professionals retain over $3,600/month in surplus savings.',
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
    lifestyleContext: 'Yields ~$6,197/month net after federal and Illinois flat (4.95%) tax (25.6% effective rate). After rent (~$1,800/mo) and CTA transit, monthly savings comfortably top $3,000.',
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
    lifestyleContext: 'Retains ~$8,343/month in net income (23.0% effective rate with 0% WA state personal income tax). Even after typical 1-bedroom rent (~$2,100), single earners have over $4,800 in monthly disposable income.',
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
    lifestyleContext: 'Produces ~$7,161/month in net pay after California progressive tax brackets (28.4% effective rate). After rent (~$2,250/mo) and auto expenses, savings total ~$3,500/mo.',
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
    lifestyleContext: 'Delivers ~$6,745/month net under Massachusetts 5% flat income tax (26.4% effective rate). After rent (~$2,500/mo) and MBTA costs, monthly discretionary buffer is ~$2,700.',
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
    lifestyleContext: 'Takes home ~$6,012/month net (19.8% effective rate with 0% Florida state income tax). With rents averaging $2,150, single professionals retain ~$2,400/month in savings.',
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
    lifestyleContext: 'Results in approximately £4,505/month (£54,057/year) net pay under HMRC PAYE and NI Class 1 (27.9% effective tax rate). After typical Zone 2 rent (£1,950), TfL transit, and council tax, discretionary savings average ~£1,340/month.',
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
    lifestyleContext: 'Generates £5,713/month (£68,557/year) net take-home under HMRC PAYE and NI Class 1 (31.4% effective tax rate). Affords central housing and over £2,500/mo in savings before the personal allowance taper begins above £100k.',
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
    lifestyleContext: 'Net pay is ~£3,293/month (21.0% effective tax rate). With modern 1-bedroom apartments costing ~£1,150/mo, earners retain ~£1,210/mo in uncommitted cash flow.',
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
    lifestyleContext: 'Takes home ~£2,993/month (20.2% effective tax rate). With city-centre rents around £1,050/mo, earners enjoy strong leisure spending and savings exceeding £1,040/month.',
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
    lifestyleContext: 'Delivers ~£3,397/month under Scottish Income Tax bands (25.9% effective rate). After New Town or Leith rent (~£1,250) and Edinburgh living costs, monthly savings average ~£1,160.',
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
    headlineSummary: 'With 0% statutory personal income tax on employment income, 300,000 AED/year (25,000 AED/month) offers an exceptional quality of life in Dubai.',
    lifestyleContext: 'Monthly gross of 25,000 AED is fully received with 0% payroll tax deductions. After modern 1-bedroom rent (~6,800 AED), utilities with 5% housing fee, car lease, and lifestyle dining, monthly uncommitted savings average ~13,220 AED.',
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
    headlineSummary: '500,000 AED/year (~41,667 AED/month tax-free) is an elite executive compensation package in the Gulf region.',
    lifestyleContext: 'Allows luxury villa or Downtown penthouse living (12,000–15,000 AED/mo), private school tuition, premium travel, and monthly savings surpassing 25,000 AED.',
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
    headlineSummary: 'At ~29,167 AED/month completely tax-free, 350,000 AED enables upper-echelon living in the UAE capital.',
    lifestyleContext: 'Rental apartments on Al Reem Island or Saadiyat cost ~5,500–8,000 AED/month, leaving over 19,000 AED/month in discretionary wealth accumulation.',
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
    lifestyleContext: 'Delivers approximately CA$6,092/month take-home (CA$73,099/year, 26.9% effective rate) under CRA federal and Ontario tax tables plus CPP/EI. After 1-bedroom downtown rent (~CA$2,450) and TTC transit, single earners retain ~CA$2,220/month.',
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
    lifestyleContext: 'Net pay is ~CA$6,149/month (26.2% effective rate) under federal and BC provincial tax. After Downtown or Kitsilano rent (~CA$2,600/mo), monthly savings average ~CA$2,140.',
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
    lifestyleContext: 'Net monthly pay is ~CA$5,405 (27.9% effective rate). With 1-bedroom apartments renting for ~CA$1,750, single professionals retain over CA$2,340/month in net savings.',
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
    lifestyleContext: 'Generates A$7,568/month (A$90,812/year, 24.3% effective rate) net after ATO revised Stage 3 tax and Medicare levy, plus 11.5% mandatory superannuation paid by employers. After typical rent (~A$2,700/mo) and Opal transit, monthly surplus is ~A$3,380.',
    benchmarkContext: 'Significantly higher than national full-time average wage (~A$85,000).',
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
    lifestyleContext: 'Net take-home is ~A$6,434/month (22.8% effective rate). With rents averaging A$2,150/month, single earners save over A$2,880/month.',
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
    lifestyleContext: 'Produces €3,471/month (€41,656/year) net under Tax Class 1 after German statutory income tax and full four-pillar social insurance (47.9% effective rate). With Berlin rent (~€1,250 Warmmiete) and €49 Deutschlandticket, savings reach ~€1,130/month.',
    benchmarkContext: 'Far above the Berlin median wage (~€46,000), offering high purchasing power and cultural lifestyle flexibility.',
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
    lifestyleContext: 'Yields ~€3,847/month net (48.7% effective rate with statutory social insurance). With Munich rents (~€1,600 for 1-room flat), monthly discretionary savings reach ~€1,060.',
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
    lifestyleContext: 'Yields approximately €3,789/month net (30.1% effective rate) after French social charges and income tax withholding. After Paris rent (~€1,500) and Navigo pass, monthly savings average ~€1,100.',
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
    lifestyleContext: 'Yields ~€4,298/month net (31.2% effective rate) under Box 1 personal income tax and healthcare contributions. With Amsterdam rents around €1,850/mo, earners retain ~€1,100/mo in savings.',
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
    lifestyleContext: 'Under Irish Revenue Commissioners PAYE/USC/PRSI, net take-home is ~€3,970/month (26.7% effective rate). In Dublin where rents average €1,950, careful budgeting provides ~€730 in monthly savings.',
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
    lifestyleContext: 'Under federal and Zurich cantonal tax schedules, net monthly salary is CHF 8,369 (CHF 100,423/year, 22.8% effective rate). Even with Zurich living costs (CHF 2,250 rent, CHF 450 health insurance), monthly savings reach CHF 4,000+.',
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
    lifestyleContext: 'Effective IRAS tax is only 6.6%, leaving S$9,338/month for an EP expat resident (0% CPF). After condo rental (~S$3,600) and MRT transit, single professionals retain over S$4,180/month in net savings.',
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
    lifestyleContext: 'Delivers ~S$13,538/month take-home (9.8% effective tax). Accommodates prime central condo living (S$3,600–5,000/mo) while banking over S$8,300/month in liquid investments.',
    benchmarkContext: 'Senior management and banking director compensation tier.',
  },

  // ==========================================
  // INDIA (Cost of Living Modeled; Statutory Tax Under Verification)
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
    lifestyleContext: 'Under Section 115BAC New Tax Regime estimates (~₹1,68,000/month indicative take-home; statutory engine currently under verification), rent (₹45,000) and living costs in prime Western Suburbs or Navi Mumbai leave upwards of ₹85,000/month for long-term investments.',
    benchmarkContext: 'Substantially above typical corporate starting brackets; local cost-of-living is statistically modeled while dedicated statutory tax withholding remains in verification status.',
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
    lifestyleContext: 'Yields ~₹1,68,000/month indicative net pay under Section 115BAC estimates (statutory engine currently under verification). With spacious 2BHK rents around ₹38,000, tech professionals easily save over ₹90,000/month.',
    benchmarkContext: 'Standard for senior software engineers (SDE-2 / SDE-3); local cost-of-living is statistically modeled while dedicated statutory tax withholding remains in verification status.',
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
    lifestyleContext: 'Yields ~₹1,07,000/month indicative net take-home after standard deduction and Sec 115BAC slabs (statutory engine currently under verification). Covers a 1BHK apartment in suburban Mumbai (~₹28,000) with ₹40,000+ left for SIPs and savings.',
    benchmarkContext: 'Upper quartile of early-to-mid career corporate professionals in Mumbai; statutory tax withholding remains in verification status.',
  },

  // ==========================================
  // JAPAN (Cost of Living Modeled; Statutory Tax Under Verification)
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
    lifestyleContext: 'Indicative net take-home after Japanese national tax, resident tax, and social health/pension is ~¥680,000/month (statutory engine under verification). With Tokyo rent (~¥150,000–¥200,000 for a 1LDK in Minato or Shibuya), discretionary surplus exceeds ¥300,000/month.',
    benchmarkContext: 'Substantially above Tokyo average salary (~¥5,500,000); local cost-of-living is statistically modeled while dedicated statutory tax withholding remains in verification status.',
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
    lifestyleContext: 'Net monthly pay is ~€2,962 (28.9% effective rate) after IRPF and Seguridad Social. With Chamberí or Salamanca rent (~€1,100/mo), savings easily exceed €960/month.',
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
