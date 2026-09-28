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

    // Effective-period rule selection
    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;

    // 1. Social Contributions (Employee Share)
    const kvCap = isHistorical2024 ? 62100 : 66150;
    const rvCap = isHistorical2024 ? 90600 : 96600;
    const kvRate = isHistorical2024 ? 0.0815 : 0.0825;

    const healthMinor = Math.round(Math.min(grossMajor, kvCap) * kvRate * 100);
    const pensionMinor = Math.round(Math.min(grossMajor, rvCap) * 0.093 * 100);
    const unemployMinor = Math.round(Math.min(grossMajor, rvCap) * 0.013 * 100);
    const nursingMinor = Math.round(Math.min(grossMajor, kvCap) * 0.022 * 100);

    const socialMinor = healthMinor + pensionMinor + unemployMinor + nursingMinor;

    // 2. German Income Tax (Einkommensteuer)
    let incomeTax = 0;
    if (isHistorical2024) {
      // EStG 2024
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
    } else {
      // EStG 2025 (Steuerfortentwicklungsgesetz)
      if (grossMajor <= 12084) {
        incomeTax = 0;
      } else if (grossMajor <= 17443) {
        const y = (grossMajor - 12084) / 10000;
        incomeTax = (995.21 * y + 1400) * y;
      } else if (grossMajor <= 68480) {
        const z = (grossMajor - 17443) / 10000;
        incomeTax = (208.85 * z + 2397) * z + 1015.51;
      } else if (grossMajor <= 277825) {
        incomeTax = 0.42 * grossMajor - 10900.0;
      } else {
        incomeTax = 0.45 * grossMajor - 19235.0;
      }
    }

    const federalTaxMinor = Math.max(0, Math.round(incomeTax * 100));

    // Solidarity surcharge (exempt for majority under statutory threshold €18,130 of tax liability)
    let soliMinor = 0;
    if (incomeTax > 18130) {
      soliMinor = Math.round((incomeTax - 18130) * 0.055 * 100);
    }

    const totalTaxMinor = federalTaxMinor + soliMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const evidenceRef = isHistorical2024 ? 'bzst-lohnsteuer-2024' : 'de-bmf-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: 'de-einkommensteuer',
        name: 'German Wage Tax (Lohnsteuer / EStG)',
        authority: 'Bundeszentralamt für Steuern (BZSt)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'EUR'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'de-sozialversicherung',
        name: 'Social Security (Health, Pension, Care & Unemployment)',
        authority: 'Deutsche Rentenversicherung / GKV',
        category: 'social_contribution',
        amount: fromMinor(socialMinor, 'EUR'),
        effectiveRate: socialMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? 'gkv-beitragssaetze-2024' : 'de-bmf-tax-2025',
      },
    ];

    const taxRuleVersion = isHistorical2024 ? 'BZSt-2024.1' : 'DE-BMF-2025.1';

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
      marginalTaxRate: grossMajor > (isHistorical2024 ? 66760 : 68480) ? 0.42 : 0.32,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
