import { ColOverrides, CostOfLivingResult, HouseholdProfile } from './col';
import { CompensationPackage } from './compensation';
import { City } from './geo';
import { CurrencyCode, Money } from './money';
import { TaxProfile, TaxResult } from './tax';

export interface LivWorthScenario {
  location: City;
  compensation: CompensationPackage;
  taxProfile: TaxProfile;
  household: HouseholdProfile;
  overrides?: ColOverrides;
  savingsGoalMonthly?: Money;
  displayCurrency: CurrencyCode;
  calculationDate: string;
}

export interface LivWorthCalculationOutcome {
  id: string;
  generatedAt: string;
  scenario: LivWorthScenario;
  tax: TaxResult;
  costOfLiving: CostOfLivingResult;
  grossAnnual: Money;
  takeHomeAnnual: Money;
  takeHomeMonthly: Money;
  livingCostsAnnual: Money;
  livingCostsMonthly: Money;
  moneyRemainingAnnual: Money; // takeHomeAnnual - livingCostsAnnual
  moneyRemainingMonthly: Money;
  savingsCapacityAnnual: Money;
  savingsCapacityMonthly: Money;
  savingsRatePercentage: number;
  relocationYear1Costs?: Money;
  evidenceSourceIds: string[];
}

// Brand migration aliases
export type LivWorthyScenario = LivWorthScenario;
export type LivWorthyCalculationOutcome = LivWorthCalculationOutcome;
