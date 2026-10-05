import { SalaryWorthCalculator } from '../engines/calculator-core/salary-worth';
import { SalaryNeededCalculator, SalaryNeededResult } from '../engines/calculator-core/salary-needed';
import { ComparisonEngine, ComparisonResult } from '../engines/calculator-core/compare';
import { CostOfLivingEngine } from '../engines/col/col-engine';
import { TaxRegistry } from '../engines/tax/tax-registry';
import { CITIES, COUNTRIES } from '../data/locations';
import { createMoney, formatMoney, toMajor } from './money';
import { CurrencyCode, Money } from '../types/money';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../types/scenario';
import { CostOfLivingResult } from '../types/col';
import { TaxResult } from '../types/tax';

export interface SalaryGuideComputedData {
  outcome: LivWorthCalculationOutcome;
  grossMajor: number;
  takeHomeAnnualMajor: number;
  takeHomeMonthlyMajor: number;
  federalTaxMajor: number;
  stateTaxMajor: number;
  localTaxMajor: number;
  socialContributionsMajor: number;
  totalTaxMajor: number;
  effectiveTaxRate: number;
  livingCostsMonthlyMajor: number;
  housingMonthlyMajor: number;
  savingsMonthlyMajor: number;
  savingsRatePercentage: number;
  taxRuleVersion: string;
  datasetVersion: string;
  evidenceSourceIds: string[];
}

export interface SalaryTierBreakdown {
  grossMajor: number;
  grossFormatted: string;
  takeHomeAnnualMajor: number;
  takeHomeAnnualFormatted: string;
  takeHomeMonthlyMajor: number;
  takeHomeMonthlyFormatted: string;
  totalTaxMajor: number;
  totalTaxFormatted: string;
  effectiveTaxRate: number;
  socialContributionsMajor: number;
  socialContributionsFormatted: string;
  stateTaxMajor: number;
  localTaxMajor: number;
  federalTaxMajor: number;
  taxResult: TaxResult;
}

export interface SalaryAfterTaxComputedData {
  cityId: string;
  cityName: string;
  countryName: string;
  currency: CurrencyCode;
  taxYear: number;
  taxRuleVersion: string;
  evidenceSourceIds: string[];
  tiers: SalaryTierBreakdown[];
  colSummary: CostOfLivingResult;
  monthlyLivingCostsMajor: number;
}

export interface SalaryNeededComputedData {
  cityId: string;
  cityName: string;
  currency: CurrencyCode;
  taxYear: number;
  taxRuleVersion: string;
  evidenceSourceIds: string[];
  singleResult: SalaryNeededResult;
  coupleResult: SalaryNeededResult;
  familyResult: SalaryNeededResult;
  singleRequiredGrossMajor: number;
  coupleRequiredGrossMajor: number;
  familyRequiredGrossMajor: number;
  singleExpensesMonthlyMajor: number;
  coupleExpensesMonthlyMajor: number;
  familyExpensesMonthlyMajor: number;
}

export interface CostOfLivingComputedData {
  cityId: string;
  cityName: string;
  countryName: string;
  currency: CurrencyCode;
  datasetVersion: string;
  evidenceSourceIds: string[];
  single: CostOfLivingResult;
  couple: CostOfLivingResult;
  family: CostOfLivingResult;
  singleColIndex: number;
}

export interface ComparisonComputedData {
  slug: string;
  cityAId: string;
  cityBId: string;
  cityAName: string;
  cityBName: string;
  currencyA: CurrencyCode;
  currencyB: CurrencyCode;
  displayCurrency: CurrencyCode;
  result: ComparisonResult;
  fxRateUsed: number;
  fxDate: string;
  evidenceSourceIds: string[];
}

// Validated benchmark exchange rate snapshot for deterministic SSR prerendering
const BENCHMARK_FX_SNAPSHOT = {
  rates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    AED: 3.6725,
    AUD: 1.52,
    SGD: 1.34,
  },
  providerTimestamp: '2026-01-01T00:00:00Z',
  status: 'BENCHMARK_SNAPSHOT',
  label: 'Benchmark exchange rate snapshot (as of 2026-01-01)',
};

export class SeoEngineAdapter {
  /**
   * Helper to build a standard single-professional scenario
   */
  public static buildSingleScenario(
    cityId: string,
    salaryMajor: number,
    taxYear = 2026
  ): LivWorthScenario {
    const city = CITIES[cityId] || CITIES.nyc;
    return {
      location: city,
      compensation: {
        baseSalary: createMoney(salaryMajor, city.currency),
        cashBonusAnnual: createMoney(0, city.currency),
        commissionAnnual: createMoney(0, city.currency),
        cashAllowancesAnnual: createMoney(0, city.currency),
      },
      taxProfile: {
        filingStatus: 'single',
        dependentsCount: 0,
        taxYear,
      },
      household: {
        adults: 1,
        children: 0,
        housingType: '1-bedroom',
        areaType: 'typical',
        transportMode: city.countryId === 'US' && city.id === 'austin' ? 'car' : 'public_transit',
        carsCount: city.countryId === 'US' && city.id === 'austin' ? 1 : 0,
        lifestyleLevel: 'moderate',
        preset: 'single',
      },
      displayCurrency: city.currency,
      calculationDate: '2026-01-01T00:00:00.000Z',
    };
  }

  /**
   * Authoritative calculation for Salary Guide pages
   */
  public static computeSalaryGuide(
    cityId: string,
    salaryMajor: number,
    taxYear = 2026
  ): SalaryGuideComputedData {
    const scenario = this.buildSingleScenario(cityId, salaryMajor, taxYear);
    const outcome = SalaryWorthCalculator.calculate(scenario);

    const grossMajor = toMajor(outcome.grossAnnual);
    const takeHomeAnnualMajor = toMajor(outcome.takeHomeAnnual);
    const takeHomeMonthlyMajor = toMajor(outcome.takeHomeMonthly);
    const federalTaxMajor = toMajor(outcome.tax.federalTax);
    const stateTaxMajor = toMajor(outcome.tax.stateTax);
    const localTaxMajor = toMajor(outcome.tax.localTax);
    const socialContributionsMajor = toMajor(outcome.tax.socialContributions);
    const totalTaxMajor = toMajor(outcome.tax.totalDeductionsAndTaxes);
    const rawRate = outcome.tax.effectiveTaxRate;
    const effectiveTaxRate = rawRate <= 1 ? rawRate * 100 : rawRate;
    const livingCostsMonthlyMajor = toMajor(outcome.livingCostsMonthly);
    const housingMonthlyMajor = toMajor(outcome.costOfLiving.housingMonthly);
    const savingsMonthlyMajor = toMajor(outcome.savingsCapacityMonthly);
    const savingsRatePercentage = outcome.savingsRatePercentage;

    return {
      outcome,
      grossMajor,
      takeHomeAnnualMajor,
      takeHomeMonthlyMajor,
      federalTaxMajor,
      stateTaxMajor,
      localTaxMajor,
      socialContributionsMajor,
      totalTaxMajor,
      effectiveTaxRate,
      livingCostsMonthlyMajor,
      housingMonthlyMajor,
      savingsMonthlyMajor,
      savingsRatePercentage,
      taxRuleVersion: outcome.taxRuleVersion || outcome.tax.taxRuleVersion || 'STATUTORY-CURRENT',
      datasetVersion: outcome.colDate || outcome.costOfLiving.datasetVersion,
      evidenceSourceIds: outcome.evidenceSourceIds,
    };
  }

  /**
   * Authoritative calculation for Salary After Tax pages
   */
  public static computeSalaryAfterTax(
    cityId: string,
    salaryTiersMajor: number[] = [40000, 60000, 80000, 100000, 120000, 150000, 200000, 250000],
    taxYear = 2026
  ): SalaryAfterTaxComputedData {
    const city = CITIES[cityId] || CITIES.nyc;
    const country = COUNTRIES[city.countryId] || COUNTRIES.US;
    const currency = city.currency;

    const tiers: SalaryTierBreakdown[] = salaryTiersMajor.map((grossMajor) => {
      const grossMoney = createMoney(grossMajor, currency);
      const taxProfile = { filingStatus: 'single' as const, dependentsCount: 0, taxYear };
      const taxContext = {
        countryId: city.countryId,
        regionId: city.regionId,
        cityId: city.id,
        taxJurisdictionId: city.taxJurisdictionId,
      };

      const taxResult = TaxRegistry.calculate(grossMoney, taxProfile, taxContext);
      const netMajor = toMajor(taxResult.netIncome);
      const monthlyNetMajor = toMajor(taxResult.monthlyNetIncome);
      const totalTaxMajor = toMajor(taxResult.totalDeductionsAndTaxes);
      const socialMajor = toMajor(taxResult.socialContributions);
      const stateTaxMajor = toMajor(taxResult.stateTax);
      const localTaxMajor = toMajor(taxResult.localTax);
      const federalTaxMajor = toMajor(taxResult.federalTax);

      return {
        grossMajor,
        grossFormatted: formatMoney(grossMoney),
        takeHomeAnnualMajor: netMajor,
        takeHomeAnnualFormatted: formatMoney(taxResult.netIncome),
        takeHomeMonthlyMajor: monthlyNetMajor,
        takeHomeMonthlyFormatted: formatMoney(taxResult.monthlyNetIncome),
        totalTaxMajor,
        totalTaxFormatted: formatMoney(taxResult.totalDeductionsAndTaxes),
        effectiveTaxRate: taxResult.effectiveTaxRate <= 1 ? taxResult.effectiveTaxRate * 100 : taxResult.effectiveTaxRate,
        socialContributionsMajor: socialMajor,
        socialContributionsFormatted: formatMoney(taxResult.socialContributions),
        stateTaxMajor,
        localTaxMajor,
        federalTaxMajor,
        taxResult,
      };
    });

    const singleHousehold = {
      adults: 1,
      children: 0,
      housingType: '1-bedroom' as const,
      areaType: 'typical' as const,
      transportMode: 'public_transit' as const,
      carsCount: 0,
      lifestyleLevel: 'moderate' as const,
      preset: 'single' as const,
    };
    const colSummary = CostOfLivingEngine.calculate(city.id, singleHousehold);

    const firstTier = tiers[0];
    const taxRuleVersion = firstTier?.taxResult.taxRuleVersion || 'STATUTORY-2026';
    const evidenceSourceIds = Array.from(
      new Set([...(firstTier?.taxResult.evidenceSourceIds || []), ...colSummary.evidenceSourceIds])
    );

    return {
      cityId: city.id,
      cityName: city.name,
      countryName: country.name,
      currency,
      taxYear,
      taxRuleVersion,
      evidenceSourceIds,
      tiers,
      colSummary,
      monthlyLivingCostsMajor: toMajor(colSummary.monthlyTotal),
    };
  }

  /**
   * Authoritative calculation for Salary Needed pages
   */
  public static computeSalaryNeeded(
    cityId: string,
    taxYear = 2026
  ): SalaryNeededComputedData {
    const city = CITIES[cityId] || CITIES.nyc;
    const currency = city.currency;

    // 1. Single scenario ($1,000 / £750 / 3,500 AED savings target)
    const singleSavingsTargetMajor = currency === 'GBP' ? 750 : currency === 'AED' ? 3500 : 1000;
    const singleScenario = this.buildSingleScenario(cityId, 100000, taxYear);
    const singleResult = SalaryNeededCalculator.calculate(
      singleScenario,
      createMoney(singleSavingsTargetMajor, currency)
    );

    // 2. Couple scenario ($1,500 / £1,200 / 5,000 AED savings target)
    const coupleSavingsTargetMajor = currency === 'GBP' ? 1200 : currency === 'AED' ? 5000 : 1500;
    const coupleScenario: LivWorthScenario = {
      ...singleScenario,
      household: {
        adults: 2,
        children: 0,
        housingType: '1-bedroom',
        areaType: 'typical',
        transportMode: 'public_transit',
        carsCount: 0,
        lifestyleLevel: 'moderate',
        preset: 'couple',
      },
    };
    const coupleResult = SalaryNeededCalculator.calculate(
      coupleScenario,
      createMoney(coupleSavingsTargetMajor, currency)
    );

    // 3. Family scenario ($2,000 / £1,500 / 7,000 AED savings target)
    const familySavingsTargetMajor = currency === 'GBP' ? 1500 : currency === 'AED' ? 7000 : 2000;
    const familyScenario: LivWorthScenario = {
      ...singleScenario,
      household: {
        adults: 2,
        children: 2,
        housingType: '2-bedroom',
        areaType: 'typical',
        transportMode: 'public_transit',
        carsCount: 0,
        lifestyleLevel: 'moderate',
        preset: 'family',
      },
    };
    const familyResult = SalaryNeededCalculator.calculate(
      familyScenario,
      createMoney(familySavingsTargetMajor, currency)
    );

    const singleOutcome = singleResult.outcomeWithRequiredSalary;
    const taxRuleVersion = singleOutcome.taxRuleVersion || singleOutcome.tax.taxRuleVersion || 'STATUTORY-2026';

    return {
      cityId: city.id,
      cityName: city.name,
      currency,
      taxYear,
      taxRuleVersion,
      evidenceSourceIds: singleOutcome.evidenceSourceIds,
      singleResult,
      coupleResult,
      familyResult,
      singleRequiredGrossMajor: toMajor(singleResult.requiredGrossAnnual),
      coupleRequiredGrossMajor: toMajor(coupleResult.requiredGrossAnnual),
      familyRequiredGrossMajor: toMajor(familyResult.requiredGrossAnnual),
      singleExpensesMonthlyMajor: toMajor(singleResult.monthlyExpensesTotal),
      coupleExpensesMonthlyMajor: toMajor(coupleResult.monthlyExpensesTotal),
      familyExpensesMonthlyMajor: toMajor(familyResult.monthlyExpensesTotal),
    };
  }

  /**
   * Authoritative calculation for Cost of Living pages
   */
  public static computeCostOfLiving(cityId: string): CostOfLivingComputedData {
    const city = CITIES[cityId] || CITIES.nyc;
    const country = COUNTRIES[city.countryId] || COUNTRIES.US;

    const singleHousehold = {
      adults: 1,
      children: 0,
      housingType: '1-bedroom' as const,
      areaType: 'typical' as const,
      transportMode: 'public_transit' as const,
      carsCount: 0,
      lifestyleLevel: 'moderate' as const,
      preset: 'single' as const,
    };
    const coupleHousehold = {
      adults: 2,
      children: 0,
      housingType: '1-bedroom' as const,
      areaType: 'typical' as const,
      transportMode: 'public_transit' as const,
      carsCount: 0,
      lifestyleLevel: 'moderate' as const,
      preset: 'couple' as const,
    };
    const familyHousehold = {
      adults: 2,
      children: 2,
      housingType: '2-bedroom' as const,
      areaType: 'typical' as const,
      transportMode: 'public_transit' as const,
      carsCount: 0,
      lifestyleLevel: 'moderate' as const,
      preset: 'family' as const,
    };

    const single = CostOfLivingEngine.calculate(city.id, singleHousehold);
    const couple = CostOfLivingEngine.calculate(city.id, coupleHousehold);
    const family = CostOfLivingEngine.calculate(city.id, familyHousehold);

    return {
      cityId: city.id,
      cityName: city.name,
      countryName: country.name,
      currency: city.currency,
      datasetVersion: single.datasetVersion,
      evidenceSourceIds: single.evidenceSourceIds,
      single,
      couple,
      family,
      singleColIndex: city.colIndexBase100NYC,
    };
  }

  /**
   * Authoritative calculation for Comparison pages
   */
  public static computeComparison(
    slug: string,
    cityAId: string,
    cityBId: string,
    salaryAMajor = 100000,
    salaryBMajor = 75000,
    displayCurrency: CurrencyCode = 'USD'
  ): ComparisonComputedData {
    const cityA = CITIES[cityAId] || CITIES.nyc;
    const cityB = CITIES[cityBId] || CITIES.london;

    const scenarioA = this.buildSingleScenario(cityA.id, salaryAMajor);
    const scenarioB = this.buildSingleScenario(cityB.id, salaryBMajor);

    const result = ComparisonEngine.compare(
      scenarioA,
      scenarioB,
      displayCurrency,
      undefined,
      BENCHMARK_FX_SNAPSHOT
    );

    const ratesMap = BENCHMARK_FX_SNAPSHOT.rates as Record<string, number>;
    const fxRateUsed = ratesMap[cityB.currency] || 1.0;

    const evidenceSourceIds = Array.from(
      new Set([
        ...(result.outcomeA.evidenceSourceIds || []),
        ...(result.outcomeA.costOfLiving?.evidenceSourceIds || []),
        ...(result.outcomeB.evidenceSourceIds || []),
        ...(result.outcomeB.costOfLiving?.evidenceSourceIds || []),
      ])
    );

    return {
      slug,
      cityAId: cityA.id,
      cityBId: cityB.id,
      cityAName: cityA.name,
      cityBName: cityB.name,
      currencyA: cityA.currency,
      currencyB: cityB.currency,
      displayCurrency,
      result,
      fxRateUsed,
      fxDate: BENCHMARK_FX_SNAPSHOT.providerTimestamp,
      evidenceSourceIds,
    };
  }
}
