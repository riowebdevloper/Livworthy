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
import { MoneyRow, MoneyValue } from '../ui/MoneyDisplay';

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
  const isTaxUnavailable = outcome.tax.status === 'TAX_CALCULATION_UNAVAILABLE';

  const housingPct = Math.max(0, Math.min(100, Math.round((housingMinor / grossMinor) * 100)));
  const essentialPct = Math.max(0, Math.min(100, Math.round((otherEssentialMinor / grossMinor) * 100)));
  const discretionaryPct = Math.max(0, Math.min(100, Math.round((discretionaryMinor / grossMinor) * 100)));
  const remainingPct = Math.max(0, Math.min(100, Math.round((remainingMinor / grossMinor) * 100)));

  const handleCopySummary = () => {
    const summary = isTaxUnavailable
      ? `--- LivWorthy Financial Assessment ---
Location: ${outcome.scenario.location.name} (${outcome.scenario.location.countryId})
Gross Salary: ${formatMoney(outcome.grossAnnual, { hideDecimals: true })}/year
Tax Status: Under Verification (statutory tables not yet available)
Take-Home Pay: Pending statutory verification
Estimated Living Costs: ${formatMoney(outcome.livingCostsAnnual, { hideDecimals: true })}/year (${formatMoney(outcome.livingCostsMonthly, { hideDecimals: true })}/month)
Spendable Surplus: Unavailable (requires statutory tax calculation)
Methodology: Deterministic statutory schedules (https://www.livworthy.com)`
      : `--- LivWorthy Financial Assessment ---
Location: ${outcome.scenario.location.name} (${outcome.scenario.location.countryId})
Gross Salary: ${formatMoney(outcome.grossAnnual, { hideDecimals: true })}/year
Effective Tax Rate: ${(outcome.tax.effectiveTaxRate * 100).toFixed(1)}%
Annual Take-Home: ${formatMoney(outcome.takeHomeAnnual, { hideDecimals: true })}/year (${formatMoney(outcome.takeHomeMonthly, { hideDecimals: true })}/month)
Estimated Living Costs: ${formatMoney(outcome.livingCostsAnnual, { hideDecimals: true })}/year (${formatMoney(outcome.livingCostsMonthly, { hideDecimals: true })}/month)
Money Remaining: ${formatMoney(outcome.moneyRemainingAnnual, { hideDecimals: true })}/year (${formatMoney(outcome.moneyRemainingMonthly, { hideDecimals: true })}/month)
Savings Rate: ${outcome.savingsRatePercentage}% of gross
Methodology: Deterministic statutory schedules (https://www.livworthy.com)`;

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
      <div className="bg-[#F7F8F5] p-4 sm:px-6 sm:py-4 border-b border-[#DCE3E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
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
              {isTaxUnavailable
                ? 'Statutory tax schedules under verification • Net income & savings pending verified tables'
                : `Statutory ${outcome.scenario.taxProfile.taxYear} schedule (${outcome.tax.taxRuleVersion || 'Official table'})`}
            </p>
          </div>

          {/* Period Selector: Grouped closely with result header */}
          <div className="inline-flex rounded-lg border border-[#DCE3E0] p-0.5 bg-[#FFFFFF] shrink-0 self-start sm:self-center">
            <button
              id="period-annual-btn"
              type="button"
              aria-label="View annual figures"
              aria-pressed={period === 'annual'}
              onClick={() => setPeriod('annual')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
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
              aria-label="View monthly figures"
              aria-pressed={period === 'monthly'}
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                period === 'monthly'
                  ? 'bg-[#102A2E] text-white'
                  : 'text-[#60706D] hover:text-[#102A2E]'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cascade Flow */}
      <div className="p-4 sm:p-8 space-y-6">
        {/* Step 1: Gross Compensation */}
        <MoneyRow
          label="Gross Compensation"
          description="Stated total cash salary"
          amount={grossDisplay}
          period={`/${isMonthly ? 'mo' : 'yr'}`}
          color="primary"
          size="xl"
        />

        {/* Flow indicator */}
        <div className="flex justify-center -my-2">
          <div className="w-6 h-6 rounded-full bg-[#F7F8F5] border border-[#DCE3E0] flex items-center justify-center text-[#60706D]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 2: Estimated Take-Home Pay */}
        <MoneyRow
          label={
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#167D75]">
                Estimated Take-Home
              </span>
              <span className="text-xs text-[#60706D]">
                {isTaxUnavailable
                  ? '(Tax calculation under verification)'
                  : `(${(outcome.tax.effectiveTaxRate * 100).toFixed(1)}% total tax & FICA)`}
              </span>
            </div>
          }
          description={
            isTaxUnavailable
              ? 'Statutory tax schedules are under institutional verification; take-home pay is not calculated without official tables'
              : 'After federal, state, local resident taxes & social contributions'
          }
          amount={isTaxUnavailable ? 'Pending Verification' : takeHomeDisplay}
          period={isTaxUnavailable ? '' : `/${isMonthly ? 'mo' : 'yr'}`}
          color="teal"
          size="xl"
        />

        {/* Flow indicator */}
        <div className="flex justify-center -my-2">
          <div className="w-6 h-6 rounded-full bg-[#F7F8F5] border border-[#DCE3E0] flex items-center justify-center text-[#60706D]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 3: Estimated Local Living Costs */}
        <MoneyRow
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-[#60706D]">
              Estimated Living Costs
            </span>
          }
          description={`Housing (${outcome.scenario.household.housingType}), food, utilities, transit & healthcare`}
          amount={livingCostsDisplay}
          prefixSign="−"
          period={`/${isMonthly ? 'mo' : 'yr'}`}
          color="muted"
          size="xl"
        />

        {/* Flow indicator */}
        <div className="flex justify-center -my-2">
          <div className="w-6 h-6 rounded-full bg-[#F7F8F5] border border-[#DCE3E0] flex items-center justify-center text-[#60706D]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 4: MONEY LEFT AFTER EXPENSES (THE HERO OUTCOME) */}
        <div className="bg-[#F7F8F5] rounded-xl p-4 sm:p-5 border border-[#DCE3E0]">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-[#167D75] shrink-0" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#102A2E]">
                  Money Left After Expenses
                </span>
              </div>
              <p className="text-xs text-[#60706D] mt-1 max-w-md leading-relaxed">
                {isTaxUnavailable
                  ? 'Spendable surplus and savings capacity cannot be derived without authoritative statutory tax calculations.'
                  : `Money you actually keep each ${isMonthly ? 'month' : 'year'} after taxes and estimated living costs — available for savings, investments, or discretionary spending.`}
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right space-y-0.5 pt-1 sm:pt-0">
              <div className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-[#102A2E] font-tabular tabular-nums tracking-tight break-words sm:whitespace-nowrap">
                {isTaxUnavailable ? 'Pending Verification' : moneyRemainingDisplay}
              </div>
              {!isTaxUnavailable && (
                <div className="text-xs font-medium text-[#60706D] whitespace-normal sm:whitespace-nowrap">
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
              )}
            </div>
          </div>

          {/* Potential Monthly Savings Callout */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 mt-4 rounded-lg bg-[#EBF6F3] border border-[#167D75]/20 text-xs">
            <div className="flex items-center space-x-2">
              <PiggyBank className="w-4 h-4 text-[#167D75] shrink-0" />
              <span className="font-bold text-[#0D625B]">Potential Monthly Savings:</span>
              <span className="font-extrabold text-[#102A2E] text-sm">
                {isTaxUnavailable ? 'Under Verification' : `${formatMoney(outcome.savingsCapacityMonthly, { hideDecimals: true })}/mo`}
              </span>
            </div>
            {!isTaxUnavailable && (
              <span className="text-[#0D625B] font-medium">
                ({outcome.savingsRatePercentage}% of gross income)
              </span>
            )}
          </div>

          {/* Visual Income Allocation Stack */}
          <div className="mt-5 pt-4 border-t border-[#DCE3E0]/80">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-2">
              <span className="font-bold text-[#102A2E] flex items-center space-x-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#167D75] shrink-0" />
                <span>Gross Compensation Allocation</span>
              </span>
              <span className="text-xs text-[#60706D]">
                {isTaxUnavailable ? 'Pending verified tax schedule' : 'Where every 100% of income goes'}
              </span>
            </div>

            {isTaxUnavailable ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Gross income allocation and savings capacity cannot be calculated because statutory tax schedules for this jurisdiction/tax year are currently under verification.
              </div>
            ) : (
              <>
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
                    title={`Savings Buffer: ${outcome.savingsRatePercentage}%`}
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
                    <span className="font-semibold text-[#102A2E]">Savings ({outcome.savingsRatePercentage}%)</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Evidence verification link */}
          <div className="mt-3 pt-3 border-t border-[#DCE3E0]/70 flex justify-end text-xs">
            <button
              onClick={onOpenEvidence}
              className="text-[#167D75] hover:underline font-medium inline-flex items-center text-xs cursor-pointer"
            >
              Inspect evidence & sources →
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[#FFFFFF] p-4 sm:px-6 sm:py-4 border-t border-[#DCE3E0] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div id="assumptions-summary-container" className="text-xs text-[#60706D] flex flex-wrap items-baseline gap-1.5 min-w-0">
          <span className="font-semibold text-[#60706D] shrink-0">Assumptions:</span>
          <span className="font-medium text-[#102A2E] break-words">
            {outcome.costOfLiving.assumptionsSummary}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
          <button
            id="btn-copy-assessment"
            type="button"
            onClick={handleCopySummary}
            className={`inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 min-h-[38px] rounded-lg border transition-colors cursor-pointer w-full sm:w-auto ${
              copied
                ? 'border-[#167D75] bg-[#DDF2EC] text-[#0D625B]'
                : 'border-[#DCE3E0] text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Share2 className="w-3.5 h-3.5 shrink-0" />}
            <span className="whitespace-nowrap">{copied ? 'Summary Copied!' : 'Share / Copy'}</span>
          </button>
          <button
            id="btn-result-customize"
            type="button"
            onClick={onOpenCustomizer}
            className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 min-h-[38px] rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5] transition-colors cursor-pointer w-full sm:w-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#167D75] shrink-0" />
            <span className="whitespace-nowrap">Customize Assumptions</span>
          </button>
          <button
            id="btn-result-compare"
            type="button"
            onClick={onCompareCity}
            className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3.5 py-2 min-h-[38px] rounded-lg bg-[#102A2E] text-white hover:bg-[#167D75] transition-colors cursor-pointer w-full sm:w-auto"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Compare Another City</span>
          </button>
        </div>
      </div>
    </div>
  );
};
