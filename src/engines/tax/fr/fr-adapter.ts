import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class FranceTaxAdapter implements TaxAdapter {
  id = 'fr';
  name = 'France DGFiP & URSSAF Statutory Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'FR';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // Effective-period rule selection
    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;

    // 1. Social Contributions (URSSAF / Arrco-Agirc)
    const PASS = isHistorical2024 ? 46368 : 47100;

    // CSG / CRDS: 9.7% on 98.25% of gross (capped above 4x PASS)
    const csgBase = Math.min(grossMajor, 4 * PASS) * 0.9825;
    const csgMinor = Math.round(csgBase * 0.097 * 100);

    // Retraite complémentaire Agirc-Arrco Tranche 1 (up to 1x PASS): 3.15% + CEG 0.86% = 4.01%
    const t1Base = Math.min(grossMajor, PASS);
    const t1Minor = Math.round(t1Base * 0.0401 * 100);

    // Agirc-Arrco Tranche 2 (from 1x PASS to 8x PASS): 8.64% + CEG 1.08% = 9.72%
    let t2Minor = 0;
    if (grossMajor > PASS) {
      const t2Base = Math.min(grossMajor, 8 * PASS) - PASS;
      t2Minor = Math.round(t2Base * 0.0972 * 100);
    }

    // Other statutory health & contingency employee share (~3.5%)
    const otherSocialMinor = Math.round(grossMajor * 0.035 * 100);
    const socialContributionsMinor = csgMinor + t1Minor + t2Minor + otherSocialMinor;

    // 2. Net Imposable & Standard Allowance for Professional Expenses
    const netSalaryMajor = Math.max(0, grossMajor - socialContributionsMinor / 100);
    const standardDeduction = Math.min(14171, Math.max(495, netSalaryMajor * 0.10));
    const taxableIncomeMajor = Math.max(0, netSalaryMajor - standardDeduction);

    // 3. Impôt sur le Revenu (Barème célibataire)
    let incomeTax = 0;
    if (isHistorical2024) {
      if (taxableIncomeMajor <= 11294) {
        incomeTax = 0;
      } else if (taxableIncomeMajor <= 28797) {
        incomeTax = (taxableIncomeMajor - 11294) * 0.11;
      } else if (taxableIncomeMajor <= 82341) {
        incomeTax = (28797 - 11294) * 0.11 + (taxableIncomeMajor - 28797) * 0.30;
      } else if (taxableIncomeMajor <= 177106) {
        incomeTax =
          (28797 - 11294) * 0.11 +
          (82341 - 28797) * 0.30 +
          (taxableIncomeMajor - 82341) * 0.41;
      } else {
        incomeTax =
          (28797 - 11294) * 0.11 +
          (82341 - 28797) * 0.30 +
          (177106 - 82341) * 0.41 +
          (taxableIncomeMajor - 177106) * 0.45;
      }
    } else {
      // 2025 projected inflation adjustment
      if (taxableIncomeMajor <= 11520) {
        incomeTax = 0;
      } else if (taxableIncomeMajor <= 29373) {
        incomeTax = (taxableIncomeMajor - 11520) * 0.11;
      } else if (taxableIncomeMajor <= 83988) {
        incomeTax = (29373 - 11520) * 0.11 + (taxableIncomeMajor - 29373) * 0.30;
      } else if (taxableIncomeMajor <= 180648) {
        incomeTax =
          (29373 - 11520) * 0.11 +
          (83988 - 29373) * 0.30 +
          (taxableIncomeMajor - 83988) * 0.41;
      } else {
        incomeTax =
          (29373 - 11520) * 0.11 +
          (83988 - 29373) * 0.30 +
          (180648 - 83988) * 0.41 +
          (taxableIncomeMajor - 180648) * 0.45;
      }
    }

    if (incomeTax > 0 && incomeTax < 1929) {
      const decote = 873 - incomeTax * 0.4525;
      incomeTax = Math.max(0, incomeTax - decote);
    }

    const federalTaxMinor = Math.round(incomeTax * 100);
    const totalTaxMinor = federalTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const evidenceRef = isHistorical2024 ? 'dgfip-bareme-ir-2024' : 'fr-dgfip-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: 'fr-impot-revenu',
        name: 'Impôt sur le Revenu (Prélèvement à la Source)',
        authority: 'Direction Générale des Finances Publiques (DGFiP)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'EUR'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'fr-csg-crds',
        name: 'Cotisations Sociales & CSG/CRDS',
        authority: 'URSSAF / CNAV / Agirc-Arrco',
        category: 'social_contribution',
        amount: fromMinor(socialContributionsMinor, 'EUR'),
        effectiveRate: socialContributionsMinor / (grossMinor || 1),
        evidenceRefId: isHistorical2024 ? 'urssaf-taux-cotisations-2024' : 'fr-dgfip-tax-2025',
      },
    ];

    const taxRuleVersion = isHistorical2024 ? 'DGFiP-2024.1' : 'FR-DGFIP-2025.1';

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: fromMinor(Math.round(taxableIncomeMajor * 100), 'EUR'),
      deductions: fromMinor(Math.round(standardDeduction * 100), 'EUR'),
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
      marginalTaxRate: taxableIncomeMajor > 82341 ? 0.41 : taxableIncomeMajor > 28797 ? 0.30 : 0.11,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
