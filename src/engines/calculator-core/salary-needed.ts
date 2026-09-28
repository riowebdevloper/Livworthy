import { createMoney, fromMinor } from '../../lib/money';
import { Money } from '../../types/money';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../../types/scenario';
import { SalaryWorthCalculator } from './salary-worth';

export interface SalaryNeededResult {
  status?: 'CALCULATED' | 'TAX_CALCULATION_UNAVAILABLE';
  warnings?: string[];
  unsupportedExplanation?: string;
  targetSavingsMonthly: Money;
  requiredGrossAnnual: Money;
  requiredNetAnnual: Money;
  monthlyExpensesTotal: Money;
  outcomeWithRequiredSalary: LivWorthCalculationOutcome;
  threeTiers: {
    essential: {
      label: string;
      requiredGrossAnnual: Money;
      monthlyLivingCosts: Money;
      monthlySavings: Money;
    };
    moderate: {
      label: string;
      requiredGrossAnnual: Money;
      monthlyLivingCosts: Money;
      monthlySavings: Money;
    };
    target: {
      label: string;
      requiredGrossAnnual: Money;
      monthlyLivingCosts: Money;
      monthlySavings: Money;
    };
  };
}

export class SalaryNeededCalculator {
  /**
   * Performs binary search over gross compensation to satisfy:
   * Net Income(Gross) - Total Expenses >= Desired Savings
   */
  public static findRequiredGross(
    scenarioTemplate: LivWorthScenario,
    desiredSavingsMonthlyMinor: number
  ): number {
    const currency = scenarioTemplate.location.currency;
    const targetAnnualNetNeededMinor =
      (SalaryWorthCalculator.calculate({
        ...scenarioTemplate,
        compensation: { baseSalary: fromMinor(50_000_00, currency) },
      }).livingCostsMonthly.amountMinor +
        desiredSavingsMonthlyMinor) *
      12;

    let lowGrossMinor = Math.max(0, targetAnnualNetNeededMinor);
    let highGrossMinor = targetAnnualNetNeededMinor * 3; // Upper bound allows for highest tax brackets

    let bestGrossMinor = highGrossMinor;

    // Binary search convergence to within $50 (5000 cents)
    for (let i = 0; i < 40; i++) {
      const midGrossMinor = Math.round((lowGrossMinor + highGrossMinor) / 2);
      const testScenario: LivWorthScenario = {
        ...scenarioTemplate,
        compensation: {
          baseSalary: fromMinor(midGrossMinor, currency),
        },
      };

      const outcome = SalaryWorthCalculator.calculate(testScenario);
      const netMinusExpensesMinor =
        outcome.takeHomeAnnual.amountMinor - outcome.livingCostsAnnual.amountMinor;
      const targetSavingsAnnualMinor = desiredSavingsMonthlyMinor * 12;

      if (netMinusExpensesMinor >= targetSavingsAnnualMinor) {
        bestGrossMinor = midGrossMinor;
        highGrossMinor = midGrossMinor - 100;
      } else {
        lowGrossMinor = midGrossMinor + 100;
      }

      if (highGrossMinor < lowGrossMinor) {
        break;
      }
    }

    return bestGrossMinor;
  }

  public static calculate(
    scenarioTemplate: LivWorthScenario,
    targetSavingsMonthly: Money
  ): SalaryNeededResult {
    const currency = scenarioTemplate.location.currency;

    // Fast-fail if statutory tax calculation is unavailable for this jurisdiction/year
    const sampleOutcome = SalaryWorthCalculator.calculate(scenarioTemplate);
    if (sampleOutcome.tax.status === 'TAX_CALCULATION_UNAVAILABLE') {
      const zeroMoney = createMoney(0, currency);
      return {
        status: 'TAX_CALCULATION_UNAVAILABLE',
        warnings: sampleOutcome.tax.warnings || [
          `Statutory tax calculation is unavailable for ${scenarioTemplate.location.name} (${scenarioTemplate.location.countryId}).`,
        ],
        unsupportedExplanation:
          sampleOutcome.tax.unsupportedExplanation ||
          `Statutory tax schedules for ${scenarioTemplate.location.name} are currently under verification. Required gross salary cannot be determined without verified official tax brackets.`,
        targetSavingsMonthly,
        requiredGrossAnnual: zeroMoney,
        requiredNetAnnual: zeroMoney,
        monthlyExpensesTotal: sampleOutcome.livingCostsMonthly,
        outcomeWithRequiredSalary: sampleOutcome,
        threeTiers: {
          essential: {
            label: 'Essential Baseline',
            requiredGrossAnnual: zeroMoney,
            monthlyLivingCosts: sampleOutcome.livingCostsMonthly,
            monthlySavings: zeroMoney,
          },
          moderate: {
            label: 'Moderate Standard (+15% Buffer)',
            requiredGrossAnnual: zeroMoney,
            monthlyLivingCosts: sampleOutcome.livingCostsMonthly,
            monthlySavings: zeroMoney,
          },
          target: {
            label: 'Your Target Scenario',
            requiredGrossAnnual: zeroMoney,
            monthlyLivingCosts: sampleOutcome.livingCostsMonthly,
            monthlySavings: zeroMoney,
          },
        },
      };
    }

    // 1. Calculate for Target savings
    const targetGrossMinor = this.findRequiredGross(
      scenarioTemplate,
      targetSavingsMonthly.amountMinor
    );
    const targetScenario: LivWorthScenario = {
      ...scenarioTemplate,
      compensation: { baseSalary: fromMinor(targetGrossMinor, currency) },
    };
    const targetOutcome = SalaryWorthCalculator.calculate(targetScenario);

    // 2. Essential scenario ($0 savings, essential lifestyle)
    const essentialTemplate: LivWorthScenario = {
      ...scenarioTemplate,
      household: {
        ...scenarioTemplate.household,
        lifestyleLevel: 'essential',
      },
    };
    const essentialGrossMinor = this.findRequiredGross(essentialTemplate, 0);
    const essentialOutcome = SalaryWorthCalculator.calculate({
      ...essentialTemplate,
      compensation: { baseSalary: fromMinor(essentialGrossMinor, currency) },
    });

    // 3. Moderate baseline ($500 / 10% target savings)
    const moderateTemplate: LivWorthScenario = {
      ...scenarioTemplate,
      household: {
        ...scenarioTemplate.household,
        lifestyleLevel: 'moderate',
      },
    };
    const moderateSavingsMinor = Math.round(essentialOutcome.livingCostsMonthly.amountMinor * 0.15);
    const moderateGrossMinor = this.findRequiredGross(moderateTemplate, moderateSavingsMinor);
    const moderateOutcome = SalaryWorthCalculator.calculate({
      ...moderateTemplate,
      compensation: { baseSalary: fromMinor(moderateGrossMinor, currency) },
    });

    return {
      status: 'CALCULATED',
      targetSavingsMonthly,
      requiredGrossAnnual: fromMinor(targetGrossMinor, currency),
      requiredNetAnnual: targetOutcome.takeHomeAnnual,
      monthlyExpensesTotal: targetOutcome.livingCostsMonthly,
      outcomeWithRequiredSalary: targetOutcome,
      threeTiers: {
        essential: {
          label: 'Essential Baseline',
          requiredGrossAnnual: fromMinor(essentialGrossMinor, currency),
          monthlyLivingCosts: essentialOutcome.livingCostsMonthly,
          monthlySavings: fromMinor(0, currency),
        },
        moderate: {
          label: 'Moderate Standard (+15% Buffer)',
          requiredGrossAnnual: fromMinor(moderateGrossMinor, currency),
          monthlyLivingCosts: moderateOutcome.livingCostsMonthly,
          monthlySavings: fromMinor(moderateSavingsMinor, currency),
        },
        target: {
          label: 'Your Target Scenario',
          requiredGrossAnnual: fromMinor(targetGrossMinor, currency),
          monthlyLivingCosts: targetOutcome.livingCostsMonthly,
          monthlySavings: targetSavingsMonthly,
        },
      },
    };
  }
}
