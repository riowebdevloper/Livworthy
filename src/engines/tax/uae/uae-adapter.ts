import { fromMinor } from '../../../lib/money';
import { CurrencyCode, Money } from '../../../types/money';
import { TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class UaeTaxAdapter implements TaxAdapter {
  id = 'uae';
  name = 'United Arab Emirates Tax Engine (0% Personal Income Tax)';

  supports(context: TaxContext): boolean {
    return context.countryId === 'AE';
  }

  calculate(gross: Money, _profile: TaxProfile, _context: TaxContext): TaxResult {
    const currency: CurrencyCode = 'AED';
    const grossMinor = gross.amountMinor;

    return {
      grossIncome: gross,
      taxableIncome: fromMinor(0, currency),
      deductions: fromMinor(0, currency),
      federalTax: fromMinor(0, currency),
      stateTax: fromMinor(0, currency),
      localTax: fromMinor(0, currency),
      socialContributions: fromMinor(0, currency),
      totalTax: fromMinor(0, currency),
      totalDeductionsAndTaxes: fromMinor(0, currency),
      netIncome: gross,
      monthlyNetIncome: fromMinor(Math.round(grossMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(grossMinor / 26), currency),
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      components: [
        {
          id: 'uae-personal-income-tax',
          name: 'UAE Personal Income Tax',
          authority: 'Federal Tax Authority (FTA)',
          category: 'federal',
          amount: fromMinor(0, currency),
          effectiveRate: 0,
          description: 'No federal or emirate personal income tax levied on employee salaries',
          evidenceRefId: 'uae-fta-2024',
        },
      ],
      taxRuleVersion: 'UAE-FTA-2024.1',
      evidenceSourceIds: ['uae-fta-2024'],
    };
  }
}
