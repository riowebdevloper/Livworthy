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
  Printer,
  Copy,
} from 'lucide-react';
import { formatMoney, toMajor } from '../../lib/money';
import { LivWorthCalculationOutcome } from '../../types/scenario';
import { MoneyRow, MoneyValue } from '../ui/MoneyDisplay';
import { useI18n } from '../../context/I18nContext';

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
  const { dict, isRtl } = useI18n();
  const [period, setPeriod] = useState<'annual' | 'monthly'>('annual');
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareText = `In ${outcome.scenario.location.name}, a gross salary of ${formatMoney(outcome.grossAnnual, { hideDecimals: true })} yields ${formatMoney(outcome.takeHomeAnnual, { hideDecimals: true })}/year net take-home pay. Calculated on LivWorthy:`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.livworthy.com';
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

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
                {outcome.scenario.location.name} {dict.results.summaryTitle}
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
              aria-label={dict.accessibility.viewAnnualAriaLabel}
              aria-pressed={period === 'annual'}
              onClick={() => setPeriod('annual')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                period === 'annual'
                  ? 'bg-[#102A2E] text-white'
                  : 'text-[#60706D] hover:text-[#102A2E]'
              }`}
            >
              {dict.common.annual}
            </button>
            <button
              id="period-monthly-btn"
              type="button"
              aria-label={dict.accessibility.viewMonthlyAriaLabel}
              aria-pressed={period === 'monthly'}
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                period === 'monthly'
                  ? 'bg-[#102A2E] text-white'
                  : 'text-[#60706D] hover:text-[#102A2E]'
              }`}
            >
              {dict.common.monthly}
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cascade Flow */}
      <div className="p-4 sm:p-8 space-y-6">
        {/* Step 1: Gross Compensation */}
        <MoneyRow
          label={dict.results.annualGross}
          description={dict.results.annualGross}
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
                {dict.results.annualTakeHome}
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
              ? dict.results.taxPending
              : dict.results.annualTakeHome
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
              {dict.results.estimatedLivingCosts}
            </span>
          }
          description={`${dict.costOfLiving.housingRent} (${outcome.scenario.household.housingType}), food, utilities, transit & healthcare`}
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
                  {dict.results.monthlyDisposable}
                </span>
              </div>
              <p className="text-xs text-[#60706D] mt-1 max-w-md leading-relaxed">
                {isTaxUnavailable
                  ? 'Spendable surplus and savings capacity cannot be derived without authoritative statutory tax calculations.'
                  : dict.results.spendableSurplus}
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
              <span className="font-bold text-[#0D625B]">{dict.results.savingsCapacity}:</span>
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
                <span>{dict.results.annualGross}</span>
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
                    title={`${dict.results.taxesAndDeductions}: ${taxPct}%`}
                  />
                  <div
                    style={{ width: `${housingPct}%` }}
                    className="bg-[#2B6CB0] h-full transition-all duration-300 relative group cursor-pointer"
                    title={`${dict.costOfLiving.housingRent}: ${housingPct}%`}
                  />
                  <div
                    style={{ width: `${essentialPct}%` }}
                    className="bg-[#167D75] h-full transition-all duration-300 relative group cursor-pointer"
                    title={`${dict.results.essentialLiving}: ${essentialPct}%`}
                  />
                  <div
                    style={{ width: `${discretionaryPct}%` }}
                    className="bg-[#D97706] h-full transition-all duration-300 relative group cursor-pointer"
                    title={`${dict.results.discretionaryLiving}: ${discretionaryPct}%`}
                  />
                  <div
                    style={{ width: `${remainingPct}%` }}
                    className="bg-[#10B981] h-full transition-all duration-300 relative group cursor-pointer"
                    title={`${dict.results.savingsCapacity}: ${outcome.savingsRatePercentage}%`}
                  />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-[#60706D]">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D9534F] shrink-0" />
                    <span>{dict.results.taxesAndDeductions} ({taxPct}%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2B6CB0] shrink-0" />
                    <span>{dict.costOfLiving.housingRent} ({housingPct}%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#167D75] shrink-0" />
                    <span>{dict.results.essentialLiving} ({essentialPct}%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] shrink-0" />
                    <span>{dict.results.discretionaryLiving} ({discretionaryPct}%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="font-semibold text-[#102A2E]">{dict.results.savingsCapacity} ({outcome.savingsRatePercentage}%)</span>
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
              {dict.common.evidence}
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-[#FFFFFF] p-4 sm:px-6 sm:py-4 border-t border-[#DCE3E0] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div id="assumptions-summary-container" className="text-xs text-[#60706D] flex flex-wrap items-baseline gap-1.5 min-w-0">
          <span className="font-semibold text-[#60706D] shrink-0">{dict.results.benchmarkContext}</span>
          <span className="font-medium text-[#102A2E] break-words">
            {outcome.costOfLiving.assumptionsSummary}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
          {/* Print / PDF Button */}
          <button
            id="btn-print-assessment"
            type="button"
            onClick={() => window.print()}
            className="no-print inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 min-h-[38px] rounded-lg border border-[#DCE3E0] text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5] transition-colors cursor-pointer w-full sm:w-auto"
            title="Print or save report as PDF"
            aria-label="Print or save report as PDF"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Print / PDF</span>
          </button>

          {/* Share Menu Toggle & Options */}
          <div className="relative inline-block w-full sm:w-auto">
            <button
              id="btn-copy-assessment"
              type="button"
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={`inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 min-h-[38px] rounded-lg border transition-colors cursor-pointer w-full sm:w-auto ${
                copied
                  ? 'border-[#167D75] bg-[#DDF2EC] text-[#0D625B]'
                  : 'border-[#DCE3E0] text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Share2 className="w-3.5 h-3.5 shrink-0" />}
              <span className="whitespace-nowrap">{copied ? dict.common.copied : dict.common.share}</span>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-[#DCE3E0] rounded-xl shadow-lg p-2 z-50 flex flex-col gap-1 text-xs no-print">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-2.5 py-1.5 rounded-lg hover:bg-[#DDF2EC] text-[#102A2E] font-medium transition-colors"
                >
                  <svg className="w-4 h-4 mr-2.5 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766 0-3.187-2.583-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.402A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182c-1.63 0-3.15-.47-4.44-1.28l-.318-.2-2.964.834.85-2.888-.22-.336A8.146 8.146 0 013.818 12C3.818 7.481 7.481 3.818 12 3.818S20.182 7.481 20.182 12 16.519 20.182 12 20.182z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-2.5 py-1.5 rounded-lg hover:bg-[#DDF2EC] text-[#102A2E] font-medium transition-colors"
                >
                  <svg className="w-4 h-4 mr-2.5 text-[#0A66C2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74V10.13H5.07v8.37h2.78z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-2.5 py-1.5 rounded-lg hover:bg-[#DDF2EC] text-[#102A2E] font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5 mr-2.5 text-[#102A2E] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Twitter / X</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    handleCopySummary();
                    setShowShareMenu(false);
                  }}
                  className="flex items-center w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#DDF2EC] text-[#102A2E] font-medium transition-colors cursor-pointer border-t border-[#DCE3E0]/50 pt-1.5 mt-0.5"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2.5 text-[#167D75] shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2.5 text-[#167D75] shrink-0" />
                  )}
                  <span>{dict.common.copied}</span>
                </button>
              </div>
            )}
          </div>
          <button
            id="btn-result-customize"
            type="button"
            onClick={onOpenCustomizer}
            className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3 py-2 min-h-[38px] rounded-lg border border-[#DCE3E0] text-[#102A2E] hover:bg-[#F7F8F5] transition-colors cursor-pointer w-full sm:w-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#167D75] shrink-0" />
            <span className="whitespace-nowrap">{dict.results.customizeAssumptions}</span>
          </button>
          <button
            id="btn-result-compare"
            type="button"
            onClick={onCompareCity}
            className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold px-3.5 py-2 min-h-[38px] rounded-lg bg-[#102A2E] text-white hover:bg-[#167D75] transition-colors cursor-pointer w-full sm:w-auto"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{dict.nav.compare}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
