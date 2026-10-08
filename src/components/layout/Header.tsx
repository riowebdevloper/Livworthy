import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, ShieldCheck, Scale, ArrowLeftRight, Calculator, DollarSign, Home, Globe, Compass, CheckCircle2 } from 'lucide-react';
import { LivWorthLogo } from '../ui/LivWorthBrand';
import { SupportedLocale, SUPPORTED_LOCALES, TIER_1_LOCALES, TRANSLATIONS, getDictionary } from '../../lib/i18n';
import { LanguageModal } from './LanguageModal';

export type ActiveTab =
  | 'salary-worth'
  | 'salary-needed'
  | 'salary-after-tax'
  | 'cost-of-living'
  | 'compare'
  | 'job-offers'
  | 'nyc-100k-guide';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenEvidence: () => void;
  onOpenMethodology: () => void;
  onOpenDiagnostics?: () => void;
  locale?: SupportedLocale;
  onSelectLocale?: (locale: SupportedLocale) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  locale = 'en',
  onSelectLocale,
}) => {
  const navRef = useRef<HTMLElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const dict = getDictionary(locale);

  const checkScroll = useCallback(() => {
    if (!navRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Close language menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Center the active tab in view whenever activeTab changes
  useEffect(() => {
    if (!navRef.current) return;
    const activeButton = navRef.current.querySelector<HTMLElement>(`#tab-${activeTab}`);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'center',
      });
    }
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [activeTab, checkScroll]);

  return (
    <header id="livworthy-header" data-testid="livworth-header" className="bg-[#FFFFFF] border-b border-[#DCE3E0] sticky top-0 z-40 w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-1.5 min-[360px]:px-2 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2">
          {/* Brand Logo — keyboard-accessible anchor to homepage */}
          <a
            href="/"
            id="header-logo-link"
            className="flex items-center space-x-1 sm:space-x-3 group py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] focus-visible:ring-offset-2 rounded shrink-0"
            aria-label={dict.accessibility.logoHomeAriaLabel}
            title={dict.accessibility.logoHomeTitle}
          >
            <LivWorthLogo size="sm" className="[&_img]:h-6 [&_img]:sm:h-8" />
          </a>

          {/* Public navigation: How It Works, Sources, Coverage, Relocation, Language Selector */}
          <nav aria-label={dict.accessibility.siteNavigationAriaLabel} className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <a
              id="nav-how-it-works"
              href="/methodology"
              className="inline-flex items-center space-x-0.5 min-[360px]:space-x-1 sm:space-x-1.5 text-[11px] min-[360px]:text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-1.5 min-[360px]:px-2 sm:px-2.5 py-1 min-[360px]:py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] shrink-0"
              aria-label={dict.accessibility.navHowItWorksAriaLabel}
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
              <span>{t.navHowItWorks}</span>
            </a>
            <a
              id="nav-sources"
              href="/sources"
              className="inline-flex items-center space-x-0.5 min-[360px]:space-x-1 sm:space-x-1.5 text-[11px] min-[360px]:text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-1.5 min-[360px]:px-2 sm:px-2.5 py-1 min-[360px]:py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] shrink-0"
              aria-label={dict.accessibility.navSourcesAriaLabel}
            >
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#167D75] shrink-0" aria-hidden="true" />
              <span>{t.navSources}</span>
            </a>
            <a
              id="nav-coverage"
              href="/coverage"
              className="hidden md:inline-flex items-center space-x-1 sm:space-x-1.5 text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2 sm:px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75]"
              aria-label={dict.accessibility.navCoverageAriaLabel}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#167D75] shrink-0" aria-hidden="true" />
              <span>{t.navCoverage}</span>
            </a>
            <a
              id="nav-relocation"
              href="/relocation"
              className="hidden lg:inline-flex items-center space-x-1 sm:space-x-1.5 text-xs sm:text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-2 sm:px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75]"
              aria-label={dict.accessibility.navRelocationAriaLabel}
            >
              <Compass className="w-3.5 h-3.5 text-[#167D75] shrink-0" aria-hidden="true" />
              <span>{t.navRelocation}</span>
            </a>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                id="lang-selector-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="inline-flex items-center space-x-0.5 min-[360px]:space-x-1 px-1.5 min-[360px]:px-2 py-1 min-[360px]:py-1.5 text-[11px] min-[360px]:text-xs font-semibold rounded border border-[#DCE3E0] bg-[#FFFFFF] hover:bg-[#F7F8F5] text-[#102A2E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] shrink-0"
                aria-label={dict.accessibility.languageSuggestionAriaLabel}
                aria-haspopup="true"
                aria-expanded={isLangMenuOpen}
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#167D75] shrink-0" aria-hidden="true" />
                <span className="uppercase">{locale}</span>
                <span className="text-[10px] text-[#60706D]">▾</span>
              </button>

              {isLangMenuOpen && (
                <div
                  id="lang-dropdown"
                  role="menu"
                  className="absolute right-0 mt-1.5 w-44 bg-white border border-[#DCE3E0] rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto"
                >
                  {TIER_1_LOCALES.map((loc) => {
                    const cfg = SUPPORTED_LOCALES[loc];
                    const isCurrent = loc === locale;
                    return (
                      <button
                        key={loc}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          onSelectLocale?.(loc);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#F7F8F5] transition-colors ${
                          isCurrent ? 'bg-[#DDF2EC] text-[#102A2E] font-bold' : 'text-[#334D4A]'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <span>{cfg.flag}</span>
                          <span>{cfg.nativeName}</span>
                        </span>
                        {isCurrent && <span className="text-[#167D75] font-bold">✓</span>}
                      </button>
                    );
                  })}
                  <div className="border-t border-[#DCE3E0] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLangMenuOpen(false);
                        setIsLanguageModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#167D75] font-semibold hover:bg-[#F7F8F5] transition-colors flex items-center justify-between"
                    >
                      <span>{dict.languageSelector.allLanguages}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <LanguageModal
              isOpen={isLanguageModalOpen}
              onClose={() => setIsLanguageModalOpen(false)}
            />
          </nav>
        </div>

        {/* Calculator Navigation Tabs Bar with visual horizontal scroll affordances */}
        <div className="relative border-t border-[#F7F8F5] bg-white group w-full overflow-hidden">
          {/* Left scroll affordance gradient */}
          {canScrollLeft && (
            <div
              className="pointer-events-none select-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-10 flex items-center pl-1 text-[#60706D]"
              aria-hidden="true"
            >
              <span className="pointer-events-none select-none text-[10px] bg-white/90 rounded-full px-1 shadow-xs border border-[#DCE3E0]">‹</span>
            </div>
          )}

          {/* Right scroll affordance gradient */}
          {canScrollRight && (
            <div
              className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-10 flex items-center justify-end pr-1 text-[#60706D]"
              aria-hidden="true"
            >
              <span className="pointer-events-none select-none text-[10px] bg-white/90 rounded-full px-1 shadow-xs border border-[#DCE3E0]">›</span>
            </div>
          )}

          <nav
            ref={navRef}
            onScroll={checkScroll}
            aria-label={dict.accessibility.calculatorTabsAriaLabel}
            className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 overscroll-x-contain touch-pan-x [scrollbar-width:thin] [scrollbar-color:#DCE3E0_transparent] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#DCE3E0] hover:[&::-webkit-scrollbar-thumb]:bg-[#167D75]"
          >
            <button
              id="tab-salary-worth"
              onClick={() => onSelectTab('salary-worth')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'salary-worth'
                  ? 'bg-[#102A2E] text-white shadow-sm'
                  : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{locale === 'en' ? 'Is My Salary Enough?' : t.tabSalaryWorth}</span>
            </button>

            <button
              id="tab-salary-needed"
              onClick={() => onSelectTab('salary-needed')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'salary-needed'
                  ? 'bg-[#102A2E] text-white shadow-sm'
                  : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{locale === 'en' ? 'How Much Should I Earn?' : t.tabSalaryNeeded}</span>
            </button>

            <button
              id="tab-salary-after-tax"
              onClick={() => onSelectTab('salary-after-tax')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'salary-after-tax'
                  ? 'bg-[#102A2E] text-white shadow-sm'
                  : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
              }`}
            >
              <span>{locale === 'en' ? 'Salary After Tax' : t.tabSalaryAfterTax}</span>
            </button>

            <button
              id="tab-cost-of-living"
              onClick={() => onSelectTab('cost-of-living')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'cost-of-living'
                  ? 'bg-[#102A2E] text-white shadow-sm'
                  : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{locale === 'en' ? 'Living Costs' : t.tabCostOfLiving}</span>
            </button>

            <button
              id="tab-compare"
              onClick={() => onSelectTab('compare')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'compare'
                  ? 'bg-[#102A2E] text-white shadow-sm'
                  : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{locale === 'en' ? 'Compare Cities' : t.tabCompare}</span>
            </button>

            <button
              id="tab-job-offers"
              onClick={() => onSelectTab('job-offers')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'job-offers'
                  ? 'bg-[#102A2E] text-white shadow-sm'
                  : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
              }`}
            >
              <Scale className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{locale === 'en' ? 'Compare Job Offers' : t.tabJobOffers}</span>
            </button>

            <button
              id="tab-nyc-100k-guide"
              onClick={() => onSelectTab('nyc-100k-guide')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors border shrink-0 ${
                activeTab === 'nyc-100k-guide'
                  ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E] font-semibold'
                  : 'border-dashed border-[#DCE3E0] bg-white text-[#167D75] hover:bg-[#F7F8F5]'
              }`}
            >
              <span>{t.tabGuides}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
