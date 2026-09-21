import React from 'react';
import { SlidersHorizontal, User, Home, MapPin, Bus, Sparkles, Check } from 'lucide-react';
import { HouseholdProfile } from '../../types/col';

interface AssumptionPillsProps {
  household: HouseholdProfile;
  actualRentOverridden?: boolean;
  actualRentFormatted?: string;
  onOpenCustomizer: () => void;
  onQuickPresetChange?: (preset: 'single' | 'couple' | 'family') => void;
}

export const AssumptionPills: React.FC<AssumptionPillsProps> = ({
  household,
  actualRentOverridden,
  actualRentFormatted,
  onOpenCustomizer,
  onQuickPresetChange,
}) => {
  const householdLabel =
    household.preset === 'single'
      ? 'Single (1 Adult)'
      : household.preset === 'couple'
      ? 'Couple (2 Adults)'
      : household.preset === 'family'
      ? `Family (${household.adults}A, ${household.children}C)`
      : `Custom (${household.adults}A, ${household.children}C)`;

  return (
    <div id="assumption-pills-bar" className="flex flex-wrap items-center gap-2 pt-2">
      {/* Quick household switcher */}
      {onQuickPresetChange && (
        <div className="inline-flex rounded-lg border border-[#DCE3E0] p-0.5 bg-[#FFFFFF]">
          <button
            id="preset-btn-single"
            type="button"
            onClick={() => onQuickPresetChange('single')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              household.preset === 'single'
                ? 'bg-[#102A2E] text-white'
                : 'text-[#60706D] hover:text-[#102A2E]'
            }`}
          >
            Single
          </button>
          <button
            id="preset-btn-couple"
            type="button"
            onClick={() => onQuickPresetChange('couple')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              household.preset === 'couple'
                ? 'bg-[#102A2E] text-white'
                : 'text-[#60706D] hover:text-[#102A2E]'
            }`}
          >
            Couple
          </button>
          <button
            id="preset-btn-family"
            type="button"
            onClick={() => onQuickPresetChange('family')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              household.preset === 'family'
                ? 'bg-[#102A2E] text-white'
                : 'text-[#60706D] hover:text-[#102A2E]'
            }`}
          >
            Family
          </button>
        </div>
      )}

      {/* Housing Chip */}
      <span
        className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#DCE3E0] text-[#102A2E] cursor-pointer hover:border-[#167D75]"
        onClick={onOpenCustomizer}
      >
        <Home className="w-3 h-3 text-[#167D75]" />
        <span>{household.housingType}</span>
        {actualRentOverridden && (
          <span className="text-[10px] text-[#167D75] font-semibold bg-[#DDF2EC] px-1 rounded">
            {actualRentFormatted}/mo
          </span>
        )}
      </span>

      {/* Area Chip */}
      <span
        className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#DCE3E0] text-[#102A2E] cursor-pointer hover:border-[#167D75]"
        onClick={onOpenCustomizer}
      >
        <MapPin className="w-3 h-3 text-[#60706D]" />
        <span className="capitalize">{household.areaType} area</span>
      </span>

      {/* Transit Chip */}
      <span
        className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#DCE3E0] text-[#102A2E] cursor-pointer hover:border-[#167D75]"
        onClick={onOpenCustomizer}
      >
        <Bus className="w-3 h-3 text-[#60706D]" />
        <span className="capitalize">{household.transportMode.replace(/_/g, ' ')}</span>
      </span>

      {/* Lifestyle Chip */}
      <span
        className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#DCE3E0] text-[#102A2E] cursor-pointer hover:border-[#167D75]"
        onClick={onOpenCustomizer}
      >
        <Sparkles className="w-3 h-3 text-[#60706D]" />
        <span className="capitalize">{household.lifestyleLevel} lifestyle</span>
      </span>

      {/* Customize Button */}
      <button
        id="btn-customize-assumptions"
        type="button"
        onClick={onOpenCustomizer}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#DDF2EC] text-[#0D625B] hover:bg-[#167D75] hover:text-white transition-colors ml-auto"
      >
        <SlidersHorizontal className="w-3 h-3" />
        <span>Customize</span>
      </button>
    </div>
  );
};
