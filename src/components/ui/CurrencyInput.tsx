import React from 'react';
import { CurrencyCode } from '../../types/money';

interface CurrencyInputProps {
  id: string;
  label?: string;
  valueMajor: number;
  currency: CurrencyCode;
  onChangeMajor: (val: number) => void;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'CA$',
  AED: 'AED ',
  AUD: 'A$',
  SAR: 'SAR ',
  CHF: 'CHF ',
  SGD: 'S$',
  QAR: 'QAR ',
  NZD: 'NZ$',
  INR: '₹',
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  valueMajor,
  currency,
  onChangeMajor,
  helperText,
  min = 0,
  max = 10_000_000,
  step = 1000,
  disabled = false,
}) => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <span className="text-[#60706D] font-medium text-base sm:text-lg">{symbol}</span>
        </div>
        <input
          type="number"
          id={id}
          name={id}
          value={valueMajor === 0 ? '' : valueMajor}
          placeholder="0"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            onChangeMajor(isNaN(raw) ? 0 : Math.max(0, raw));
          }}
          className="block w-full rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] pl-10 pr-4 py-2.5 sm:py-3 text-base sm:text-lg font-bold text-[#102A2E] font-tabular placeholder-[#60706D]/40 focus:border-[#167D75] focus:ring-2 focus:ring-[#167D75]/20 focus:outline-hidden transition-colors"
        />
      </div>
      {helperText && <p className="mt-1 text-xs text-[#60706D]">{helperText}</p>}
    </div>
  );
};
