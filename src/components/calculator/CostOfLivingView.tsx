import React, { useState } from 'react';
import { Home, SlidersHorizontal, ShieldCheck, MapPin } from 'lucide-react';
import { CITIES } from '../../data/locations';
import { CostOfLivingEngine } from '../../engines/col/col-engine';
import { formatMoney } from '../../lib/money';
import { HouseholdProfile } from '../../types/col';
import { LivingCostBreakdownCard } from './LivingCostBreakdownCard';

interface CostOfLivingViewProps {
  household: HouseholdProfile;
  actualRentMajor?: number;
  onUpdateRentOverride: (rent: number | undefined) => void;
  onOpenCustomizer: () => void;
  onOpenEvidence: () => void;
}

export const CostOfLivingView: React.FC<CostOfLivingViewProps> = ({
  household,
  actualRentMajor,
  onUpdateRentOverride,
  onOpenCustomizer,
  onOpenEvidence,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('nyc');
  const city = CITIES[selectedCityId] || CITIES.nyc;

  const colResult = CostOfLivingEngine.calculate(city.id, household, {
    actualRentMonthlyMinor: actualRentMajor ? actualRentMajor * 100 : undefined,
  });

  return (
    <div id="cost-of-living-view" className="space-y-8">
      {/* Question Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs">
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
            <label className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              Select City
            </label>
            <select
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
              <span>Data Sources</span>
            </button>
          </div>
        </div>
      </div>

      {/* Living Costs Detailed Breakdown */}
      <LivingCostBreakdownCard
        col={colResult}
        actualRentMajor={actualRentMajor}
        onOverrideRent={onUpdateRentOverride}
        onOpenCustomizer={onOpenCustomizer}
      />
    </div>
  );
};
