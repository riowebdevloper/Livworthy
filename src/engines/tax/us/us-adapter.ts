import { fromMinor, toMajor } from '../../../lib/money';
import { CurrencyCode, Money } from '../../../types/money';
import { FilingStatus, TaxComponentBreakdown, TaxProfile, TaxResult } from '../../../types/tax';
import { TaxAdapter, TaxContext } from '../tax-adapter';

// 2024 Federal Tax Brackets (IRS Rev. Proc. 2023-34)
interface Bracket {
  upToMinor: number; // In cents
  rate: number;
}

const US_FEDERAL_BRACKETS_2024: Record<FilingStatus, Bracket[]> = {
  single: [
    { upToMinor: 11_600_00, rate: 0.10 },
    { upToMinor: 47_150_00, rate: 0.12 },
    { upToMinor: 100_525_00, rate: 0.22 },
    { upToMinor: 191_950_00, rate: 0.24 },
    { upToMinor: 243_725_00, rate: 0.32 },
    { upToMinor: 609_350_00, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 },
  ],
  married_filing_jointly: [
    { upToMinor: 23_200_00, rate: 0.10 },
    { upToMinor: 94_300_00, rate: 0.12 },
    { upToMinor: 201_050_00, rate: 0.22 },
    { upToMinor: 383_900_00, rate: 0.24 },
    { upToMinor: 487_450_00, rate: 0.32 },
    { upToMinor: 731_200_00, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { upToMinor: 16_550_00, rate: 0.10 },
    { upToMinor: 63_100_00, rate: 0.12 },
    { upToMinor: 100_500_00, rate: 0.22 },
    { upToMinor: 191_950_00, rate: 0.24 },
    { upToMinor: 243_700_00, rate: 0.32 },
    { upToMinor: 609_350_00, rate: 0.35 },
    { upToMinor: Infinity, rate: 0.37 },
  ],
};

const US_FEDERAL_STANDARD_DEDUCTION_2024: Record<FilingStatus, number> = {
  single: 14_600_00,
  married_filing_jointly: 29_200_00,
  head_of_household: 21_900_00,
};

// 2024 FICA Wage Caps & Rates (SSA / IRS)
const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_CAP_2024_MINOR = 168_600_00; // $168,600
const MEDICARE_RATE = 0.0145;
const ADDL_MEDICARE_RATE = 0.009;
const ADDL_MEDICARE_THRESHOLD_MINOR: Record<FilingStatus, number> = {
  single: 200_000_00,
  married_filing_jointly: 250_000_00,
  head_of_household: 200_000_00,
};

// NY State Standard Deduction & Brackets (NYS Form IT-201-I)
const NYS_STANDARD_DEDUCTION_2024: Record<FilingStatus, number> = {
  single: 8_000_00,
  married_filing_jointly: 16_050_00,
  head_of_household: 11_200_00,
};

const NYS_BRACKETS_2024_SINGLE: Bracket[] = [
  { upToMinor: 8_500_00, rate: 0.040 },
  { upToMinor: 11_700_00, rate: 0.045 },
  { upToMinor: 13_900_00, rate: 0.0525 },
  { upToMinor: 80_650_00, rate: 0.055 },
  { upToMinor: 215_400_00, rate: 0.060 },
  { upToMinor: 1_077_550_00, rate: 0.0685 },
  { upToMinor: 5_000_000_00, rate: 0.0965 },
  { upToMinor: 25_000_000_00, rate: 0.103 },
  { upToMinor: Infinity, rate: 0.109 },
];

// NYC Resident Personal Income Tax Brackets (Single)
const NYC_BRACKETS_2024_SINGLE: Bracket[] = [
  { upToMinor: 12_000_00, rate: 0.03078 },
  { upToMinor: 25_000_00, rate: 0.03762 },
  { upToMinor: 50_000_00, rate: 0.03819 },
  { upToMinor: Infinity, rate: 0.03876 },
];

function calculateGraduatedTax(
  taxableMinor: number,
  brackets: Bracket[]
): { taxMinor: number; topMarginalRate: number } {
  if (taxableMinor <= 0) {
    return { taxMinor: 0, topMarginalRate: 0 };
  }

  let taxMinor = 0;
  let previousThresholdMinor = 0;
  let topMarginalRate = 0;

  for (const bracket of brackets) {
    if (taxableMinor > previousThresholdMinor) {
      const taxableInBracket = Math.min(taxableMinor, bracket.upToMinor) - previousThresholdMinor;
      if (taxableInBracket > 0) {
        taxMinor += taxableInBracket * bracket.rate;
        topMarginalRate = bracket.rate;
      }
      previousThresholdMinor = bracket.upToMinor;
    } else {
      break;
    }
  }

  return { taxMinor: Math.round(taxMinor), topMarginalRate };
}

export class UsTaxAdapter implements TaxAdapter {
  id = 'us';
  name = 'United States Tax Engine';

  supports(context: TaxContext): boolean {
    return context.countryId === 'US';
  }

  calculate(gross: Money, profile: TaxProfile, context: TaxContext): TaxResult {
    const currency: CurrencyCode = 'USD';
    const grossMinor = gross.amountMinor;

    // Pre-tax deductions (e.g. 401k/HSA/Pension)
    const preTaxDeductionsMinor =
      (profile.pensionContributionMinor || 0) + (profile.healthDeductionMinor || 0);

    const adjustedGrossMinor = Math.max(0, grossMinor - preTaxDeductionsMinor);

    // 1. Federal Standard Deduction & Tax
    const federalStdDeductionMinor = US_FEDERAL_STANDARD_DEDUCTION_2024[profile.filingStatus];
    const federalTaxableMinor = Math.max(0, adjustedGrossMinor - federalStdDeductionMinor);
    const federalBrackets = US_FEDERAL_BRACKETS_2024[profile.filingStatus];
    const { taxMinor: federalTaxMinor, topMarginalRate: federalMarginal } = calculateGraduatedTax(
      federalTaxableMinor,
      federalBrackets
    );

    // 2. FICA: Social Security & Medicare
    const socialSecuritySubjectMinor = Math.min(grossMinor, SOCIAL_SECURITY_CAP_2024_MINOR);
    const socialSecurityTaxMinor = Math.round(socialSecuritySubjectMinor * SOCIAL_SECURITY_RATE);

    const standardMedicareTaxMinor = Math.round(grossMinor * MEDICARE_RATE);
    const addlMedicareThresholdMinor = ADDL_MEDICARE_THRESHOLD_MINOR[profile.filingStatus];
    const addlMedicareSubjectMinor = Math.max(0, grossMinor - addlMedicareThresholdMinor);
    const addlMedicareTaxMinor = Math.round(addlMedicareSubjectMinor * ADDL_MEDICARE_RATE);
    const totalMedicareTaxMinor = standardMedicareTaxMinor + addlMedicareTaxMinor;

    const totalFicaMinor = socialSecurityTaxMinor + totalMedicareTaxMinor;

    // 3. State & Local Tax
    let stateTaxMinor = 0;
    let localTaxMinor = 0;
    let stateMarginal = 0;
    let localMarginal = 0;
    const isNewYorkState = context.regionId === 'US-NY';
    const isNycResident = context.cityId === 'nyc';

    let nysTaxableMinor = 0;

    if (isNewYorkState) {
      const nysStdDeductionMinor = NYS_STANDARD_DEDUCTION_2024[profile.filingStatus];
      nysTaxableMinor = Math.max(0, adjustedGrossMinor - nysStdDeductionMinor);
      const stateCalc = calculateGraduatedTax(nysTaxableMinor, NYS_BRACKETS_2024_SINGLE);
      stateTaxMinor = stateCalc.taxMinor;
      stateMarginal = stateCalc.topMarginalRate;

      if (isNycResident) {
        // NYC Resident tax applies to NY taxable income
        const localCalc = calculateGraduatedTax(nysTaxableMinor, NYC_BRACKETS_2024_SINGLE);
        localTaxMinor = localCalc.taxMinor;
        localMarginal = localCalc.topMarginalRate;
      }
    } else if (context.regionId === 'US-CA') {
      // California Franchise Tax Board 2024
      const caTaxable = Math.max(0, adjustedGrossMinor - 5363_00);
      const caCalc = calculateGraduatedTax(caTaxable, [
        { upToMinor: 10412_00, rate: 0.01 },
        { upToMinor: 24684_00, rate: 0.02 },
        { upToMinor: 38959_00, rate: 0.04 },
        { upToMinor: 54081_00, rate: 0.06 },
        { upToMinor: 68350_00, rate: 0.08 },
        { upToMinor: 349137_00, rate: 0.093 },
        { upToMinor: Infinity, rate: 0.103 },
      ]);
      stateTaxMinor = caCalc.taxMinor;
      stateMarginal = caCalc.topMarginalRate;
    } else if (context.regionId === 'US-IL') {
      // Illinois flat individual income tax rate 4.95%
      const ilTaxable = Math.max(0, adjustedGrossMinor - 2775_00);
      stateTaxMinor = Math.round(ilTaxable * 0.0495);
      stateMarginal = 0.0495;
    } else if (context.regionId === 'US-MA') {
      // Massachusetts flat personal income tax 5.0%
      const maTaxable = Math.max(0, adjustedGrossMinor - 4400_00);
      stateTaxMinor = Math.round(maTaxable * 0.05);
      stateMarginal = 0.05;
    } else if (context.regionId === 'US-DC') {
      // District of Columbia progressive tax
      const dcTaxable = Math.max(0, adjustedGrossMinor - 14600_00);
      const dcCalc = calculateGraduatedTax(dcTaxable, [
        { upToMinor: 10000_00, rate: 0.04 },
        { upToMinor: 40000_00, rate: 0.06 },
        { upToMinor: 60000_00, rate: 0.065 },
        { upToMinor: 250000_00, rate: 0.085 },
        { upToMinor: 500000_00, rate: 0.0925 },
        { upToMinor: Infinity, rate: 0.0975 },
      ]);
      stateTaxMinor = dcCalc.taxMinor;
      stateMarginal = dcCalc.topMarginalRate;
    }
    // Texas (US-TX), Washington (US-WA), and Florida (US-FL) have 0% state personal income tax

    const totalIncomeTaxMinor = federalTaxMinor + stateTaxMinor + localTaxMinor;
    const totalDeductionsAndTaxesMinor = totalIncomeTaxMinor + totalFicaMinor;
    const netIncomeMinor = Math.max(0, grossMinor - totalDeductionsAndTaxesMinor);

    const components: TaxComponentBreakdown[] = [
      {
        id: 'us-fed-income-tax',
        name: 'Federal Income Tax',
        authority: 'Internal Revenue Service (IRS)',
        category: 'federal',
        amount: fromMinor(federalTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? federalTaxMinor / grossMinor : 0,
        marginalRate: federalMarginal,
        description: `Taxable Income: $${(federalTaxableMinor / 100).toLocaleString()} (Standard deduction $${(federalStdDeductionMinor / 100).toLocaleString()})`,
        evidenceRefId: 'us-irs-tax-2024',
      },
      {
        id: 'us-fica-social-security',
        name: 'Social Security (OASDI)',
        authority: 'Social Security Administration',
        category: 'social_contribution',
        amount: fromMinor(socialSecurityTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? socialSecurityTaxMinor / grossMinor : 0,
        marginalRate: grossMinor < SOCIAL_SECURITY_CAP_2024_MINOR ? SOCIAL_SECURITY_RATE : 0,
        description: `6.2% on wages up to $168,600 maximum annual wage base`,
        evidenceRefId: 'us-ssa-fica-2024',
      },
      {
        id: 'us-fica-medicare',
        name: 'Medicare & Additional Medicare',
        authority: 'Centers for Medicare & Medicaid / IRS',
        category: 'social_contribution',
        amount: fromMinor(totalMedicareTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? totalMedicareTaxMinor / grossMinor : 0,
        marginalRate: grossMinor > addlMedicareThresholdMinor ? MEDICARE_RATE + ADDL_MEDICARE_RATE : MEDICARE_RATE,
        description: `1.45% uncapped + 0.9% on earnings exceeding $200k`,
        evidenceRefId: 'us-ssa-fica-2024',
      },
    ];

    if (stateTaxMinor > 0 || isNewYorkState) {
      components.push({
        id: 'us-state-tax',
        name: isNewYorkState ? 'New York State Personal Income Tax' : 'State Income Tax',
        authority: isNewYorkState ? 'NYS Dept of Taxation and Finance' : 'State Tax Agency',
        category: 'state',
        amount: fromMinor(stateTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? stateTaxMinor / grossMinor : 0,
        marginalRate: stateMarginal,
        description: isNewYorkState
          ? `NYS Standard Deduction $${(NYS_STANDARD_DEDUCTION_2024[profile.filingStatus] / 100).toLocaleString()}`
          : undefined,
        evidenceRefId: isNewYorkState ? 'us-nys-tax-2024' : 'us-irs-tax-2024',
      });
    }

    if (localTaxMinor > 0 || isNycResident) {
      components.push({
        id: 'us-nyc-local-tax',
        name: 'New York City Resident Income Tax',
        authority: 'NYC Department of Finance',
        category: 'local',
        amount: fromMinor(localTaxMinor, currency),
        effectiveRate: grossMinor > 0 ? localTaxMinor / grossMinor : 0,
        marginalRate: localMarginal,
        description: 'NYC Resident Tax Schedule (Admin Code § 11-1701)',
        evidenceRefId: 'us-nyc-tax-2024',
      });
    }

    const effectiveTaxRate = grossMinor > 0 ? totalDeductionsAndTaxesMinor / grossMinor : 0;
    const combinedMarginalRate =
      federalMarginal +
      stateMarginal +
      localMarginal +
      (grossMinor < SOCIAL_SECURITY_CAP_2024_MINOR ? SOCIAL_SECURITY_RATE : 0) +
      MEDICARE_RATE +
      (grossMinor > addlMedicareThresholdMinor ? ADDL_MEDICARE_RATE : 0);

    return {
      grossIncome: gross,
      taxableIncome: fromMinor(federalTaxableMinor, currency),
      deductions: fromMinor(federalStdDeductionMinor, currency),
      federalTax: fromMinor(federalTaxMinor, currency),
      stateTax: fromMinor(stateTaxMinor, currency),
      localTax: fromMinor(localTaxMinor, currency),
      socialContributions: fromMinor(totalFicaMinor, currency),
      totalTax: fromMinor(totalIncomeTaxMinor, currency),
      totalDeductionsAndTaxes: fromMinor(totalDeductionsAndTaxesMinor, currency),
      netIncome: fromMinor(netIncomeMinor, currency),
      monthlyNetIncome: fromMinor(Math.round(netIncomeMinor / 12), currency),
      biweeklyNetIncome: fromMinor(Math.round(netIncomeMinor / 26), currency),
      effectiveTaxRate,
      marginalTaxRate: combinedMarginalRate,
      components,
      taxRuleVersion: 'US-FED-NY-NYC-2024.1',
      evidenceSourceIds: [
        'us-irs-tax-2024',
        'us-ssa-fica-2024',
        ...(isNewYorkState ? ['us-nys-tax-2024'] : []),
        ...(isNycResident ? ['us-nyc-tax-2024'] : []),
      ],
    };
  }
}
