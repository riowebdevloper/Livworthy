import { createMoney, fromMinor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class SaudiTaxAdapter implements TaxAdapter {
  id = 'sa';
  name = 'Saudi ZATCA & Gulf Statutory Zero-Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'SA';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const currency = grossCompensation.currency;

    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;
    const taxRuleVersion = isHistorical2024 ? 'GULF-2024.1' : 'SA-ZATCA-2025.1';
    const evidenceRef = isHistorical2024 ? 'gulf-zero-income-tax-statute' : 'sa-zatca-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: `${context.countryId.toLowerCase()}-zero-tax`,
        name: `${context.countryId === 'SA' ? 'Saudi Arabia' : 'Qatar'} Statutory Personal Income Tax (0%)`,
        authority:
          context.countryId === 'SA'
            ? 'Zakat, Tax and Customs Authority (ZATCA)'
            : 'General Tax Authority (GTA)',
        category: 'federal',
        amount: createMoney(0, currency),
        effectiveRate: 0,
        evidenceRefId: evidenceRef,
      },
    ];

    return {
      status: 'CALCULATED',
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
      monthlyNetIncome: fromMinor(Math.round(grossMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(grossMinor / 26), currency),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
