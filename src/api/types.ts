import { CurrencyCode, Money } from '../types/money';
import { HouseholdProfile, CostOfLivingResult } from '../types/col';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../types/scenario';
import { TaxResult, FilingStatus } from '../types/tax';
import { ComparisonResult, RelocationProfile } from '../engines/calculator-core/compare';
import { SalaryNeededResult } from '../engines/calculator-core/salary-needed';

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  scenarioId?: string;
  resultId?: string;
  calculatedAt?: string;
  verificationStatus?: 'VERIFIED' | 'LIMITED' | 'PROVISIONAL' | 'UNSUPPORTED';
  isStatutorilyVerified?: boolean;
  notes?: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  retryAfterSeconds?: number;
  statusCode?: number;
}

export interface CalculateSalaryWorthRequest {
  scenario: LivWorthScenario;
}

export interface CalculateSalaryNeededRequest {
  scenario: LivWorthScenario;
  targetSavingsMonthlyMinor: number;
}

export interface CalculateSalaryAfterTaxRequest {
  grossSalaryMinor: number;
  currency: CurrencyCode;
  countryId: string;
  regionId?: string;
  cityId?: string;
  taxJurisdictionId?: string;
  filingStatus?: FilingStatus;
  dependentsCount?: number;
  taxYear?: number;
}

export interface CalculateCostOfLivingRequest {
  cityId: string;
  household: HouseholdProfile;
  overrides?: {
    actualRentMonthlyMinor?: number;
    actualGroceriesMonthlyMinor?: number;
    actualTransitMonthlyMinor?: number;
  };
}

export interface CompareRequest {
  scenarioA: LivWorthScenario;
  scenarioB: LivWorthScenario;
  displayCurrency?: CurrencyCode;
  relocationB?: RelocationProfile;
}
