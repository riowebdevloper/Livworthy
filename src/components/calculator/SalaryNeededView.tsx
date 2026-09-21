import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, Sparkles, Check, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { calculateSalaryNeeded } from '../../api/calculators';
import { SalaryNeededResult } from '../../engines/calculator-core/salary-needed';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { HouseholdProfile } from '../../types/col';
import { LivWorthScenario } from '../../types/scenario';
import { CurrencyInput } from '../ui/CurrencyInput';

interface SalaryNeededViewProps {
  initialScenario: LivWorthScenario;
  onOpenCustomizer: () => void;
  onSwitchToSalaryWorthWithSalary: (salaryMajor: number, cityId?: string) => void;
  onOpenEvidence: () => void;
  onCalculationResult?: (result: SalaryNeededResult) => void;
}

export const SalaryNeededView: React.FC<SalaryNeededViewProps> = ({
  initialScenario,
  onOpenCustomizer,
  onSwitchToSalaryWorthWithSalary,
  onOpenEvidence,
  onCalculationResult,
}) => {
  const [targetSavingsMonthlyMajor, setTargetSavingsMonthlyMajor] = useState<number>(1000);
  const [selectedCityId, setSelectedCityId] = useState<string>(initialScenario.location.id);
  const [result, setResult] = useState<SalaryNeededResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [calcError, setCalcError] = useState<string | null>(null);

  const city = CITIES[selectedCityId] || initialScenario.location;
  const currency = city.currency;

  const abortControllerRef = useRef<AbortController | null>(null);

  const scenarioForCalculation: LivWorthScenario = {
    ...initialScenario,
    location: city,
  };

  const targetSavingsMoney = createMoney(targetSavingsMonthlyMajor, currency);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsCalculating(true);
    setCalcError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await calculateSalaryNeeded(
          scenarioForCalculation,
          targetSavingsMoney.amountMinor,
          { signal: controller.signal }
        );

        if (response.success && response.data) {
          setResult(response.data);
          onCalculationResult?.(response.data);
        } else {
          setCalcError('Solver failed to find converging salary. Please adjust savings target.');
        }
      } catch (err: any) {
        if (err.errorCode === 'REQUEST_CANCELLED') return;
        setCalcError(err.message || 'Reverse solver service unavailable.');
      } finally {
        setIsCalculating(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedCityId, targetSavingsMonthlyMajor, initialScenario.household, onCalculationResult]);

  return (
    <div id="salary-needed-view" className="space-y-8">
      {/* Question Hero */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
        {isCalculating && (
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-semibold text-[#0D524D] bg-[#DDF2EC] px-2.5 py-1 rounded-full animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Solving iteratively...</span>
          </div>
        )}

        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
            Reverse Financial Solver
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
            How much do you need to earn in {city.name}?
          </h2>
          <p className="text-xs sm:text-sm text-[#60706D] mt-2 leading-relaxed">
            LivWorthy runs our tax and cost-of-living engines iteratively in reverse to calculate the exact gross salary required to cover your living costs and meet your monthly savings goal.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#F7F8F5]">
          <div>
            <label htmlFor="target-location-select" className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              Target Location
            </label>
            <select
              id="target-location-select"
              aria-label="Target Location"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] px-3 py-3 text-base font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
            >
              {Object.values(CITIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.countryId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <CurrencyInput
              id="target-savings-input"
              label="Desired Monthly Savings Target"
              valueMajor={targetSavingsMonthlyMajor}
              currency={currency}
              onChangeMajor={(val) => setTargetSavingsMonthlyMajor(val)}
              helperText="How much you want to save every month after taxes & expenses."
            />
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {calcError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{calcError}</span>
        </div>
      )}

      {/* The 3 Scenario Tiers (Essential, Moderate, Your Target) */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-[#102A2E]">Calculated Salary Thresholds</h3>
            <button
              onClick={onOpenEvidence}
              className="text-xs text-[#167D75] font-semibold hover:underline flex items-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> View Statutory Tax Schedules
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1: Essential Baseline */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#60706D] uppercase tracking-wider">
                  Baseline (0 Savings)
                </span>
                <h4 className="text-lg font-bold text-[#102A2E] mt-1">
                  {result.threeTiers.essential.label}
                </h4>
                <p className="text-xs text-[#60706D] mt-1">
                  Gross income to cover essential rent, food, utilities, and transport with zero surplus.
                </p>

                <div className="mt-4 pt-4 border-t border-[#F7F8F5]">
                  <span className="text-2xl font-extrabold text-[#102A2E] font-tabular">
                    {formatMoney(result.threeTiers.essential.requiredGrossAnnual, { hideDecimals: true })}
                  </span>
                  <span className="text-xs text-[#60706D] block">Required Annual Gross</span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#60706D] bg-[#F7F8F5] p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span>Monthly Expenses:</span>
                    <span className="font-semibold text-[#102A2E]">
                      {formatMoney(result.threeTiers.essential.monthlyLivingCosts, { hideDecimals: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Savings:</span>
                    <span className="font-medium text-[#60706D]">
                      {formatMoney(result.threeTiers.essential.monthlySavings, { hideDecimals: true })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onSwitchToSalaryWorthWithSalary(toMajor(result.threeTiers.essential.requiredGrossAnnual), city.id)
                }
                className="mt-6 w-full py-2 px-3 rounded-lg border border-[#DCE3E0] text-xs font-semibold text-[#102A2E] hover:border-[#167D75] hover:text-[#167D75] flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Inspect in Salary Worth</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Tier 2: Moderate Comfortable */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#167D75] uppercase tracking-wider">
                  Recommended Pace
                </span>
                <h4 className="text-lg font-bold text-[#102A2E] mt-1">
                  {result.threeTiers.moderate.label}
                </h4>
                <p className="text-xs text-[#60706D] mt-1">
                  Covers moderate living expenses plus standard safety cushion (15% savings buffer).
                </p>

                <div className="mt-4 pt-4 border-t border-[#F7F8F5]">
                  <span className="text-2xl font-extrabold text-[#102A2E] font-tabular">
                    {formatMoney(result.threeTiers.moderate.requiredGrossAnnual, { hideDecimals: true })}
                  </span>
                  <span className="text-xs text-[#60706D] block">Required Annual Gross</span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#60706D] bg-[#F7F8F5] p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span>Monthly Expenses:</span>
                    <span className="font-semibold text-[#102A2E]">
                      {formatMoney(result.threeTiers.moderate.monthlyLivingCosts, { hideDecimals: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Savings:</span>
                    <span className="font-medium text-[#167D75] font-semibold">
                      +{formatMoney(result.threeTiers.moderate.monthlySavings, { hideDecimals: true })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  onSwitchToSalaryWorthWithSalary(toMajor(result.threeTiers.moderate.requiredGrossAnnual), city.id)
                }
                className="mt-6 w-full py-2 px-3 rounded-lg border border-[#DCE3E0] text-xs font-semibold text-[#102A2E] hover:border-[#167D75] hover:text-[#167D75] flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Inspect in Salary Worth</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Tier 3: Custom Target Goal */}
            <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#167D75] p-6 shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 right-4 bg-[#167D75] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Your Exact Target
              </div>

              <div>
                <span className="text-xs font-bold text-[#167D75] uppercase tracking-wider">
                  Target Match
                </span>
                <h4 className="text-lg font-bold text-[#102A2E] mt-1">
                  Required Gross Salary
                </h4>
                <p className="text-xs text-[#60706D] mt-1">
                  Required to support your household and net exactly {formatMoney(targetSavingsMoney, { hideDecimals: true })}/month.
                </p>

                <div className="mt-4 pt-4 border-t border-[#F7F8F5]">
                  <span className="text-3xl font-black text-[#102A2E] font-tabular">
                    {formatMoney(result.requiredGrossAnnual, { hideDecimals: true })}
                  </span>
                  <span className="text-xs font-semibold text-[#167D75] block">Annual Gross Compensation</span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#60706D] bg-[#F7F8F5] p-3 rounded-xl border border-[#DCE3E0]/60">
                  <div className="flex justify-between">
                    <span>Monthly Expenses:</span>
                    <span className="font-semibold text-[#102A2E]">
                      {formatMoney(result.monthlyExpensesTotal, { hideDecimals: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Savings Target:</span>
                    <span className="font-bold text-[#167D75]">
                      +{formatMoney(targetSavingsMoney, { hideDecimals: true })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="btn-transfer-to-salary-worth"
                onClick={() =>
                  onSwitchToSalaryWorthWithSalary(toMajor(result.requiredGrossAnnual), city.id)
                }
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#167D75] text-white text-xs font-bold hover:bg-[#102A2E] flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>Load this salary into Salary Worth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
