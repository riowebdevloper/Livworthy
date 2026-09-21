import React, { useState } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Building,
  Home,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { DEFAULT_NYC_100K_SCENARIO } from '../../data/presets';
import { SalaryWorthCalculator } from '../../engines/calculator-core/salary-worth';
import { formatMoney, toMajor } from '../../lib/money';
import { LivingCostBreakdownCard } from '../calculator/LivingCostBreakdownCard';
import { ResultSummaryCard } from '../calculator/ResultSummaryCard';
import { TaxBreakdownCard } from '../calculator/TaxBreakdownCard';

interface SeoArticlePageProps {
  onOpenCustomizer: () => void;
  onOpenEvidence: () => void;
  onOpenMethodology: () => void;
  onNavigateToCompare: () => void;
}

export const SeoArticlePage: React.FC<SeoArticlePageProps> = ({
  onOpenCustomizer,
  onOpenEvidence,
  onOpenMethodology,
  onNavigateToCompare,
}) => {
  const [actualRentMajor, setActualRentMajor] = useState<number | undefined>(undefined);

  const scenario = {
    ...DEFAULT_NYC_100K_SCENARIO,
    overrides: {
      actualRentMonthlyMinor: actualRentMajor ? actualRentMajor * 100 : undefined,
    },
  };

  const outcome = SalaryWorthCalculator.calculate(scenario);

  return (
    <article id="seo-landing-nyc-100k" className="space-y-10 max-w-4xl mx-auto">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-[#60706D]">
        <span>LivWorthy</span>
        <ChevronRight className="w-3 h-3 text-[#60706D]" />
        <span>United States</span>
        <ChevronRight className="w-3 h-3 text-[#60706D]" />
        <span>New York City</span>
        <ChevronRight className="w-3 h-3 text-[#60706D]" />
        <span className="text-[#102A2E] font-semibold">$100,000 Salary Intelligence</span>
      </nav>

      {/* 2. H1 */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight leading-tight">
          Is $100K a Good Salary in New York City?
        </h1>
        <p className="text-xs sm:text-sm text-[#60706D] mt-2">
          Verified analysis based on 2024 IRS tax schedules, NYS/NYC resident tax tables, HUD Fair Market Rents, and BLS metro expenditure weights.
        </p>
      </div>

      {/* 3. Short Direct Answer */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border-l-4 border-l-[#167D75] border border-[#DCE3E0] shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-[#167D75] block mb-1">
          Direct Editorial Answer
        </span>
        <p className="text-base text-[#102A2E] leading-relaxed">
          <strong>Yes, for a single earner living independently in a typical 1-bedroom apartment, $100,000 is a viable, moderate salary in New York City.</strong> It yields an estimated after-tax take-home of <strong>$70,116/year ($5,843/month)</strong>. After typical housing ($2,750), food ($700), utilities ($255), and transit ($132), you are left with approximately <strong>$1,521/month in uncommitted disposable income</strong> for personal savings or lifestyle.
        </p>
        <p className="text-xs text-[#60706D] mt-2">
          However, for a couple with a non-earning partner or a family requiring 2+ bedrooms and childcare, $100,000 creates a substantial monthly deficit unless subsidized.
        </p>
      </div>

      {/* 4. Interactive Calculator Result */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#102A2E]">
            Interactive Scenario: $100K in New York City
          </h2>
          <button
            onClick={onOpenEvidence}
            className="text-xs text-[#167D75] font-semibold hover:underline flex items-center"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Data Sources
          </button>
        </div>

        <ResultSummaryCard
          outcome={outcome}
          onOpenCustomizer={onOpenCustomizer}
          onCompareCity={onNavigateToCompare}
          onOpenEvidence={onOpenEvidence}
        />
      </div>

      {/* 5. After-Tax Explanation */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#102A2E]">
          How Taxes Reduce $100,000 in NYC
        </h2>
        <p className="text-sm text-[#60706D] leading-relaxed">
          New York City residents face one of the few triple-layer income tax jurisdictions in the United States: Federal, New York State, and NYC Local resident tax, plus mandatory FICA contributions.
        </p>

        <TaxBreakdownCard tax={outcome.tax} onOpenEvidence={onOpenEvidence} />
      </div>

      {/* 6. Housing Scenarios & Override */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#102A2E]">
          Where the Money Goes: Living Costs in NYC
        </h2>
        <p className="text-sm text-[#60706D] leading-relaxed">
          Housing accounts for over 60% of basic monthly expenditures. Below is the itemized breakdown across groceries, transportation, utilities, and healthcare.
        </p>

        <LivingCostBreakdownCard
          col={outcome.costOfLiving}
          actualRentMajor={actualRentMajor}
          onOverrideRent={(r) => setActualRentMajor(r)}
          onOpenCustomizer={onOpenCustomizer}
        />
      </div>

      {/* 7. Household Scenarios (Single vs Couple vs Family) */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE3E0] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#102A2E]">
          How Household Size Transforms a $100K Salary in NYC
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F7F8F5]">
            <span className="font-bold text-sm text-[#102A2E] block">Single Earner</span>
            <span className="text-[#167D75] font-semibold block mt-0.5">1-Bedroom, Transit</span>
            <p className="text-[#60706D] mt-2">
              Remaining: <strong className="text-[#102A2E]">+$1,521/month</strong>
            </p>
            <p className="text-[#60706D] mt-1">Comfortable budget with room for 401(k) and emergency savings.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8F5]">
            <span className="font-bold text-sm text-[#102A2E] block">Couple (1 Earner)</span>
            <span className="text-[#60706D] font-semibold block mt-0.5">1-Bedroom, 2 Adults</span>
            <p className="text-[#60706D] mt-2">
              Remaining: <strong className="text-[#102A2E]">+$740/month</strong>
            </p>
            <p className="text-[#60706D] mt-1">Modest buffer. Tight discretionary spending required.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F8F5]">
            <span className="font-bold text-sm text-[#102A2E] block">Family of 3 (1 Earner)</span>
            <span className="text-amber-700 font-semibold block mt-0.5">2-Bed + Childcare</span>
            <p className="text-[#60706D] mt-2">
              Remaining: <strong className="text-red-600">−$1,280/month</strong>
            </p>
            <p className="text-[#60706D] mt-1">Deficit without second income or subsidized housing.</p>
          </div>
        </div>
      </div>

      {/* 8. Comparison with Lower-Cost Metros */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE3E0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102A2E]">
              NYC vs Austin: The Real Value of $100,000
            </h2>
            <p className="text-xs text-[#60706D] mt-0.5">
              Texas has 0% state and local income tax, and housing is ~40% lower.
            </p>
          </div>
          <button
            onClick={onNavigateToCompare}
            className="text-xs font-semibold text-[#167D75] hover:underline flex items-center"
          >
            <span>Open Interactive Compare</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="p-4 bg-[#F7F8F5] rounded-xl text-xs space-y-2">
          <p className="text-[#102A2E] font-medium leading-relaxed">
            In Austin, TX, a $100,000 salary yields <strong>$78,509 after tax</strong> ($8,393 more take-home than NYC due to zero state/local tax). Combined with lower typical rent ($1,650 vs $2,750), $100,000 in Austin leaves approximately <strong>$2,850/month in disposable income</strong>—nearly double NYC’s $1,521/month.
          </p>
        </div>
      </div>

      {/* 9. Useful FAQs */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DCE3E0] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#102A2E]">Frequently Asked Questions</h2>

        <div className="space-y-4 text-xs">
          <div className="border-b border-[#F7F8F5] pb-3">
            <h3 className="font-bold text-[#102A2E]">Can I qualify for the 40x rent rule on $100K in NYC?</h3>
            <p className="text-[#60706D] mt-1 leading-relaxed">
              Most NYC landlords require an annual gross income of 40x the monthly rent. On a $100,000 salary, your maximum lease is $2,500/month ($100,000 ÷ 40). While the median 1-bedroom across Manhattan is higher, you can readily find options in Brooklyn, Queens, or Upper Manhattan, or opt for a studio or roommate.
            </p>
          </div>

          <div className="border-b border-[#F7F8F5] pb-3">
            <h3 className="font-bold text-[#102A2E]">What is NYC Resident Personal Income Tax?</h3>
            <p className="text-[#60706D] mt-1 leading-relaxed">
              New York City is one of the few US cities with a local income tax. Anyone who maintains a permanent place of abode and spends 184+ days in the five boroughs pays NYC local tax, which ranges from 3.078% to 3.876% on taxable income. On $100,000, this equals $3,441 annually.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#102A2E]">How does LivWorthy verify these calculations?</h3>
            <p className="text-[#60706D] mt-1 leading-relaxed">
              Every tax bracket uses official IRS (Rev. Proc. 2023-34) and NYS Department of Taxation tables. Rent benchmarks utilize HUD 50th percentile Fair Market Rents and NYC Housing Vacancy Survey data. No numbers are generated by artificial intelligence.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};
