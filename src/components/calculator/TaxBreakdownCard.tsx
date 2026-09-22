import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { formatMoney } from '../../lib/money';
import { TaxResult } from '../../types/tax';

interface TaxBreakdownCardProps {
  tax: TaxResult;
  onOpenEvidence: () => void;
}

export const TaxBreakdownCard: React.FC<TaxBreakdownCardProps> = ({ tax, onOpenEvidence }) => {
  const [expanded, setExpanded] = useState(false);

  if (tax.status === 'TAX_CALCULATION_UNAVAILABLE') {
    return (
      <div id="tax-breakdown-card" className="bg-[#FFFFFF] rounded-2xl border border-amber-200 shadow-xs p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-base text-[#102A2E]">Statutory Tax Schedules Under Verification</h3>
            <p className="text-xs text-[#60706D] mt-1 leading-relaxed">
              {tax.unsupportedExplanation ||
                'Statutory tax calculation for this jurisdiction is currently being verified against official revenue authority tables.'}
            </p>
            <div className="mt-3 inline-flex items-center text-xs text-[#167D75] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              LivWorthy Data Integrity Charter: We never substitute synthetic approximations for official tax schedules.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="tax-breakdown-card" className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] shadow-xs p-6">
      {tax.warnings && tax.warnings.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>{tax.warnings.join(' ')}</div>
        </div>
      )}
      <div className="flex items-center justify-between pb-4 border-b border-[#F7F8F5]">
        <div>
          <h3 className="font-bold text-base text-[#102A2E]">Tax & Statutory Contribution Breakdown</h3>
          <p className="text-xs text-[#60706D] mt-0.5">
            Rule Version: <span className="font-mono text-[#102A2E]">{tax.taxRuleVersion}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#60706D]">Effective Tax Rate</div>
          <div className="text-lg sm:text-xl font-bold text-[#102A2E] font-tabular">
            {(tax.effectiveTaxRate * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-4">
        <div className="bg-[#F7F8F5] p-3 rounded-xl min-w-0">
          <span className="text-[11px] sm:text-xs text-[#60706D] block truncate">Gross Income</span>
          <span className="text-xs sm:text-sm font-bold text-[#102A2E] font-tabular tabular-nums tracking-tight block truncate sm:overflow-visible">
            {formatMoney(tax.grossIncome, { hideDecimals: true })}
          </span>
        </div>
        <div className="bg-[#F7F8F5] p-3 rounded-xl min-w-0">
          <span className="text-[11px] sm:text-xs text-[#60706D] block truncate">Total Taxes & FICA</span>
          <span className="text-xs sm:text-sm font-bold text-[#102A2E] font-tabular tabular-nums tracking-tight block truncate sm:overflow-visible">
            {formatMoney(tax.totalDeductionsAndTaxes, { hideDecimals: true })}
          </span>
        </div>
        <div className="bg-[#F7F8F5] p-3 rounded-xl min-w-0">
          <span className="text-[11px] sm:text-xs text-[#60706D] block truncate">Annual Take-Home</span>
          <span className="text-xs sm:text-sm font-bold text-[#167D75] font-tabular tabular-nums tracking-tight block truncate sm:overflow-visible">
            {formatMoney(tax.netIncome, { hideDecimals: true })}
          </span>
        </div>
        <div className="bg-[#F7F8F5] p-3 rounded-xl min-w-0">
          <span className="text-[11px] sm:text-xs text-[#60706D] block truncate">Combined Marginal</span>
          <span className="text-xs sm:text-sm font-bold text-[#102A2E] font-tabular tabular-nums tracking-tight block">
            {(tax.marginalTaxRate * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Line-item component table */}
      <div className="space-y-2.5 pt-2">
        {tax.components.map((item) => {
          const pctOfGross = tax.grossIncome.amountMinor > 0
            ? (item.amount.amountMinor / tax.grossIncome.amountMinor) * 100
            : 0;

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-[#F7F8F5]/60 hover:bg-[#F7F8F5] transition-colors gap-2"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-[#102A2E]">{item.name}</span>
                  <span className="text-[10px] text-[#60706D] bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#DCE3E0]">
                    {item.authority}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-[#60706D] leading-relaxed">{item.description}</p>
                )}
              </div>
              <div className="shrink-0 flex sm:block items-baseline justify-between sm:text-right pl-0 sm:pl-3">
                <div className="text-sm font-bold text-[#102A2E] font-tabular tabular-nums whitespace-nowrap">
                  {formatMoney(item.amount)}
                </div>
                <div className="text-xs text-[#60706D]">
                  {pctOfGross.toFixed(1)}% of gross
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accordion for Tax Logic Details */}
      <div className="mt-4 pt-3 border-t border-[#F7F8F5]">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#167D75] hover:text-[#102A2E] transition-colors"
        >
          <span>{expanded ? 'Hide statutory standard deductions & schedules' : 'View statutory standard deductions & schedules'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-3 p-4 bg-[#F7F8F5] rounded-xl text-xs space-y-2 text-[#60706D] leading-relaxed">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-[#167D75] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#102A2E]">Deterministic Rules & Standard Deductions:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Federal Standard Deduction: $14,600 (Single) / $29,200 (MFJ) per IRS Rev. Proc. 2023-34.</li>
                  <li>New York State Standard Deduction: $8,000 (Single) / $16,050 (MFJ) per NYS IT-201-I.</li>
                  <li>Social Security (OASDI): 6.2% on wages up to $168,600 wage base per Social Security Administration.</li>
                  <li>Medicare Tax: 1.45% uncapped + 0.9% Additional Medicare tax on earnings exceeding $200,000.</li>
                  <li>New York City Resident Personal Income Tax: Progressive rates (3.078% to 3.876%) under NYC Admin Code § 11-1701.</li>
                </ul>
              </div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={onOpenEvidence}
                className="text-[#167D75] hover:underline font-semibold text-xs inline-flex items-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> View Official Source Records
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
