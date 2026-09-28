import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class NetherlandsTaxAdapter implements TaxAdapter {
  id = 'nl';
  name = 'Netherlands Belastingdienst Box 1 Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'NL';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // Effective-period rule selection
    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;

    // 1. Box 1 Income Tax & National Insurance
    const bracket1Cap = isHistorical2024 ? 75518 : 76817;
    const bracket1Rate = isHistorical2024 ? 0.3697 : 0.3582;
    const bracket2Rate = 0.495;

    let grossTax = 0;
    if (grossMajor <= bracket1Cap) {
      grossTax = grossMajor * bracket1Rate;
    } else {
      grossTax = bracket1Cap * bracket1Rate + (grossMajor - bracket1Cap) * bracket2Rate;
    }

    // 2. Algemene Heffingskorting (General Tax Credit)
    let generalCredit = 0;
    const maxGenCredit = isHistorical2024 ? 3362 : 3068;
    const genThreshold = isHistorical2024 ? 24812 : 28406;
    const genTaperRate = isHistorical2024 ? 0.0663 : 0.06337;

    if (grossMajor <= genThreshold) {
      generalCredit = maxGenCredit;
    } else if (grossMajor < bracket1Cap) {
      generalCredit = Math.max(0, maxGenCredit - (grossMajor - genThreshold) * genTaperRate);
    }

    // 3. Arbeidskorting (Labour Tax Credit)
    let labourCredit = 0;
    if (isHistorical2024) {
      if (grossMajor <= 11490) {
        labourCredit = grossMajor * 0.08425;
      } else if (grossMajor <= 24820) {
        labourCredit = 968 + (grossMajor - 11490) * 0.31433;
      } else if (grossMajor <= 39957) {
        labourCredit = 5158 + (grossMajor - 24820) * 0.02471;
      } else {
        labourCredit = Math.max(0, 5532 - (grossMajor - 39957) * 0.0651);
      }
    } else {
      if (grossMajor <= 11500) {
        labourCredit = grossMajor * 0.084;
      } else if (grossMajor <= 25000) {
        labourCredit = 966 + (grossMajor - 11500) * 0.314;
      } else if (grossMajor <= 40000) {
        labourCredit = 5205 + (grossMajor - 25000) * 0.024;
      } else {
        labourCredit = Math.max(0, 5599 - (grossMajor - 40000) * 0.0651);
      }
    }

    const totalCredits = generalCredit + labourCredit;
    const netTax = Math.max(0, grossTax - totalCredits);

    const volksverzekeringenShare = Math.min(grossMajor, bracket1Cap) * 0.2765;
    const nationalInsuranceMinor = Math.round(Math.min(netTax, volksverzekeringenShare) * 100);
    const incomeTaxMinor = Math.round(Math.max(0, netTax - nationalInsuranceMinor / 100) * 100);

    const totalDeductionsMinor = Math.round(netTax * 100);
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const evidenceRef = isHistorical2024 ? 'belastingdienst-box1-2024' : 'nl-belasting-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: 'nl-inkomstenbelasting',
        name: 'Inkomstenbelasting (Box 1 Tax after Credits)',
        authority: 'Belastingdienst',
        category: 'federal',
        amount: fromMinor(incomeTaxMinor, 'EUR'),
        effectiveRate: incomeTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'nl-volksverzekeringen',
        name: 'Premie Volksverzekeringen (AOW, Anw, Wlz)',
        authority: 'Sociale Verzekeringsbank (SVB) / Belastingdienst',
        category: 'social_contribution',
        amount: fromMinor(nationalInsuranceMinor, 'EUR'),
        effectiveRate: nationalInsuranceMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? 'belastingdienst-premies-2024' : 'nl-belasting-tax-2025',
      },
    ];

    const taxRuleVersion = isHistorical2024 ? 'Belastingdienst-2024.1' : 'NL-BELASTING-2025.1';

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: fromMinor(Math.round(totalCredits * 100), 'EUR'),
      federalTax: fromMinor(incomeTaxMinor, 'EUR'),
      stateTax: createMoney(0, 'EUR'),
      localTax: createMoney(0, 'EUR'),
      socialContributions: fromMinor(nationalInsuranceMinor, 'EUR'),
      totalTax: fromMinor(totalDeductionsMinor, 'EUR'),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, 'EUR'),
      netIncome: fromMinor(netIncomeMinor, 'EUR'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'EUR'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'EUR'),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: grossMajor > bracket1Cap ? 0.495 : bracket1Rate,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
