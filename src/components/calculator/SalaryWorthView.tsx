import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Building2, MapPin, SlidersHorizontal, ShieldCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { PRESET_LIST } from '../../data/presets';
import { calculateSalaryWorth } from '../../api/calculators';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { HouseholdProfile } from '../../types/col';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../../types/scenario';
import { CurrencyInput } from '../ui/CurrencyInput';
import { AssumptionPills } from './AssumptionPills';
import { LivingCostBreakdownCard } from './LivingCostBreakdownCard';
import { ResultSummaryCard } from './ResultSummaryCard';
import { TaxBreakdownCard } from './TaxBreakdownCard';

interface SalaryWorthViewProps {
  scenario: LivWorthScenario;
  onUpdateScenario: (updated: LivWorthScenario) => void;
  actualRentMajor?: number;
  onUpdateRentOverride: (rentMajor: number | undefined) => void;
  onOpenCustomizer: () => void;
  onOpenEvidence: () => void;
  onNavigateToCompare: () => void;
  onCalculationOutcome?: (outcome: LivWorthCalculationOutcome) => void;
}

export const SalaryWorthView: React.FC<SalaryWorthViewProps> = ({
  scenario,
  onUpdateScenario,
  actualRentMajor,
  onUpdateRentOverride,
  onOpenCustomizer,
  onOpenEvidence,
  onNavigateToCompare,
  onCalculationOutcome,
}) => {
  const [salaryInputMajor, setSalaryInputMajor] = useState<number>(
    toMajor(scenario.compensation.baseSalary)
  );
  const [outcome, setOutcome] = useState<LivWorthCalculationOutcome | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [calcError, setCalcError] = useState<string | null>(null);

  const currentCity = scenario.location;
  const currency = currentCity.currency;

  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronize local input state if scenario changes externally
  useEffect(() => {
    setSalaryInputMajor(toMajor(scenario.compensation.baseSalary));
  }, [scenario.compensation.baseSalary]);

  // Execute authoritative backend calculation whenever scenario changes
  useEffect(() => {
    // Cancel any ongoing calculation in flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsCalculating(true);
    setCalcError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await calculateSalaryWorth(scenario, {
          signal: controller.signal,
        });

        if (response.success && response.data) {
          setOutcome(response.data);
          onCalculationOutcome?.(response.data);
        } else {
          setCalcError('Failed to calculate income worth. Please verify inputs.');
        }
      } catch (err: any) {
        if (err.errorCode === 'REQUEST_CANCELLED') {
          return; // Ignore aborted requests
        }
        setCalcError(err.message || 'Unable to connect to calculation engine.');
      } finally {
        setIsCalculating(false);
      }
    }, 150); // Debounce to prevent race conditions during typing

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [scenario, onCalculationOutcome]);

  const handleSalaryChange = (newMajor: number) => {
    setSalaryInputMajor(newMajor);
    onUpdateScenario({
      ...scenario,
      compensation: {
        ...scenario.compensation,
        baseSalary: createMoney(newMajor, currency),
      },
    });
  };

  const handleCityChange = (cityId: string) => {
    const nextCity = CITIES[cityId] || CITIES.nyc;
    onUpdateScenario({
      ...scenario,
      location: nextCity,
      compensation: {
        ...scenario.compensation,
        baseSalary: createMoney(salaryInputMajor, nextCity.currency),
      },
    });
  };

  const handleQuickPresetChange = (preset: 'single' | 'couple' | 'family') => {
    const updatedHousehold: HouseholdProfile = { ...scenario.household, preset };
    if (preset === 'single') {
      updatedHousehold.adults = 1;
      updatedHousehold.children = 0;
      updatedHousehold.housingType = '1-bedroom';
    } else if (preset === 'couple') {
      updatedHousehold.adults = 2;
      updatedHousehold.children = 0;
      updatedHousehold.housingType = '1-bedroom';
    } else if (preset === 'family') {
      updatedHousehold.adults = 2;
      updatedHousehold.children = 2;
      updatedHousehold.housingType = '2-bedroom';
    }
    onUpdateScenario({
      ...scenario,
      household: updatedHousehold,
    });
  };

  return (
    <div id="salary-worth-view" className="space-y-8">
      {/* 28. Hero Section: Calculator is the Hero */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
        {isCalculating && (
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-semibold text-[#0D524D] bg-[#DDF2EC] px-2.5 py-1 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Calculating...</span>
          </div>
        )}

        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
            Global Income & Living Intelligence
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
            What is your income really worth?
          </h1>
          <p className="text-xs sm:text-sm text-[#60706D] mt-2 leading-relaxed">
            LivWorthy estimates what actually remains after statutory income taxes, mandatory social contributions, and verified local living costs.
          </p>
        </div>

        {/* Quick Scenario Benchmark Presets */}
        <div className="mt-5 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-[#60706D] whitespace-nowrap flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#167D75]" />
            <span>Popular Scenarios:</span>
          </span>
          <div className="flex items-center space-x-1.5">
            {PRESET_LIST.map((p) => {
              const isSelected =
                scenario.location.id === p.scenario.location.id &&
                toMajor(scenario.compensation.baseSalary) === toMajor(p.scenario.compensation.baseSalary) &&
                scenario.household.preset === p.scenario.household.preset;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSalaryInputMajor(toMajor(p.scenario.compensation.baseSalary));
                    onUpdateRentOverride(undefined);
                    onUpdateScenario(p.scenario);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border ${
                    isSelected
                      ? 'bg-[#102A2E] text-white border-[#102A2E]'
                      : 'bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0] hover:border-[#167D75]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#F7F8F5]">
          <div>
            <CurrencyInput
              id="hero-annual-salary-input"
              label="Annual Gross Salary"
              valueMajor={salaryInputMajor}
              currency={currency}
              onChangeMajor={handleSalaryChange}
              helperText="Pre-tax compensation (base salary)."
            />
          </div>

          <div>
            <label htmlFor="hero-location-select" className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              Location
            </label>
            <div className="relative">
              <select
                id="hero-location-select"
                aria-label="Location"
                value={currentCity.id}
                onChange={(e) => handleCityChange(e.target.value)}
                className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] px-3 py-2.5 sm:py-3 text-base sm:text-lg font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
              >
                {Object.values(CITIES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.countryId})
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-[#60706D]">
              Statutory tax jurisdiction: {currentCity.taxJurisdictionId}
            </p>
          </div>
        </div>

        {/* 31. Editable Assumption Chips */}
        <div className="mt-4 pt-4 border-t border-[#F7F8F5]">
          <span className="text-xs font-semibold text-[#60706D] block mb-1">
            Household Profile Assumptions:
          </span>
          <AssumptionPills
            household={scenario.household}
            actualRentOverridden={actualRentMajor !== undefined}
            actualRentFormatted={actualRentMajor ? formatMoney(createMoney(actualRentMajor, currency), { hideDecimals: true }) : undefined}
            onOpenCustomizer={onOpenCustomizer}
            onQuickPresetChange={handleQuickPresetChange}
          />
        </div>
      </div>

      {/* Error state if backend fails */}
      {calcError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{calcError}</span>
          </div>
          <button
            onClick={() => onUpdateScenario({ ...scenario })}
            className="flex items-center space-x-1 font-semibold text-red-900 underline hover:no-underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 29. Primary Result Summary Card */}
      {outcome && (
        <>
          <ResultSummaryCard
            outcome={outcome}
            onOpenCustomizer={onOpenCustomizer}
            onCompareCity={onNavigateToCompare}
            onOpenEvidence={onOpenEvidence}
          />

          {/* 30. Detailed Breakdowns: Taxes & Living Costs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaxBreakdownCard tax={outcome.tax} onOpenEvidence={onOpenEvidence} />
            <LivingCostBreakdownCard
              col={outcome.costOfLiving}
              actualRentMajor={actualRentMajor}
              onOverrideRent={onUpdateRentOverride}
              onOpenCustomizer={onOpenCustomizer}
            />
          </div>
        </>
      )}
    </div>
  );
};
