import { createMoney } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class FallbackUnsupportedTaxAdapter implements TaxAdapter {
  id = 'fallback';
  name = 'Fallback Unsupported Jurisdiction Adapter';

  public supports(context: TaxContext): boolean {
    // Acts as the catch-all for any country without a verified statutory adapter
    return true;
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const currency = grossCompensation.currency;
    const countryName = context.countryId || 'this territory';

    return {
      status: 'TAX_CALCULATION_UNAVAILABLE',
      grossIncome: grossCompensation,
      taxableIncome: createMoney(0, currency),
      deductions: createMoney(0, currency),
      federalTax: createMoney(0, currency),
      stateTax: createMoney(0, currency),
      localTax: createMoney(0, currency),
      socialContributions: createMoney(0, currency),
      totalTax: createMoney(0, currency),
      totalDeductionsAndTaxes: createMoney(0, currency),
      netIncome: grossCompensation,
      monthlyNetIncome: createMoney(0, currency),
      biweeklyNetIncome: createMoney(0, currency),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components: [],
      taxRuleVersion: 'UNSUPPORTED-JURISDICTION',
      evidenceSourceIds: [],
      warnings: [
        `Detailed statutory tax calculation for ${countryName} is currently under verification. LivWorthy does not fabricate synthetic tax rates without verified official schedules.`,
      ],
      unsupportedExplanation: `Statutory tax schedules for ${countryName} are currently in research. In accordance with LivWorthy's data integrity charter, we do not substitute verified statutory tax tables with artificial approximations.`,
    };
  }
}
