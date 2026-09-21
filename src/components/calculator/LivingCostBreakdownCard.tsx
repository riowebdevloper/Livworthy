import React, { useState } from 'react';
import { Home, Utensils, Zap, Bus, HeartPulse, Baby, Sparkles, Edit2, Check, RotateCcw } from 'lucide-react';
import { formatMoney, toMajor } from '../../lib/money';
import { CostCategorySummary, CostOfLivingResult } from '../../types/col';

interface LivingCostBreakdownCardProps {
  col: CostOfLivingResult;
  actualRentMajor?: number;
  onOverrideRent: (rentMajor: number | undefined) => void;
  onOpenCustomizer: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  housing: <Home className="w-4 h-4 text-[#167D75]" />,
  food: <Utensils className="w-4 h-4 text-[#167D75]" />,
  utilities: <Zap className="w-4 h-4 text-[#167D75]" />,
  transport: <Bus className="w-4 h-4 text-[#167D75]" />,
  healthcare: <HeartPulse className="w-4 h-4 text-[#167D75]" />,
  family: <Baby className="w-4 h-4 text-[#167D75]" />,
  lifestyle: <Sparkles className="w-4 h-4 text-[#167D75]" />,
};

export const LivingCostBreakdownCard: React.FC<LivingCostBreakdownCardProps> = ({
  col,
  actualRentMajor,
  onOverrideRent,
  onOpenCustomizer,
}) => {
  const [rentInput, setRentInput] = useState<string>(
    actualRentMajor ? actualRentMajor.toString() : ''
  );
  const [isEditingRent, setIsEditingRent] = useState(false);
  const [viewMode, setViewMode] = useState<'with-rent' | 'without-rent'>('with-rent');

  const currency = col.monthlyTotal.currency;
  const isWithoutRent = viewMode === 'without-rent';

  const displayedTotal = isWithoutRent ? col.monthlyWithoutRent : col.monthlyWithRent;

  const handleSaveRent = () => {
    const parsed = parseFloat(rentInput);
    if (!isNaN(parsed) && parsed > 0) {
      onOverrideRent(parsed);
    } else {
      onOverrideRent(undefined);
    }
    setIsEditingRent(false);
  };

  const handleResetRent = () => {
    setRentInput('');
    onOverrideRent(undefined);
    setIsEditingRent(false);
  };

  return (
    <div id="living-cost-breakdown-card" className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] shadow-xs p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#F7F8F5] gap-3">
        <div>
          <h3 className="font-bold text-base text-[#102A2E]">Estimated Household Living Costs</h3>
          <p className="text-xs text-[#60706D] mt-0.5">
            Benchmarked to local metropolitan consumer price and housing datasets
          </p>
        </div>

        {/* View Toggle: With Rent vs Without Rent */}
        <div className="inline-flex rounded-lg border border-[#DCE3E0] p-0.5 bg-[#FFFFFF]">
          <button
            id="btn-with-rent"
            type="button"
            onClick={() => setViewMode('with-rent')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'with-rent'
                ? 'bg-[#102A2E] text-white'
                : 'text-[#60706D] hover:text-[#102A2E]'
            }`}
          >
            With Rent ({formatMoney(col.monthlyWithRent, { hideDecimals: true })}/mo)
          </button>
          <button
            id="btn-without-rent"
            type="button"
            onClick={() => setViewMode('without-rent')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'without-rent'
                ? 'bg-[#102A2E] text-white'
                : 'text-[#60706D] hover:text-[#102A2E]'
            }`}
          >
            Without Rent ({formatMoney(col.monthlyWithoutRent, { hideDecimals: true })}/mo)
          </button>
        </div>
      </div>

      {/* Actual Rent Override Section */}
      <div className="mt-4 p-4 rounded-xl bg-[#F7F8F5] border border-[#DCE3E0]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-[#167D75]" />
            <div>
              <span className="text-xs font-bold text-[#102A2E]">
                {actualRentMajor ? 'Your Actual Rent Override Active:' : 'Have an exact rental price?'}
              </span>
              <p className="text-[11px] text-[#60706D]">
                {actualRentMajor
                  ? `Overriding benchmark with $${actualRentMajor.toLocaleString()}/month`
                  : 'Replace the HUD benchmark estimate with your specific monthly lease amount.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isEditingRent ? (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-[#60706D] font-bold">$</span>
                  <input
                    type="number"
                    value={rentInput}
                    placeholder="e.g. 2400"
                    onChange={(e) => setRentInput(e.target.value)}
                    className="w-28 pl-6 pr-2 py-1 text-xs font-bold border border-[#167D75] rounded-md bg-white focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={handleSaveRent}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#167D75] text-white rounded-md hover:bg-[#102A2E] flex items-center space-x-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Apply</span>
                </button>
                <button
                  onClick={() => setIsEditingRent(false)}
                  className="px-2 py-1 text-xs text-[#60706D] hover:text-[#102A2E]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {actualRentMajor && (
                  <button
                    onClick={handleResetRent}
                    className="text-xs text-[#60706D] hover:text-[#102A2E] flex items-center space-x-1 px-2 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setRentInput(actualRentMajor ? actualRentMajor.toString() : '');
                    setIsEditingRent(true);
                  }}
                  className="text-xs font-semibold px-3 py-1 bg-[#FFFFFF] border border-[#DCE3E0] hover:border-[#167D75] text-[#102A2E] rounded-md flex items-center space-x-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-[#167D75]" />
                  <span>{actualRentMajor ? 'Change rent' : 'Use my actual rent'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown rows */}
      <div className="space-y-3 mt-5">
        {col.categories
          .filter((cat) => (isWithoutRent ? cat.category !== 'housing' : true))
          .map((cat) => {
            const monthlyAmount = cat.monthlyTotal;
            const pctOfTotal =
              displayedTotal.amountMinor > 0
                ? (monthlyAmount.amountMinor / displayedTotal.amountMinor) * 100
                : 0;

            return (
              <div
                key={cat.category}
                className="p-3.5 rounded-xl border border-[#DCE3E0]/60 bg-[#FFFFFF] hover:border-[#DCE3E0] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F7F8F5] flex items-center justify-center">
                      {CATEGORY_ICONS[cat.category] || <Sparkles className="w-4 h-4 text-[#167D75]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#102A2E]">{cat.label}</span>
                      <p className="text-[11px] text-[#60706D]">
                        {cat.items.map((i) => i.label).join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-[#102A2E] font-tabular">
                      {formatMoney(monthlyAmount)}
                      <span className="text-xs font-normal text-[#60706D]">/mo</span>
                    </div>
                    <div className="text-[10px] text-[#60706D]">
                      {formatMoney(cat.annualTotal, { hideDecimals: true })}/yr ({pctOfTotal.toFixed(0)}%)
                    </div>
                  </div>
                </div>

                {/* Range bar (low - estimate - high) */}
                {cat.items[0] && (
                  <div className="mt-2 pt-2 border-t border-[#F7F8F5] flex items-center justify-between text-[10px] text-[#60706D]">
                    <span>Low: {formatMoney(cat.items[0].monthlyLow, { hideDecimals: true })}</span>
                    <span className="font-semibold text-[#167D75]">
                      Expected: {formatMoney(cat.items[0].monthlyEstimate, { hideDecimals: true })}
                    </span>
                    <span>High: {formatMoney(cat.items[0].monthlyHigh, { hideDecimals: true })}</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Summary Footer */}
      <div className="mt-5 pt-4 border-t border-[#F7F8F5] flex items-center justify-between text-xs">
        <span className="text-[#60706D]">
          Coverage: <span className="font-semibold text-[#167D75]">{col.confidenceScore}</span>
        </span>
        <button
          onClick={onOpenCustomizer}
          className="text-[#167D75] hover:underline font-semibold"
        >
          Adjust household profile & transit modes →
        </button>
      </div>
    </div>
  );
};
