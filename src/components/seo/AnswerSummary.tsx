import React from 'react';
import { ShieldCheck, Calendar, Info, Building2, CheckCircle2, HelpCircle } from 'lucide-react';
import { LivWorthCalculationOutcome } from '../../types/scenario';
import { formatMoney } from '../../lib/money';

interface AnswerSummaryProps {
  question: string;
  headlineSummary: string;
  lifestyleContext?: string;
  cityName: string;
  countryName: string;
  currency: string;
  grossSalaryMajor: number;
  outcome: LivWorthCalculationOutcome | null;
  taxYear?: number;
  onOpenMethodology?: () => void;
  onOpenEvidence?: () => void;
  onReportCorrection?: () => void;
}

export const AnswerSummary: React.FC<AnswerSummaryProps> = ({
  question,
  headlineSummary,
  lifestyleContext,
  cityName,
  countryName,
  currency,
  grossSalaryMajor,
  outcome,
  taxYear = 2024,
  onOpenMethodology,
  onOpenEvidence,
  onReportCorrection,
}) => {
  if (!outcome) {
    return (
      <section className="p-6 bg-white border border-[#DCE3E0] rounded-2xl animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </section>
    );
  }

  const grossFormatted = `${currency} ${grossSalaryMajor.toLocaleString()}`;
  const netAnnualFormatted = formatMoney(outcome.takeHomeAnnual, { hideDecimals: true });
  const netMonthlyFormatted = formatMoney(outcome.takeHomeMonthly, { hideDecimals: true });

  const rentMonthlyFormatted = formatMoney(outcome.costOfLiving.housingMonthly, { hideDecimals: true });
  const rentAnnualMinor = outcome.costOfLiving.housingMonthly.amountMinor * 12;
  const rentAnnualFormatted = formatMoney(
    { amountMinor: rentAnnualMinor, currency: outcome.costOfLiving.housingMonthly.currency },
    { hideDecimals: true }
  );

  const livingCostsMonthlyFormatted = formatMoney(outcome.costOfLiving.monthlyWithoutRent, { hideDecimals: true });
  const livingCostsAnnualMinor = outcome.costOfLiving.monthlyWithoutRent.amountMinor * 12;
  const livingCostsAnnualFormatted = formatMoney(
    { amountMinor: livingCostsAnnualMinor, currency: outcome.costOfLiving.monthlyWithoutRent.currency },
    { hideDecimals: true }
  );

  const disposableAnnualFormatted = formatMoney(outcome.moneyRemainingAnnual, { hideDecimals: true });
  const disposableMonthlyFormatted = formatMoney(outcome.moneyRemainingMonthly, { hideDecimals: true });

  const totalTaxFormatted = formatMoney(outcome.tax.totalDeductionsAndTaxes, { hideDecimals: true });
  const totalTaxMonthlyMinor = Math.round(outcome.tax.totalDeductionsAndTaxes.amountMinor / 12);
  const totalTaxMonthlyFormatted = formatMoney(
    { amountMinor: totalTaxMonthlyMinor, currency: outcome.tax.totalDeductionsAndTaxes.currency },
    { hideDecimals: true }
  );

  const effectiveRate = (
    outcome.tax.effectiveTaxRate <= 1 ? outcome.tax.effectiveTaxRate * 100 : outcome.tax.effectiveTaxRate
  ).toFixed(1);
  const taxRuleVersion = outcome.taxRuleVersion || `${countryName}-${taxYear}`;

  return (
    <section
      aria-label="Direct Financial Answer & Fact Summary"
      className="p-6 sm:p-7 bg-white border-l-4 border-l-[#167D75] border border-[#DCE3E0] rounded-2xl shadow-xs space-y-5"
    >
      {/* 1. Clear Question Anchor */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-[#DDF2EC] text-[#0D524D] text-[11px] font-bold uppercase tracking-wider rounded">
            AEO Direct Answer
          </span>
          <span className="text-xs text-slate-500 font-medium">Question:</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#167D75]" />
            Tax Year: <strong>{taxYear}</strong>
          </span>
          <span>•</span>
          <span className="text-teal-700 font-semibold">{taxRuleVersion}</span>
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-extrabold text-[#102A2E] tracking-tight">
        {question}
      </h2>

      {/* 2. Structured Factual Answer Paragraph (Extracted by Google AI & LLMs) */}
      <div className="text-sm sm:text-base text-[#102A2E] leading-relaxed space-y-2">
        <p>
          <strong>{headlineSummary}</strong> A <strong>{grossFormatted}</strong> gross salary in {cityName} produces an estimated <strong>{netAnnualFormatted}</strong> in annual statutory take-home pay (approximately <strong>{netMonthlyFormatted}/month</strong>) under {taxYear} statutory schedules (an effective deduction rate of {effectiveRate}%).
        </p>
        <p className="text-slate-700 text-xs sm:text-sm">
          After accounting for an assumed baseline rent of <strong>{rentMonthlyFormatted}/month</strong> ({rentAnnualFormatted}/year) and essential household necessities of <strong>{livingCostsMonthlyFormatted}/month</strong>, approximately <strong>{disposableMonthlyFormatted}/month ({disposableAnnualFormatted}/year)</strong> remains as uncommitted disposable savings capacity.
        </p>
        {lifestyleContext && (
          <p className="text-xs text-slate-600 italic pt-1">
            {lifestyleContext}
          </p>
        )}
      </div>

      {/* 3. Machine-Readable Semantic Fact Table */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="py-2.5 px-3">Financial Component</th>
              <th className="py-2.5 px-3">Annual Amount</th>
              <th className="py-2.5 px-3">Monthly Amount</th>
              <th className="py-2.5 px-3">Data Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            <tr>
              <td className="py-2 px-3 font-semibold text-[#102A2E]">Gross Compensation</td>
              <td className="py-2 px-3 font-bold text-[#102A2E]">{grossFormatted}</td>
              <td className="py-2 px-3 font-medium text-slate-600">{currency} {Math.round(grossSalaryMajor / 12).toLocaleString()}</td>
              <td className="py-2 px-3 text-[11px] text-slate-500">Scenario Input</td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="py-2 px-3 font-semibold text-[#102A2E]">Total Statutory Taxes & Levies</td>
              <td className="py-2 px-3 font-semibold text-rose-700">-{totalTaxFormatted}</td>
              <td className="py-2 px-3 text-rose-700 font-medium">-{totalTaxMonthlyFormatted}</td>
              <td className="py-2 px-3 text-[11px] text-teal-800 font-semibold">Official Statutory Schedule</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-bold text-[#102A2E]">Net Take-Home Pay</td>
              <td className="py-2 px-3 font-extrabold text-[#167D75]">{netAnnualFormatted}</td>
              <td className="py-2 px-3 font-bold text-[#167D75]">{netMonthlyFormatted}</td>
              <td className="py-2 px-3 text-[11px] text-teal-800 font-semibold">Statutory Net Income</td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="py-2 px-3 font-semibold text-[#102A2E]">Baseline Housing (1-Bed Typical)</td>
              <td className="py-2 px-3 text-slate-700">-{rentAnnualFormatted}</td>
              <td className="py-2 px-3 text-slate-700 font-medium">-{rentMonthlyFormatted}</td>
              <td className="py-2 px-3 text-[11px] text-slate-500">Fair Market Rent Benchmark</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-semibold text-[#102A2E]">Itemized Living Necessities</td>
              <td className="py-2 px-3 text-slate-700">-{livingCostsAnnualFormatted}</td>
              <td className="py-2 px-3 text-slate-700 font-medium">-{livingCostsMonthlyFormatted}</td>
              <td className="py-2 px-3 text-[11px] text-slate-500">BLS / Eurostat Weighted Basket</td>
            </tr>
            <tr className="bg-[#DDF2EC]/40 font-bold border-t-2 border-teal-600">
              <td className="py-2.5 px-3 text-[#0D524D]">Uncommitted Disposable Cash</td>
              <td className="py-2.5 px-3 text-[#0D524D]">{disposableAnnualFormatted}</td>
              <td className="py-2.5 px-3 text-[#0D524D]">{disposableMonthlyFormatted}</td>
              <td className="py-2.5 px-3 text-[11px] text-[#0D524D] font-bold">LivWorthy Derived Model</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Trust, Source Provenance & Disclaimers Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#167D75]" />
            Deterministic Zero-AI Math
          </span>
          <span>•</span>
          <span>Effective Deduction Rate: <strong>{effectiveRate}%</strong></span>
        </div>

        <div className="flex items-center space-x-3">
          {onOpenMethodology && (
            <button
              type="button"
              onClick={onOpenMethodology}
              className="text-[#167D75] hover:underline font-semibold cursor-pointer"
            >
              Methodology
            </button>
          )}
          {onOpenEvidence && (
            <button
              type="button"
              onClick={onOpenEvidence}
              className="text-[#167D75] hover:underline font-semibold cursor-pointer"
            >
              Official Sources
            </button>
          )}
          {onReportCorrection && (
            <button
              type="button"
              onClick={onReportCorrection}
              className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
            >
              Report Correction
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
