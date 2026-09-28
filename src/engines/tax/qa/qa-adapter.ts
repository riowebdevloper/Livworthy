import { createMoney, fromMinor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class QatarTaxAdapter implements TaxAdapter {
  id = 'qa';
  name = 'Qatar GTA Statutory Zero-Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'QA';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;

    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;
    const taxRuleVersion = isHistorical2024 ? 'GTA-2024.1' : 'QA-GTA-2025.1';
    const evidenceRef = isHistorical2024 ? 'qatar-income-tax-law-2018' : 'qa-gta-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: 'qa-statutory-tax',
        name: 'Qatar Personal Employment Income Tax (0%)',
        authority: 'General Tax Authority (GTA)',
        category: 'federal',
        amount: createMoney(0, 'QAR'),
        effectiveRate: 0,
        evidenceRefId: evidenceRef,
      },
    ];

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: createMoney(0, 'QAR'),
      deductions: createMoney(0, 'QAR'),
      federalTax: createMoney(0, 'QAR'),
      stateTax: createMoney(0, 'QAR'),
      localTax: createMoney(0, 'QAR'),
      socialContributions: createMoney(0, 'QAR'),
      totalTax: createMoney(0, 'QAR'),
      totalDeductionsAndTaxes: createMoney(0, 'QAR'),
      netIncome: grossCompensation,
      monthlyNetIncome: fromMinor(Math.round(grossMinor / 12), 'QAR'),
      biweeklyNetIncome: fromMinor(Math.round(grossMinor / 26), 'QAR'),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
