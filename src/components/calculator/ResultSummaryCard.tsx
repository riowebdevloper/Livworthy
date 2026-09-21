import React, { useState } from 'react';
import {
  ArrowDown,
  DollarSign,
  Wallet,
  PiggyBank,
  HelpCircle,
  SlidersHorizontal,
  ArrowLeftRight,
  Share2,
  Check,
  BarChart3,
} from 'lucide-react';
import { formatMoney, toMajor } from '../../lib/money';
import { LivWorthCalculationOutcome } from '../../types/scenario';

interface ResultSummaryCardProps {
  outcome: LivWorthCalculationOutcome;
  onOpenCustomizer: () => void;
  onCompareCity: () => void;
  onOpenEvidence: () => void;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({
  outcome,
  onOpenCustomizer,
  onCompareCity,
  onOpenEvidence,
}) => {
  const [period, setPeriod] = useState<'annual' | 'monthly'>('annual');
  const [copied, setCopied] = useState(false);

  const isMonthly = period === 'monthly';
  const currency = outcome.scenario.location.currency;

  const grossDisplay = isMonthly
    ? formatMoney({
        amountMinor: Math.round(outcome.grossAnnual.amountMinor / 12),
        currency,
      })
    : formatMoney(outcome.grossAnnual);

  const takeHomeDisplay = isMonthly
    ? formatMoney(outcome.takeHomeMonthly)
    : formatMoney(outcome.takeHomeAnnual);

  const livingCostsDisplay = isMonthly
    ? formatMoney(outcome.livingCostsMonthly)
    : formatMoney(outcome.livingCostsAnnual);

  const moneyRemainingDisplay = isMonthly
    ? formatMoney(outcome.moneyRemainingMonthly)
    : formatMoney(outcome.moneyRemainingAnnual);

  const isRemainingPositive = outcome.moneyRemainingAnnual.amountMinor >= 0;

  // Visual Allocation Percentages
  const grossMinor = outcome.grossAnnual.amountMinor || 1;
  const taxesMinor = outcome.tax.totalDeductionsAndTaxes.amountMinor;
  const housingMinor = outcome.costOfLiving.housingMonthly.amountMinor * 12;
  const otherEssentialMinor = Math.max(
    0,
    (outcome.costOfLiving.essentialMonthly.amountMinor - outcome.costOfLiving.housingMonthly.amountMinor) * 12
  );
  const discretionaryMinor = outcome.costOfLiving.discretionaryMonthly.amountMinor * 12;
  const remainingMinor = Math.max(0, outcome.moneyRemainingAnnual.amountMinor);

  const taxPct = Math.max(0, Math.min(100, Math.round((taxesMinor / grossMinor) * 100)));
  const housingPct = Math.max(0, Math.min(100, Math.round((housingMinor / grossMinor) * 100)));
  const essentialPct = Math.max(0, Math.min(100, Math.round((otherEssentialMinor / grossMinor) * 100)));
  const discretionaryPct = Math.max(0, Math.min(100, Math.round((discretionaryMinor / grossMinor) * 100)));
  const remainingPct = Math.max(0, Math.min(100, Math.round((remainingMinor / grossMinor) * 100)));

  const handleCopySummary = () => {
    const summary = `--- LivWorthy Financial Assessment ---
Location: ${outcome.scenario.location.name} (${outcome.scenario.location.countryId})
Gross Salary: ${formatMoney(outcome.grossAnnual, { hideDecimals: true })}/year
Effective Tax Rate: ${(outcome.tax.effectiveTaxRate * 100).toFixed(1)}%
Annual Take-Home: ${formatMoney(outcome.takeHomeAnnual, { hideDecimals: true })}/year (${formatMoney(outcome.takeHomeMonthly, { hideDecimals: true })}/month)
Estimated Living Costs: ${formatMoney(outcome.livingCostsAnnual, { hideDecimals: true })}/year (${formatMoney(outcome.livingCostsMonthly, { hideDecimals: true })}/month)
Money Remaining: ${formatMoney(outcome.moneyRemainingAnnual, { hideDecimals: true })}/year (${formatMoney(outcome.moneyRemainingMonthly, { hideDecimals: true })}/month)
Savings Rate: ${outcome.savingsRatePercentage}% of gross
Methodology: Deterministic statutory schedules (https://livworthy.com)`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="result-summary-card"
      className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] shadow-xs overflow-hidden transition-all"
    >
      {/* Card Header & Frequency Toggle */}
      <div className="bg-[#F7F8F5] px-6 py-4 border-b border-[#DCE3E0] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-base text-[#102A2E]">
              {outcome.scenario.location.name} Living Worth Result
            </h2>
            <span className="text-xs font-semibold bg-[#DDF2EC] text-[#0D625B] px-2 py-0.5 rounded-full">
              {outcome.scenario.taxProfile.filingStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-[#60706D] mt-0.5">
            Verified with {outcome.scenario.taxProfile.taxYear} statutory schedules
          </p>
        </div>

        {/* Period Selector */}
        <div className="inline-flex rounded-lg border border-[#DCE3E0] p-0.5 bg-[#FFFFFF]">
          <button
            id="period-annual-btn"
            type="button"
            onClick={() => setPeriod('annual')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              period === 'annual'
                ? 'bg-[#102A2E] text-white'
                : 'text-[#60706D] hover:text-[#102A2E]'
            }`}
          >
            Annual
          </button>
          <button
            id="period-monthly-btn"
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              period === 'monthly'
                ? 'bg-[#102A2E] text-white'
                : 'text-[#60706D] hover:text-[#102A2E]'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Main Metric Cascade Flow */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Step 1: Gross Compensation */}
        <div className="flex items-baseline justify-between border-b border-[#F7F8F5] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#60706D]">
              Gross Compensation
            </span>
            <p className="text-xs text-[#60706D] mt-0.5">Stated total cash salary</p>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-[#102A2E] font-tabular">
              {grossDisplay}
            </span>
            <span className="text-xs text-[#60706D] block">/{isMonthly ? 'mo' : 'yr'}</span>
          </div>
        </div>

        {/* Flow indicator */}
        <div className="flex justify-center -my-2">
          <div className="w-6 h-6 rounded-full bg-[#F7F8F5] border border-[#DCE3E0] flex items-center justify-center text-[#60706D]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 2: Estimated Take-Home Pay */}
        <div className="flex items-baseline justify-between border-b border-[#F7F8F5] pb-4">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#167D75]">
                Estimated Take-Home
              </span>
              <span className="text-xs text-[#60706D]">
                ({(outcome.tax.effectiveTaxRate * 100).toFixed(1)}% total tax & FICA)
              </span>
            </div>
            <p className="text-xs text-[#60706D] mt-0.5">
              After federal, state, local resident taxes & social contributions
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-[#167D75] font-tabular">
              {takeHomeDisplay}
            </span>
            <span className="text-xs text-[#60706D] block">/{isMonthly ? 'mo' : 'yr'}</span>
          </div>
        </div>

        {/* Flow indicator */}
        <div className="flex justify-center -my-2">
          <div className="w-6 h-6 rounded-full bg-[#F7F8F5] border border-[#DCE3E0] flex items-center justify-center text-[#60706D]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 3: Estimated Local Living Costs */}
        <div className="flex items-baseline justify-between border-b border-[#F7F8F5] pb-4">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#60706D]">
                Estimated Living Costs
              </span>
            </div>
            <p className="text-xs text-[#60706D] mt-0.5">
              Housing ({outcome.scenario.household.housingType}), food, utilities, transit & healthcare
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-[#60706D] font-tabular">
              −{livingCostsDisplay}
            </span>
            <span className="text-xs text-[#60706D] block">/{isMonthly ? 'mo' : 'yr'}</span>
          </div>
        </div>

        {/* Flow indicator */}
        <div className="flex justify-center -my-2">
          <div className="w-6 h-6 rounded-full bg-[#102A2E] text-[#DDF2EC] flex items-center justify-center">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 4: MONEY REMAINING (THE HERO OUTCOME) */}
        <div className="bg-[#F7F8F5] rounded-xl p-5 border border-[#DCE3E0]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-[#167D75]" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#102A2E]">
                  Money Remaining (Disposable Income)
                </span>
              </div>
              <p className="text-xs text-[#60706D] mt-1 max-w-md">
                Uncommitted income available for personal savings, emergency fund, investments, or travel.
              </p>
            </div>

            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] font-tabular">
                {moneyRemainingDisplay}
              </div>
              <div className="text-xs font-medium text-[#60706D]">
                {isMonthly ? (
                  <span>
                    Equivalent to {formatMoney(outcome.moneyRemainingAnnual, { hideDecimals: true })}/year
                  </span>
                ) : (
                  <span>
                    Equivalent to {formatMoney(outcome.moneyRemainingMonthly, { hideDecimals: true })}/month
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Visual Income Allocation Stack */}
          <div className="mt-5 pt-4 border-t border-[#DCE3E0]/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[#102A2E] flex items-center space-x-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#167D75]" />
                <span>Gross Compensation Allocation</span>
              </span>
              <span className="text-xs text-[#60706D]">
                Where every 100% of income goes
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-4 w-full rounded-full bg-[#DCE3E0]/50 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${taxPct}%` }}
                className="bg-[#D9534F] h-full transition-all duration-300 relative group cursor-pointer"
                title={`Taxes & FICA: ${taxPct}%`}
              />
              <div
                style={{ width: `${housingPct}%` }}
                className="bg-[#2B6CB0] h-full transition-all duration-300 relative group cursor-pointer"
                title={`Housing: ${housingPct}%`}
              />
              <div
                style={{ width: `${essentialPct}%` }}
                className="bg-[#167D75] h-full transition-all duration-300 relative group cursor-pointer"
                title={`Essential Living: ${essentialPct}%`}
              />
              <div
                style={{ width: `${discretionaryPct}%` }}
                className="bg-[#D97706] h-full transition-all duration-300 relative group cursor-pointer"
                title={`Discretionary: ${discretionaryPct}%`}
              />
              <div
                style={{ width: `${remainingPct}%` }}
                className="bg-[#10B981] h-full transition-all duration-300 relative group cursor-pointer"
                title={`Savings Buffer: ${remainingPct}%`}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-[#60706D]">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9534F] shrink-0" />
                <span>Taxes & FICA ({taxPct}%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2B6CB0] shrink-0" />
                <span>Housing ({housingPct}%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#167D75] shrink-0" />
                <span>Essentials ({essentialPct}%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] shrink-0" />
                <span>Discretionary ({discretionaryPct}%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                <span className="font-semibold text-[#102A2E]">Savings ({remainingPct}%)</span>
              </div>
            </div>
          </div>

          {/* Savings Capacity Bar */}
          <div className="mt-4 pt-4 border-t border-[#DCE3E0]/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <PiggyBank className="w-4 h-4 text-[#167D75]" />
              <span className="font-semibold text-[#102A2E]">Potential Savings Rate:</span>
              <span className="font-bold text-[#167D75]">{outcome.savingsRatePercentage}%</span>
              <span className="text-[#60706D]">of gross earnings</span>
            </div>
            <button
              onClick={onOpenEvidence}
              className="text-[#167D75] hover:underline font-medium inline-flex items-center text-xs"
            >
              Inspect evidence & sources
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[#FFFFFF] px-6 py-4 border-t border-[#DCE3E0] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#60706D] flex items-center space-x-1">
          <span>Assumptions:</span>
          <span className="font-medium text-[#102A2E] truncate max-w-xs sm:max-w-md">
            {outcome.costOfLiving.assumptionsSummary}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-copy-assessment"
            type="button"
            onClick={handleCopySummary}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              copied
                ? 'border-[#167D75] bg-[#DDF2EC] text-[#0D625B]'
                : 'border-[#DCE3E0] text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Summary Copied!' : 'Share / Copy'}</span>
          </button>
          <button
            id="btn-result-customize"
            type="button"
            onClick={onOpenCustomizer}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#167D75]" />
            <span>Customize Assumptions</span>
          </button>
          <button
            id="btn-result-compare"
            type="button"
            onClick={onCompareCity}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#102A2E] text-white hover:bg-[#167D75] transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Compare Another City</span>
          </button>
        </div>
      </div>
    </div>
  );
};
