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

    // 1. Box 1 Income Tax & National Insurance (2024 Tarieven Box 1)
    // Bracket 1: Up to €75,518 -> 36.97%
    // Bracket 2: Above €75,518 -> 49.50%
    const BRACKET_1_CAP = 75518;
    let grossTax = 0;
    if (grossMajor <= BRACKET_1_CAP) {
      grossTax = grossMajor * 0.3697;
    } else {
      grossTax = BRACKET_1_CAP * 0.3697 + (grossMajor - BRACKET_1_CAP) * 0.4950;
    }

    // 2. Algemene Heffingskorting (General Tax Credit 2024)
    // Max €3,362. Tapers off between €24,812 and €75,518 at 6.63%
    let generalCredit = 0;
    if (grossMajor <= 24812) {
      generalCredit = 3362;
    } else if (grossMajor < 75518) {
      generalCredit = Math.max(0, 3362 - (grossMajor - 24812) * 0.0663);
    }

    // 3. Arbeidskorting (Labour Tax Credit 2024)
    let labourCredit = 0;
    if (grossMajor <= 11490) {
      labourCredit = grossMajor * 0.08425;
    } else if (grossMajor <= 24820) {
      labourCredit = 968 + (grossMajor - 11490) * 0.31433;
    } else if (grossMajor <= 39957) {
      labourCredit = 5158 + (grossMajor - 24820) * 0.02471;
    } else {
      labourCredit = Math.max(0, 5532 - (grossMajor - 39957) * 0.0651);
    }

    const totalCredits = generalCredit + labourCredit;
    const netTax = Math.max(0, grossTax - totalCredits);

    // Break down into National Insurance (premie volksverzekeringen ~27.65% of first bracket) vs Income tax
    const volksverzekeringenShare = Math.min(grossMajor, BRACKET_1_CAP) * 0.2765;
    const nationalInsuranceMinor = Math.round(Math.min(netTax, volksverzekeringenShare) * 100);
    const incomeTaxMinor = Math.round(Math.max(0, netTax - nationalInsuranceMinor / 100) * 100);

    const totalDeductionsMinor = Math.round(netTax * 100);
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'nl-inkomstenbelasting',
        name: 'Inkomstenbelasting (Box 1 Tax after Credits)',
        authority: 'Belastingdienst',
        category: 'federal',
        amount: fromMinor(incomeTaxMinor, 'EUR'),
        effectiveRate: incomeTaxMinor / (grossMinor || 1),
        evidenceRefId: 'belastingdienst-box1-2024',
      },
      {
        id: 'nl-volksverzekeringen',
        name: 'Premie Volksverzekeringen (AOW, Anw, Wlz)',
        authority: 'Sociale Verzekeringsbank (SVB) / Belastingdienst',
        category: 'social_contribution',
        amount: fromMinor(nationalInsuranceMinor, 'EUR'),
        effectiveRate: nationalInsuranceMinor / (grossMinor || 1),
        evidenceRefId: 'belastingdienst-premies-2024',
      },
    ];

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
      marginalTaxRate: grossMajor > 75518 ? 0.495 : 0.3697,
      components,
      taxRuleVersion: 'Belastingdienst-2024.1',
      evidenceSourceIds: ['belastingdienst-box1-2024', 'belastingdienst-premies-2024'],
    };
  }
}
