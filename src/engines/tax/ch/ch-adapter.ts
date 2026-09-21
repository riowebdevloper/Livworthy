import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class SwitzerlandTaxAdapter implements TaxAdapter {
  id = 'ch';
  name = 'Switzerland ESTV Federal & Cantonal Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'CH';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // 1. Social Security (1st Pillar: AHV/IV/EO + ALV 2024)
    // AHV / IV / EO: 5.3% uncapped
    const ahvMinor = Math.round(grossMajor * 0.053 * 100);

    // ALV (Arbeitslosenversicherung): 1.1% up to CHF 148,200
    const alvBase = Math.min(grossMajor, 148200);
    const alvMinor = Math.round(alvBase * 0.011 * 100);

    // 2nd Pillar (BVG / Occupational Pension estimate employee share ~5.0% on coordinated salary)
    const coordinatedSalary = Math.max(0, Math.min(grossMajor, 88200) - 25725);
    const bvgMinor = Math.round(coordinatedSalary * 0.05 * 100);

    const socialContributionsMinor = ahvMinor + alvMinor + bvgMinor;

    // 2. Net Taxable Income after social deductions
    const taxableIncomeMajor = Math.max(0, grossMajor - socialContributionsMinor / 100);

    // 3. Federal Direct Tax (Direkte Bundessteuer 2024 single)
    let federalTax = 0;
    if (taxableIncomeMajor <= 14500) {
      federalTax = 0;
    } else if (taxableIncomeMajor <= 31600) {
      federalTax = (taxableIncomeMajor - 14500) * 0.0077;
    } else if (taxableIncomeMajor <= 41400) {
      federalTax = 131.65 + (taxableIncomeMajor - 31600) * 0.0088;
    } else if (taxableIncomeMajor <= 55200) {
      federalTax = 217.9 + (taxableIncomeMajor - 41400) * 0.0264;
    } else if (taxableIncomeMajor <= 72500) {
      federalTax = 582.2 + (taxableIncomeMajor - 55200) * 0.0297;
    } else if (taxableIncomeMajor <= 78100) {
      federalTax = 1096.0 + (taxableIncomeMajor - 72500) * 0.0594;
    } else if (taxableIncomeMajor <= 103600) {
      federalTax = 1428.65 + (taxableIncomeMajor - 78100) * 0.066;
    } else if (taxableIncomeMajor <= 134600) {
      federalTax = 3111.65 + (taxableIncomeMajor - 103600) * 0.088;
    } else if (taxableIncomeMajor <= 176000) {
      federalTax = 5839.65 + (taxableIncomeMajor - 134600) * 0.11;
    } else {
      federalTax = 10393.65 + (taxableIncomeMajor - 176000) * 0.132;
    }
    const federalTaxMinor = Math.round(federalTax * 100);

    // 4. Cantonal & Communal Tax (Staats- und Gemeindesteuern)
    // Modeled with Zurich / Geneva standard schedules (~11% to 16% effective depending on income)
    const cantonCode = context.regionId?.replace('CH-', '') || 'ZH';
    let cantonalEffectiveRate = 0.115;
    if (cantonCode === 'GE') {
      cantonalEffectiveRate = 0.145;
    } else if (cantonCode === 'BS') {
      cantonalEffectiveRate = 0.14;
    } else if (cantonCode === 'ZG') {
      cantonalEffectiveRate = 0.075; // Low-tax canton Zug
    }

    // Scale rate based on progressive tier
    if (taxableIncomeMajor > 150000) {
      cantonalEffectiveRate += 0.03;
    } else if (taxableIncomeMajor < 60000) {
      cantonalEffectiveRate = Math.max(0.04, cantonalEffectiveRate - 0.04);
    }

    const cantonalTaxMajor = taxableIncomeMajor * cantonalEffectiveRate;
    const stateTaxMinor = Math.round(cantonalTaxMajor * 100);

    const totalTaxMinor = federalTaxMinor + stateTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialContributionsMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'ch-bundessteuer',
        name: 'Direct Federal Tax (Direkte Bundessteuer)',
        authority: 'Eidgenössische Steuerverwaltung (ESTV)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'CHF'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'estv-bundessteuer-tarife-2024',
      },
      {
        id: 'ch-kantonssteuer',
        name: `Cantonal & Municipal Tax (${cantonCode})`,
        authority: `Kantonales Steueramt ${cantonCode}`,
        category: 'state',
        amount: fromMinor(stateTaxMinor, 'CHF'),
        effectiveRate: stateTaxMinor / (grossMinor || 1),
        evidenceRefId: 'estv-kantonssteuer-2024',
      },
      {
        id: 'ch-sozialabgaben',
        name: 'Social Security (AHV/IV/EO, ALV & BVG 2nd Pillar)',
        authority: 'Bundesamt für Sozialversicherungen (BSV)',
        category: 'social_contribution',
        amount: fromMinor(socialContributionsMinor, 'CHF'),
        effectiveRate: socialContributionsMinor / (grossMinor || 1),
        evidenceRefId: 'bsv-beitragssaetze-2024',
      },
    ];

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: fromMinor(Math.round(taxableIncomeMajor * 100), 'CHF'),
      deductions: createMoney(0, 'CHF'),
      federalTax: fromMinor(federalTaxMinor, 'CHF'),
      stateTax: fromMinor(stateTaxMinor, 'CHF'),
      localTax: createMoney(0, 'CHF'),
      socialContributions: fromMinor(socialContributionsMinor, 'CHF'),
      totalTax: fromMinor(totalTaxMinor, 'CHF'),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, 'CHF'),
      netIncome: fromMinor(netIncomeMinor, 'CHF'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'CHF'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'CHF'),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: federalTaxMinor / grossMinor + cantonalEffectiveRate + 0.064,
      components,
      taxRuleVersion: 'ESTV-2024.1',
      evidenceSourceIds: [
        'estv-bundessteuer-tarife-2024',
        'estv-kantonssteuer-2024',
        'bsv-beitragssaetze-2024',
      ],
    };
  }
}
