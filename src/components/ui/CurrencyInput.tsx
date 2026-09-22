import React, { useState, useEffect } from 'react';
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
  AED: 'AED',
  AUD: 'A$',
  SAR: 'SAR',
  CHF: 'CHF',
  SGD: 'S$',
  QAR: 'QAR',
  NZD: 'NZ$',
  INR: '₹',
  JPY: '¥',
  KRW: '₩',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  ILS: '₪',
  HKD: 'HK$',
  BRL: 'R$',
  MXN: 'Mex$',
  IDR: 'Rp',
  MYR: 'RM',
  PHP: '₱',
  ZAR: 'R',
  PLN: 'zł',
  CZK: 'Kč',
  THB: '฿',
  VND: '₫',
};

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  valueMajor,
  currency,
  onChangeMajor,
  helperText,
  max = 100_000_000,
  disabled = false,
}) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState(valueMajor === 0 ? '' : valueMajor.toString());

  useEffect(() => {
    if (!isFocused) {
      setRawText(valueMajor === 0 ? '' : valueMajor.toString());
    }
  }, [valueMajor, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep digits only
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setRawText(digits);
    const parsed = parseInt(digits, 10);
    onChangeMajor(isNaN(parsed) ? 0 : Math.min(max, parsed));
  };

  const handleFocus = () => {
    setIsFocused(true);
    setRawText(valueMajor === 0 ? '' : valueMajor.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Formatted with thousands separators when idle; raw digits when actively typing
  const displayValue = isFocused
    ? rawText
    : valueMajor === 0
    ? ''
    : valueMajor.toLocaleString('en-US');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[#102A2E] mb-1.5 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center rounded-lg border border-[#DCE3E0] bg-[#FFFFFF] focus-within:border-[#167D75] focus-within:ring-2 focus-within:ring-[#167D75]/20 shadow-xs transition-colors">
        {/* Dedicated currency badge container with distinct spacing preventing overlap */}
        <div className="flex items-center pl-3.5 pr-2.5 select-none shrink-0 pointer-events-none">
          <span className="text-[#60706D] font-bold text-base sm:text-lg">
            {symbol}
          </span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id={id}
          name={id}
          value={displayValue}
          placeholder="0"
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className="block w-full rounded-r-lg bg-transparent pr-4 py-2.5 sm:py-3 text-base sm:text-lg font-bold text-[#102A2E] font-tabular tabular-nums placeholder-[#60706D]/40 focus:outline-hidden"
        />
      </div>
      {helperText && <p className="mt-1 text-xs text-[#60706D]">{helperText}</p>}
    </div>
  );
};
