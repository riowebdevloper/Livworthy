import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  Building,
  Home,
  ArrowRight,
  TrendingUp,
  Scale,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { CITIES, COUNTRIES } from '../../data/locations';
import { SALARY_GUIDES, POPULAR_GUIDES_LIST, SalaryGuide } from '../../data/salary-guides';
import { calculateSalaryWorth } from '../../api/calculators';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../../types/scenario';
import { createMoney, formatMoney, toMajor } from '../../lib/money';
import { LivingCostBreakdownCard } from '../calculator/LivingCostBreakdownCard';
import { ResultSummaryCard } from '../calculator/ResultSummaryCard';
import { TaxBreakdownCard } from '../calculator/TaxBreakdownCard';

interface SeoArticlePageProps {
  initialGuideSlug?: string;
  onOpenCustomizer: () => void;
  onOpenEvidence: () => void;
  onOpenMethodology: () => void;
  onNavigateToCompare: () => void;
  onNavigateHome: () => void;
  onNavigateCity: (cityId: string) => void;
  onNavigateCountry: (countryId: string) => void;
  onSelectGuide?: (slug: string) => void;
}

export const SeoArticlePage: React.FC<SeoArticlePageProps> = ({
  initialGuideSlug = 'nyc-100k',
  onOpenCustomizer,
  onOpenEvidence,
  onOpenMethodology,
  onNavigateToCompare,
  onNavigateHome,
  onNavigateCity,
  onNavigateCountry,
  onSelectGuide,
}) => {
  const [currentSlug, setCurrentSlug] = useState<string>(initialGuideSlug);
  const [actualRentMajor, setActualRentMajor] = useState<number | undefined>(undefined);
  const [outcome, setOutcome] = useState<LivWorthCalculationOutcome | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);

  // Sync when initial prop changes
  useEffect(() => {
    if (initialGuideSlug && SALARY_GUIDES[initialGuideSlug]) {
      setCurrentSlug(initialGuideSlug);
    }
  }, [initialGuideSlug]);

  const activeGuide: SalaryGuide = SALARY_GUIDES[currentSlug] || SALARY_GUIDES['nyc-100k'];
  const city = CITIES[activeGuide.cityId] || CITIES.nyc;
  const country = COUNTRIES[activeGuide.countryId] || COUNTRIES.US;

  // Construct scenario dynamically for this guide
  const scenario: LivWorthScenario = {
    location: city,
    compensation: {
      baseSalary: createMoney(activeGuide.salaryMajor, city.currency),
    },
    household: {
      adults: 1,
      children: 0,
      housingType: '1-bedroom',
      areaType: 'typical',
      transportMode: 'public_transit',
      carsCount: 0,
      lifestyleLevel: 'moderate',
      preset: 'single',
    },
    taxProfile: {
      filingStatus: 'single',
      dependentsCount: 0,
      taxYear: 2024,
    },
    overrides: {
      actualRentMonthlyMinor: actualRentMajor ? Math.round(actualRentMajor * 100) : undefined,
    },
    displayCurrency: city.currency,
    calculationDate: new Date().toISOString(),
  };

  useEffect(() => {
    let isMounted = true;
    setIsCalculating(true);

    calculateSalaryWorth(scenario)
      .then((res) => {
        if (isMounted && res.data) {
          setOutcome(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to calculate salary worth for SEO article:', err);
      })
      .finally(() => {
        if (isMounted) setIsCalculating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSlug, actualRentMajor]);

  const handleSwitchGuide = (slug: string) => {
    setCurrentSlug(slug);
    setActualRentMajor(undefined);
    onSelectGuide?.(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formattedSalary = formatMoney(createMoney(activeGuide.salaryMajor, activeGuide.currency), { hideDecimals: true });
  const formattedTakeHome = outcome ? formatMoney(outcome.takeHomeAnnual, { hideDecimals: true }) : '...';
  const formattedMonthlyTakeHome = outcome ? formatMoney(outcome.takeHomeMonthly, { hideDecimals: true }) : '...';
  const formattedMonthlyLiving = outcome ? formatMoney(outcome.livingCostsMonthly, { hideDecimals: true }) : '...';
  const formattedMonthlyRemaining = outcome ? formatMoney(outcome.moneyRemainingMonthly, { hideDecimals: true }) : '...';

  return (
    <article id={`seo-landing-${activeGuide.slug}`} className="space-y-10 max-w-4xl mx-auto">
      {/* 1. Fully Clickable Interactive Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-[#60706D] bg-white p-3 rounded-xl border border-[#DCE3E0] shadow-2xs">
        <button
          type="button"
          onClick={onNavigateHome}
          className="hover:text-[#167D75] font-medium transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-[#60706D]" />
        <button
          type="button"
          onClick={() => onNavigateCountry(country.id)}
          className="hover:text-[#167D75] font-medium transition-colors cursor-pointer"
        >
          {country.name}
        </button>
        <ChevronRight className="w-3 h-3 text-[#60706D]" />
        <button
          type="button"
          onClick={() => onNavigateCity(city.id)}
          className="hover:text-[#167D75] font-medium transition-colors cursor-pointer"
        >
          {city.name}
        </button>
        <ChevronRight className="w-3 h-3 text-[#60706D]" />
        <span className="text-[#102A2E] font-bold">
          {formattedSalary} Salary Intelligence
        </span>
      </nav>

      {/* Guide Switcher Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DCE3E0] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#167D75]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#102A2E]">
            Global City Salary Guides:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_GUIDES_LIST.map((g) => (
            <button
              key={g.slug}
              type="button"
              onClick={() => handleSwitchGuide(g.slug)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                g.slug === currentSlug
                  ? 'bg-[#167D75] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-[#DDF2EC] hover:text-[#0D524D] text-slate-700'
              }`}
            >
              {g.cityId.toUpperCase()}: {g.currency} {g.salaryMajor >= 1000 ? `${(g.salaryMajor / 1000).toFixed(0)}k` : g.salaryMajor}
            </button>
          ))}
        </div>
      </div>

      {/* 2. H1 Headline & Context */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DDF2EC] text-[#0D524D] text-xs font-bold rounded-full mb-3">
          <span>{country.name}</span>
          <span>•</span>
          <span>{city.name}</span>
          <span>•</span>
          <span>Statutory Tax Status: {country.verificationStatus}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A2E] tracking-tight leading-tight">
          {activeGuide.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#60706D] mt-2 leading-relaxed">
          Authoritative financial intelligence analyzing statutory deductions, local housing benchmarks, itemized necessities, and discretionary savings in {city.name}.
        </p>
      </div>

      {/* 3. Direct Editorial Answer Card */}
      <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-2xl border-l-4 border-l-[#167D75] border border-[#DCE3E0] shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#167D75] block">
          Direct Editorial & Financial Verdict
        </span>
        <p className="text-base text-[#102A2E] leading-relaxed">
          <strong>{activeGuide.headlineSummary}</strong> At an annual gross salary of <strong>{formattedSalary}</strong>, an earner takes home an estimated <strong>{formattedTakeHome}/year ({formattedMonthlyTakeHome}/month)</strong> after statutory national, regional, and social payroll contributions.
        </p>
        <p className="text-sm text-[#374151] leading-relaxed">
          {activeGuide.lifestyleContext}
        </p>
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-[#60706D] gap-2">
          <span>Benchmark Context: {activeGuide.benchmarkContext}</span>
          <button
            type="button"
            onClick={onOpenMethodology}
            className="text-[#167D75] hover:underline font-medium cursor-pointer"
          >
            Review Statutory Assumptions →
          </button>
        </div>
      </div>

      {/* 4. Interactive Live Scenario Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#102A2E]">
              Interactive Scenario Breakdown: {formattedSalary} in {city.name}
            </h2>
            <p className="text-xs text-[#60706D]">
              Adjust rent or household structure to model your personal situation in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCustomizer}
            className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DCE3E0] bg-white hover:bg-slate-50 text-[#102A2E] transition-colors cursor-pointer"
          >
            Customize Household & Tax Profile
          </button>
        </div>

        {outcome && (
          <ResultSummaryCard
            outcome={outcome}
            onOpenCustomizer={onOpenCustomizer}
            onCompareCity={onNavigateToCompare}
            onOpenEvidence={onOpenEvidence}
          />
        )}
      </div>

      {/* 5. Itemized Living Costs Breakdown */}
      {outcome?.costOfLiving && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[#102A2E]">
            Cost of Living in {city.name} for Single Earner
          </h2>
          <LivingCostBreakdownCard
            col={outcome.costOfLiving}
            actualRentMajor={actualRentMajor}
            onOverrideRent={(rent) => setActualRentMajor(rent)}
            onOpenCustomizer={onOpenCustomizer}
          />
        </div>
      )}

      {/* 6. Itemized Tax Breakdown */}
      {outcome?.tax && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[#102A2E]">
            Statutory Tax Deductions ({outcome.taxRuleVersion || city.taxJurisdictionId})
          </h2>
          <TaxBreakdownCard
            tax={outcome.tax}
            onOpenEvidence={onOpenEvidence}
          />
        </div>
      )}

      {/* 7. Action CTA Bar */}
      <div className="bg-[#102A2E] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Relocating or Evaluating an Offer?</h3>
          <p className="text-xs text-slate-300 mt-1">
            Compare what {formattedSalary} in {city.name} equals in other major cities like London, Dubai, or Singapore.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigateCity(city.id);
            onNavigateToCompare();
          }}
          className="inline-flex items-center space-x-2 bg-[#167D75] hover:bg-[#0D524D] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer"
        >
          <span>Compare With Another City</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 8. More City Salary Guides (All Interlinked) */}
      <section className="pt-6 border-t border-[#DCE3E0] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#102A2E]">
            Explore More City Salary Benchmarks
          </h3>
          <span className="text-xs text-[#60706D]">Deterministic living intelligence</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {POPULAR_GUIDES_LIST.filter((g) => g.slug !== currentSlug).slice(0, 6).map((g) => {
            const guideCity = CITIES[g.cityId] || CITIES.nyc;
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => handleSwitchGuide(g.slug)}
                className="p-4 bg-white border border-[#DCE3E0] rounded-xl hover:border-[#167D75] hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#167D75] block mb-1">
                    {guideCity.name}, {COUNTRIES[g.countryId]?.name || g.countryId}
                  </span>
                  <span className="font-bold text-sm text-[#102A2E] group-hover:text-[#167D75] transition-colors block line-clamp-2">
                    {g.title}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Gross: {g.currency} {g.salaryMajor.toLocaleString()}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#167D75] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </article>
  );
};
