import { CurrencyCode, Money } from './money';

export type FilingStatus = 'single' | 'married_filing_jointly' | 'head_of_household';

export interface TaxProfile {
  filingStatus: FilingStatus;
  dependentsCount: number;
  taxYear: number;
  pensionContributionMinor?: number; // Pre-tax 401k/IRA/pension
  healthDeductionMinor?: number; // Pre-tax healthcare premium
}

export interface TaxBracket {
  rate: number; // e.g. 0.10, 0.22, 0.37
  thresholdMinor: number; // Bracket starts at this income
  capMinor?: number; // Optional upper limit for bracket
}

export interface TaxComponentBreakdown {
  id: string;
  name: string;
  authority: string;
  category: 'federal' | 'state' | 'local' | 'social_contribution';
  amount: Money;
  effectiveRate: number;
  marginalRate?: number;
  description?: string;
  evidenceRefId: string;
}

export type TaxCalculationStatus = 'CALCULATED' | 'TAX_CALCULATION_UNAVAILABLE';

export interface TaxResult {
  status?: TaxCalculationStatus;
  grossIncome: Money;
  taxableIncome: Money;
  deductions: Money;
  federalTax: Money;
  stateTax: Money;
  localTax: Money;
  socialContributions: Money; // FICA / NI / CPP / Super / GOSI
  totalTax: Money; // All income taxes
  totalDeductionsAndTaxes: Money; // Total taken before pay check
  netIncome: Money; // Take-home pay
  monthlyNetIncome: Money;
  biweeklyNetIncome: Money;
  effectiveTaxRate: number; // (totalTax + socialContributions) / grossIncome
  marginalTaxRate: number; // combined top bracket
  components: TaxComponentBreakdown[];
  taxRuleVersion: string;
  evidenceSourceIds: string[];
  warnings?: string[];
  unsupportedExplanation?: string;
}
