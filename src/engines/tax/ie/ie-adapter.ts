import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class IrelandTaxAdapter implements TaxAdapter {
  id = 'ie';
  name = 'Ireland Revenue Commissioners Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'IE';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // 1. PAYE Income Tax 2024
    // Single Standard Rate Cut-Off Point (SRCOP): €42,000
    const SRCOP = 42000;
    let grossIncomeTax = 0;
    if (grossMajor <= SRCOP) {
      grossIncomeTax = grossMajor * 0.20;
    } else {
      grossIncomeTax = SRCOP * 0.20 + (grossMajor - SRCOP) * 0.40;
    }

    // Standard Tax Credits: Single (€1,875) + Employee PAYE (€1,875) = €3,750
    const standardCredits = 3750;
    const netIncomeTax = Math.max(0, grossIncomeTax - standardCredits);
    const federalTaxMinor = Math.round(netIncomeTax * 100);

    // 2. Universal Social Charge (USC 2024)
    // If gross <= €13,000, exempt from USC
    let usc = 0;
    if (grossMajor > 13000) {
      const b1 = Math.min(grossMajor, 12012);
      usc += b1 * 0.005;

      if (grossMajor > 12012) {
        const b2 = Math.min(grossMajor, 25760) - 12012;
        usc += b2 * 0.02;
      }
      if (grossMajor > 25760) {
        const b3 = Math.min(grossMajor, 70044) - 25760;
        usc += b3 * 0.04;
      }
      if (grossMajor > 70044) {
        const b4 = grossMajor - 70044;
        usc += b4 * 0.08;
      }
    }
    const uscMinor = Math.round(usc * 100);

    // 3. PRSI (Pay Related Social Insurance, Class A employee 4.1%)
    let prsi = 0;
    if (grossMajor > 352 * 52) {
      prsi = grossMajor * 0.041;
      // Tapered PRSI credit if between €352 and €424/week (approx €18,304 to €22,048)
      if (grossMajor <= 424 * 52) {
        const maxCreditWeekly = 12;
        const weeklyPay = grossMajor / 52;
        const credit = Math.max(0, maxCreditWeekly - (weeklyPay - 352) / 6);
        prsi = Math.max(0, prsi - credit * 52);
      }
    }
    const prsiMinor = Math.round(prsi * 100);

    const socialContributionsMinor = uscMinor + prsiMinor;
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'ie-paye-tax',
        name: 'Irish PAYE Income Tax (after Tax Credits)',
        authority: 'Office of the Revenue Commissioners (Revenue.ie)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'EUR'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'revenue-paye-rates-2024',
      },
      {
        id: 'ie-usc',
        name: 'Universal Social Charge (USC)',
        authority: 'Office of the Revenue Commissioners (Revenue.ie)',
        category: 'social_contribution',
        amount: fromMinor(uscMinor, 'EUR'),
        effectiveRate: uscMinor / (grossMinor || 1),
        evidenceRefId: 'revenue-usc-rates-2024',
      },
      {
        id: 'ie-prsi',
        name: 'PRSI (Pay Related Social Insurance Class A)',
        authority: 'Department of Social Protection (DSP)',
        category: 'social_contribution',
        amount: fromMinor(prsiMinor, 'EUR'),
        effectiveRate: prsiMinor / (grossMinor || 1),
        evidenceRefId: 'dsp-prsi-rates-2024',
      },
    ];

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: fromMinor(Math.round(standardCredits * 100), 'EUR'),
      federalTax: fromMinor(federalTaxMinor, 'EUR'),
      stateTax: createMoney(0, 'EUR'),
      localTax: createMoney(0, 'EUR'),
      socialContributions: fromMinor(socialContributionsMinor, 'EUR'),
      totalTax: fromMinor(totalTaxMinor, 'EUR'),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, 'EUR'),
      netIncome: fromMinor(netIncomeMinor, 'EUR'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'EUR'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'EUR'),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > 70044 ? 0.52 : grossMajor > 42000 ? 0.481 : 0.261,
      components,
      taxRuleVersion: 'Revenue-2024.1',
      evidenceSourceIds: ['revenue-paye-rates-2024', 'revenue-usc-rates-2024', 'dsp-prsi-rates-2024'],
    };
  }
}
