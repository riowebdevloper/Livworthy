import React, { useState } from 'react';
import { ArrowLeftRight, ShieldCheck, Scale, Info } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { ComparisonEngine, ComparisonResult } from '../../engines/calculator-core/compare';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { HouseholdProfile } from '../../types/col';
import { CurrencyCode } from '../../types/money';
import { LivWorthScenario } from '../../types/scenario';

interface CompareViewProps {
  initialScenarioA: LivWorthScenario;
  onOpenEvidence: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  initialScenarioA,
  onOpenEvidence,
}) => {
  const [cityAId, setCityAId] = useState<string>(initialScenarioA.location.id);
  const [cityBId, setCityBId] = useState<string>('austin');

  const [salaryAMajor, setSalaryAMajor] = useState<number>(
    toMajor(initialScenarioA.compensation.baseSalary)
  );
  const [salaryBMajor, setSalaryBMajor] = useState<number>(100000);

  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');

  const cityA = CITIES[cityAId] || CITIES.nyc;
  const cityB = CITIES[cityBId] || CITIES.austin;

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

  const comparison: ComparisonResult = ComparisonEngine.compare(
    scenarioA,
    scenarioB,
    displayCurrency
  );

  return (
    <div id="compare-view" className="space-y-8">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs">
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

        {/* Popular Comparisons Quick Links */}
        <div className="mt-5 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-[#60706D] whitespace-nowrap">
            Popular Comparisons:
          </span>
          <div className="flex items-center space-x-1.5">
            {[
              { label: 'NYC vs. Austin ($100k)', a: 'nyc', salA: 100000, b: 'austin', salB: 100000 },
              { label: 'London vs. Dubai (£80k vs 400k AED)', a: 'london', salA: 80000, b: 'dubai', salB: 400000 },
              { label: 'Toronto vs. Vancouver (C$110k vs C$120k)', a: 'toronto', salA: 110000, b: 'vancouver', salB: 120000 },
              { label: 'Sydney vs. Melbourne (A$130k vs A$125k)', a: 'sydney', salA: 130000, b: 'melbourne', salB: 125000 },
              { label: 'Berlin vs. Munich (€75k vs €85k)', a: 'berlin', salA: 75000, b: 'munich', salB: 85000 },
              { label: 'NYC vs. Singapore ($150k vs S$190k)', a: 'nyc', salA: 150000, b: 'singapore', salB: 190000 },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCityAId(p.a);
                  setSalaryAMajor(p.salA);
                  setCityBId(p.b);
                  setSalaryBMajor(p.salB);
                }}
                className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border bg-[#F7F8F5] text-[#102A2E] border-[#DCE3E0] hover:border-[#167D75]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* City & Salary Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#F7F8F5]">
          {/* Location A */}
          <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#DCE3E0]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D75] block mb-2">
              Location A
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="compare-city-a-select" className="text-[11px] font-semibold text-[#60706D] block mb-1">City</label>
                <select
                  id="compare-city-a-select"
                  aria-label="City Location A"
                  value={cityAId}
                  onChange={(e) => setCityAId(e.target.value)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                >
                  {Object.values(CITIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="compare-salary-a-input" className="text-[11px] font-semibold text-[#60706D] block mb-1">
                  Salary ({cityA.currency})
                </label>
                <input
                  id="compare-salary-a-input"
                  aria-label="Salary Location A"
                  type="number"
                  value={salaryAMajor}
                  onChange={(e) => setSalaryAMajor(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Location B */}
          <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#DCE3E0]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D75] block mb-2">
              Location B
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="compare-city-b-select" className="text-[11px] font-semibold text-[#60706D] block mb-1">City</label>
                <select
                  id="compare-city-b-select"
                  aria-label="City Location B"
                  value={cityBId}
                  onChange={(e) => setCityBId(e.target.value)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                >
                  {Object.values(CITIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="compare-salary-b-input" className="text-[11px] font-semibold text-[#60706D] block mb-1">
                  Salary ({cityB.currency})
                </label>
                <input
                  id="compare-salary-b-input"
                  aria-label="Salary Location B"
                  type="number"
                  value={salaryBMajor}
                  onChange={(e) => setSalaryBMajor(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Objective Narrative Banner (No subjective winner) */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DCE3E0] shadow-xs flex items-start space-x-3">
        <Scale className="w-5 h-5 text-[#167D75] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#102A2E]">
            Calculated Economic Comparison
          </h4>
          <p className="text-sm font-semibold text-[#102A2E] mt-1 leading-snug">
            {comparison.delta.summaryNarrative}
          </p>
          <p className="text-xs text-[#60706D] mt-1">
            Normalized using verified reference exchange rates ({comparison.fxSnapshotDate.slice(0, 10)}).
          </p>
        </div>
      </div>

      {/* Two-Column Side-by-Side Comparison Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-[#F7F8F5] p-4 border-b border-[#DCE3E0] text-xs font-bold text-[#102A2E]">
          <div className="uppercase tracking-wider text-[#60706D]">Metric</div>
          <div className="text-center">{cityA.name}</div>
          <div className="text-center">{cityB.name}</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#F7F8F5] text-xs">
          {/* Gross */}
          <div className="grid grid-cols-3 p-4 items-center">
            <div>
              <span className="font-bold text-[#102A2E]">Gross Compensation</span>
              <span className="text-[11px] text-[#60706D] block">In {displayCurrency}</span>
            </div>
            <div className="text-center font-bold text-[#102A2E] font-tabular text-sm">
              {formatMoney(comparison.convertedA.grossAnnual, { hideDecimals: true })}
            </div>
            <div className="text-center font-bold text-[#102A2E] font-tabular text-sm">
              {formatMoney(comparison.convertedB.grossAnnual, { hideDecimals: true })}
            </div>
          </div>

          {/* Taxes */}
          <div className="grid grid-cols-3 p-4 items-center bg-[#F7F8F5]/30">
            <div>
              <span className="font-bold text-[#102A2E]">Total Tax & Contributions</span>
              <span className="text-[11px] text-[#60706D] block">
                {(comparison.outcomeA.tax.effectiveTaxRate * 100).toFixed(1)}% vs{' '}
                {(comparison.outcomeB.tax.effectiveTaxRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-center text-[#60706D] font-tabular font-semibold">
              −{formatMoney(
                createMoney(
                  toMajor(comparison.convertedA.grossAnnual) - toMajor(comparison.convertedA.takeHomeAnnual),
                  displayCurrency
                ),
                { hideDecimals: true }
              )}
            </div>
            <div className="text-center text-[#60706D] font-tabular font-semibold">
              −{formatMoney(
                createMoney(
                  toMajor(comparison.convertedB.grossAnnual) - toMajor(comparison.convertedB.takeHomeAnnual),
                  displayCurrency
                ),
                { hideDecimals: true }
              )}
            </div>
          </div>

          {/* Take-Home */}
          <div className="grid grid-cols-3 p-4 items-center">
            <div>
              <span className="font-bold text-[#167D75]">Annual Take-Home Pay</span>
              <span className="text-[11px] text-[#60706D] block">Net spendable income</span>
            </div>
            <div className="text-center font-bold text-[#167D75] font-tabular text-sm">
              {formatMoney(comparison.convertedA.takeHomeAnnual, { hideDecimals: true })}
            </div>
            <div className="text-center font-bold text-[#167D75] font-tabular text-sm">
              {formatMoney(comparison.convertedB.takeHomeAnnual, { hideDecimals: true })}
            </div>
          </div>

          {/* Living Costs */}
          <div className="grid grid-cols-3 p-4 items-center bg-[#F7F8F5]/30">
            <div>
              <span className="font-bold text-[#102A2E]">Annual Living Costs</span>
              <span className="text-[11px] text-[#60706D] block">Housing, food, transit, utilities</span>
            </div>
            <div className="text-center text-[#60706D] font-tabular font-semibold">
              −{formatMoney(comparison.convertedA.livingCostsAnnual, { hideDecimals: true })}
            </div>
            <div className="text-center text-[#60706D] font-tabular font-semibold">
              −{formatMoney(comparison.convertedB.livingCostsAnnual, { hideDecimals: true })}
            </div>
          </div>

          {/* Money Remaining */}
          <div className="grid grid-cols-3 p-4 items-center bg-[#DDF2EC]/20 border-y border-[#167D75]/20">
            <div>
              <span className="font-extrabold text-[#102A2E] text-sm">Annual Money Remaining</span>
              <span className="text-[11px] text-[#167D75] font-semibold block">Disposable capacity</span>
            </div>
            <div className="text-center font-extrabold text-[#102A2E] font-tabular text-base sm:text-lg">
              {formatMoney(comparison.convertedA.disposableAnnual, { hideDecimals: true })}
            </div>
            <div className="text-center font-extrabold text-[#102A2E] font-tabular text-base sm:text-lg">
              {formatMoney(comparison.convertedB.disposableAnnual, { hideDecimals: true })}
            </div>
          </div>

          {/* Monthly Remaining */}
          <div className="grid grid-cols-3 p-4 items-center">
            <div>
              <span className="font-bold text-[#102A2E]">Monthly Disposable Buffer</span>
              <span className="text-[11px] text-[#60706D] block">Per month</span>
            </div>
            <div className="text-center font-bold text-[#102A2E] font-tabular">
              {formatMoney(comparison.convertedA.disposableMonthly, { hideDecimals: true })}/mo
            </div>
            <div className="text-center font-bold text-[#102A2E] font-tabular">
              {formatMoney(comparison.convertedB.disposableMonthly, { hideDecimals: true })}/mo
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F8F5] border-t border-[#DCE3E0] flex items-center justify-between text-xs text-[#60706D]">
          <span className="flex items-center">
            <Info className="w-3.5 h-3.5 mr-1 text-[#167D75]" /> Deterministic calculation. No subjective winner label.
          </span>
          <button onClick={onOpenEvidence} className="text-[#167D75] hover:underline font-semibold">
            Inspect data sources
          </button>
        </div>
      </div>
    </div>
  );
};
