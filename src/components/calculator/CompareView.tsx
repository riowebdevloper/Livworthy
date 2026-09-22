import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, ShieldCheck, Scale, Info, Loader2, AlertCircle } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { compareCities } from '../../api/calculators';
import { ComparisonResult } from '../../engines/calculator-core/compare';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { CurrencyCode } from '../../types/money';
import { LivWorthScenario } from '../../types/scenario';
import { CurrencyInput } from '../ui/CurrencyInput';

interface CompareViewProps {
  initialScenarioA: LivWorthScenario;
  onOpenEvidence: () => void;
  onComparisonResult?: (result: ComparisonResult) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  initialScenarioA,
  onOpenEvidence,
  onComparisonResult,
}) => {
  const [cityAId, setCityAId] = useState<string>(initialScenarioA.location.id);
  const [cityBId, setCityBId] = useState<string>('austin');

  const [salaryAMajor, setSalaryAMajor] = useState<number>(
    toMajor(initialScenarioA.compensation.baseSalary)
  );
  const [salaryBMajor, setSalaryBMajor] = useState<number>(100000);

  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(true);
  const [compareError, setCompareError] = useState<string | null>(null);

  const cityA = CITIES[cityAId] || CITIES.nyc;
  const cityB = CITIES[cityBId] || CITIES.austin;

  const abortControllerRef = useRef<AbortController | null>(null);

  const scenarioA: LivWorthScenario = {
    ...initialScenarioA,
    location: cityA,
    compensation: {
      ...initialScenarioA.compensation,
      baseSalary: createMoney(salaryAMajor, cityA.currency),
    },
  };

  const scenarioB: LivWorthScenario = {
    ...initialScenarioA,
    location: cityB,
    compensation: {
      ...initialScenarioA.compensation,
      baseSalary: createMoney(salaryBMajor, cityB.currency),
    },
  };

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsComparing(true);
    setCompareError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await compareCities(scenarioA, scenarioB, displayCurrency, undefined, {
          signal: controller.signal,
        });

        if (response.success && response.data) {
          setComparison(response.data);
          onComparisonResult?.(response.data);
        } else {
          setCompareError('Comparison engine failed. Please verify selected cities.');
        }
      } catch (err: any) {
        if (err.errorCode === 'REQUEST_CANCELLED') return;
        setCompareError(err.message || 'Comparison service unavailable.');
      } finally {
        setIsComparing(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cityAId, cityBId, salaryAMajor, salaryBMajor, displayCurrency, onComparisonResult]);

  return (
    <div id="compare-view" className="space-y-8">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
        {isComparing && (
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-semibold text-[#0D524D] bg-[#DDF2EC] px-2.5 py-1 rounded-full animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Comparing locations...</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
              Objective Location Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
              Compare Real Living Worth Between Cities
            </h2>
            <p className="text-xs sm:text-sm text-[#60706D] mt-1 max-w-xl">
              Compare two scenarios side-by-side through the same unified financial calculation engine. Retains full statutory tax differences and regional cost benchmarks.
            </p>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center space-x-1.5 bg-[#F7F8F5] p-1 rounded-xl border border-[#DCE3E0] overflow-x-auto max-w-full">
            <span className="text-xs text-[#60706D] font-medium pl-2 whitespace-nowrap">Display in:</span>
            {(['USD', 'EUR', 'GBP', 'AED', 'CAD', 'AUD', 'SGD'] as CurrencyCode[]).map((curr) => (
              <button
                key={curr}
                type="button"
                id={`btn-currency-${curr.toLowerCase()}`}
                onClick={() => setDisplayCurrency(curr)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  displayCurrency === curr
                    ? 'bg-[#102A2E] text-white shadow-xs'
                    : 'text-[#60706D] hover:text-[#102A2E]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Comparisons */}
        <div className="mt-5 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-[#60706D] whitespace-nowrap">Popular Pairs:</span>
          {[
            { a: 'nyc', aSal: 100000, b: 'austin', bSal: 100000, label: 'NYC vs Austin ($100k)' },
            { a: 'sf', aSal: 150000, b: 'seattle', bSal: 150000, label: 'SF vs Seattle ($150k)' },
            { a: 'london', aSal: 85000, b: 'dubai', bSal: 300000, label: 'London (£85k) vs Dubai (AED 300k)' },
            { a: 'toronto', aSal: 120000, b: 'vancouver', bSal: 120000, label: 'Toronto vs Vancouver (CAD $120k)' },
          ].map((pair, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCityAId(pair.a);
                setSalaryAMajor(pair.aSal);
                setCityBId(pair.b);
                setSalaryBMajor(pair.bSal);
              }}
              className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap bg-[#F7F8F5] text-[#102A2E] border border-[#DCE3E0] hover:border-[#167D75] transition-colors"
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {compareError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{compareError}</span>
        </div>
      )}

      {/* Comparison Inputs (City A vs City B) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City A Input */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F7F8F5]">
            <span className="font-bold text-sm text-[#102A2E]">Location A (Baseline)</span>
            <span className="text-xs bg-[#DDF2EC] text-[#0D625B] font-bold px-2 py-0.5 rounded">
              {cityA.currency}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="compare-city-a-select" className="block text-xs font-semibold text-[#102A2E] mb-1 uppercase tracking-wider">
                Select City A
              </label>
              <select
                id="compare-city-a-select"
                aria-label="Select City A"
                value={cityAId}
                onChange={(e) => setCityAId(e.target.value)}
                className="w-full text-base font-bold rounded-lg border border-[#DCE3E0] p-2.5 bg-white text-[#102A2E]"
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
                id="compare-salary-a-input"
                label={`Annual Gross Salary (${cityA.currency})`}
                valueMajor={salaryAMajor}
                currency={cityA.currency}
                onChangeMajor={setSalaryAMajor}
              />
            </div>
          </div>
        </div>

        {/* City B Input */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F7F8F5]">
            <span className="font-bold text-sm text-[#102A2E]">Location B (Target)</span>
            <span className="text-xs bg-[#DDF2EC] text-[#0D625B] font-bold px-2 py-0.5 rounded">
              {cityB.currency}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="compare-city-b-select" className="block text-xs font-semibold text-[#102A2E] mb-1 uppercase tracking-wider">
                Select City B
              </label>
              <select
                id="compare-city-b-select"
                aria-label="Select City B"
                value={cityBId}
                onChange={(e) => setCityBId(e.target.value)}
                className="w-full text-base font-bold rounded-lg border border-[#DCE3E0] p-2.5 bg-white text-[#102A2E]"
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
                id="compare-salary-b-input"
                label={`Annual Gross Salary (${cityB.currency})`}
                valueMajor={salaryBMajor}
                currency={cityB.currency}
                onChangeMajor={setSalaryBMajor}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results Card */}
      {comparison && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F7F8F5] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
                Normalized Comparison Delta
              </span>
              <h3 className="text-xl font-extrabold text-[#102A2E]">
                {cityA.name} vs {cityB.name}
              </h3>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#60706D]">
              <span className="bg-[#F7F8F5] px-2.5 py-1 rounded-full border border-[#DCE3E0]">
                All metrics converted to <strong className="text-[#102A2E]">{displayCurrency}</strong>
              </span>
              <button onClick={onOpenEvidence} className="text-[#167D75] font-semibold hover:underline flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Evidence Sources
              </button>
            </div>
          </div>

          {/* Objective Summary Narrative */}
          <div className="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0] text-xs leading-relaxed text-[#102A2E]">
            <p className="font-medium">{comparison.delta.summaryNarrative}</p>
          </div>

          {/* Table Breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE3E0] text-[#60706D] font-bold">
                  <th className="py-2.5">Financial Metric</th>
                  <th className="py-2.5 text-right">{cityA.name}</th>
                  <th className="py-2.5 text-right">{cityB.name}</th>
                  <th className="py-2.5 text-right">Net Delta ({displayCurrency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F8F5]">
                <tr>
                  <td className="py-3 font-semibold text-[#102A2E]">Gross Compensation</td>
                  <td className="py-3 text-right font-tabular text-[#60706D]">
                    {formatMoney(comparison.convertedA.grossAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3 text-right font-tabular text-[#60706D]">
                    {formatMoney(comparison.convertedB.grossAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3 text-right font-bold font-tabular text-[#102A2E]">
                    {comparison.delta.grossAnnualDiff.amountMinor >= 0 ? '+' : ''}
                    {formatMoney(comparison.delta.grossAnnualDiff, { hideDecimals: true })}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-[#102A2E]">Net Take-Home (Post-Tax)</td>
                  <td className="py-3 text-right font-tabular text-[#167D75] font-semibold">
                    {formatMoney(comparison.convertedA.takeHomeAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3 text-right font-tabular text-[#167D75] font-semibold">
                    {formatMoney(comparison.convertedB.takeHomeAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3 text-right font-bold font-tabular text-[#167D75]">
                    {comparison.delta.takeHomeAnnualDiff.amountMinor >= 0 ? '+' : ''}
                    {formatMoney(comparison.delta.takeHomeAnnualDiff, { hideDecimals: true })}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold text-[#102A2E]">Annual Living Expenses</td>
                  <td className="py-3 text-right font-tabular text-[#60706D]">
                    {formatMoney(comparison.convertedA.livingCostsAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3 text-right font-tabular text-[#60706D]">
                    {formatMoney(comparison.convertedB.livingCostsAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3 text-right font-bold font-tabular text-[#60706D]">
                    {comparison.delta.livingCostsAnnualDiff.amountMinor >= 0 ? '+' : ''}
                    {formatMoney(comparison.delta.livingCostsAnnualDiff, { hideDecimals: true })}
                  </td>
                </tr>

                <tr className="bg-[#DDF2EC]/40 font-bold text-sm">
                  <td className="py-3.5 pl-2 rounded-l-lg text-[#102A2E]">Disposable Income Remaining</td>
                  <td className="py-3.5 text-right font-tabular text-[#102A2E]">
                    {formatMoney(comparison.convertedA.disposableAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3.5 text-right font-tabular text-[#102A2E]">
                    {formatMoney(comparison.convertedB.disposableAnnual, { hideDecimals: true })}
                  </td>
                  <td className="py-3.5 pr-2 rounded-r-lg text-right font-tabular font-extrabold text-[#167D75]">
                    {comparison.delta.disposableIncomeAnnualDiff.amountMinor >= 0 ? '+' : ''}
                    {formatMoney(comparison.delta.disposableIncomeAnnualDiff, { hideDecimals: true })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
