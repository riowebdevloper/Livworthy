import React from 'react';

export interface MoneyValueProps {
  /** The formatted string or numeric representation */
  amount: string;
  /** Optional prefix sign, e.g. '−' for negative living costs or '+' for savings */
  prefixSign?: '−' | '+' | '-';
  /** Optional recurring period suffix e.g. '/yr', '/mo', '/month' */
  period?: string;
  /** Text size tier preserving visual hierarchy */
  size?: 'hero' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
  /** Color theme */
  color?: 'primary' | 'teal' | 'muted' | 'danger' | 'white';
  /** Additional styling */
  className?: string;
}

const SIZE_CLASSES = {
  hero: 'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight',
  xl: 'text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight',
  lg: 'text-lg sm:text-xl font-bold tracking-tight',
  md: 'text-base sm:text-lg font-bold',
  sm: 'text-sm sm:text-base font-semibold',
  xs: 'text-xs sm:text-sm font-semibold',
};

const COLOR_CLASSES = {
  primary: 'text-[#102A2E]',
  teal: 'text-[#167D75]',
  muted: 'text-[#60706D]',
  danger: 'text-red-600',
  white: 'text-white',
};

/**
 * Standardized money value presentation ensuring tabular numerals,
 * safe text wrapping, and clean unit/period attachments.
 */
export const MoneyValue: React.FC<MoneyValueProps> = ({
  amount,
  prefixSign,
  period,
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  // Avoid double negation if amount already has a minus sign
  const displaySign = prefixSign && !amount.startsWith('−') && !amount.startsWith('-') ? prefixSign : '';
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  return (
    <span
      className={`inline-flex items-baseline font-tabular tabular-nums whitespace-nowrap ${colorClass} ${sizeClass} ${className}`}
    >
      {displaySign && <span className="mr-0.5 select-none font-sans font-bold">{displaySign}</span>}
      <span className="break-keep">{amount}</span>
      {period && (
        <span className="text-xs sm:text-sm font-normal text-[#60706D] ml-1 select-none">
          {period}
        </span>
      )}
    </span>
  );
};

export interface MoneyRowProps {
  /** Label on the left / top */
  label: React.ReactNode;
  /** Explanatory subtext */
  description?: React.ReactNode;
  /** Formatted money amount */
  amount: string;
  /** Suffix e.g. '/yr' or '/mo' */
  period?: string;
  /** Suffix position on desktop */
  periodBlock?: boolean;
  /** Sign prefix, e.g. '−' */
  prefixSign?: '−' | '+' | '-';
  /** Value size tier */
  size?: 'hero' | 'xl' | 'lg' | 'md' | 'sm';
  /** Value color theme */
  color?: 'primary' | 'teal' | 'muted' | 'danger';
  /** Additional container classes */
  className?: string;
}

/**
 * Responsive financial row:
 * - Desktop: Side-by-side layout with label allowed to flex-shrink while amount stays right-aligned and shrink-proof.
 * - Mobile: Stacks cleanly (Label on top, Amount below) when horizontal space is constrained, eliminating collisions.
 */
export const MoneyRow: React.FC<MoneyRowProps> = ({
  label,
  description,
  amount,
  period,
  periodBlock = true,
  prefixSign,
  size = 'xl',
  color = 'primary',
  className = '',
}) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.xl;
  const colorClass = COLOR_CLASSES[color] || COLOR_CLASSES.primary;
  const displaySign = prefixSign && !amount.startsWith('−') && !amount.startsWith('-') ? prefixSign : '';

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-4 border-b border-[#F7F8F5] pb-4 ${className}`}
    >
      <div className="min-w-0 flex-1 pr-0 sm:pr-2">
        {typeof label === 'string' ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-[#60706D] block">
            {label}
          </span>
        ) : (
          label
        )}
        {description && (
          <p className="text-xs text-[#60706D] mt-0.5 leading-relaxed break-words">
            {description}
          </p>
        )}
      </div>

      <div className="shrink-0 flex sm:block items-baseline justify-between sm:text-right gap-2 pt-1 sm:pt-0">
        <span
          className={`font-bold font-tabular tabular-nums tracking-tight whitespace-nowrap ${colorClass} ${sizeClass}`}
        >
          {displaySign && <span className="mr-0.5 select-none font-sans font-bold">{displaySign}</span>}
          <span>{amount}</span>
        </span>
        {period && (
          <span
            className={`text-xs text-[#60706D] font-normal ${
              periodBlock ? 'sm:block ml-1 sm:ml-0' : 'ml-1 inline'
            }`}
          >
            {period}
          </span>
        )}
      </div>
    </div>
  );
};
