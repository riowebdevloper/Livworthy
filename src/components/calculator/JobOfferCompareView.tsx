import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Plane,
  Building,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { CITIES } from '../../data/locations';
import { compareJobOffers } from '../../api/calculators';
import { ComparisonResult, RelocationProfile } from '../../engines/calculator-core/compare';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { CurrencyCode } from '../../types/money';
import { LivWorthScenario } from '../../types/scenario';

interface JobOfferCompareViewProps {
  initialScenario: LivWorthScenario;
  onOpenEvidence: () => void;
  onComparisonResult?: (result: ComparisonResult) => void;
}

export const JobOfferCompareView: React.FC<JobOfferCompareViewProps> = ({
  initialScenario,
  onOpenEvidence,
  onComparisonResult,
}) => {
  // Current / Baseline Offer (Offer A)
  const [offerACityId, setOfferACityId] = useState<string>(initialScenario.location.id);
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
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(true);
  const [compareError, setCompareError] = useState<string | null>(null);

  const cityA = CITIES[offerACityId] || CITIES.nyc;
  const cityB = CITIES[offerBCityId] || CITIES.austin;
  const displayCurrency: CurrencyCode = cityA.currency;

  const abortControllerRef = useRef<AbortController | null>(null);

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
    flightsMinor: displayYear === 'year1' ? relocFlights * 100 : 0,
    tempHousingMinor: displayYear === 'year1' ? relocTempHousing * 100 : 0,
    securityDepositMinor: displayYear === 'year1' ? relocDeposit * 100 : 0,
    shippingFurnitureMinor: displayYear === 'year1' ? relocShipping * 100 : 0,
    visaAdminMinor: 0,
    otherSetupMinor: 0,
  };

  const year1TotalRelocation =
    displayYear === 'year1' ? relocFlights + relocTempHousing + relocDeposit + relocShipping : 0;

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
        const response = await compareJobOffers(
          scenarioA,
          scenarioB,
          displayCurrency,
          relocationB,
          { signal: controller.signal }
        );

        if (response.success && response.data) {
          setComparison(response.data);
          onComparisonResult?.(response.data);
        } else {
          setCompareError('Failed to compare offers. Please verify inputs.');
        }
      } catch (err: any) {
        if (err.errorCode === 'REQUEST_CANCELLED') return;
        setCompareError(err.message || 'Job offer comparison service unavailable.');
      } finally {
        setIsComparing(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    offerACityId,
    offerBCityId,
    offerABase,
    offerABonus,
    offerAHousingAllowance,
    offerBBase,
    offerBBonus,
    offerBHousingAllowance,
    relocFlights,
    relocTempHousing,
    relocDeposit,
    relocShipping,
    displayYear,
    onComparisonResult,
  ]);

  return (
    <div id="job-offer-compare-view" className="space-y-8">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
        {isComparing && (
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-semibold text-[#0D524D] bg-[#DDF2EC] px-2.5 py-1 rounded-full animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Evaluating offers...</span>
          </div>
        )}

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
              id="btn-offer-year1"
              type="button"
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
              id="btn-offer-year2"
              type="button"
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

      {/* Error Banner */}
      {compareError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{compareError}</span>
        </div>
      )}

      {/* Offer Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offer A */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#F7F8F5] pb-3">
            <Briefcase className="w-4 h-4 text-[#167D75]" />
            <h3 className="font-bold text-sm text-[#102A2E]">Job Offer A (Current / Baseline)</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="offer-a-location-select" className="block text-xs font-semibold text-[#102A2E] mb-1 uppercase tracking-wider">
                Location A
              </label>
              <select
                id="offer-a-location-select"
                aria-label="Location A"
                value={offerACityId}
                onChange={(e) => setOfferACityId(e.target.value)}
                className="w-full text-xs font-bold rounded-lg border border-[#DCE3E0] p-2 bg-white"
              >
                {Object.values(CITIES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.countryId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="offer-a-base-salary" className="block text-xs font-semibold text-[#102A2E] mb-1">
                  Base Salary ({cityA.currency})
                </label>
                <input
                  id="offer-a-base-salary"
                  aria-label={`Base Salary (${cityA.currency})`}
                  type="number"
                  value={offerABase}
                  onChange={(e) => setOfferABase(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label htmlFor="offer-a-bonus" className="block text-xs font-semibold text-[#102A2E] mb-1">
                  Annual Cash Bonus ({cityA.currency})
                </label>
                <input
                  id="offer-a-bonus"
                  aria-label={`Annual Cash Bonus (${cityA.currency})`}
                  type="number"
                  value={offerABonus}
                  onChange={(e) => setOfferABonus(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="offer-a-housing" className="block text-xs font-semibold text-[#102A2E] mb-1">
                Housing Allowance / Relocation Stipend (Annual)
              </label>
              <input
                id="offer-a-housing"
                aria-label="Housing Allowance / Relocation Stipend (Annual)"
                type="number"
                value={offerAHousingAllowance}
                onChange={(e) => setOfferAHousingAllowance(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Offer B */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#F7F8F5] pb-3">
            <Building className="w-4 h-4 text-[#167D75]" />
            <h3 className="font-bold text-sm text-[#102A2E]">Job Offer B (Target Opportunity)</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="offer-b-location-select" className="block text-xs font-semibold text-[#102A2E] mb-1 uppercase tracking-wider">
                Location B
              </label>
              <select
                id="offer-b-location-select"
                aria-label="Location B"
                value={offerBCityId}
                onChange={(e) => setOfferBCityId(e.target.value)}
                className="w-full text-xs font-bold rounded-lg border border-[#DCE3E0] p-2 bg-white"
              >
                {Object.values(CITIES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.countryId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="offer-b-base-salary" className="block text-xs font-semibold text-[#102A2E] mb-1">
                  Base Salary ({cityB.currency})
                </label>
                <input
                  id="offer-b-base-salary"
                  aria-label={`Base Salary (${cityB.currency})`}
                  type="number"
                  value={offerBBase}
                  onChange={(e) => setOfferBBase(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label htmlFor="offer-b-bonus" className="block text-xs font-semibold text-[#102A2E] mb-1">
                  Annual Cash Bonus ({cityB.currency})
                </label>
                <input
                  id="offer-b-bonus"
                  aria-label={`Annual Cash Bonus (${cityB.currency})`}
                  type="number"
                  value={offerBBonus}
                  onChange={(e) => setOfferBBonus(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="offer-b-housing" className="block text-xs font-semibold text-[#102A2E] mb-1">
                Housing Allowance / Relocation Stipend (Annual)
              </label>
              <input
                id="offer-b-housing"
                aria-label="Housing Allowance / Relocation Stipend (Annual)"
                type="number"
                value={offerBHousingAllowance}
                onChange={(e) => setOfferBHousingAllowance(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full text-xs font-bold border border-[#DCE3E0] rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          {/* Relocation inputs */}
          <div className="mt-3 pt-3 border-t border-[#F7F8F5]">
            <span className="text-[11px] font-bold text-[#102A2E] flex items-center space-x-1 mb-2">
              <Plane className="w-3.5 h-3.5 text-[#167D75]" />
              <span>One-Time Moving & Setup Costs for Offer B (Total: {formatMoney(createMoney(year1TotalRelocation, cityB.currency), { hideDecimals: true })})</span>
            </span>
            <div className="grid grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-[#60706D] block">Flights</span>
                <input
                  aria-label="Flights relocation cost"
                  type="number"
                  value={relocFlights}
                  onChange={(e) => setRelocFlights(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold border border-[#DCE3E0] rounded p-1 bg-white"
                />
              </div>
              <div>
                <span className="text-[#60706D] block">Temp Hotel</span>
                <input
                  aria-label="Temp hotel relocation cost"
                  type="number"
                  value={relocTempHousing}
                  onChange={(e) => setRelocTempHousing(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold border border-[#DCE3E0] rounded p-1 bg-white"
                />
              </div>
              <div>
                <span className="text-[#60706D] block">Deposit</span>
                <input
                  aria-label="Deposit relocation cost"
                  type="number"
                  value={relocDeposit}
                  onChange={(e) => setRelocDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold border border-[#DCE3E0] rounded p-1 bg-white"
                />
              </div>
              <div>
                <span className="text-[#60706D] block">Shipping</span>
                <input
                  aria-label="Shipping relocation cost"
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
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Outcome A */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#F7F8F5]">
              <h4 className="font-bold text-base text-[#102A2E]">{cityA.name} Package Outcome</h4>
              <span className="text-xs text-[#60706D]">Offer A</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Spendable Gross Pay:</span>
                <span className="font-bold text-[#102A2E] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  {formatMoney(comparison.outcomeA.grossAnnual, { hideDecimals: true })}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Total Compensation Value:</span>
                <span className="font-bold text-[#102A2E] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  {formatMoney(
                    createMoney(
                      toMajor(comparison.outcomeA.grossAnnual) + offerAHousingAllowance,
                      cityA.currency
                    ),
                    { hideDecimals: true }
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Net Take-Home (After Tax & Social):</span>
                <span className="font-bold text-[#167D75] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  {formatMoney(comparison.outcomeA.takeHomeAnnual, { hideDecimals: true })}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Annual Living Costs:</span>
                <span className="font-bold text-[#60706D] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  −{formatMoney(comparison.outcomeA.livingCostsAnnual, { hideDecimals: true })}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2 py-2 bg-[#DDF2EC]/40 border border-[#167D75]/20 px-3 rounded-lg mt-2">
                <span className="font-bold text-[#102A2E] min-w-0 flex-1 pr-1">Net Money Remaining:</span>
                <span className="font-extrabold text-[#102A2E] font-tabular tabular-nums text-sm shrink-0 whitespace-nowrap">
                  {formatMoney(comparison.outcomeA.moneyRemainingAnnual, { hideDecimals: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Outcome B */}
          <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#167D75] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#F7F8F5]">
              <h4 className="font-bold text-base text-[#102A2E]">{cityB.name} Package Outcome</h4>
              <span className="text-xs text-[#167D75] font-bold bg-[#DDF2EC] px-2 py-0.5 rounded">
                Offer B
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Spendable Gross Pay:</span>
                <span className="font-bold text-[#102A2E] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  {formatMoney(comparison.outcomeB.grossAnnual, { hideDecimals: true })}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Total Compensation Value:</span>
                <span className="font-bold text-[#102A2E] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  {formatMoney(
                    createMoney(
                      toMajor(comparison.outcomeB.grossAnnual) + offerBHousingAllowance,
                      cityB.currency
                    ),
                    { hideDecimals: true }
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Net Take-Home (After Tax & Social):</span>
                <span className="font-bold text-[#167D75] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  {formatMoney(comparison.outcomeB.takeHomeAnnual, { hideDecimals: true })}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5]">
                <span className="text-[#60706D] min-w-0 flex-1 pr-1">Annual Living Costs:</span>
                <span className="font-bold text-[#60706D] font-tabular tabular-nums shrink-0 whitespace-nowrap">
                  −{formatMoney(comparison.outcomeB.livingCostsAnnual, { hideDecimals: true })}
                </span>
              </div>

              {displayYear === 'year1' && year1TotalRelocation > 0 && (
                <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#F7F8F5] text-amber-700">
                  <span className="min-w-0 flex-1 pr-1">Less One-Time Relocation Costs:</span>
                  <span className="font-bold font-tabular tabular-nums shrink-0 whitespace-nowrap">
                    −{formatMoney(createMoney(year1TotalRelocation, cityB.currency), { hideDecimals: true })}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-between gap-2 py-2 bg-[#DDF2EC]/40 border border-[#167D75]/20 px-3 rounded-lg mt-2">
                <span className="font-bold text-[#102A2E] min-w-0 flex-1 pr-1">
                  {displayYear === 'year1' ? 'Year 1 Net Remaining:' : 'Year 2+ Recurring Remaining:'}
                </span>
                <span className="font-extrabold text-[#102A2E] font-tabular tabular-nums text-sm shrink-0 whitespace-nowrap">
                  {displayYear === 'year1'
                    ? formatMoney(
                        createMoney(
                          toMajor(comparison.outcomeB.moneyRemainingAnnual) - year1TotalRelocation,
                          cityB.currency
                        ),
                        { hideDecimals: true }
                      )
                    : formatMoney(comparison.outcomeB.moneyRemainingAnnual, { hideDecimals: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
