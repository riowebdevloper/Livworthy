import { Money } from './money';

export interface CompensationPackage {
  // Spendable cash
  baseSalary: Money;
  cashBonusAnnual?: Money;
  commissionAnnual?: Money;
  cashAllowancesAnnual?: Money;

  // Deferred compensation
  equityAnnualValue?: Money;
  pensionEmployerAnnual?: Money;

  // Expense-replacing benefits
  housingAllowanceAnnual?: Money;
  transportAllowanceAnnual?: Money;
  healthInsuranceBenefitAnnual?: Money;
  educationAllowanceAnnual?: Money;
  annualFlightsBenefitAnnual?: Money;
}

export interface NormalizedCompensation {
  totalSpendableGrossAnnual: Money;
  totalExpenseReplacingBenefitsAnnual: Money;
  totalDeferredCompensationAnnual: Money;
  totalPackageNominalAnnual: Money;
}
