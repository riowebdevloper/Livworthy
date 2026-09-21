import React, { useState, useEffect, useRef } from 'react';
import { Home, SlidersHorizontal, ShieldCheck, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { calculateCostOfLiving } from '../../api/calculators';
import { CostOfLivingResult, HouseholdProfile } from '../../types/col';
import { LivingCostBreakdownCard } from './LivingCostBreakdownCard';

interface CostOfLivingViewProps {
  household: HouseholdProfile;
  actualRentMajor?: number;
  onUpdateRentOverride: (rent: number | undefined) => void;
  onOpenCustomizer: () => void;
  onOpenEvidence: () => void;
  onCalculationResult?: (result: CostOfLivingResult) => void;
}

export const CostOfLivingView: React.FC<CostOfLivingViewProps> = ({
  household,
  actualRentMajor,
  onUpdateRentOverride,
  onOpenCustomizer,
  onOpenEvidence,
  onCalculationResult,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('nyc');
  const [colResult, setColResult] = useState<CostOfLivingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [calcError, setCalcError] = useState<string | null>(null);

  const city = CITIES[selectedCityId] || CITIES.nyc;
  const abortControllerRef = useRef<AbortController | null>(null);

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
        const response = await calculateCostOfLiving(
          {
            cityId: city.id,
            household,
            overrides: {
              actualRentMonthlyMinor: actualRentMajor ? actualRentMajor * 100 : undefined,
            },
          },
          { signal: controller.signal }
        );

        if (response.success && response.data) {
          setColResult(response.data);
          onCalculationResult?.(response.data);
        } else {
          setCalcError('Failed to fetch cost of living data.');
        }
      } catch (err: any) {
        if (err.errorCode === 'REQUEST_CANCELLED') return;
        setCalcError(err.message || 'Cost of living engine unavailable.');
      } finally {
        setIsCalculating(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [city.id, household, actualRentMajor, onCalculationResult]);

  return (
    <div id="cost-of-living-view" className="space-y-8">
      {/* Question Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
        {isCalculating && (
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-semibold text-[#0D524D] bg-[#DDF2EC] px-2.5 py-1 rounded-full animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Calculating living costs...</span>
          </div>
        )}

        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
            Household Living Costs
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
            What would your household actually spend in {city.name}?
          </h2>
          <p className="text-xs sm:text-sm text-[#60706D] mt-1.5 leading-relaxed">
            Detailed breakdown based on HUD metropolitan housing vacancy surveys and Bureau of Labor Statistics consumer expenditure tables.
          </p>
        </div>

        {/* Location switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-[#F7F8F5]">
          <div className="w-full sm:w-72">
            <label htmlFor="col-city-select" className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              Select City
            </label>
            <select
              id="col-city-select"
              aria-label="Select City"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] px-3 py-2.5 text-base font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
            >
              {Object.values(CITIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.countryId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-2 sm:pt-6">
            <button
              onClick={onOpenCustomizer}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#102A2E]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#167D75]" />
              <span>Customize Household & Bedrooms</span>
            </button>
            <button
              onClick={onOpenEvidence}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-[#DCE3E0] hover:bg-[#F7F8F5] text-[#167D75]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {calcError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{calcError}</span>
        </div>
      )}

      {/* Breakdown Card */}
      {colResult && (
        <LivingCostBreakdownCard
          col={colResult}
          actualRentMajor={actualRentMajor}
          onOverrideRent={onUpdateRentOverride}
          onOpenCustomizer={onOpenCustomizer}
        />
      )}
    </div>
  );
};
