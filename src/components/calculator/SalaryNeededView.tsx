import React, { useState } from 'react';
import { Target, TrendingUp, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { SalaryNeededCalculator, SalaryNeededResult } from '../../engines/calculator-core/salary-needed';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { HouseholdProfile } from '../../types/col';
import { LivWorthScenario } from '../../types/scenario';
import { CurrencyInput } from '../ui/CurrencyInput';

interface SalaryNeededViewProps {
  initialScenario: LivWorthScenario;
  onOpenCustomizer: () => void;
  onSwitchToSalaryWorthWithSalary: (salaryMajor: number) => void;
  onOpenEvidence: () => void;
}

export const SalaryNeededView: React.FC<SalaryNeededViewProps> = ({
  initialScenario,
  onOpenCustomizer,
  onSwitchToSalaryWorthWithSalary,
  onOpenEvidence,
}) => {
  const [targetSavingsMonthlyMajor, setTargetSavingsMonthlyMajor] = useState<number>(1000);
  const [selectedCityId, setSelectedCityId] = useState<string>(initialScenario.location.id);

  const city = CITIES[selectedCityId] || initialScenario.location;
  const currency = city.currency;

  const scenarioForCalculation: LivWorthScenario = {
    ...initialScenario,
    location: city,
  };

  const targetSavingsMoney = createMoney(targetSavingsMonthlyMajor, currency);
  const result: SalaryNeededResult = SalaryNeededCalculator.calculate(
    scenarioForCalculation,
    targetSavingsMoney
  );

  return (
    <div id="salary-needed-view" className="space-y-8">
      {/* Question Hero */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs">
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

      {/* The 3 Scenario Tiers (Essential, Moderate, Your Target) */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tier 1: Essential */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 flex flex-col justify-between hover:border-[#60706D] transition-colors">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#60706D]">
                Tier 1
              </span>
              <h4 className="font-bold text-base text-[#102A2E] mt-0.5">
                {result.threeTiers.essential.label}
              </h4>
              <p className="text-xs text-[#60706D] mt-1">
                Zero savings cushion, restrained discretionary expenses.
              </p>

              <div className="mt-5 pt-4 border-t border-[#F7F8F5]">
                <span className="text-xs text-[#60706D] block">Required Gross Salary</span>
                <div className="text-2xl font-extrabold text-[#102A2E] font-tabular mt-1">
                  {formatMoney(result.threeTiers.essential.requiredGrossAnnual, { hideDecimals: true })}
                </div>
                <span className="text-xs text-[#60706D]">/year</span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-[#60706D]">
                <div className="flex justify-between">
                  <span>Monthly Expenses:</span>
                  <span className="font-semibold text-[#102A2E]">
                    {formatMoney(result.threeTiers.essential.monthlyLivingCosts, { hideDecimals: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Savings:</span>
                  <span className="font-semibold text-[#102A2E]">$0</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onSwitchToSalaryWorthWithSalary(
                  toMajor(result.threeTiers.essential.requiredGrossAnnual)
                )
              }
              className="mt-6 w-full py-2 px-3 rounded-lg border border-[#DCE3E0] text-xs font-semibold text-[#102A2E] hover:bg-[#F7F8F5] flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>Explore in Salary Worth</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tier 2: Moderate */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 flex flex-col justify-between hover:border-[#60706D] transition-colors">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#60706D]">
                Tier 2
              </span>
              <h4 className="font-bold text-base text-[#102A2E] mt-0.5">
                {result.threeTiers.moderate.label}
              </h4>
              <p className="text-xs text-[#60706D] mt-1">
                Typical living standard with standard 15% emergency savings cushion.
              </p>

              <div className="mt-5 pt-4 border-t border-[#F7F8F5]">
                <span className="text-xs text-[#60706D] block">Required Gross Salary</span>
                <div className="text-2xl font-extrabold text-[#102A2E] font-tabular mt-1">
                  {formatMoney(result.threeTiers.moderate.requiredGrossAnnual, { hideDecimals: true })}
                </div>
                <span className="text-xs text-[#60706D]">/year</span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-[#60706D]">
                <div className="flex justify-between">
                  <span>Monthly Expenses:</span>
                  <span className="font-semibold text-[#102A2E]">
                    {formatMoney(result.threeTiers.moderate.monthlyLivingCosts, { hideDecimals: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Savings:</span>
                  <span className="font-semibold text-[#167D75]">
                    {formatMoney(result.threeTiers.moderate.monthlySavings, { hideDecimals: true })}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onSwitchToSalaryWorthWithSalary(
                  toMajor(result.threeTiers.moderate.requiredGrossAnnual)
                )
              }
              className="mt-6 w-full py-2 px-3 rounded-lg border border-[#DCE3E0] text-xs font-semibold text-[#102A2E] hover:bg-[#F7F8F5] flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>Explore in Salary Worth</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tier 3: YOUR TARGET (VISUAL EMPHASIS) */}
          <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#167D75] p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#167D75] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
              Your Target
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#167D75]">
                Custom Goal
              </span>
              <h4 className="font-bold text-base text-[#102A2E] mt-0.5">
                {result.threeTiers.target.label}
              </h4>
              <p className="text-xs text-[#60706D] mt-1">
                Full lifestyle expenses plus {formatMoney(targetSavingsMoney, { hideDecimals: true })}/month in savings.
              </p>

              <div className="mt-5 pt-4 border-t border-[#DCE3E0]/70">
                <span className="text-xs text-[#167D75] font-semibold block">
                  Exact Required Gross Income
                </span>
                <div className="text-3xl font-extrabold text-[#102A2E] font-tabular mt-1">
                  {formatMoney(result.requiredGrossAnnual, { hideDecimals: true })}
                </div>
                <span className="text-xs text-[#60706D]">
                  yields {formatMoney(result.requiredNetAnnual, { hideDecimals: true })}/year take-home
                </span>
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
              onClick={() =>
                onSwitchToSalaryWorthWithSalary(toMajor(result.requiredGrossAnnual))
              }
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#167D75] text-white text-xs font-bold hover:bg-[#102A2E] flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <span>Load this salary into Salary Worth</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
