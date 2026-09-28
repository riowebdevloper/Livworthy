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

    // Effective-period rule selection
    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;

    // 1. PAYE Income Tax
    // Single Standard Rate Cut-Off Point (SRCOP): 2024 €42,000 / 2025 €44,000
    const SRCOP = isHistorical2024 ? 42000 : 44000;
    let grossIncomeTax = 0;
    if (grossMajor <= SRCOP) {
      grossIncomeTax = grossMajor * 0.20;
    } else {
      grossIncomeTax = SRCOP * 0.20 + (grossMajor - SRCOP) * 0.40;
    }

    // Standard Tax Credits: Single + Employee PAYE
    const standardCredits = isHistorical2024 ? 3750 : 4000;
    const netIncomeTax = Math.max(0, grossIncomeTax - standardCredits);
    const federalTaxMinor = Math.round(netIncomeTax * 100);

    // 2. Universal Social Charge (USC)
    let usc = 0;
    if (grossMajor > 13000) {
      const b1 = Math.min(grossMajor, 12012);
      usc += b1 * 0.005;

      const uscB2Cap = isHistorical2024 ? 25760 : 27382;
      const uscB3Rate = isHistorical2024 ? 0.04 : 0.03;

      if (grossMajor > 12012) {
        const b2 = Math.min(grossMajor, uscB2Cap) - 12012;
        usc += b2 * 0.02;
      }
      if (grossMajor > uscB2Cap) {
        const b3 = Math.min(grossMajor, 70044) - uscB2Cap;
        usc += b3 * uscB3Rate;
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

    const evidenceRef = isHistorical2024 ? 'revenue-paye-rates-2024' : 'ie-revenue-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: 'ie-paye-tax',
        name: 'Irish PAYE Income Tax (after Tax Credits)',
        authority: 'Office of the Revenue Commissioners (Revenue.ie)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'EUR'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'ie-usc',
        name: 'Universal Social Charge (USC)',
        authority: 'Office of the Revenue Commissioners (Revenue.ie)',
        category: 'social_contribution',
        amount: fromMinor(uscMinor, 'EUR'),
        effectiveRate: uscMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? 'revenue-usc-rates-2024' : 'ie-revenue-tax-2025',
      },
      {
        id: 'ie-prsi',
        name: 'PRSI (Pay Related Social Insurance Class A)',
        authority: 'Department of Social Protection (DSP)',
        category: 'social_contribution',
        amount: fromMinor(prsiMinor, 'EUR'),
        effectiveRate: prsiMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? 'dsp-prsi-rates-2024' : 'ie-revenue-tax-2025',
      },
    ];

    const taxRuleVersion = isHistorical2024 ? 'Revenue-2024.1' : 'IE-REVENUE-2025.1';

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
      marginalTaxRate: grossMajor > 70044 ? 0.52 : grossMajor > SRCOP ? 0.481 : 0.261,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
