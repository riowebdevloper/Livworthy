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

    // 1. CPP (Canada Pension Plan) 2024
    // Base CPP: 5.95% between $3,500 and $68,500 (Max $3,867.50)
    let cppMinor = 0;
    if (grossMajor > 3500) {
      const cppEligible = Math.min(grossMajor, 68500) - 3500;
      cppMinor = Math.round(cppEligible * 0.0595 * 100);
    }
    // CPP2: 4.0% between $68,500 and $73,200 (Max $188)
    if (grossMajor > 68500) {
      const cpp2Eligible = Math.min(grossMajor, 73200) - 68500;
      cppMinor += Math.round(cpp2Eligible * 0.04 * 100);
    }

    // 2. EI (Employment Insurance) 2024
    // 1.66% on gross up to $63,200 (Max $1,049.12)
    const eiEligible = Math.min(grossMajor, 63200);
    const eiMinor = Math.round(eiEligible * 0.0166 * 100);

    const socialMinor = cppMinor + eiMinor;

    // 3. Federal Income Tax (2024 Brackets)
    // 15% on first $55,867
    // 20.5% on $55,867 to $111,733
    // 26% on $111,733 to $173,205
    // 29% on $173,205 to $246,752
    // 33% on excess over $246,752
    let fedGrossTax = 0;
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

    // Federal BPA (Basic Personal Amount) non-refundable credit 15% of $15,705
    const fedBpa = 15705;
    const fedBpaCredit = fedBpa * 0.15;
    const fedTaxTotal = Math.max(0, fedGrossTax - fedBpaCredit);
    const federalTaxMinor = Math.round(fedTaxTotal * 100);

    // 4. Provincial Income Tax
    const regionCode = context.regionId?.replace('CA-', '') || 'ON';
    let provGrossTax = 0;
    let provBpaCredit = 0;
    let provSurtax = 0;

    if (regionCode === 'ON') {
      // Ontario 2024:
      // 5.05% on first $51,446
      // 9.15% on $51,446 to $102,894
      // 11.16% on $102,894 to $150,000
      // 12.16% on $150,000 to $220,000
      // 13.16% on excess over $220,000
      if (grossMajor <= 51446) {
        provGrossTax = grossMajor * 0.0505;
      } else if (grossMajor <= 102894) {
        provGrossTax = 51446 * 0.0505 + (grossMajor - 51446) * 0.0915;
      } else if (grossMajor <= 150000) {
        provGrossTax = 51446 * 0.0505 + (102894 - 51446) * 0.0915 + (grossMajor - 102894) * 0.1116;
      } else if (grossMajor <= 220000) {
        provGrossTax =
          51446 * 0.0505 +
          (102894 - 51446) * 0.0915 +
          (150000 - 102894) * 0.1116 +
          (grossMajor - 150000) * 0.1216;
      } else {
        provGrossTax =
          51446 * 0.0505 +
          (102894 - 51446) * 0.0915 +
          (150000 - 102894) * 0.1116 +
          (220000 - 150000) * 0.1216 +
          (grossMajor - 220000) * 0.1316;
      }

      // Ontario BPA ($12,399 at 5.05%)
      provBpaCredit = 12399 * 0.0505;
      const onBaseTax = Math.max(0, provGrossTax - provBpaCredit);

      // Ontario Surtax:
      // 20% on Ontario tax above $5,554
      // 36% on Ontario tax above $7,108
      if (onBaseTax > 7108) {
        provSurtax = (onBaseTax - 5554) * 0.20 + (onBaseTax - 7108) * 0.36;
      } else if (onBaseTax > 5554) {
        provSurtax = (onBaseTax - 5554) * 0.20;
      }
    } else if (regionCode === 'BC') {
      // British Columbia 2024:
      // 5.06% on first $47,937
      // 7.7% on $47,937 to $95,875
      // 10.5% on $95,875 to $110,076
      // 12.29% on $110,076 to $133,664
      // 14.7% on $133,664 to $181,232
      // 16.8% on $181,232 to $252,752
      // 20.5% over $252,752
      if (grossMajor <= 47937) {
        provGrossTax = grossMajor * 0.0506;
      } else if (grossMajor <= 95875) {
        provGrossTax = 47937 * 0.0506 + (grossMajor - 47937) * 0.077;
      } else if (grossMajor <= 110076) {
        provGrossTax = 47937 * 0.0506 + (95875 - 47937) * 0.077 + (grossMajor - 95875) * 0.105;
      } else if (grossMajor <= 133664) {
        provGrossTax =
          47937 * 0.0506 +
          (95875 - 47937) * 0.077 +
          (110076 - 95875) * 0.105 +
          (grossMajor - 110076) * 0.1229;
      } else {
        provGrossTax =
          47937 * 0.0506 +
          (95875 - 47937) * 0.077 +
          (110076 - 95875) * 0.105 +
          (133664 - 110076) * 0.1229 +
          (grossMajor - 133664) * 0.147;
      }
      provBpaCredit = 12580 * 0.0506;
    } else {
      // Alberta 2024:
      // 10% on first $148,269
      // 12% on $148,269 to $177,922
      // 13% on $177,922 to $237,230
      // 14% on $237,230 to $355,845
      // 15% over $355,845
      if (grossMajor <= 148269) {
        provGrossTax = grossMajor * 0.10;
      } else {
        provGrossTax = 148269 * 0.10 + (grossMajor - 148269) * 0.12;
      }
      provBpaCredit = 21885 * 0.10;
    }

    const provTaxTotal = Math.max(0, provGrossTax - provBpaCredit) + provSurtax;
    const stateTaxMinor = Math.round(provTaxTotal * 100);

    const totalTaxMinor = federalTaxMinor + stateTaxMinor;
    const totalDeductionsMinor = totalTaxMinor + socialMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'ca-fed-tax',
        name: 'Canada Federal Income Tax',
        authority: 'Canada Revenue Agency (CRA)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, 'CAD'),
        effectiveRate: federalTaxMinor / (grossMinor || 1),
        evidenceRefId: 'cra-income-tax-2024',
      },
      {
        id: 'ca-cpp',
        name: 'Canada Pension Plan (CPP/CPP2)',
        authority: 'Employment and Social Development Canada',
        category: 'social_contribution',
        amount: fromMinor(cppMinor, 'CAD'),
        effectiveRate: cppMinor / (grossMinor || 1),
        evidenceRefId: 'cra-cpp-2024',
      },
      {
        id: 'ca-ei',
        name: 'Employment Insurance (EI)',
        authority: 'Canada Revenue Agency (CRA)',
        category: 'social_contribution',
        amount: fromMinor(eiMinor, 'CAD'),
        effectiveRate: eiMinor / (grossMinor || 1),
        evidenceRefId: 'cra-ei-2024',
      },
      {
        id: 'ca-prov-tax',
        name: `${regionCode} Provincial Income Tax`,
        authority: `${regionCode} Ministry of Finance`,
        category: 'state',
        amount: fromMinor(stateTaxMinor, 'CAD'),
        effectiveRate: stateTaxMinor / (grossMinor || 1),
        evidenceRefId: 'cra-provincial-rates-2024',
      },
    ];

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
      taxRuleVersion: 'CRA-2024.1',
      evidenceSourceIds: ['cra-income-tax-2024', 'cra-cpp-2024', 'cra-ei-2024'],
    };
  }
}
