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

    // 1. Social Security (Seguridad Social 2024)
    // Base máxima 2024: €56,646/year (€4,720.50/month)
    // Rate: 4.70% (contingencias) + 1.55% (desempleo) + 0.10% (formación) + 0.12% (MEI) = 6.47%
    const ssBase = Math.min(grossMajor, 56646);
    const ssMinor = Math.round(ssBase * 0.0647 * 100);

    // 2. Net Income for Tax & Standard Work Allowance (Gastos deducibles)
    // Fixed €2,000 work expense allowance (Rendimientos del trabajo)
    const workAllowance = 2000;
    const taxableBase = Math.max(0, grossMajor - (ssMinor / 100) - workAllowance);

    // 3. IRPF (Combined State & Autonomous Community scale - standard)
    // Brackets:
    // 0 to €12,450: 19%
    // €12,450 to €20,200: 24%
    // €20,200 to €35,200: 30%
    // €35,200 to €60,000: 37%
    // €60,000 to €300,000: 45%
    // Above €300,000: 47%
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

    // Gross tax before personal minimum credit
    const grossIrpf = calcScaleTax(taxableBase);

    // Mínimo personal y familiar (€5,550 for single individual)
    const personalMinimumCredit = calcScaleTax(5550);
    const netIrpf = Math.max(0, grossIrpf - personalMinimumCredit);

    const federalTaxMinor = Math.round(netIrpf * 100);
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + ssMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'es-irpf',
        name: 'Impuesto sobre la Renta de las Personas Físicas (IRPF)',
        authority: 'Agencia Estatal de Administración Tributaria (AEAT)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'EUR'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'aeat-tramos-irpf-2024',
      },
      {
        id: 'es-seguridad-social',
        name: 'Cotizaciones a la Seguridad Social (Régimen General)',
        authority: 'Tesorería General de la Seguridad Social (TGSS)',
        category: 'social_contribution',
        amount: fromMinor(ssMinor, 'EUR'),
        effectiveRate: ssMinor / (grossMinor || 1),
        evidenceRefId: 'tgss-bases-cotizacion-2024',
      },
    ];

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
      taxRuleVersion: 'AEAT-2024.1',
      evidenceSourceIds: ['aeat-tramos-irpf-2024', 'tgss-bases-cotizacion-2024'],
    };
  }
}
