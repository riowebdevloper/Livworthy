import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class SpainTaxAdapter implements TaxAdapter {
  id = 'es';
  name = 'Spain AEAT & Seguridad Social Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'ES';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // Effective-period rule selection
    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;

    // 1. Social Security (Seguridad Social)
    const ssBaseLimit = isHistorical2024 ? 56646 : 60000;
    const ssRate = isHistorical2024 ? 0.0647 : 0.0649; // MEI increases slightly in 2025
    const ssBase = Math.min(grossMajor, ssBaseLimit);
    const ssMinor = Math.round(ssBase * ssRate * 100);

    // 2. Net Income for Tax & Standard Work Allowance (Gastos deducibles)
    const workAllowance = 2000;
    const taxableBase = Math.max(0, grossMajor - ssMinor / 100 - workAllowance);

    // 3. IRPF (Combined State & Autonomous Community scale - standard)
    const calcScaleTax = (income: number): number => {
      if (income <= 0) return 0;
      if (income <= 12450) return income * 0.19;
      if (income <= 20200) return 12450 * 0.19 + (income - 12450) * 0.24;
      if (income <= 35200) return 12450 * 0.19 + (20200 - 12450) * 0.24 + (income - 20200) * 0.30;
      if (income <= 60000)
        return (
          12450 * 0.19 +
          (20200 - 12450) * 0.24 +
          (35200 - 20200) * 0.30 +
          (income - 35200) * 0.37
        );
      if (income <= 300000)
        return (
          12450 * 0.19 +
          (20200 - 12450) * 0.24 +
          (35200 - 20200) * 0.30 +
          (60000 - 35200) * 0.37 +
          (income - 60000) * 0.45
        );
      return (
        12450 * 0.19 +
        (20200 - 12450) * 0.24 +
        (35200 - 20200) * 0.30 +
        (60000 - 35200) * 0.37 +
        (300000 - 60000) * 0.45 +
        (income - 300000) * 0.47
      );
    };

    const grossIrpf = calcScaleTax(taxableBase);
    const personalMinimumCredit = calcScaleTax(5550);
    const netIrpf = Math.max(0, grossIrpf - personalMinimumCredit);

    const federalTaxMinor = Math.round(netIrpf * 100);
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + ssMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const evidenceRef = isHistorical2024 ? 'aeat-tramos-irpf-2024' : 'es-aeat-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: 'es-irpf',
        name: 'Impuesto sobre la Renta de las Personas Físicas (IRPF)',
        authority: 'Agencia Estatal de Administración Tributaria (AEAT)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'EUR'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'es-seguridad-social',
        name: 'Cotizaciones a la Seguridad Social (Régimen General)',
        authority: 'Tesorería General de la Seguridad Social (TGSS)',
        category: 'social_contribution',
        amount: fromMinor(ssMinor, 'EUR'),
        effectiveRate: ssMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? 'tgss-bases-cotizacion-2024' : 'es-aeat-tax-2025',
      },
    ];

    const taxRuleVersion = isHistorical2024 ? 'AEAT-2024.1' : 'ES-AEAT-2025.1';

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: fromMinor(Math.round(taxableBase * 100), 'EUR'),
      deductions: fromMinor(Math.round(workAllowance * 100), 'EUR'),
      federalTax: fromMinor(federalTaxMinor, 'EUR'),
      stateTax: createMoney(0, 'EUR'),
      localTax: createMoney(0, 'EUR'),
      socialContributions: fromMinor(ssMinor, 'EUR'),
      totalTax: fromMinor(totalTaxMinor, 'EUR'),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, 'EUR'),
      netIncome: fromMinor(netIncomeMinor, 'EUR'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'EUR'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'EUR'),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: taxableBase > 60000 ? 0.45 : taxableBase > 35200 ? 0.37 : 0.30,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
