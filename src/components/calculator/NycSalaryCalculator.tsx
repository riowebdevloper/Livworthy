import React, { useState, useId, useMemo } from 'react';
import { TaxRegistry } from '../../engines/tax/tax-registry';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { useI18n } from '../../context/I18nContext';

export interface NycSalaryCalculatorProps {
  initialSalary?: number;
}

export const NycSalaryCalculator: React.FC<NycSalaryCalculatorProps> = ({
  initialSalary = 100000,
}) => {
  const { dict } = useI18n();
  const salaryInputId = useId();
  const [salary, setSalary] = useState<number>(initialSalary);

  // Execute statutory calculation via verified TaxRegistry engine
  const result = useMemo(() => {
    const grossNum = Math.max(0, isNaN(salary) ? 0 : salary);

    const grossMoney = createMoney(grossNum, 'USD');
    const taxProfile = {
      filingStatus: 'single' as const,
      dependentsCount: 0,
      taxYear: 2026,
    };
    const taxContext = {
      countryId: 'US',
      regionId: 'US-NY',
      cityId: 'nyc',
      taxJurisdictionId: 'US-FED-NY-NYC',
      taxYear: 2026,
    };

    const taxResult = TaxRegistry.calculate(grossMoney, taxProfile, taxContext);

    const grossMajor = grossNum;
    const netAnnualMajor = toMajor(taxResult.netIncome);
    const netMonthlyMajor = toMajor(taxResult.monthlyNetIncome);
    const netBiweeklyMajor = Math.round((netAnnualMajor / 26) * 100) / 100;
    const totalTaxMajor = toMajor(taxResult.totalDeductionsAndTaxes);
    const federalTaxMajor = toMajor(taxResult.federalTax);
    const stateTaxMajor = toMajor(taxResult.stateTax);
    const localTaxMajor = toMajor(taxResult.localTax);
    const ssComponent = taxResult.components.find((c) => c.id === 'us-fica-social-security');
    const medComponent = taxResult.components.find((c) => c.id === 'us-fica-medicare');
    const socialSecurityMajor = ssComponent ? toMajor(ssComponent.amount) : 0;
    const medicareMajor = medComponent ? toMajor(medComponent.amount) : 0;
    const totalFicaMajor = toMajor(taxResult.socialContributions);
    const effectiveRate = taxResult.effectiveTaxRate <= 1
      ? (taxResult.effectiveTaxRate * 100)
      : taxResult.effectiveTaxRate;

    return {
      grossMajor,
      netAnnualMajor,
      netMonthlyMajor,
      netBiweeklyMajor,
      totalTaxMajor,
      federalTaxMajor,
      stateTaxMajor,
      localTaxMajor,
      socialSecurityMajor,
      medicareMajor,
      totalFicaMajor,
      effectiveRate,
      taxRuleVersion: taxResult.taxRuleVersion,
      evidenceSourceIds: taxResult.evidenceSourceIds,
    };
  }, [salary]);

  const PRESETS = [60000, 80000, 100000, 120000, 150000, 200000, 250000];

  return (
    <div
      aria-label={dict.accessibility?.nycCalculatorAriaLabel || 'Interactive NYC Salary Calculator'}
      className="p-5 sm:p-7 bg-white border border-[#DCE3E0] rounded-2xl shadow-xs"
    >
      {/* Scope and Authority Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE3E0] pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#167D75]"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
            2026 Tax Year • Single Filer • NYC Resident
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#60706D] bg-[#F7F8F5] px-2.5 py-0.5 rounded-md border border-[#DCE3E0]">
          {result.taxRuleVersion}
        </span>
      </div>

      {/* Primary Input Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label
            htmlFor={salaryInputId}
            className="block text-xs font-bold text-[#102A2E] uppercase tracking-wide mb-1.5"
          >
            Annual Gross Salary (USD)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base font-bold text-[#60706D]">
              $
            </span>
            <input
              id={salaryInputId}
              name="annualSalary"
              type="number"
              min="0"
              step="1000"
              value={salary === 0 ? '' : salary}
              onChange={(e) => setSalary(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="100000"
              className="w-full pl-8 pr-4 py-2.5 text-lg font-bold text-[#102A2E] bg-white border border-[#DCE3E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#167D75] focus:border-transparent transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Quick Salary Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#60706D] mr-1">Tiers:</span>
          {PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setSalary(amt)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                salary === amt
                  ? 'bg-[#167D75] text-white border-[#167D75]'
                  : 'bg-[#F7F8F5] text-[#334D4A] border-[#DCE3E0] hover:border-[#167D75]'
              }`}
            >
              ${(amt / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>

      {/* Top Results Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 block">
            Monthly Take-Home
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#167D75] mt-1 block">
            ${result.netMonthlyMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-[#60706D] mt-0.5 block">
            ${result.netAnnualMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr
          </span>
        </div>

        <div className="p-3.5 bg-[#F7F8F5] border border-[#DCE3E0] rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60706D] block">
            Biweekly Paycheck
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#102A2E] mt-1 block">
            ${result.netBiweeklyMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-[#60706D] mt-0.5 block">26 pay periods/yr</span>
        </div>

        <div className="p-3.5 bg-[#F7F8F5] border border-[#DCE3E0] rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60706D] block">
            Effective Tax Rate
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#102A2E] mt-1 block">
            {result.effectiveRate.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#60706D] mt-0.5 block">
            All 4 tax layers combined
          </span>
        </div>

        <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 block">
            Total Withholdings
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-700 mt-1 block">
            ${result.totalTaxMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-[#60706D] mt-0.5 block">
            ${Math.round(result.totalTaxMajor / 12).toLocaleString()}/mo withheld
          </span>
        </div>
      </div>

      {/* Complete Statutory Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse border border-[#DCE3E0] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#F7F8F5] text-[#102A2E] font-bold">
              <th className="p-3 border-b border-[#DCE3E0]">Tax / Withholding Layer</th>
              <th className="p-3 border-b border-[#DCE3E0]">Statutory Authority</th>
              <th className="p-3 border-b border-[#DCE3E0]">Annual Amount</th>
              <th className="p-3 border-b border-[#DCE3E0]">Monthly Amount</th>
              <th className="p-3 border-b border-[#DCE3E0]">Effective Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE3E0] bg-white text-[#334D4A]">
            <tr>
              <td className="p-3 font-semibold text-[#102A2E]">Federal Income Tax</td>
              <td className="p-3 text-[#60706D]">IRS Rev. Proc. 2025-32 ($16,100 std deduction)</td>
              <td className="p-3 font-semibold text-[#102A2E]">${result.federalTaxMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">${(result.federalTaxMajor / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">{result.grossMajor > 0 ? ((result.federalTaxMajor / result.grossMajor) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#102A2E]">Social Security (FICA)</td>
              <td className="p-3 text-[#60706D]">6.2% on wages up to $184,500 wage base</td>
              <td className="p-3 font-semibold text-[#102A2E]">${result.socialSecurityMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">${(result.socialSecurityMajor / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">{result.grossMajor > 0 ? ((result.socialSecurityMajor / result.grossMajor) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#102A2E]">Medicare (FICA)</td>
              <td className="p-3 text-[#60706D]">1.45% uncapped + 0.9% above $200k</td>
              <td className="p-3 font-semibold text-[#102A2E]">${result.medicareMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">${(result.medicareMajor / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">{result.grossMajor > 0 ? ((result.medicareMajor / result.grossMajor) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#102A2E]">New York State Income Tax</td>
              <td className="p-3 text-[#60706D]">NYS Tax Law § 601 (3.90%–10.90% + IT-2105-I Worksheets)</td>
              <td className="p-3 font-semibold text-[#102A2E]">${result.stateTaxMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">${(result.stateTaxMajor / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">{result.grossMajor > 0 ? ((result.stateTaxMajor / result.grossMajor) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#102A2E]">NYC Resident Income Tax</td>
              <td className="p-3 text-[#60706D]">NYC Admin Code § 11-1701 (3.078%–3.876%)</td>
              <td className="p-3 font-semibold text-[#102A2E]">${result.localTaxMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">${(result.localTaxMajor / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3">{result.grossMajor > 0 ? ((result.localTaxMajor / result.grossMajor) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr className="bg-[#F7F8F5] font-bold text-[#102A2E]">
              <td className="p-3">Total Taxes &amp; Deductions</td>
              <td className="p-3 text-[#60706D]">All 4 statutory withholdings combined</td>
              <td className="p-3 text-rose-700">${result.totalTaxMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3 text-rose-700">${(result.totalTaxMajor / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3 text-rose-700">{result.effectiveRate.toFixed(1)}%</td>
            </tr>
            <tr className="bg-teal-50/50 font-bold text-[#167D75]">
              <td className="p-3">Net Take-Home Pay</td>
              <td className="p-3 text-teal-800">Gross salary minus all statutory taxes</td>
              <td className="p-3 text-xl">${result.netAnnualMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3 text-xl">${result.netMonthlyMajor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-3 text-teal-800">{(100 - result.effectiveRate).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status Notice */}
      <div className="mt-4 p-3 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0] text-[11px] text-[#60706D] flex items-start gap-2">
        <span className="text-[#167D75] font-bold text-xs mt-0.5">ℹ</span>
        <span>
          <strong>Scope note:</strong> High-income recapture worksheets (Form IT-2105-I) are fully enacted for single filers. Married Filing Jointly and Head of Household schedules will be enabled upon completion of their separate statutory worksheet verification.
        </span>
      </div>
    </div>
  );
};
