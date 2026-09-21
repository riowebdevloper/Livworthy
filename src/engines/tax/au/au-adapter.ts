import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class AustraliaTaxAdapter implements TaxAdapter {
  id = 'au';
  name = 'Australia ATO Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'AU';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // Australia 2024-2025 Resident Tax Rates (Revised Stage 3 Cuts):
    // 0 to $18,200: Nil
    // $18,201 to $45,000: 16% on excess over $18,200
    // $45,001 to $135,000: $4,288 + 30% on excess over $45,000
    // $135,001 to $190,000: $31,288 + 37% on excess over $135,000
    // Over $190,000: $51,638 + 45% on excess over $190,000
    let incomeTax = 0;
    if (grossMajor <= 18200) {
      incomeTax = 0;
    } else if (grossMajor <= 45000) {
      incomeTax = (grossMajor - 18200) * 0.16;
    } else if (grossMajor <= 135000) {
      incomeTax = 4288 + (grossMajor - 45000) * 0.30;
    } else if (grossMajor <= 190000) {
      incomeTax = 31288 + (grossMajor - 135000) * 0.37;
    } else {
      incomeTax = 51638 + (grossMajor - 190000) * 0.45;
    }

    // Medicare Levy (2.0% standard, shade-in threshold ~$26,000)
    let medicareLevy = 0;
    if (grossMajor > 32500) {
      medicareLevy = grossMajor * 0.02;
    } else if (grossMajor > 26000) {
      medicareLevy = (grossMajor - 26000) * 0.10;
    }

    const federalTaxMinor = Math.round(incomeTax * 100);
    const medicareMinor = Math.round(medicareLevy * 100);
    const totalTaxMinor = federalTaxMinor + medicareMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalTaxMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'au-income-tax',
        name: 'Australian Resident Income Tax (Stage 3)',
        authority: 'Australian Taxation Office (ATO)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'AUD'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'ato-individual-rates-2024',
      },
      {
        id: 'au-medicare-levy',
        name: 'Medicare Levy (2.0%)',
        authority: 'Services Australia / ATO',
        category: 'social_contribution',
        amount: fromMinor(medicareMinor, 'AUD'),
        effectiveRate: medicareMinor / (grossMinor || 1),
        evidenceRefId: 'ato-medicare-levy-2024',
      },
    ];

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, 'AUD'),
      federalTax: fromMinor(federalTaxMinor, 'AUD'),
      stateTax: createMoney(0, 'AUD'),
      localTax: createMoney(0, 'AUD'),
      socialContributions: fromMinor(medicareMinor, 'AUD'),
      totalTax: fromMinor(totalTaxMinor, 'AUD'),
      totalDeductionsAndTaxes: fromMinor(totalTaxMinor, 'AUD'),
      netIncome: fromMinor(netIncomeMinor, 'AUD'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'AUD'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'AUD'),
      effectiveTaxRate: totalTaxMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 190000 ? 0.47 : grossMajor > 135000 ? 0.39 : 0.32,
      components,
      taxRuleVersion: 'ATO-2024.2',
      evidenceSourceIds: ['ato-individual-rates-2024', 'ato-medicare-levy-2024'],
    };
  }
}
