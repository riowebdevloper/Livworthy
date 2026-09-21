import React, { useState } from 'react';
import { Briefcase, Plane, Scale, Check, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { ComparisonEngine, RelocationProfile } from '../../engines/calculator-core/compare';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { CurrencyCode } from '../../types/money';
import { LivWorthScenario } from '../../types/scenario';

interface JobOfferCompareViewProps {
  initialScenario: LivWorthScenario;
  onOpenEvidence: () => void;
}

export const JobOfferCompareView: React.FC<JobOfferCompareViewProps> = ({
  initialScenario,
  onOpenEvidence,
}) => {
  // Current Offer (Offer A)
  const [offerACityId, setOfferACityId] = useState<string>('nyc');
  const [offerABase, setOfferABase] = useState<number>(100000);
  const [offerABonus, setOfferABonus] = useState<number>(10000);
  const [offerAHousingAllowance, setOfferAHousingAllowance] = useState<number>(0);

  // New Offer (Offer B)
  const [offerBCityId, setOfferBCityId] = useState<string>('austin');
  const [offerBBase, setOfferBBase] = useState<number>(115000);
  const [offerBBonus, setOfferBBonus] = useState<number>(15000);
  const [offerBHousingAllowance, setOfferBHousingAllowance] = useState<number>(0);

  // Relocation costs for Offer B
  const [relocFlights, setRelocFlights] = useState<number>(1500);
  const [relocTempHousing, setRelocTempHousing] = useState<number>(2500);
  const [relocDeposit, setRelocDeposit] = useState<number>(2000);
  const [relocShipping, setRelocShipping] = useState<number>(1800);

  const [displayYear, setDisplayYear] = useState<'year1' | 'year2'>('year1');

  const cityA = CITIES[offerACityId] || CITIES.nyc;
  const cityB = CITIES[offerBCityId] || CITIES.austin;

  const scenarioA: LivWorthScenario = {
    ...initialScenario,
    location: cityA,
    compensation: {
      baseSalary: createMoney(offerABase, cityA.currency),
      cashBonusAnnual: createMoney(offerABonus, cityA.currency),
      housingAllowanceAnnual:
        offerAHousingAllowance > 0
          ? createMoney(offerAHousingAllowance, cityA.currency)
          : undefined,
    },
  };

  const scenarioB: LivWorthScenario = {
    ...initialScenario,
    location: cityB,
    compensation: {
      baseSalary: createMoney(offerBBase, cityB.currency),
      cashBonusAnnual: createMoney(offerBBonus, cityB.currency),
      housingAllowanceAnnual:
        offerBHousingAllowance > 0
          ? createMoney(offerBHousingAllowance, cityB.currency)
          : undefined,
    },
  };

  const relocationB: RelocationProfile = {
    flightsMinor: relocFlights * 100,
    tempHousingMinor: relocTempHousing * 100,
    securityDepositMinor: relocDeposit * 100,
    shippingFurnitureMinor: relocShipping * 100,
    visaAdminMinor: 0,
    otherSetupMinor: 0,
  };

  const comparison = ComparisonEngine.compare(scenarioA, scenarioB, 'USD', relocationB);

  const year1TotalRelocation =
    relocFlights + relocTempHousing + relocDeposit + relocShipping;

  return (
    <div id="job-offer-compare-view" className="space-y-8">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
            Compensation & Relocation Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
            Job Offer & Relocation Comparison
          </h2>
          <p className="text-xs sm:text-sm text-[#60706D] mt-1.5 leading-relaxed">
            Separate spendable cash from expense-replacing benefits. Model Year 1 one-time relocation costs versus Year 2+ recurring disposable income.
          </p>
        </div>

        {/* Year 1 vs Year 2 Selector */}
        <div className="mt-6 pt-4 border-t border-[#F7F8F5] flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-[#DCE3E0] p-0.5 bg-[#FFFFFF]">
            <button
              onClick={() => setDisplayYear('year1')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                displayYear === 'year1'
                  ? 'bg-[#102A2E] text-white'
                  : 'text-[#60706D] hover:text-[#102A2E]'
              }`}
            >
              Year 1 (With Relocation Setup Costs)
            </button>
            <button
              onClick={() => setDisplayYear('year2')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                displayYear === 'year2'
                  ? 'bg-[#102A2E] text-white'
                  : 'text-[#60706D] hover:text-[#102A2E]'
              }`}
            >
              Year 2+ (Steady-State Recurring)
            </button>
          </div>

          <button onClick={onOpenEvidence} className="text-xs text-[#167D75] font-semibold hover:underline flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Data
          </button>
        </div>
      </div>

      {/* Offer Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offer A */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#F7F8F5] pb-3">
            <Briefcase className="w-4 h-4 text-[#167D75]" />
            <h3 className="font-bold text-sm text-[#102A2E]">Job Offer A (Current / Baseline)</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">City</label>
              <select
                value={offerACityId}
                onChange={(e) => setOfferACityId(e.target.value)}
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
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">Base Salary ($)</label>
              <input
                type="number"
                value={offerABase}
                onChange={(e) => setOfferABase(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">Annual Cash Bonus ($)</label>
              <input
                type="number"
                value={offerABonus}
                onChange={(e) => setOfferABonus(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">Housing Allowance ($/yr)</label>
              <input
                type="number"
                value={offerAHousingAllowance}
                onChange={(e) => setOfferAHousingAllowance(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Offer B */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#F7F8F5] pb-3">
            <Briefcase className="w-4 h-4 text-[#167D75]" />
            <h3 className="font-bold text-sm text-[#102A2E]">Job Offer B (Prospective / Relocation)</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">City</label>
              <select
                value={offerBCityId}
                onChange={(e) => setOfferBCityId(e.target.value)}
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
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">Base Salary ($)</label>
              <input
                type="number"
                value={offerBBase}
                onChange={(e) => setOfferBBase(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">Annual Cash Bonus ($)</label>
              <input
                type="number"
                value={offerBBonus}
                onChange={(e) => setOfferBBonus(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#60706D] block mb-1">Housing Allowance ($/yr)</label>
              <input
                type="number"
                value={offerBHousingAllowance}
                onChange={(e) => setOfferBHousingAllowance(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          {/* Relocation inputs for Offer B */}
          <div className="mt-3 pt-3 border-t border-[#F7F8F5]">
            <span className="text-[11px] font-bold text-[#102A2E] flex items-center space-x-1 mb-2">
              <Plane className="w-3.5 h-3.5 text-[#167D75]" />
              <span>One-Time Moving & Setup Costs for Offer B (Total: ${year1TotalRelocation.toLocaleString()})</span>
            </span>
            <div className="grid grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-[#60706D] block">Flights</span>
                <input
                  type="number"
                  value={relocFlights}
                  onChange={(e) => setRelocFlights(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold border border-[#DCE3E0] rounded p-1 bg-white"
                />
              </div>
              <div>
                <span className="text-[#60706D] block">Temp Hotel</span>
                <input
                  type="number"
                  value={relocTempHousing}
                  onChange={(e) => setRelocTempHousing(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold border border-[#DCE3E0] rounded p-1 bg-white"
                />
              </div>
              <div>
                <span className="text-[#60706D] block">Deposit</span>
                <input
                  type="number"
                  value={relocDeposit}
                  onChange={(e) => setRelocDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold border border-[#DCE3E0] rounded p-1 bg-white"
                />
              </div>
              <div>
                <span className="text-[#60706D] block">Shipping</span>
                <input
                  type="number"
                  value={relocShipping}
                  onChange={(e) => setRelocShipping(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold border border-[#DCE3E0] rounded p-1 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Outcome Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outcome A */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F7F8F5]">
            <h4 className="font-bold text-base text-[#102A2E]">{cityA.name} Package Outcome</h4>
            <span className="text-xs text-[#60706D]">Offer A</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
              <span className="text-[#60706D]">Spendable Gross Pay:</span>
              <span className="font-bold text-[#102A2E] font-tabular">
                {formatMoney(comparison.outcomeA.grossAnnual, { hideDecimals: true })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
              <span className="text-[#60706D]">Net Take-Home (After Tax & FICA):</span>
              <span className="font-bold text-[#167D75] font-tabular">
                {formatMoney(comparison.outcomeA.takeHomeAnnual, { hideDecimals: true })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
              <span className="text-[#60706D]">Annual Living Costs:</span>
              <span className="font-bold text-[#60706D] font-tabular">
                −{formatMoney(comparison.outcomeA.livingCostsAnnual, { hideDecimals: true })}
              </span>
            </div>
            <div className="flex justify-between py-2 bg-[#F7F8F5] px-3 rounded-lg mt-2">
              <span className="font-bold text-[#102A2E]">
                {displayYear === 'year1' ? 'Year 1 Money Remaining:' : 'Year 2+ Recurring Remaining:'}
              </span>
              <span className="font-extrabold text-[#102A2E] font-tabular text-sm">
                {formatMoney(comparison.outcomeA.moneyRemainingAnnual, { hideDecimals: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Outcome B */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F7F8F5]">
            <h4 className="font-bold text-base text-[#102A2E]">{cityB.name} Package Outcome</h4>
            <span className="text-xs text-[#167D75] font-bold bg-[#DDF2EC] px-2 py-0.5 rounded">
              Offer B
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
              <span className="text-[#60706D]">Spendable Gross Pay:</span>
              <span className="font-bold text-[#102A2E] font-tabular">
                {formatMoney(comparison.outcomeB.grossAnnual, { hideDecimals: true })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
              <span className="text-[#60706D]">Net Take-Home (After Tax & FICA):</span>
              <span className="font-bold text-[#167D75] font-tabular">
                {formatMoney(comparison.outcomeB.takeHomeAnnual, { hideDecimals: true })}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F7F8F5]">
              <span className="text-[#60706D]">Annual Living Costs:</span>
              <span className="font-bold text-[#60706D] font-tabular">
                −{formatMoney(comparison.outcomeB.livingCostsAnnual, { hideDecimals: true })}
              </span>
            </div>

            {displayYear === 'year1' && (
              <div className="flex justify-between py-1 border-b border-[#F7F8F5] text-amber-700">
                <span>Less One-Time Relocation Costs:</span>
                <span className="font-bold font-tabular">−${year1TotalRelocation.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between py-2 bg-[#DDF2EC]/40 border border-[#167D75]/20 px-3 rounded-lg mt-2">
              <span className="font-bold text-[#102A2E]">
                {displayYear === 'year1' ? 'Year 1 Net Remaining:' : 'Year 2+ Recurring Remaining:'}
              </span>
              <span className="font-extrabold text-[#102A2E] font-tabular text-sm">
                {displayYear === 'year1'
                  ? formatMoney(
                      createMoney(
                        toMajor(comparison.outcomeB.moneyRemainingAnnual) - year1TotalRelocation,
                        'USD'
                      ),
                      { hideDecimals: true }
                    )
                  : formatMoney(comparison.outcomeB.moneyRemainingAnnual, { hideDecimals: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
