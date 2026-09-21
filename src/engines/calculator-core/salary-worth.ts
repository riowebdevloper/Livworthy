import { fromMinor } from '../../lib/money';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../../types/scenario';
import { CostOfLivingEngine } from '../col/col-engine';
import { TaxRegistry } from '../tax/tax-registry';

export class SalaryWorthCalculator {
  public static calculate(scenario: LivWorthScenario): LivWorthCalculationOutcome {
    const currency = scenario.location.currency;

    // 1. Calculate Gross Cash Compensation
    const baseMinor = scenario.compensation.baseSalary.amountMinor;
    const bonusMinor = scenario.compensation.cashBonusAnnual?.amountMinor || 0;
    const commissionMinor = scenario.compensation.commissionAnnual?.amountMinor || 0;
    const allowancesMinor = scenario.compensation.cashAllowancesAnnual?.amountMinor || 0;
    const totalSpendableGrossMinor = baseMinor + bonusMinor + commissionMinor + allowancesMinor;

    const grossAnnual = fromMinor(totalSpendableGrossMinor, currency);

    // 2. Tax calculation
    const taxContext = {
      countryId: scenario.location.countryId,
      regionId: scenario.location.regionId,
      cityId: scenario.location.id,
      taxJurisdictionId: scenario.location.taxJurisdictionId,
    };

    const taxResult = TaxRegistry.calculate(grossAnnual, scenario.taxProfile, taxContext);

    // 3. Cost of Living
    const colResult = CostOfLivingEngine.calculate(
      scenario.location.id,
      scenario.household,
      scenario.overrides
    );

    // 4. Net & Disposable
    const takeHomeAnnualMinor = taxResult.netIncome.amountMinor;
    const takeHomeMonthlyMinor = Math.round(takeHomeAnnualMinor / 12);

    // Handle expense-replacing benefits (e.g. employer housing allowance)
    let netLivingCostsAnnualMinor = colResult.annualTotal.amountMinor;
    if (scenario.compensation.housingAllowanceAnnual) {
      netLivingCostsAnnualMinor = Math.max(
        0,
        netLivingCostsAnnualMinor - scenario.compensation.housingAllowanceAnnual.amountMinor
      );
    }
    const netLivingCostsMonthlyMinor = Math.round(netLivingCostsAnnualMinor / 12);

    const moneyRemainingAnnualMinor = takeHomeAnnualMinor - netLivingCostsAnnualMinor;
    const moneyRemainingMonthlyMinor = Math.round(moneyRemainingAnnualMinor / 12);

    // Savings capacity
    const savingsCapacityAnnualMinor = Math.max(0, moneyRemainingAnnualMinor);
    const savingsCapacityMonthlyMinor = Math.max(0, moneyRemainingMonthlyMinor);
    const savingsRate =
      grossAnnual.amountMinor > 0 ? (savingsCapacityAnnualMinor / grossAnnual.amountMinor) * 100 : 0;

    const allEvidenceSources = Array.from(
      new Set([...taxResult.evidenceSourceIds, ...colResult.evidenceSourceIds])
    );

    return {
      id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      generatedAt: new Date().toISOString(),
      scenario,
      tax: taxResult,
      costOfLiving: colResult,
      grossAnnual,
      takeHomeAnnual: fromMinor(takeHomeAnnualMinor, currency),
      takeHomeMonthly: fromMinor(takeHomeMonthlyMinor, currency),
      livingCostsAnnual: fromMinor(netLivingCostsAnnualMinor, currency),
      livingCostsMonthly: fromMinor(netLivingCostsMonthlyMinor, currency),
      moneyRemainingAnnual: fromMinor(moneyRemainingAnnualMinor, currency),
      moneyRemainingMonthly: fromMinor(moneyRemainingMonthlyMinor, currency),
      savingsCapacityAnnual: fromMinor(savingsCapacityAnnualMinor, currency),
      savingsCapacityMonthly: fromMinor(savingsCapacityMonthlyMinor, currency),
      savingsRatePercentage: Math.round(savingsRate * 10) / 10,
      evidenceSourceIds: allEvidenceSources,
    };
  }
}
