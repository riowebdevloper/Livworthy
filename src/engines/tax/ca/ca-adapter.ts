import { createMoney, fromMinor, toMajor } from '../../../lib/money';
import { Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class CanadaTaxAdapter implements TaxAdapter {
  id = 'ca';
  name = 'Canada CRA & Provincial Tax Engine';

  public supports(context: TaxContext): boolean {
    return context.countryId === 'CA';
  }

  public calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const grossMinor = grossCompensation.amountMinor;
    const grossMajor = toMajor(grossCompensation);

    // Effective-period rule selection
    const requestedYear = profile.taxYear || context.taxYear || 2025;
    const isHistorical2024 = requestedYear <= 2024;

    // 1. CPP (Canada Pension Plan)
    let cppMinor = 0;
    if (isHistorical2024) {
      // 2024: Base CPP 5.95% between $3,500 and $68,500 (Max $3,867.50)
      if (grossMajor > 3500) {
        const cppEligible = Math.min(grossMajor, 68500) - 3500;
        cppMinor = Math.round(cppEligible * 0.0595 * 100);
      }
      // 2024 CPP2: 4.0% between $68,500 and $73,200 (Max $188)
      if (grossMajor > 68500) {
        const cpp2Eligible = Math.min(grossMajor, 73200) - 68500;
        cppMinor += Math.round(cpp2Eligible * 0.04 * 100);
      }
    } else {
      // 2025 (CRA Statutory Parameters): Base CPP 5.95% between $3,500 and $71,300 (Max $4,034.10)
      if (grossMajor > 3500) {
        const cppEligible = Math.min(grossMajor, 71300) - 3500;
        cppMinor = Math.round(cppEligible * 0.0595 * 100);
      }
      // 2025 CPP2: 4.0% between $71,300 and $81,200 (Max $396.00)
      if (grossMajor > 71300) {
        const cpp2Eligible = Math.min(grossMajor, 81200) - 71300;
        cppMinor += Math.round(cpp2Eligible * 0.04 * 100);
      }
    }

    // 2. EI (Employment Insurance)
    let eiMinor = 0;
    if (isHistorical2024) {
      // 2024: 1.66% on gross up to $63,200 (Max $1,049.12)
      const eiEligible = Math.min(grossMajor, 63200);
      eiMinor = Math.round(eiEligible * 0.0166 * 100);
    } else {
      // 2025: 1.64% on gross up to $65,700 (Max $1,077.48)
      const eiEligible = Math.min(grossMajor, 65700);
      eiMinor = Math.round(eiEligible * 0.0164 * 100);
    }

    const socialMinor = cppMinor + eiMinor;

    // 3. Federal Income Tax
    let fedGrossTax = 0;
    let fedBpa = 15705;

    if (isHistorical2024) {
      // 2024 Federal Brackets:
      // 15% on first $55,867
      // 20.5% on $55,867 to $111,733
      // 26% on $111,733 to $173,205
      // 29% on $173,205 to $246,752
      // 33% on excess over $246,752
      fedBpa = 15705;
      if (grossMajor <= 55867) {
        fedGrossTax = grossMajor * 0.15;
      } else if (grossMajor <= 111733) {
        fedGrossTax = 55867 * 0.15 + (grossMajor - 55867) * 0.205;
      } else if (grossMajor <= 173205) {
        fedGrossTax = 55867 * 0.15 + (111733 - 55867) * 0.205 + (grossMajor - 111733) * 0.26;
      } else if (grossMajor <= 246752) {
        fedGrossTax =
          55867 * 0.15 +
          (111733 - 55867) * 0.205 +
          (173205 - 111733) * 0.26 +
          (grossMajor - 173205) * 0.29;
      } else {
        fedGrossTax =
          55867 * 0.15 +
          (111733 - 55867) * 0.205 +
          (173205 - 111733) * 0.26 +
          (246752 - 173205) * 0.29 +
          (grossMajor - 246752) * 0.33;
      }
    } else {
      // 2025 Federal Brackets (2.7% indexation):
      // 15% on first $57,375
      // 20.5% on $57,375 to $114,750
      // 26% on $114,750 to $177,882
      // 29% on $177,882 to $253,414
      // 33% on excess over $253,414
      fedBpa = 16129;
      if (grossMajor <= 57375) {
        fedGrossTax = grossMajor * 0.15;
      } else if (grossMajor <= 114750) {
        fedGrossTax = 57375 * 0.15 + (grossMajor - 57375) * 0.205;
      } else if (grossMajor <= 177882) {
        fedGrossTax = 57375 * 0.15 + (114750 - 57375) * 0.205 + (grossMajor - 114750) * 0.26;
      } else if (grossMajor <= 253414) {
        fedGrossTax =
          57375 * 0.15 +
          (114750 - 57375) * 0.205 +
          (177882 - 114750) * 0.26 +
          (grossMajor - 177882) * 0.29;
      } else {
        fedGrossTax =
          57375 * 0.15 +
          (114750 - 57375) * 0.205 +
          (177882 - 114750) * 0.26 +
          (253414 - 177882) * 0.29 +
          (grossMajor - 253414) * 0.33;
      }
    }

    const fedBpaCredit = fedBpa * 0.15;
    const fedTaxTotal = Math.max(0, fedGrossTax - fedBpaCredit);
    const federalTaxMinor = Math.round(fedTaxTotal * 100);

    // 4. Provincial Income Tax
    const regionCode = context.regionId?.replace('CA-', '') || 'ON';
    let provGrossTax = 0;
    let provBpaCredit = 0;
    let provSurtax = 0;

    if (regionCode === 'ON') {
      const b1Cap = isHistorical2024 ? 51446 : 52835;
      const b2Cap = isHistorical2024 ? 102894 : 105672;
      const onBpa = isHistorical2024 ? 12399 : 12734;

      if (grossMajor <= b1Cap) {
        provGrossTax = grossMajor * 0.0505;
      } else if (grossMajor <= b2Cap) {
        provGrossTax = b1Cap * 0.0505 + (grossMajor - b1Cap) * 0.0915;
      } else if (grossMajor <= 150000) {
        provGrossTax = b1Cap * 0.0505 + (b2Cap - b1Cap) * 0.0915 + (grossMajor - b2Cap) * 0.1116;
      } else if (grossMajor <= 220000) {
        provGrossTax =
          b1Cap * 0.0505 +
          (b2Cap - b1Cap) * 0.0915 +
          (150000 - b2Cap) * 0.1116 +
          (grossMajor - 150000) * 0.1216;
      } else {
        provGrossTax =
          b1Cap * 0.0505 +
          (b2Cap - b1Cap) * 0.0915 +
          (150000 - b2Cap) * 0.1116 +
          (220000 - 150000) * 0.1216 +
          (grossMajor - 220000) * 0.1316;
      }

      provBpaCredit = onBpa * 0.0505;
      const onBaseTax = Math.max(0, provGrossTax - provBpaCredit);

      const surtax1Threshold = isHistorical2024 ? 5554 : 5704;
      const surtax2Threshold = isHistorical2024 ? 7108 : 7300;

      if (onBaseTax > surtax2Threshold) {
        provSurtax = (onBaseTax - surtax1Threshold) * 0.20 + (onBaseTax - surtax2Threshold) * 0.36;
      } else if (onBaseTax > surtax1Threshold) {
        provSurtax = (onBaseTax - surtax1Threshold) * 0.20;
      }
    } else if (regionCode === 'BC') {
      const b1 = isHistorical2024 ? 47937 : 49279;
      const b2 = isHistorical2024 ? 95875 : 98560;
      const b3 = isHistorical2024 ? 110076 : 113158;
      const b4 = isHistorical2024 ? 133664 : 137407;
      const b5 = isHistorical2024 ? 181232 : 186306;

      if (grossMajor <= b1) {
        provGrossTax = grossMajor * 0.0506;
      } else if (grossMajor <= b2) {
        provGrossTax = b1 * 0.0506 + (grossMajor - b1) * 0.077;
      } else if (grossMajor <= b3) {
        provGrossTax = b1 * 0.0506 + (b2 - b1) * 0.077 + (grossMajor - b2) * 0.105;
      } else if (grossMajor <= b4) {
        provGrossTax =
          b1 * 0.0506 +
          (b2 - b1) * 0.077 +
          (b3 - b2) * 0.105 +
          (grossMajor - b3) * 0.1229;
      } else {
        provGrossTax =
          b1 * 0.0506 +
          (b2 - b1) * 0.077 +
          (b3 - b2) * 0.105 +
          (b4 - b3) * 0.1229 +
          (grossMajor - b4) * 0.147;
      }
      provBpaCredit = (isHistorical2024 ? 12580 : 12932) * 0.0506;
    } else {
      // Alberta
      const abCap = isHistorical2024 ? 148269 : 152272;
      if (grossMajor <= abCap) {
        provGrossTax = grossMajor * 0.10;
      } else {
        provGrossTax = abCap * 0.10 + (grossMajor - abCap) * 0.12;
      }
      provBpaCredit = (isHistorical2024 ? 21885 : 22476) * 0.10;
    }

    const provTaxTotal = Math.max(0, provGrossTax - provBpaCredit) + provSurtax;
    const stateTaxMinor = Math.round(provTaxTotal * 100);

    const totalTaxMinor = federalTaxMinor + stateTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const evidenceRef = isHistorical2024 ? 'cra-income-tax-2024' : 'ca-cra-tax-2025';

    const components: TaxComponentBreakdown[] = [
      {
        id: 'ca-fed-tax',
        name: 'Canada Federal Income Tax',
        authority: 'Canada Revenue Agency (CRA)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'CAD'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'ca-cpp',
        name: 'Canada Pension Plan (CPP/CPP2)',
        authority: 'Employment and Social Development Canada',
        category: 'social_contribution',
        amount: fromMinor(cppMinor, 'CAD'),
        effectiveRate: cppMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'ca-ei',
        name: 'Employment Insurance (EI)',
        authority: 'Canada Revenue Agency (CRA)',
        category: 'social_contribution',
        amount: fromMinor(eiMinor, 'CAD'),
        effectiveRate: eiMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
      {
        id: 'ca-prov-tax',
        name: `${regionCode} Provincial Income Tax`,
        authority: `${regionCode} Ministry of Finance`,
        category: 'state',
        amount: fromMinor(stateTaxMinor, 'CAD'),
        effectiveRate: stateTaxMinor / (grossMinor || 1),
        evidenceRefId: evidenceRef,
      },
    ];

    const taxRuleVersion = isHistorical2024 ? 'CRA-2024.1' : 'CA-CRA-ON-2025.1';

    return {
      status: 'CALCULATED',
      grossIncome: grossCompensation,
      taxableIncome: grossCompensation,
      deductions: createMoney(0, 'CAD'),
      federalTax: fromMinor(federalTaxMinor, 'CAD'),
      stateTax: fromMinor(stateTaxMinor, 'CAD'),
      localTax: createMoney(0, 'CAD'),
      socialContributions: fromMinor(socialMinor, 'CAD'),
      totalTax: fromMinor(totalTaxMinor, 'CAD'),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, 'CAD'),
      netIncome: fromMinor(netIncomeMinor, 'CAD'),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), 'CAD'),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), 'CAD'),
      effectiveTaxRate: totalDeductionsMinor / (grossMinor || 1),
      marginalTaxRate: 0.4341,
      components,
      taxRuleVersion,
      evidenceSourceIds: [evidenceRef],
    };
  }
}
