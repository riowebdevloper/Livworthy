/**
 * LivWorthy Transparency, E-E-A-T & Canonical Definitions Registry
 * 
 * Truthful, authoritative data defining platform governance, calculation methodology,
 * verified source tiers, editorial standards, and canonical financial terminology.
 */

export interface SourceCitation {
  id: string;
  name: string;
  category: 'STATUTORY_TAX' | 'STATISTICAL_AGENCY' | 'HOUSING_BENCHMARK' | 'CURRENCY_FX' | 'MULTILATERAL';
  tier: 'TIER_1_GOVERNMENT' | 'TIER_2_STATISTICS' | 'TIER_3_INSTITUTIONAL';
  jurisdiction: string;
  description: string;
  officialUrl: string;
  retrievedDate: string;
  updateFrequency: string;
}

export interface GlossaryTerm {
  term: string;
  shortDefinition: string;
  detailedExplanation: string;
  mathematicalExpression?: string;
  governingStandard: string;
}

export const PLATFORM_IDENTITY = {
  name: 'LivWorthy',
  tagline: 'Know what your income is really worth.',
  coreDefinition:
    'A global income and living intelligence platform that helps people understand what their income is really worth in a specific location.',
  establishedYear: 2024,
  primaryDomain: 'https://livworthy.com',
  productionApp: 'https://livworthy.vercel.app',
  publisher: 'LivWorthy Financial Research & Intelligence Team',
  mission:
    'To provide transparent, deterministic, and verifiable financial living intelligence without advertising distortion, AI hallucinations, or synthetic approximations.',
  zeroAiMathPolicy:
    'LivWorthy strictly prohibits using generative AI or Large Language Models (LLMs) to estimate taxes, calculate cost of living, perform currency conversions, or derive disposable income. All calculations are executed by deterministic code operating on official statutory tables and validated statistical datasets.',
  privacyCommitment:
    'Anonymous by design. LivWorthy does not require user registration, does not collect personal names, email addresses, or account credentials for calculations, and processes scenarios client-side or ephemerally.',
};

export const CORE_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Gross Salary',
    shortDefinition: 'Total pre-tax cash compensation paid by an employer before statutory deductions.',
    detailedExplanation:
      'Gross salary encompasses base contract pay, guaranteed cash allowances, and regular stipends. It forms the base input for statutory income tax brackets, local payroll withholdings, and mandatory social insurance contributions.',
    mathematicalExpression: 'Gross Salary = Base Annual Cash Pay + Guaranteed Cash Allowances',
    governingStandard: 'International Labour Organization (ILO) / National Statutory Labour Codes',
  },
  {
    term: 'Net Salary (Take-Home Pay)',
    shortDefinition: 'The actual statutory cash earnings remaining after national, regional, and municipal taxes plus mandatory social contributions.',
    detailedExplanation:
      'Net salary is computed using jurisdiction-specific statutory tax schedules, standardized allowances/credits, and statutory social welfare levies (such as FICA/Medicare in the US, National Insurance in the UK, or Social Security in France).',
    mathematicalExpression: 'Net Salary = Gross Salary - (Income Taxes + Mandatory Social Contributions)',
    governingStandard: 'Jurisdictional Tax Authorities (IRS, HMRC, FTA, CRA, ATO)',
  },
  {
    term: 'Effective Tax Rate',
    shortDefinition: 'The actual percentage of total gross income paid in compulsory taxes and social contributions.',
    detailedExplanation:
      'Unlike marginal tax rates, the effective tax rate reflects blended progressive bracket rates, standard deductions, and personal allowances, representing the true tax burden on the earner.',
    mathematicalExpression: 'Effective Rate = (Total Deductions ÷ Gross Salary) × 100',
    governingStandard: 'OECD Tax Database Standards',
  },
  {
    term: 'Marginal Tax Rate',
    shortDefinition: 'The statutory tax percentage applied to the very last dollar (or currency unit) of earned income.',
    detailedExplanation:
      'Marginal rates determine how much of a subsequent pay raise, annual bonus, or overtime compensation will be retained versus deducted at the progressive bracket ceiling.',
    mathematicalExpression: 'Marginal Rate = Δ Total Tax / Δ Gross Income',
    governingStandard: 'National Statutory Progressive Tax Schedules',
  },
  {
    term: 'Cost of Living (COL)',
    shortDefinition: 'The localized baseline financial expenditure required to sustain a defined standard of health, shelter, nutrition, and mobility.',
    detailedExplanation:
      'In LivWorthy, cost of living is anchored to fair-market housing benchmarks and weighted necessity categories (groceries, utilities, public transit, healthcare, and baseline amenities) derived from official consumer expenditure surveys.',
    mathematicalExpression: 'COL = Baseline Rent + Weighted Essential Goods & Services',
    governingStandard: 'US BLS Consumer Expenditure Survey / Eurostat HICP Weights',
  },
  {
    term: 'Disposable Income',
    shortDefinition: 'The remaining net income available after covering mandatory statutory taxes, shelter, and non-negotiable living necessities.',
    detailedExplanation:
      'Disposable income (or discretionary cash capacity) represents the uncommitted cash an earner can allocate toward voluntary savings, investments, debt amortization, leisure, or family support.',
    mathematicalExpression: 'Disposable Income = Net Take-Home Pay - (Annual Rent + Baseline Living Costs)',
    governingStandard: 'National Accounts System (SNA 2008 / Eurostat)',
  },
  {
    term: 'Purchasing Power',
    shortDefinition: 'The real relative quantity of goods and shelter an earner can afford in a specific market compared to an international benchmark.',
    detailedExplanation:
      'Purchasing power measures income efficacy by dividing net disposable cash by local price levels, enabling realistic lifestyle parity comparisons between high-tax, high-cost and low-tax, low-cost regions.',
    mathematicalExpression: 'Purchasing Power Index = (Local Disposable Income ÷ Benchmark Disposable Income) × Price Level Adjustment',
    governingStandard: 'World Bank International Comparison Program (ICP)',
  },
  {
    term: 'Salary Needed',
    shortDefinition: 'The gross compensation required in a specific city to cover statutory deductions, target housing, living necessities, and a desired savings rate.',
    detailedExplanation:
      'LivWorthy solves this inverse calculation deterministically through bounded root-finding algorithms, computing the exact gross compensation necessary to achieve positive cash balance after all location-specific deductions.',
    mathematicalExpression: 'Gross Needed = InverseNetTax(Target Living Expenses + Desired Savings)',
    governingStandard: 'LivWorthy Inverse Deterministic Solver Model',
  },
  {
    term: 'Total Cash Compensation',
    shortDefinition: 'All guaranteed and regular monetary payments received by an employee within a twelve-month compensation period.',
    detailedExplanation:
      'Includes contract base salary, guaranteed thirteenth-month pay, and recurring fixed cash stipends, excluding non-guaranteed discretionary bonuses or non-liquid equity grants.',
    mathematicalExpression: 'Total Cash = Base Pay + Guaranteed Fixed Cash Allowances',
    governingStandard: 'WorldatWork Compensation Frameworks',
  },
  {
    term: 'Total Compensation Value',
    shortDefinition: 'The evaluated aggregate worth of cash earnings combined with quantifiable employer-provided non-cash benefits.',
    detailedExplanation:
      'Considers employer pension/superannuation matching, statutory healthcare subsidies, transit passes, and relocation assistance, analyzed alongside localized living costs to measure real employment package worth.',
    mathematicalExpression: 'Total Value = Total Cash Pay + Employer Subsidies & Benefits',
    governingStandard: 'Global Total Rewards Architecture (SHRM / CIPD)',
  },
];

export const AUTHORITATIVE_SOURCES: SourceCitation[] = [
  {
    id: 'us-irs-tax-2024',
    name: 'Internal Revenue Service (IRS)',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'United States (Federal)',
    description: 'Statutory federal income tax brackets, standard deductions, and personal exemption schedules.',
    officialUrl: 'https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2024',
    retrievedDate: '2024-11-01',
    updateFrequency: 'Annual',
  },
  {
    id: 'us-ssa-fica-2024',
    name: 'Social Security Administration (SSA)',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'United States (Federal)',
    description: 'FICA Old-Age, Survivors, and Disability Insurance (OASDI) wage base and tax rate guidelines.',
    officialUrl: 'https://www.ssa.gov/oact/cola/cbb.html',
    retrievedDate: '2024-10-15',
    updateFrequency: 'Annual',
  },
  {
    id: 'us-nys-tax-2024',
    name: 'New York State Department of Taxation and Finance',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'United States (New York State)',
    description: 'NYS progressive income tax schedules and standard deduction tables.',
    officialUrl: 'https://www.tax.ny.gov/forms/income_cur_forms.htm',
    retrievedDate: '2024-11-10',
    updateFrequency: 'Annual',
  },
  {
    id: 'us-nyc-tax-2024',
    name: 'New York City Department of Finance',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'United States (New York City)',
    description: 'NYC resident individual income tax rates and local surcharge tables.',
    officialUrl: 'https://www.nyc.gov/site/finance/taxes/personal-income-tax-and-non-resident-employees.page',
    retrievedDate: '2024-11-10',
    updateFrequency: 'Annual',
  },
  {
    id: 'us-hud-nyc-fmr-2024',
    name: 'US Department of Housing and Urban Development (HUD)',
    category: 'HOUSING_BENCHMARK',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'United States (Metropolitan Areas)',
    description: 'Fair Market Rents (FMR) for studio, 1-bedroom, 2-bedroom, and 3-bedroom residential units.',
    officialUrl: 'https://www.huduser.gov/portal/datasets/fmr.html',
    retrievedDate: '2024-10-01',
    updateFrequency: 'Annual',
  },
  {
    id: 'us-bls-cpi-nyc-2024',
    name: 'US Bureau of Labor Statistics (BLS)',
    category: 'STATISTICAL_AGENCY',
    tier: 'TIER_2_STATISTICS',
    jurisdiction: 'United States (National & Regional)',
    description: 'Consumer Price Index (CPI) and Consumer Expenditure Survey (CEX) household expenditure weighting.',
    officialUrl: 'https://www.bls.gov/cpi/',
    retrievedDate: '2024-12-01',
    updateFrequency: 'Monthly / Annual',
  },
  {
    id: 'uk-hmrc-tax-2024',
    name: 'HM Revenue & Customs (HMRC)',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'United Kingdom',
    description: 'PAYE income tax rates, Personal Allowance thresholds, and Class 1 National Insurance contributions.',
    officialUrl: 'https://www.gov.uk/income-tax-rates',
    retrievedDate: '2024-04-06',
    updateFrequency: 'Annual (April Fiscal Year)',
  },
  {
    id: 'ae-fta-tax-2024',
    name: 'Federal Tax Authority (FTA) & Ministry of Finance UAE',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'United Arab Emirates',
    description: 'Individual personal income tax zero-rate statutory decree and national social pension applicability.',
    officialUrl: 'https://tax.gov.ae/',
    retrievedDate: '2024-06-01',
    updateFrequency: 'Continuous',
  },
  {
    id: 'ca-cra-tax-2024',
    name: 'Canada Revenue Agency (CRA)',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'Canada (Federal & Provincial)',
    description: 'Federal and provincial income tax brackets, CPP/QPP contributions, and Employment Insurance (EI) ceilings.',
    officialUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html',
    retrievedDate: '2024-01-15',
    updateFrequency: 'Annual',
  },
  {
    id: 'au-ato-tax-2024',
    name: 'Australian Taxation Office (ATO)',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'Australia',
    description: 'Individual resident income tax rates, Stage 3 tax adjustments, and Medicare Levy schedules.',
    officialUrl: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
    retrievedDate: '2024-07-01',
    updateFrequency: 'Annual (July Fiscal Year)',
  },
  {
    id: 'sg-iras-tax-2024',
    name: 'Inland Revenue Authority of Singapore (IRAS)',
    category: 'STATUTORY_TAX',
    tier: 'TIER_1_GOVERNMENT',
    jurisdiction: 'Singapore',
    description: 'Tax resident progressive income tax rates and Central Provident Fund (CPF) contribution schedules.',
    officialUrl: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates',
    retrievedDate: '2024-01-01',
    updateFrequency: 'Annual',
  },
  {
    id: 'ecb-fx-reference',
    name: 'European Central Bank (ECB) Reference Exchange Rates',
    category: 'CURRENCY_FX',
    tier: 'TIER_3_INSTITUTIONAL',
    jurisdiction: 'International',
    description: 'Daily reference foreign exchange conversion snapshots for multi-currency benchmarking.',
    officialUrl: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
    retrievedDate: '2025-01-01',
    updateFrequency: 'Daily Business Day',
  },
];

export const CORRECTIONS_LOG = [
  {
    id: 'corr-2024-001',
    date: '2024-11-15',
    jurisdiction: 'United States (Federal)',
    summary: 'Adjusted standard deduction and tax bracket thresholds for single filers to match IRS 2024 inflation adjustments.',
    sourceReference: 'IRS Rev. Proc. 2023-34 / IRS Newsroom',
    status: 'VERIFIED_AND_DEPLOYED',
  },
  {
    id: 'corr-2024-002',
    date: '2024-07-01',
    jurisdiction: 'Australia',
    summary: 'Implemented Australian Stage 3 revised personal income tax rate schedules effective July 1, 2024.',
    sourceReference: 'ATO Treasury Laws Amendment Act 2024',
    status: 'VERIFIED_AND_DEPLOYED',
  },
  {
    id: 'corr-2024-003',
    date: '2024-04-06',
    jurisdiction: 'United Kingdom',
    summary: 'Updated Class 1 National Insurance employee primary contribution rate to 8% following Chancellor Spring Budget enactment.',
    sourceReference: 'HMRC National Insurance Guidelines 2024/25',
    status: 'VERIFIED_AND_DEPLOYED',
  },
];
