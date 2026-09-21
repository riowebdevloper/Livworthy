import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class SingaporeTaxAdapter implements TaxAdapter {
  id = 'sg';
  name = 'Singapore IRAS Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'SG';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // Singapore IRAS Resident Tax Brackets (YA 2024):
    // First $20,000: 0%
    // Next $10,000 ($20,001 - $30,000): 2%
    // Next $10,000 ($30,001 - $40,000): 3.5%
    // Next $40,000 ($40,001 - $80,000): 7%
    // Next $40,000 ($80,001 - $120,000): 11.5%
    // Next $40,000 ($120,001 - $160,000): 15%
    // Next $40,000 ($160,001 - $200,000): 18%
    // Next $40,000 ($200,001 - $240,000): 19%
    // Next $40,000 ($240,001 - $280,000): 19.5%
    // Next $40,000 ($280,001 - $320,000): 20%
    // Next $180,000 ($320,001 - $500,000): 22%
    // Above $500,000: 24%
    let tax = 0;
    if (grossMajor <= 20000) {
      tax = 0;
    } else if (grossMajor <= 30000) {
      tax = (grossMajor - 20000) * 0.02;
    } else if (grossMajor <= 40000) {
      tax = 200 + (grossMajor - 30000) * 0.035;
    } else if (grossMajor <= 80000) {
      tax = 550 + (grossMajor - 40000) * 0.07;
    } else if (grossMajor <= 120000) {
      tax = 3350 + (grossMajor - 80000) * 0.115;
    } else if (grossMajor <= 160000) {
      tax = 7950 + (grossMajor - 120000) * 0.15;
    } else if (grossMajor <= 200000) {
      tax = 13950 + (grossMajor - 160000) * 0.18;
    } else if (grossMajor <= 240000) {
      tax = 21150 + (grossMajor - 200000) * 0.19;
    } else if (grossMajor <= 280000) {
      tax = 28750 + (grossMajor - 240000) * 0.195;
    } else if (grossMajor <= 320000) {
      tax = 36550 + (grossMajor - 280000) * 0.20;
    } else if (grossMajor <= 500000) {
      tax = 44550 + (grossMajor - 320000) * 0.22;
    } else {
      tax = 84150 + (grossMajor - 500000) * 0.24;
    }

    const federalTaxMinor = Math.round(tax * 100);
    const totalTaxMinor = federalTaxMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalTaxMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'sg-iras-income-tax',
        name: 'Inland Revenue Authority of Singapore (IRAS) Resident Tax',
        authority: 'Inland Revenue Authority of Singapore (IRAS)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'SGD'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'iras-tax-rates-2024',
      },
    ];

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, 'SGD'),
      federalTax: fromMinor(federalTaxMinor, 'SGD'),
      stateTax: createMoney(0, 'SGD'),
      localTax: createMoney(0, 'SGD'),
      socialContributions: createMoney(0, 'SGD'),
      totalTax: fromMinor(totalTaxMinor, 'SGD'),
      totalDeductionsAndTaxes: fromMinor(totalTaxMinor, 'SGD'),
      netIncome: fromMinor(netIncomeMinor, 'SGD'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'SGD'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'SGD'),
      effectiveTaxRate: totalTaxMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 500000 ? 0.24 : grossMajor > 320000 ? 0.22 : 0.19,
      components,
      taxRuleVersion: 'IRAS-YA2024',
      evidenceSourceIds: ['iras-tax-rates-2024'],
    };
  }
}
