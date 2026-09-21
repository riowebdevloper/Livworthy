import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class NewZealandTaxAdapter implements TaxAdapter {
  id = 'nz';
  name = 'New Zealand Inland Revenue (IRD) & ACC Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'NZ';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // 1. IRD PAYE Personal Income Tax Brackets (2024/2025 Revised Thresholds)
    // 0 to $15,600: 10.5%
    // $15,601 to $53,500: 17.5%
    // $53,501 to $78,100: 30%
    // $78,101 to $180,000: 33%
    // Over $180,000: 39%
    let incomeTax = 0;
    if (grossMajor <= 15600) {
      incomeTax = grossMajor * 0.105;
    } else if (grossMajor <= 53500) {
      incomeTax = 15600 * 0.105 + (grossMajor - 15600) * 0.175;
    } else if (grossMajor <= 78100) {
      incomeTax = 15600 * 0.105 + (53500 - 15600) * 0.175 + (grossMajor - 53500) * 0.30;
    } else if (grossMajor <= 180000) {
      incomeTax =
        15600 * 0.105 +
        (53500 - 15600) * 0.175 +
        (78100 - 53500) * 0.30 +
        (grossMajor - 78100) * 0.33;
    } else {
      incomeTax =
        15600 * 0.105 +
        (53500 - 15600) * 0.175 +
        (78100 - 53500) * 0.30 +
        (180000 - 78100) * 0.33 +
        (grossMajor - 180000) * 0.39;
    }
    const federalTaxMinor = Math.round(incomeTax * 100);

    // 2. ACC Earner's Levy (1.60% capped at $142,283)
    const accLiable = Math.min(grossMajor, 142283);
    const accMinor = Math.round(accLiable * 0.0160 * 100);

    const socialContributionsMinor = accMinor;
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'nz-ird-paye',
        name: 'Inland Revenue PAYE Income Tax',
        authority: 'Inland Revenue Department (Te Tari Taake)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'NZD'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'ird-tax-rates-2024-2025',
      },
      {
        id: 'nz-acc-levy',
        name: "ACC Earner's Levy (1.60%)",
        authority: 'Accident Compensation Corporation (ACC)',
        category: 'social_contribution',
        amount: fromMinor(accMinor, 'NZD'),
        effectiveRate: accMinor / (grossMinor || 1),
        evidenceRefId: 'acc-earners-levy-2024',
      },
    ];

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, 'NZD'),
      federalTax: fromMinor(federalTaxMinor, 'NZD'),
      stateTax: createMoney(0, 'NZD'),
      localTax: createMoney(0, 'NZD'),
      socialContributions: fromMinor(accMinor, 'NZD'),
      totalTax: fromMinor(totalTaxMinor, 'NZD'),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, 'NZD'),
      netIncome: fromMinor(netIncomeMinor, 'NZD'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'NZD'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'NZD'),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 180000 ? 0.406 : grossMajor > 78100 ? 0.346 : 0.316,
      components,
      taxRuleVersion: 'IRD-2024.2',
      evidenceSourceIds: ['ird-tax-rates-2024-2025', 'acc-earners-levy-2024'],
    };
  }
}
