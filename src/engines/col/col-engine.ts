import { fromMinor } from '../../lib/money';
import { CurrencyCode, Money } from '../../types/money';
import {
  CostCategorySummary,
  CostEstimateItem,
  CostOfLivingResult,
  HouseholdProfile,
  HousingType,
} from '../../types/col';
import { CITY_COL_BENCHMARKS, CityColBenchmark } from '../../data/city-benchmarks';

export { CITY_COL_BENCHMARKS };
export type { CityColBenchmark };

export interface ColOverrides {
  actualRentMonthlyMinor?: number;
  actualGroceriesMonthlyMinor?: number;
  actualTransitMonthlyMinor?: number;
}

export class CostOfLivingEngine {
  public static calculate(
    cityId: string,
    household: HouseholdProfile,
    overrides?: ColOverrides
  ): CostOfLivingResult {
    const benchmark = CITY_COL_BENCHMARKS[cityId] || CITY_COL_BENCHMARKS['nyc'];
    const currency = benchmark.currency;

    // Area multiplier for housing
    const areaMultiplier =
      household.areaType === 'budget' ? 0.85 : household.areaType === 'premium' ? 1.35 : 1.0;

    // 1. Housing
    const baseRentMajor = benchmark.rentBase[household.housingType] * areaMultiplier;
    let rentMonthlyMinor = Math.round(baseRentMajor * 100);
    let rentIsOverridden = false;

    if (overrides?.actualRentMonthlyMinor !== undefined && overrides.actualRentMonthlyMinor > 0) {
      rentMonthlyMinor = overrides.actualRentMonthlyMinor;
      rentIsOverridden = true;
    }

    const housingLowMinor = Math.round(rentMonthlyMinor * 0.88);
    const housingHighMinor = Math.round(rentMonthlyMinor * 1.15);

    const housingItem: CostEstimateItem = {
      id: 'housing-rent',
      category: 'housing',
      label: rentIsOverridden ? 'Actual Housing Rent (User Input)' : `Rental Housing (${household.housingType}, ${household.areaType} area)`,
      monthlyEstimate: fromMinor(rentMonthlyMinor, currency),
      monthlyLow: fromMinor(housingLowMinor, currency),
      monthlyHigh: fromMinor(housingHighMinor, currency),
      annualEstimate: fromMinor(rentMonthlyMinor * 12, currency),
      isOverridden: rentIsOverridden,
      confidence: rentIsOverridden ? 'High' : 'High',
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: benchmark.evidenceSourceId,
      notes: rentIsOverridden
        ? 'Direct user override applied.'
        : 'HUD 50th Percentile Fair Market Rents and Local Vacancy Survey median.',
    };

    // 2. Food & Groceries
    let foodMonthlyMajor =
      household.adults * benchmark.groceriesPerAdult +
      household.children * benchmark.groceriesPerChild;

    // Dining out scales with lifestyle
    const diningMultiplier =
      household.lifestyleLevel === 'essential'
        ? 0.4
        : household.lifestyleLevel === 'comfortable'
        ? 1.6
        : 1.0;
    foodMonthlyMajor += household.adults * benchmark.diningPerAdult * diningMultiplier;

    let foodMonthlyMinor = Math.round(foodMonthlyMajor * 100);
    if (overrides?.actualGroceriesMonthlyMinor) {
      foodMonthlyMinor = overrides.actualGroceriesMonthlyMinor;
    }

    const foodItem: CostEstimateItem = {
      id: 'food-groceries',
      category: 'food',
      label: `Groceries & Dining (${household.adults} adult${household.adults > 1 ? 's' : ''}${household.children > 0 ? `, ${household.children} child` : ''})`,
      monthlyEstimate: fromMinor(foodMonthlyMinor, currency),
      monthlyLow: fromMinor(Math.round(foodMonthlyMinor * 0.85), currency),
      monthlyHigh: fromMinor(Math.round(foodMonthlyMinor * 1.2), currency),
      annualEstimate: fromMinor(foodMonthlyMinor * 12, currency),
      confidence: 'High',
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === 'nyc' ? 'us-bls-cpi-nyc-2024' : benchmark.evidenceSourceId,
      notes: cityId === 'nyc' ? 'Based on BLS Consumer Expenditure Survey metropolitan food-at-home and food-away weights.' : 'Official statistics consumer price index regional food-at-home and dining expenditure weights.',
    };

    // 3. Utilities & Connectivity
    const extraPersons = Math.max(0, household.adults + household.children - 1);
    const utilitiesMajor =
      benchmark.baseUtilities +
      extraPersons * benchmark.utilitiesPerExtraPerson +
      benchmark.internetMonthly +
      household.adults * benchmark.mobilePerAdult;
    const utilitiesMinor = Math.round(utilitiesMajor * 100);

    const utilitiesItem: CostEstimateItem = {
      id: 'utilities-connectivity',
      category: 'utilities',
      label: 'Energy, Water, Fiber Internet & Mobile',
      monthlyEstimate: fromMinor(utilitiesMinor, currency),
      monthlyLow: fromMinor(Math.round(utilitiesMinor * 0.9), currency),
      monthlyHigh: fromMinor(Math.round(utilitiesMinor * 1.25), currency),
      annualEstimate: fromMinor(utilitiesMinor * 12, currency),
      confidence: 'High',
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === 'nyc' ? 'us-bls-cpi-nyc-2024' : benchmark.evidenceSourceId,
      notes: 'Includes seasonal weighted energy, municipal water, high-speed broadband, and cellular plans.',
    };

    // 4. Transportation
    let transportMajor = 0;
    if (household.transportMode === 'public_transit') {
      transportMajor = household.adults * benchmark.publicTransitPerAdult;
    } else if (household.transportMode === 'car') {
      transportMajor = household.carsCount * benchmark.carMonthlyPerVehicle;
    } else if (household.transportMode === 'transit_and_rideshare') {
      transportMajor =
        household.adults * benchmark.publicTransitPerAdult +
        household.adults * benchmark.rideshareMonthly;
    } else {
      // walking / biking
      transportMajor = household.adults * 40;
    }

    let transportMinor = Math.round(transportMajor * 100);
    if (overrides?.actualTransitMonthlyMinor) {
      transportMinor = overrides.actualTransitMonthlyMinor;
    }

    const transportItem: CostEstimateItem = {
      id: 'transportation',
      category: 'transport',
      label: `Transportation (${(household.transportMode || 'public_transit').replace(/_/g, ' ')})`,
      monthlyEstimate: fromMinor(transportMinor, currency),
      monthlyLow: fromMinor(Math.round(transportMinor * 0.9), currency),
      monthlyHigh: fromMinor(Math.round(transportMinor * 1.15), currency),
      annualEstimate: fromMinor(transportMinor * 12, currency),
      confidence: 'High',
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === 'nyc' ? 'us-mta-nyc-transit-2024' : benchmark.evidenceSourceId,
      notes: cityId === 'nyc' ? 'MTA 30-day passes or vehicle amortization, gas, insurance, and routine maintenance.' : 'Metropolitan transit agency passes, vehicle operating costs, fuel, and routine maintenance.',
    };

    // 5. Healthcare
    const isFamily = household.children > 0 || household.adults > 1;
    const healthcareMajor = isFamily ? benchmark.healthcareFamily : benchmark.healthcareSingle;
    const healthcareMinor = Math.round(healthcareMajor * 100);

    const healthcareItem: CostEstimateItem = {
      id: 'healthcare',
      category: 'healthcare',
      label: 'Healthcare (Employee Premium Share & Copays)',
      monthlyEstimate: fromMinor(healthcareMinor, currency),
      monthlyLow: fromMinor(Math.round(healthcareMinor * 0.8), currency),
      monthlyHigh: fromMinor(Math.round(healthcareMinor * 1.3), currency),
      annualEstimate: fromMinor(healthcareMinor * 12, currency),
      confidence: 'High',
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === 'nyc' ? 'us-bls-cpi-nyc-2024' : benchmark.evidenceSourceId,
      notes: 'Typical employer plan payroll deduction plus standard prescription and office copays.',
    };

    // 6. Childcare & Family (if children > 0)
    let childcareMinor = 0;
    const items: CostEstimateItem[] = [housingItem, foodItem, utilitiesItem, transportItem, healthcareItem];

    if (household.children > 0) {
      const childcareMajor = household.children * benchmark.childcarePerChild;
      childcareMinor = Math.round(childcareMajor * 100);
      const childcareItem: CostEstimateItem = {
        id: 'childcare-education',
        category: 'family',
        label: `Childcare, After-School & Activities (${household.children} child${household.children > 1 ? 'ren' : ''})`,
        monthlyEstimate: fromMinor(childcareMinor, currency),
        monthlyLow: fromMinor(Math.round(childcareMinor * 0.85), currency),
        monthlyHigh: fromMinor(Math.round(childcareMinor * 1.25), currency),
        annualEstimate: fromMinor(childcareMinor * 12, currency),
        confidence: 'Moderate',
        sourceDate: benchmark.sourceDate,
        evidenceSourceId: benchmark.evidenceSourceId,
        notes: 'Licensed day care / preschool or activity fees for school-age dependents.',
      };
      items.push(childcareItem);
    }

    // 7. Lifestyle & Personal Discretionary
    const effectiveLifestyle = household.lifestyleLevel || 'moderate';
    const lifestyleBase = benchmark.lifestyleBasePerAdult[effectiveLifestyle] || benchmark.lifestyleBasePerAdult.moderate;
    const lifestyleMajor = household.adults * lifestyleBase;
    const lifestyleMinor = Math.round(lifestyleMajor * 100);

    const lifestyleItem: CostEstimateItem = {
      id: 'lifestyle-discretionary',
      category: 'lifestyle',
      label: `Discretionary Lifestyle (${effectiveLifestyle})`,
      monthlyEstimate: fromMinor(lifestyleMinor, currency),
      monthlyLow: fromMinor(Math.round(lifestyleMinor * 0.8), currency),
      monthlyHigh: fromMinor(Math.round(lifestyleMinor * 1.3), currency),
      annualEstimate: fromMinor(lifestyleMinor * 12, currency),
      confidence: 'Moderate',
      sourceDate: benchmark.sourceDate,
      evidenceSourceId: cityId === 'nyc' ? 'us-bls-cpi-nyc-2024' : benchmark.evidenceSourceId,
      notes: 'Clothing, recreation, fitness, personal grooming, entertainment subscriptions.',
    };
    items.push(lifestyleItem);

    // Grouping by category
    const categoryMap = new Map<string, CostEstimateItem[]>();
    for (const it of items) {
      const list = categoryMap.get(it.category) || [];
      list.push(it);
      categoryMap.set(it.category, list);
    }

    const categories: CostCategorySummary[] = [];
    let monthlyTotalMinor = 0;
    let monthlyWithoutRentMinor = 0;

    for (const [catKey, catItems] of categoryMap.entries()) {
      const catMonthly = catItems.reduce((acc, i) => acc + i.monthlyEstimate.amountMinor, 0);
      monthlyTotalMinor += catMonthly;
      if (catKey !== 'housing') {
        monthlyWithoutRentMinor += catMonthly;
      }
      categories.push({
        category: catKey as any,
        label: catKey.charAt(0).toUpperCase() + catKey.slice(1),
        monthlyTotal: fromMinor(catMonthly, currency),
        annualTotal: fromMinor(catMonthly * 12, currency),
        items: catItems,
      });
    }

    const assumptionsSummary = `${household.adults} adult${household.adults > 1 ? 's' : ''}${
      household.children > 0 ? `, ${household.children} child` : ''
    } · ${household.housingType || '1-bedroom'} · ${household.areaType || 'typical'} area · ${(household.transportMode || 'public_transit').replace(/_/g, ' ')} · ${effectiveLifestyle} lifestyle`;

    return {
      monthlyTotal: fromMinor(monthlyTotalMinor, currency),
      annualTotal: fromMinor(monthlyTotalMinor * 12, currency),
      monthlyWithRent: fromMinor(monthlyTotalMinor, currency),
      monthlyWithoutRent: fromMinor(monthlyWithoutRentMinor, currency),
      categories,
      housingMonthly: fromMinor(rentMonthlyMinor, currency),
      essentialMonthly: fromMinor(monthlyTotalMinor - lifestyleMinor, currency),
      discretionaryMonthly: fromMinor(lifestyleMinor, currency),
      confidenceScore: 'High-confidence estimate',
      evidenceSourceIds: Array.from(new Set(items.map((i) => i.evidenceSourceId))),
      datasetVersion: benchmark.sourceDate,
      assumptionsSummary,
    };
  }
}
