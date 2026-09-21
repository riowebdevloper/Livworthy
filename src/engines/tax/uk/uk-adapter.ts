import { fromMinor } from '../../../lib/money';
import { CurrencyCode, Money } from '../../../types/money';
import { TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

export class UkTaxAdapter implements TaxAdapter {
  id = 'uk';
  name = 'United Kingdom HMRC Tax Engine';

  supports(context: TaxContext): boolean {
    return context.countryId === 'GB';
  }

  calculate(gross: Money, _profile: TaxProfile, _context: TaxContext): TaxResult {
    const currency: CurrencyCode = 'GBP';
    const grossMinor = gross.amountMinor;

    // UK Personal Allowance 2024/2025: £12,570
    // Tapers by £1 for every £2 of income above £100,000
    let personalAllowanceMinor = 12_570_00;
    if (grossMinor > 100_000_00) {
      const reduction = Math.floor((grossMinor - 100_000_00) / 2);
      personalAllowanceMinor = Math.max(0, personalAllowanceMinor - reduction);
    }

    const taxableMinor = Math.max(0, grossMinor - personalAllowanceMinor);

    // Income tax brackets
    let incomeTaxMinor = 0;
    const isScotland = _context.regionId === 'GB-SCT';

    if (isScotland) {
      // Scottish Income Tax 2024/25:
      // Starter 19% (first £2,306 taxable)
      // Basic 20% (next £11,685 taxable, up to £13,991)
      // Intermediate 21% (next £17,101 taxable, up to £31,092)
      // Higher 42% (next £31,338 taxable, up to £62,430)
      // Advanced 45% (next £50,140 taxable, up to £112,570)
      // Top 48% (above £112,570 taxable)
      if (taxableMinor > 0) {
        const t1 = 2_306_00;
        const t2 = 13_991_00;
        const t3 = 31_092_00;
        const t4 = 62_430_00;
        const t5 = 112_570_00;

        incomeTaxMinor += Math.min(taxableMinor, t1) * 0.19;
        if (taxableMinor > t1) {
          incomeTaxMinor += (Math.min(taxableMinor, t2) - t1) * 0.20;
        }
        if (taxableMinor > t2) {
          incomeTaxMinor += (Math.min(taxableMinor, t3) - t2) * 0.21;
        }
        if (taxableMinor > t3) {
          incomeTaxMinor += (Math.min(taxableMinor, t4) - t3) * 0.42;
        }
        if (taxableMinor > t4) {
          incomeTaxMinor += (Math.min(taxableMinor, t5) - t4) * 0.45;
        }
        if (taxableMinor > t5) {
          incomeTaxMinor += (taxableMinor - t5) * 0.48;
        }
      }
    } else {
      // England & Wales 2024/2025:
      // Basic: 20% on £0 up to £37,700 taxable (i.e. £12,570 to £50,270)
      // Higher: 40% on £37,700 to £112,570 taxable (i.e. up to £125,140)
      // Additional: 45% above £125,140
      const basicLimit = 37_700_00;
      const higherLimit = 112_570_00;

      if (taxableMinor > 0) {
        const inBasic = Math.min(taxableMinor, basicLimit);
        incomeTaxMinor += inBasic * 0.20;

        if (taxableMinor > basicLimit) {
          const inHigher = Math.min(taxableMinor, higherLimit) - basicLimit;
          incomeTaxMinor += inHigher * 0.40;

          if (taxableMinor > higherLimit) {
            const inAdditional = taxableMinor - higherLimit;
            incomeTaxMinor += inAdditional * 0.45;
          }
        }
      }
    }
    incomeTaxMinor = Math.round(incomeTaxMinor);

    // National Insurance (Class 1 Employee 2024 - 8% main rate, 2% above UEL)
    // Primary threshold: £12,570/yr, Upper Earnings Limit: £50,270/yr
    let niMinor = 0;
    const ptMinor = 12_570_00;
    const uelMinor = 50_270_00;
    if (grossMinor > ptMinor) {
      const inMain = Math.min(grossMinor, uelMinor) - ptMinor;
      niMinor += inMain * 0.08;
      if (grossMinor > uelMinor) {
        const inUpper = grossMinor - uelMinor;
        niMinor += inUpper * 0.02;
      }
    }
    niMinor = Math.round(niMinor);

    const totalDeductionsMinor = incomeTaxMinor + niMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'uk-income-tax',
        name: 'UK Income Tax (PAYE)',
        authority: 'HM Revenue & Customs (HMRC)',
        category: 'federal',
        amount: fromMinor(incomeTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? incomeTaxMinor / grossMinor : 0,
        description: `Personal Allowance: £${(personalAllowanceMinor / 100).toLocaleString()}`,
        evidenceRefId: 'uk-hmrc-tax-2024',
      },
      {
        id: 'uk-national-insurance',
        name: 'National Insurance (Class 1)',
        authority: 'HM Revenue & Customs (HMRC)',
        category: 'social_contribution',
        amount: fromMinor(niMinor, currency),
        effectiveRate: grossMinor > 0 ? niMinor / grossMinor : 0,
        description: '8% main rate up to £50,270 + 2% upper rate',
        evidenceRefId: 'uk-hmrc-tax-2024',
      },
    ];

    return {
      grossIncome: gross,
      taxableIncome: fromMinor(taxableMinor, currency),
      deductions: fromMinor(personalAllowanceMinor, currency),
      federalTax: fromMinor(incomeTaxMinor, currency),
      stateTax: fromMinor(0, currency),
      localTax: fromMinor(0, currency),
      socialContributions: fromMinor(niMinor, currency),
      totalTax: fromMinor(incomeTaxMinor, currency),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsMinor, currency),
      netIncome: fromMinor(netIncomeMinor, currency),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), currency),
      effectiveTaxRate: grossMinor > 0 ? totalDeductionsMinor / grossMinor : 0,
      marginalTaxRate: grossMinor > 125_140_00 ? 0.47 : grossMinor > 50_270_00 ? 0.42 : 0.28,
      components,
      taxRuleVersion: 'UK-HMRC-2024.2',
      evidenceSourceIds: ['uk-hmrc-tax-2024'],
    };
  }
}
