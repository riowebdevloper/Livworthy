import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, DollarSign, ShieldCheck, Sparkles, Building2, Loader2, AlertCircle } from 'lucide-react';
import { CITIES, COUNTRIES } from '../../data/locations';
import { calculateSalaryAfterTax } from '../../api/calculators';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { TaxResult, FilingStatus } from '../../types/tax';
import { CurrencyInput } from '../ui/CurrencyInput';

interface SalaryAfterTaxViewProps {
  onSwitchToSalaryWorthWithSalary: (salaryMajor: number, cityId?: string) => void;
  onOpenEvidence: () => void;
  onCalculationResult?: (result: TaxResult) => void;
}

export const SalaryAfterTaxView: React.FC<SalaryAfterTaxViewProps> = ({
  onSwitchToSalaryWorthWithSalary,
  onOpenEvidence,
  onCalculationResult,
}) => {
  const [grossSalaryMajor, setGrossSalaryMajor] = useState<number>(100000);
  const [selectedCityId, setSelectedCityId] = useState<string>('nyc');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [payFrequency, setPayFrequency] = useState<'annual' | 'monthly' | 'biweekly'>('annual');
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('VERIFIED');
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [calcError, setCalcError] = useState<string | null>(null);

  const city = CITIES[selectedCityId] || CITIES.nyc;
  const currency = city.currency;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsCalculating(true);
    setCalcError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await calculateSalaryAfterTax(
          {
            grossSalaryMinor: Math.round(grossSalaryMajor * 100),
            currency,
            countryId: city.countryId,
            regionId: city.regionId,
            cityId: city.id,
            taxJurisdictionId: city.taxJurisdictionId,
            filingStatus,
            dependentsCount: 0,
            taxYear: 2024,
          },
          { signal: controller.signal }
        );

        if (response.success && response.data) {
          setTaxResult(response.data);
          setVerificationStatus(response.verificationStatus || 'VERIFIED');
          onCalculationResult?.(response.data);
        } else {
          setCalcError('Tax calculation failed. Please check inputs.');
        }
      } catch (err: any) {
        if (err.errorCode === 'REQUEST_CANCELLED') return;
        setCalcError(err.message || 'Tax engine service unavailable.');
      } finally {
        setIsCalculating(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [grossSalaryMajor, selectedCityId, filingStatus, currency, city, onCalculationResult]);

  const getFreqAmount = (annualMinor: number) => {
    if (payFrequency === 'monthly') return Math.round(annualMinor / 12);
    if (payFrequency === 'biweekly') return Math.round(annualMinor / 26);
    return annualMinor;
  };

  const netDisplay = taxResult
    ? formatMoney({
        amountMinor: getFreqAmount(taxResult.netIncome.amountMinor),
        currency,
      })
    : '$0';

  const grossDisplay = taxResult
    ? formatMoney({
        amountMinor: getFreqAmount(taxResult.grossIncome.amountMinor),
        currency,
      })
    : '$0';

  const taxDisplay = taxResult
    ? formatMoney({
        amountMinor: getFreqAmount(taxResult.totalDeductionsAndTaxes.amountMinor),
        currency,
      })
    : '$0';

  return (
    <div id="salary-after-tax-view" className="space-y-8">
      {/* Input Header */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 sm:p-8 shadow-xs relative">
        {isCalculating && (
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-semibold text-[#0D524D] bg-[#DDF2EC] px-2.5 py-1 rounded-full animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Calculating statutory tax...</span>
          </div>
        )}

        <div className="max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#167D75]">
              Precision Tax Calculator
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                verificationStatus === 'VERIFIED'
                  ? 'bg-[#DDF2EC] text-[#0D625B]'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {verificationStatus} ADAPTER
            </span>
          </div>
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
              onChangeMajor={(val) => setGrossSalaryMajor(val)}
            />
          </div>

          <div>
            <label htmlFor="tax-location-select" className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
              Location & Jurisdiction
            </label>
            <select
              id="tax-location-select"
              aria-label="Location & Jurisdiction"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] px-3 py-3 text-base font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
            >
              {Object.values(CITIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.countryId})
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
              onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
              className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] px-3 py-3 text-base font-bold text-[#102A2E] focus:border-[#167D75] focus:outline-hidden"
            >
              <option value="single">Single Filer</option>
              <option value="married_filing_jointly">Married Filing Jointly</option>
              <option value="head_of_household">Head of Household</option>
            </select>
          </div>
        </div>

        {/* Frequency Toggle */}
        <div className="mt-6 pt-4 border-t border-[#F7F8F5] flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-[#F7F8F5] p-1 rounded-lg border border-[#DCE3E0]">
            <span className="text-xs text-[#60706D] font-medium px-2">Show:</span>
            {(['annual', 'monthly', 'biweekly'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setPayFrequency(freq)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  payFrequency === freq
                    ? 'bg-[#102A2E] text-white'
                    : 'text-[#60706D] hover:text-[#102A2E]'
                }`}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenEvidence}
            className="text-xs text-[#167D75] font-semibold hover:underline flex items-center"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> View Statutory Rates & Evidence
          </button>
        </div>
      </div>

      {/* Error state */}
      {calcError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{calcError}</span>
        </div>
      )}

      {/* Result Cards */}
      {taxResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60706D]">
                Spendable Cash
              </span>
              <h3 className="text-xl font-bold text-[#102A2E] mt-0.5">
                Estimated Net Take-Home Pay
              </h3>
              <p className="text-xs text-[#60706D] mt-1">
                Your actual in-pocket income after all statutory withholdings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F8F5]">
              <span className="text-3xl sm:text-4xl font-black text-[#167D75] font-tabular">
                {netDisplay}
              </span>
              <span className="text-xs text-[#60706D] block mt-1">
                Effective Take-Home Rate: {Math.round((1 - taxResult.effectiveTaxRate) * 1000) / 10}%
              </span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60706D]">
                Total Deductions
              </span>
              <h3 className="text-xl font-bold text-[#102A2E] mt-0.5">
                Total Deducted Taxes & FICA
              </h3>
              <p className="text-xs text-[#60706D] mt-1">
                Combined income taxes, social security, and health contributions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F8F5]">
              <span className="text-3xl sm:text-4xl font-black text-[#60706D] font-tabular">
                {taxDisplay}
              </span>
              <span className="text-xs text-[#60706D] block mt-1">
                Effective Total Tax Rate: {Math.round(taxResult.effectiveTaxRate * 1000) / 10}%
              </span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60706D]">
                Living Worth
              </span>
              <h3 className="text-xl font-bold text-[#102A2E] mt-0.5">
                Living Cost Feasibility
              </h3>
              <p className="text-xs text-[#60706D] mt-1">
                See what remains after local housing, food, and living expenses in {city.name}.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F7F8F5]">
              <button
                onClick={() => onSwitchToSalaryWorthWithSalary(grossSalaryMajor, city.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#102A2E] text-white text-xs font-bold hover:bg-[#167D75] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Calculate Living Cost Feasibility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Deductions Table */}
      {taxResult && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE3E0] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F7F8F5]">
            <div>
              <h3 className="text-base font-bold text-[#102A2E]">Itemized Statutory Tax Schedule</h3>
              <p className="text-xs text-[#60706D]">
                Rule Version: <span className="font-mono text-[#167D75] font-semibold">{taxResult.taxRuleVersion}</span>
              </p>
            </div>
            <span className="text-xs font-medium text-[#60706D]">
              Marginal Top Bracket: {Math.round(taxResult.marginalTaxRate * 100)}%
            </span>
          </div>

          <div className="divide-y divide-[#F7F8F5] mt-2 text-xs">
            {taxResult.components.map((c, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#102A2E]">{c.name}</span>
                  <span className="text-[11px] text-[#60706D] block">{c.authority} · {c.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#102A2E] font-tabular">
                    {formatMoney({
                      amountMinor: getFreqAmount(c.amount.amountMinor),
                      currency,
                    })}
                  </span>
                  <span className="text-[11px] text-[#60706D] block">
                    {Math.round(c.effectiveRate * 1000) / 10}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
