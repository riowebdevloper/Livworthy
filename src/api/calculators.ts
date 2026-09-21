import { apiFetch, ApiFetchOptions } from './client';
import {
  ApiSuccessResponse,
  CalculateCostOfLivingRequest,
  CalculateSalaryAfterTaxRequest,
  CalculateSalaryNeededRequest,
} from './types';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../types/scenario';
import { SalaryNeededResult } from '../engines/calculator-core/salary-needed';
import { TaxResult } from '../types/tax';
import { CostOfLivingResult } from '../types/col';
import { ComparisonResult, RelocationProfile } from '../engines/calculator-core/compare';
import { CurrencyCode } from '../types/money';

/**
 * Calculates authoritative Salary Worth (take-home pay, living costs, money remaining)
 * via backend POST /api/calculate
 */
export async function calculateSalaryWorth(
  scenario: LivWorthScenario,
  options?: ApiFetchOptions
): Promise<ApiSuccessResponse<LivWorthCalculationOutcome>> {
  return apiFetch<ApiSuccessResponse<LivWorthCalculationOutcome>>('/api/calculate', {
    method: 'POST',
    body: JSON.stringify(scenario),
    ...options,
  });
}

/**
 * Executes iterative reverse solver to compute required gross salary
 * via backend POST /api/salary-needed
 */
export async function calculateSalaryNeeded(
  scenario: LivWorthScenario,
  targetSavingsMonthlyMinor: number,
  options?: ApiFetchOptions
): Promise<ApiSuccessResponse<SalaryNeededResult>> {
  const payload: CalculateSalaryNeededRequest = {
    scenario,
    targetSavingsMonthlyMinor,
  };
  return apiFetch<ApiSuccessResponse<SalaryNeededResult>>('/api/salary-needed', {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  });
}

/**
 * Calculates authoritative itemized statutory taxes and deductions
 * via backend POST /api/tax/estimate
 */
export async function calculateSalaryAfterTax(
  params: CalculateSalaryAfterTaxRequest,
  options?: ApiFetchOptions
): Promise<ApiSuccessResponse<TaxResult>> {
  return apiFetch<ApiSuccessResponse<TaxResult>>('/api/tax/estimate', {
    method: 'POST',
    body: JSON.stringify(params),
    ...options,
  });
}

/**
 * Calculates itemized household living expenses and benchmarks
 * via backend POST /api/cost-of-living
 */
export async function calculateCostOfLiving(
  params: CalculateCostOfLivingRequest,
  options?: ApiFetchOptions
): Promise<ApiSuccessResponse<CostOfLivingResult>> {
  return apiFetch<ApiSuccessResponse<CostOfLivingResult>>('/api/cost-of-living', {
    method: 'POST',
    body: JSON.stringify(params),
    ...options,
  });
}

/**
 * Executes cross-city comparison via backend POST /api/compare
 * utilizing institutional live FX snapshot
 */
export async function compareCities(
  scenarioA: LivWorthScenario,
  scenarioB: LivWorthScenario,
  displayCurrency: CurrencyCode = 'USD',
  relocationB?: RelocationProfile,
  options?: ApiFetchOptions
): Promise<ApiSuccessResponse<ComparisonResult>> {
  return apiFetch<ApiSuccessResponse<ComparisonResult>>('/api/compare', {
    method: 'POST',
    body: JSON.stringify({
      scenarioA,
      scenarioB,
      displayCurrency,
      relocationB,
    }),
    ...options,
  });
}

/**
 * Compares job offers and one-time relocation vs recurring disposable income
 * via backend POST /api/compare
 */
export async function compareJobOffers(
  scenarioA: LivWorthScenario,
  scenarioB: LivWorthScenario,
  displayCurrency: CurrencyCode,
  relocationB?: RelocationProfile,
  options?: ApiFetchOptions
): Promise<ApiSuccessResponse<ComparisonResult>> {
  return apiFetch<ApiSuccessResponse<ComparisonResult>>('/api/compare', {
    method: 'POST',
    body: JSON.stringify({
      scenarioA,
      scenarioB,
      displayCurrency,
      relocationB,
    }),
    ...options,
  });
}
