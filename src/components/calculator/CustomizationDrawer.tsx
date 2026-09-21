import React from 'react';
import { X, Check, Home, Users, Bus, Sparkles, MapPin, DollarSign } from 'lucide-react';
import { AreaType, HouseholdProfile, HousingType, LifestyleLevel, TransportMode } from '../../types/col';
import { FilingStatus, TaxProfile } from '../../types/tax';

interface CustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  household: HouseholdProfile;
  taxProfile: TaxProfile;
  actualRentMajor?: number;
  onUpdateHousehold: (updated: HouseholdProfile) => void;
  onUpdateTaxProfile: (updated: TaxProfile) => void;
  onUpdateRentOverride: (rentMajor: number | undefined) => void;
}

export const CustomizationDrawer: React.FC<CustomizationDrawerProps> = ({
  isOpen,
  onClose,
  household,
  taxProfile,
  actualRentMajor,
  onUpdateHousehold,
  onUpdateTaxProfile,
  onUpdateRentOverride,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Customize Assumptions" className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102A2E]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl overflow-y-auto flex flex-col z-10 border-l border-[#DCE3E0]">
        {/* Header */}
        <div className="p-5 border-b border-[#DCE3E0] flex items-center justify-between sticky top-0 bg-[#FFFFFF] z-20">
          <div>
            <h2 className="text-base font-bold text-[#102A2E]">Customize Assumptions</h2>
            <p className="text-xs text-[#60706D] mt-0.5">
              Reflect your exact lifestyle, housing, and tax profile
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close customization drawer"
            className="p-1.5 rounded-lg text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* Section 1: Household Structure */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#102A2E] mb-2 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-[#167D75]" />
              <span>Household Structure</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['single', 'couple', 'family'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    if (p === 'single') {
                      onUpdateHousehold({
                        ...household,
                        preset: 'single',
                        adults: 1,
                        children: 0,
                        housingType: '1-bedroom',
                      });
                      onUpdateTaxProfile({ ...taxProfile, filingStatus: 'single', dependentsCount: 0 });
                    } else if (p === 'couple') {
                      onUpdateHousehold({
                        ...household,
                        preset: 'couple',
                        adults: 2,
                        children: 0,
                        housingType: '1-bedroom',
                      });
                      onUpdateTaxProfile({ ...taxProfile, filingStatus: 'married_filing_jointly', dependentsCount: 0 });
                    } else {
                      onUpdateHousehold({
                        ...household,
                        preset: 'family',
                        adults: 2,
                        children: 2,
                        housingType: '2-bedroom',
                      });
                      onUpdateTaxProfile({ ...taxProfile, filingStatus: 'married_filing_jointly', dependentsCount: 2 });
                    }
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                    household.preset === p
                      ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E]'
                      : 'border-[#DCE3E0] bg-[#FFFFFF] text-[#60706D] hover:border-[#102A2E]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <span className="text-[11px] text-[#60706D] block mb-1">Adults</span>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        onUpdateHousehold({ ...household, adults: num, preset: 'custom' })
                      }
                      className={`w-9 h-8 rounded-md text-xs font-bold border transition-colors ${
                        household.adults === num
                          ? 'border-[#167D75] bg-[#102A2E] text-white'
                          : 'border-[#DCE3E0] text-[#60706D] hover:border-[#102A2E]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#60706D] block mb-1">Children</span>
                <div className="flex items-center space-x-2">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        onUpdateHousehold({ ...household, children: num, preset: 'custom' });
                        onUpdateTaxProfile({ ...taxProfile, dependentsCount: num });
                      }}
                      className={`w-9 h-8 rounded-md text-xs font-bold border transition-colors ${
                        household.children === num
                          ? 'border-[#167D75] bg-[#102A2E] text-white'
                          : 'border-[#DCE3E0] text-[#60706D] hover:border-[#102A2E]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Housing & Rent Override */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#102A2E] mb-2 flex items-center space-x-1.5">
              <Home className="w-3.5 h-3.5 text-[#167D75]" />
              <span>Housing & Rent</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['studio', '1-bedroom', '2-bedroom', '3-bedroom'] as HousingType[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onUpdateHousehold({ ...household, housingType: h })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                    household.housingType === h
                      ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E]'
                      : 'border-[#DCE3E0] bg-[#FFFFFF] text-[#60706D] hover:border-[#102A2E]'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Area Tier */}
            <div className="mt-3">
              <span className="text-[11px] text-[#60706D] block mb-1">Neighborhood Area Tier</span>
              <div className="grid grid-cols-3 gap-2">
                {(['budget', 'typical', 'premium'] as AreaType[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => onUpdateHousehold({ ...household, areaType: a })}
                    className={`py-1.5 px-2 text-xs font-medium rounded-md border capitalize transition-colors ${
                      household.areaType === a
                        ? 'border-[#167D75] bg-[#102A2E] text-white'
                        : 'border-[#DCE3E0] text-[#60706D] hover:border-[#102A2E]'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Actual Rent Override */}
            <div className="mt-3 p-3 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0]">
              <span className="text-xs font-bold text-[#102A2E] block mb-1">
                Actual Monthly Rent ($/month)
              </span>
              <p className="text-[11px] text-[#60706D] mb-2">
                Leave empty to use the verified regional benchmark median.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#60706D] font-bold">$</span>
                <input
                  type="number"
                  placeholder="e.g. 2750"
                  value={actualRentMajor || ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    onUpdateRentOverride(isNaN(v) || v <= 0 ? undefined : v);
                  }}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-bold border border-[#DCE3E0] rounded-lg bg-white focus:border-[#167D75] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Transportation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#102A2E] mb-2 flex items-center space-x-1.5">
              <Bus className="w-3.5 h-3.5 text-[#167D75]" />
              <span>Transportation Mode</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'public_transit', label: 'Public Transit' },
                { id: 'car', label: 'Personal Car' },
                { id: 'transit_and_rideshare', label: 'Transit + Rideshare' },
                { id: 'walking_biking', label: 'Walk / Bike' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    onUpdateHousehold({
                      ...household,
                      transportMode: m.id as TransportMode,
                      carsCount: m.id === 'car' ? 1 : 0,
                    })
                  }
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                    household.transportMode === m.id
                      ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E]'
                      : 'border-[#DCE3E0] bg-[#FFFFFF] text-[#60706D] hover:border-[#102A2E]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Lifestyle Spending Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#102A2E] mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#167D75]" />
              <span>Lifestyle Spending Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['essential', 'moderate', 'comfortable'] as LifestyleLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onUpdateHousehold({ ...household, lifestyleLevel: lvl })}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                    household.lifestyleLevel === lvl
                      ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E]'
                      : 'border-[#DCE3E0] bg-[#FFFFFF] text-[#60706D] hover:border-[#102A2E]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Tax Filing Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#102A2E] mb-2 flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#167D75]" />
              <span>Tax Filing Status</span>
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'single', label: 'Single' },
                { id: 'married_filing_jointly', label: 'Married Filing Jointly' },
                { id: 'head_of_household', label: 'Head of Household' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    onUpdateTaxProfile({ ...taxProfile, filingStatus: f.id as FilingStatus })
                  }
                  className={`w-full text-left py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-between ${
                    taxProfile.filingStatus === f.id
                      ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E] font-semibold'
                      : 'border-[#DCE3E0] text-[#60706D] hover:border-[#102A2E]'
                  }`}
                >
                  <span>{f.label}</span>
                  {taxProfile.filingStatus === f.id && <Check className="w-3.5 h-3.5 text-[#167D75]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE3E0] bg-[#FFFFFF] sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#102A2E] text-white text-xs font-bold hover:bg-[#167D75] transition-colors"
          >
            Apply & View Updated LivWorthy Calculation
          </button>
        </div>
      </div>
    </div>
  );
};
