import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Sparkles,
  Building2,
  MapPin,
  SlidersHorizontal,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calculator,
  Home,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CITIES } from '../../data/locations';
import { PRESET_LIST } from '../../data/presets';
import { calculateSalaryWorth } from '../../api/calculators';
import { SalaryWorthCalculator } from '../../engines/calculator-core/salary-worth';
import { createMoney, formatMoney, getDefaultSalaryForCurrency, toMajor } from '../../lib/money';
import { HouseholdProfile } from '../../types/col';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../../types/scenario';
import { CurrencyInput } from '../ui/CurrencyInput';
import { ResultSummaryCard } from './ResultSummaryCard';

// Defer non-critical cards to reduce initial JavaScript parse and transfer size
const AssumptionPills = React.lazy(() =>
  import('./AssumptionPills').then((m) => ({ default: m.AssumptionPills }))
);
const LivingCostBreakdownCard = React.lazy(() =>
  import('./LivingCostBreakdownCard').then((m) => ({ default: m.LivingCostBreakdownCard }))
);
const TaxBreakdownCard = React.lazy(() =>
  import('./TaxBreakdownCard').then((m) => ({ default: m.TaxBreakdownCard }))
);

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
  const [outcome, setOutcome] = useState<LivWorthCalculationOutcome>(() => {
    try {
      return SalaryWorthCalculator.calculate(scenario);
    } catch {
      return null as any;
    }
  });
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const currentCity = scenario.location;
  const currency = currentCity.currency;

  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronize local input state if scenario changes externally
  useEffect(() => {
    setSalaryInputMajor(toMajor(scenario.compensation.baseSalary));
  }, [scenario.compensation.baseSalary]);

  const isInitialMount = useRef<boolean>(true);

  // Prefetch non-critical cards during browser idle time
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => {
        import('./TaxBreakdownCard');
        import('./LivingCostBreakdownCard');
        import('./AssumptionPills');
      });
      return () => (window as any).cancelIdleCallback?.(handle);
    }
  }, []);

  // Execute authoritative backend calculation whenever scenario changes
  useEffect(() => {
    // Immediately compute synchronous outcome to eliminate layout jumps
    try {
      const immediate = SalaryWorthCalculator.calculate(scenario);
      setOutcome(immediate);
      onCalculationOutcome?.(immediate);
    } catch {}

    // On pristine initial mount, the scenario is already computed synchronously
    // without needing a duplicate blocking network call.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

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
    const isCurrencyChange = nextCity.currency !== scenario.location.currency;
    const nextSalaryMajor = isCurrencyChange
      ? getDefaultSalaryForCurrency(nextCity.currency)
      : salaryInputMajor;

    if (isCurrencyChange) {
      setSalaryInputMajor(nextSalaryMajor);
    }
    if (onUpdateRentOverride) {
      onUpdateRentOverride(undefined);
    }
    setRentInputDraft('');

    onUpdateScenario({
      ...scenario,
      location: nextCity,
      compensation: {
        ...scenario.compensation,
        baseSalary: createMoney(nextSalaryMajor, nextCity.currency),
      },
      overrides: undefined,
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

  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [showColBreakdown, setShowColBreakdown] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [rentInputDraft, setRentInputDraft] = useState<string>(
    actualRentMajor !== undefined && isFinite(actualRentMajor) ? actualRentMajor.toString() : ''
  );

  useEffect(() => {
    setRentInputDraft(
      actualRentMajor !== undefined && isFinite(actualRentMajor) ? actualRentMajor.toString() : ''
    );
  }, [actualRentMajor]);

  const handleTriggerCalculate = () => {
    isInitialMount.current = false;
    const updated: LivWorthScenario = {
      ...scenario,
      location: currentCity,
      compensation: {
        ...scenario.compensation,
        baseSalary: createMoney(salaryInputMajor, currency),
      },
    };
    onUpdateScenario(updated);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsCalculating(true);
    setCalcError(null);

    calculateSalaryWorth(updated, { signal: controller.signal })
      .then((response) => {
        if (response.success && response.data) {
          setOutcome(response.data);
          onCalculationOutcome?.(response.data);
        } else {
          setCalcError('Failed to calculate income worth. Please verify inputs.');
        }
      })
      .catch((err) => {
        if (err.errorCode === 'REQUEST_CANCELLED') return;
        setCalcError(err.message || 'Unable to connect to calculation engine.');
      })
      .finally(() => {
        setIsCalculating(false);
      });
  };

  return (
    <div id="salary-worth-view" className="space-y-8">
      {/* Hero Section: Calculator is the Hero */}
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
            What is your salary really worth?
          </h1>
          <p className="text-sm sm:text-base text-[#60706D] mt-2 leading-relaxed">
            Enter your salary and city to see how much you could take home, spend and save.
          </p>
          <p className="text-xs text-[#167D75] mt-1 font-medium">
            See if your salary covers living costs and allows you to save in your chosen city.
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
                    setRentInputDraft('');
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

        {/* Primary Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-6 pt-6 border-t border-[#F7F8F5]">
          <div className="sm:col-span-5">
            <label htmlFor="hero-location-select" className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              1. Choose City / Location
            </label>
            <div className="relative">
              <select
                id="hero-location-select"
                aria-label="Location"
                value={currentCity.id}
                onChange={(e) => handleCityChange(e.target.value)}
                className="block w-full rounded-xl border border-[#DCE3E0] bg-[#FFFFFF] px-3.5 py-3 text-base sm:text-lg font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
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

          <div className="sm:col-span-5">
            <CurrencyInput
              id="hero-annual-salary-input"
              label="2. Annual Salary"
              valueMajor={salaryInputMajor}
              currency={currency}
              onChangeMajor={handleSalaryChange}
              helperText="Pre-tax compensation (base salary)."
            />
          </div>

          <div className="sm:col-span-2 flex flex-col justify-end">
            <button
              id="btn-calculate"
              type="button"
              onClick={handleTriggerCalculate}
              className="w-full h-[52px] bg-[#102A2E] hover:bg-[#167D75] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate</span>
            </button>
          </div>
        </div>

        {/* Optional Expandable Controls: Advanced Options */}
        <div className="mt-5 pt-4 border-t border-[#F7F8F5]">
          <button
            id="btn-toggle-assumptions"
            type="button"
            onClick={() => setIsAssumptionsOpen(!isAssumptionsOpen)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#167D75] hover:text-[#0D524D] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {isAssumptionsOpen
                ? 'Hide optional assumptions'
                : 'Optional assumptions (household size, rent, tax profile, filing status)'}
            </span>
            {isAssumptionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isAssumptionsOpen && (
            <div className="mt-3 p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0] space-y-4">
              <div>
                <span className="text-xs font-semibold text-[#102A2E] block mb-1.5">
                  Household Size & Presets:
                </span>
                <React.Suspense fallback={<div className="h-9 animate-pulse bg-slate-100 rounded-lg" />}>
                  <AssumptionPills
                    household={scenario.household}
                    actualRentOverridden={actualRentMajor !== undefined}
                    actualRentFormatted={
                      actualRentMajor !== undefined && isFinite(actualRentMajor)
                        ? formatMoney(createMoney(actualRentMajor, currency), { hideDecimals: true })
                        : undefined
                    }
                    onOpenCustomizer={onOpenCustomizer}
                    onQuickPresetChange={handleQuickPresetChange}
                  />
                </React.Suspense>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#DCE3E0]/70">
                <div>
                  <label htmlFor="hero-custom-rent-input" className="block text-xs font-semibold text-[#102A2E] mb-1">
                    Custom Monthly Rent Override (Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="hero-custom-rent-input"
                      type="number"
                      placeholder="e.g. 2500"
                      value={rentInputDraft}
                      onChange={(e) => setRentInputDraft(e.target.value)}
                      className="w-full rounded-lg border border-[#DCE3E0] bg-white px-3 py-2 text-xs font-medium text-[#102A2E]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = rentInputDraft.trim();
                        const num = trimmed !== '' ? parseFloat(trimmed) : NaN;
                        if (!isNaN(num) && num >= 0) {
                          onUpdateRentOverride(num);
                        } else {
                          onUpdateRentOverride(undefined);
                        }
                      }}
                      className="px-3 py-2 text-xs font-bold rounded-lg bg-[#102A2E] text-white hover:bg-[#167D75] shrink-0"
                    >
                      Apply
                    </button>
                    {actualRentMajor !== undefined && (
                      <button
                        type="button"
                        onClick={() => {
                          setRentInputDraft('');
                          onUpdateRentOverride(undefined);
                        }}
                        className="px-2 py-2 text-xs font-medium text-red-600 hover:underline shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={onOpenCustomizer}
                    className="text-xs font-semibold text-[#167D75] hover:text-[#0D524D] hover:underline flex items-center space-x-1"
                  >
                    <span>Open full tax profile & filing status modeler →</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {/* Primary Result Summary Card */}
      {outcome && (
        <>
          <ResultSummaryCard
            outcome={outcome}
            onOpenCustomizer={onOpenCustomizer}
            onCompareCity={onNavigateToCompare}
            onOpenEvidence={onOpenEvidence}
          />

          {/* Progressive Disclosure Action Bar */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#60706D] block">
                  Detailed Financial Intelligence
                </span>
                <p className="text-xs text-[#60706D] mt-0.5">
                  Explore statutory tax brackets, itemized living costs, and methodology
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-toggle-tax-breakdown"
                  type="button"
                  onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                  className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    showTaxBreakdown
                      ? 'bg-[#102A2E] text-white border-[#102A2E]'
                      : 'border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5]'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{showTaxBreakdown ? 'Hide tax breakdown' : 'See tax breakdown'}</span>
                  {showTaxBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="btn-toggle-col-breakdown"
                  type="button"
                  onClick={() => setShowColBreakdown(!showColBreakdown)}
                  className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    showColBreakdown
                      ? 'bg-[#102A2E] text-white border-[#102A2E]'
                      : 'border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5]'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{showColBreakdown ? 'Hide living-cost breakdown' : 'See living-cost breakdown'}</span>
                  {showColBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="btn-toggle-methodology-summary"
                  type="button"
                  onClick={() => setShowMethodology(!showMethodology)}
                  className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    showMethodology
                      ? 'bg-[#102A2E] text-white border-[#102A2E]'
                      : 'border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>How was this calculated?</span>
                  {showMethodology ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  id="btn-open-evidence"
                  data-testid="btn-view-data-sources"
                  type="button"
                  onClick={onOpenEvidence}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DCE3E0] text-[#167D75] hover:bg-[#DDF2EC] transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>View data sources</span>
                </button>

                <button
                  id="btn-open-customizer"
                  type="button"
                  onClick={onOpenCustomizer}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Customize Assumptions</span>
                </button>
              </div>
            </div>

            {/* Expandable "How was this calculated?" explanation box */}
            {showMethodology && (
              <div className="mt-4 p-4 rounded-xl bg-[#F7F8F5] border border-[#DCE3E0] text-xs space-y-2 text-[#60706D]">
                <h4 className="font-bold text-sm text-[#102A2E]">LivWorthy Calculation Pipeline</h4>
                <p>
                  1. <strong>Gross Salary:</strong> Stated pre-tax cash compensation.
                </p>
                <p>
                  2. <strong>Statutory Deductions & Taxes:</strong> Applied deterministically using verified government tax authority schedules (federal, state/provincial, local, and mandatory social insurance).
                </p>
                <p>
                  3. <strong>Take-Home Pay:</strong> Stated gross minus exact statutory deductions and taxes.
                </p>
                <p>
                  4. <strong>Estimated Living Costs:</strong> Benchmarked for your household composition (rent, utilities, groceries, healthcare, transit) using official metropolitan statistics.
                </p>
                <p>
                  5. <strong>Money Left After Expenses:</strong> Take-home pay minus estimated living costs. This represents your spendable buffer for savings, investments, or travel.
                </p>
              </div>
            )}
          </div>

          {/* Detailed Breakdowns when expanded */}
          {(showTaxBreakdown || showColBreakdown) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {showTaxBreakdown && (
                <React.Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-xl" />}>
                  <TaxBreakdownCard tax={outcome.tax} onOpenEvidence={onOpenEvidence} />
                </React.Suspense>
              )}
              {showColBreakdown && (
                <React.Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-xl" />}>
                  <LivingCostBreakdownCard
                    col={outcome.costOfLiving}
                    actualRentMajor={actualRentMajor}
                    onOverrideRent={onUpdateRentOverride}
                    onOpenCustomizer={onOpenCustomizer}
                  />
                </React.Suspense>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
