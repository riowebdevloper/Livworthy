import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class GermanyTaxAdapter implements TaxAdapter {
  id = 'de';
  name = 'Germany BZSt & Social Insurance Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'DE';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // 1. Social Contributions (Employee Share 2024)
    // Health (KV): ~8.15% capped at €62,100
    const healthCap = Math.min(grossMajor, 62100);
    const healthMinor = Math.round(healthCap * 0.0815 * 100);

    // Pension (RV): 9.3% capped at €90,600
    const pensionCap = Math.min(grossMajor, 90600);
    const pensionMinor = Math.round(pensionCap * 0.093 * 100);

    // Unemployment (AV): 1.3% capped at €90,600
    const unemployMinor = Math.round(pensionCap * 0.013 * 100);

    // Nursing (PV): 2.2% capped at €62,100
    const nursingMinor = Math.round(healthCap * 0.022 * 100);

    const socialMinor = healthMinor + pensionMinor + unemployMinor + nursingMinor;

    // 2. German Income Tax (Einkommensteuer 2024)
    // Standard basic tax-free allowance €11,784
    let incomeTax = 0;
    if (grossMajor <= 11784) {
      incomeTax = 0;
    } else if (grossMajor <= 17005) {
      const y = (grossMajor - 11784) / 10000;
      incomeTax = (995.21 * y + 1400) * y;
    } else if (grossMajor <= 66760) {
      const z = (grossMajor - 17005) / 10000;
      incomeTax = (208.85 * z + 2397) * z + 1015.51;
    } else if (grossMajor <= 277825) {
      incomeTax = 0.42 * grossMajor - 10636.31;
    } else {
      incomeTax = 0.45 * grossMajor - 18971.06;
    }

    const federalTaxMinor = Math.max(0, Math.round(incomeTax * 100));

    // Solidarity surcharge (exempt for majority under 2024 threshold €18,130 of tax liability)
    let soliMinor = 0;
    if (incomeTax > 18130) {
      soliMinor = Math.round((incomeTax - 18130) * 0.055 * 100);
    }

    const totalTaxMinor = federalTaxMinor + soliMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'de-einkommensteuer',
        name: 'German Wage Tax (Lohnsteuer / EStG)',
        authority: 'Bundeszentralamt für Steuern (BZSt)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'EUR'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'bzst-lohnsteuer-2024',
      },
      {
        id: 'de-sozialversicherung',
        name: 'Social Security (Health, Pension, Care & Unemployment)',
        authority: 'Deutsche Rentenversicherung / GKV',
        category: 'social_contribution',
        amount: fromMinor(socialMinor, 'EUR'),
        effectiveRate: socialMinor / (grossMinor || 1),
        evidenceRefId: 'gkv-beitragssaetze-2024',
      },
    ];

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, 'EUR'),
      federalTax: fromMinor(totalTaxMinor, 'EUR'),
      stateTax: createMoney(0, 'EUR'),
      localTax: createMoney(0, 'EUR'),
      socialContributions: fromMinor(socialMinor, 'EUR'),
      totalTax: fromMinor(totalTaxMinor, 'EUR'),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, 'EUR'),
      netIncome: fromMinor(netIncomeMinor, 'EUR'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'EUR'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'EUR'),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 66760 ? 0.42 : 0.32,
      components,
      taxRuleVersion: 'BZSt-2024.1',
      evidenceSourceIds: ['bzst-lohnsteuer-2024', 'gkv-beitragssaetze-2024'],
    };
  }
}
