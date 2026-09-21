import React, { useState } from 'react';
import { ArrowRight, DollarSign, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { CITIES, COUNTRIES } from '../../data/locations';
import { TaxRegistry } from '../../engines/tax/tax-registry';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { TaxResult } from '../../types/tax';
import { CurrencyInput } from '../ui/CurrencyInput';

interface SalaryAfterTaxViewProps {
  onSwitchToSalaryWorthWithSalary: (salaryMajor: number, cityId?: string) => void;
  onOpenEvidence: () => void;
}

export const SalaryAfterTaxView: React.FC<SalaryAfterTaxViewProps> = ({
  onSwitchToSalaryWorthWithSalary,
  onOpenEvidence,
}) => {
  const [grossSalaryMajor, setGrossSalaryMajor] = useState<number>(100000);
  const [selectedCityId, setSelectedCityId] = useState<string>('nyc');
  const [filingStatus, setFilingStatus] = useState<'single' | 'married_filing_jointly'>('single');
  const [payFrequency, setPayFrequency] = useState<'annual' | 'monthly' | 'biweekly'>('annual');

  const city = CITIES[selectedCityId] || CITIES.nyc;
  const currency = city.currency;
  const grossMoney = createMoney(grossSalaryMajor, currency);

  const taxResult: TaxResult = TaxRegistry.calculate(
    grossMoney,
    { filingStatus, dependentsCount: 0, taxYear: 2024 },
    {
      countryId: city.countryId,
      regionId: city.regionId,
      cityId: city.id,
      taxJurisdictionId: city.taxJurisdictionId,
    }
  );

  const getFreqAmount = (annualMinor: number) => {
    if (payFrequency === 'monthly') return Math.round(annualMinor / 12);
    if (payFrequency === 'biweekly') return Math.round(annualMinor / 26);
    return annualMinor;
  };

  const netDisplay = formatMoney({
    amountMinor: getFreqAmount(taxResult.netIncome.amountMinor),
    currency,
  });

  const grossDisplay = formatMoney({
    amountMinor: getFreqAmount(taxResult.grossIncome.amountMinor),
    currency,
  });

  const taxDisplay = formatMoney({
    amountMinor: getFreqAmount(taxResult.totalDeductionsAndTaxes.amountMinor),
    currency,
  });

  return (
    <div id="salary-after-tax-view" className="space-y-8">
      {/* Input Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
            Precision Tax Calculator
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2E] mt-1 tracking-tight">
            Salary After Tax Calculator
          </h2>
          <p className="text-xs sm:text-sm text-[#60706D] mt-1.5">
            Instant statutory breakdown including federal tax, state tax, local city resident tax, and social contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#F7F8F5]">
          <div className="sm:col-span-1">
            <CurrencyInput
              id="tax-gross-salary-input"
              label="Annual Gross Salary"
              valueMajor={grossSalaryMajor}
              currency={currency}
              onChangeMajor={(v) => setGrossSalaryMajor(v)}
            />
          </div>

          <div>
            <label htmlFor="tax-city-select" className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              Jurisdiction / City
            </label>
            <select
              id="tax-city-select"
              aria-label="Jurisdiction / City"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] px-3 py-3 text-base font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
            >
              {Object.values(CITIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({COUNTRIES[c.countryId]?.name || c.countryId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tax-filing-status-select" className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              Filing Status
            </label>
            <select
              id="tax-filing-status-select"
              aria-label="Filing Status"
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as any)}
              className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] px-3 py-3 text-base font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
            >
              <option value="single">Single</option>
              <option value="married_filing_jointly">Married Filing Jointly</option>
            </select>
          </div>
        </div>

        {/* Frequency selector */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-[#F7F8F5]">
          <span className="text-xs text-[#60706D] font-medium">Display Frequency:</span>
          {(['annual', 'monthly', 'biweekly'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => setPayFrequency(freq)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                payFrequency === freq
                  ? 'bg-[#102A2E] text-white'
                  : 'text-[#60706D] hover:bg-[#F7F8F5] border border-[#DCE3E0]'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#F7F8F5] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
              Estimated Net Take-Home Pay
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#102A2E] font-tabular mt-1">
              {netDisplay}
              <span className="text-sm font-normal text-[#60706D] ml-2">
                /{payFrequency === 'annual' ? 'year' : payFrequency === 'monthly' ? 'month' : 'bi-weekly'}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#60706D] block">Effective Total Tax Rate</span>
            <span className="text-xl font-bold text-[#102A2E] font-tabular">
              {(taxResult.effectiveTaxRate * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Component breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
          <div className="p-4 rounded-xl bg-[#F7F8F5]">
            <span className="text-xs text-[#60706D] block">Gross Pay</span>
            <span className="text-lg font-bold text-[#102A2E] font-tabular">{grossDisplay}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#F7F8F5]">
            <span className="text-xs text-[#60706D] block">Total Deducted Taxes & FICA</span>
            <span className="text-lg font-bold text-[#60706D] font-tabular">−{taxDisplay}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#DDF2EC]/40 border border-[#167D75]/20">
            <span className="text-xs text-[#167D75] font-semibold block">Marginal Top Tax Rate</span>
            <span className="text-lg font-bold text-[#167D75] font-tabular">
              {(taxResult.marginalTaxRate * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Statutory schedule list */}
        <div className="space-y-2 mt-4">
          {taxResult.components.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#FFFFFF] border border-[#DCE3E0]/70"
            >
              <div>
                <span className="text-xs font-bold text-[#102A2E]">{c.name}</span>
                <span className="text-[11px] text-[#60706D] ml-2">({c.authority})</span>
              </div>
              <span className="text-sm font-bold text-[#102A2E] font-tabular">
                {formatMoney({
                  amountMinor: getFreqAmount(c.amount.amountMinor),
                  currency,
                })}
              </span>
            </div>
          ))}
        </div>

        {/* BRIDGE TO LIVWORTH: "What does this take-home actually buy where you live?" */}
        <div className="mt-8 p-6 rounded-2xl bg-[#102A2E] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#DDF2EC] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Living Intelligence Bridge</span>
            </div>
            <h4 className="text-lg font-bold mt-1">
              What does this take-home pay actually buy in {city.name}?
            </h4>
            <p className="text-xs text-[#DDF2EC]/80 mt-1 max-w-lg">
              Take-home pay tells only half the story. See how much remains after local rent, groceries, transit, and utilities.
            </p>
          </div>

          <button
            onClick={() => onSwitchToSalaryWorthWithSalary(grossSalaryMajor, city.id)}
            className="px-5 py-3 rounded-xl bg-[#167D75] text-white font-bold text-xs hover:bg-[#DDF2EC] hover:text-[#102A2E] transition-colors flex items-center space-x-2 shrink-0 shadow-md"
          >
            <span>Calculate my LivWorthy Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
