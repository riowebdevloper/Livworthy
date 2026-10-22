import React, { useState } from 'react';
import { ShieldCheck, Database, FileText, MapPin, Calculator, ChevronRight, Check } from 'lucide-react';
import { LivWorthLogo } from '../ui/LivWorthBrand';
import { ActiveTab } from './Header';
import { POPULAR_GUIDE_LINKS, TOTAL_GUIDES_COUNT } from '../../data/salary-guides-links';
import { useI18n } from '../../context/I18nContext';
import {
  FEATURED_CITIES,
  getLocalizedCityDisplayName,
  getLocalizedCountryDisplayName,
} from '../../lib/i18n/locations';

interface FooterProps {
  onOpenEvidence: () => void;
  onOpenMethodology: () => void;
  onOpenCorrections?: () => void;
  onOpenDiagnostics?: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  onSelectGuide?: (slug: string) => void;
  onSelectCity?: (cityId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenEvidence,
  onOpenMethodology,
  onOpenCorrections,
  onOpenDiagnostics,
  onSelectTab,
  onSelectGuide,
  onSelectCity,
}) => {
  const { locale, dict, isRtl } = useI18n();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="livworthy-footer" data-testid="livworth-footer" className="bg-[#FFFFFF] border-t border-[#DCE3E0] mt-16 py-12 text-sm text-[#60706D]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2027 Tax Release Alerts Banner */}
        <div className="mb-10 p-6 rounded-2xl bg-[#F7F8F5] border border-[#DCE3E0] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#DDF2EC] text-[#0D625B] px-2.5 py-0.5 rounded-full">
                2027 Tax Radar
              </span>
              <h3 className="font-bold text-sm text-[#102A2E]">
                Stay Informed on 2027 Statutory Tax Law Releases
              </h3>
            </div>
            <p className="text-xs text-[#60706D] max-w-xl">
              Receive verified notifications when official 2027 statutory withholding schedules (IRS, HMRC, CRA, ATO, FTA) are confirmed. Zero spam, unsubscribe anytime.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newsletterEmail) {
                setIsSubscribed(true);
              }
            }}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            {isSubscribed ? (
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#0D625B] bg-[#DDF2EC] px-4 py-2.5 rounded-xl border border-[#167D75]/20">
                <Check className="w-4 h-4 text-[#167D75] shrink-0" />
                <span>Subscribed! We will notify you when 2027 schedules are live.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@example.com"
                  aria-label="Email address for 2027 tax updates"
                  className="bg-white border border-[#DCE3E0] rounded-xl px-3.5 py-2 text-xs text-[#102A2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#167D75] w-full sm:w-64"
                />
                <button
                  type="submit"
                  className="bg-[#102A2E] hover:bg-[#167D75] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </>
            )}
          </form>
        </div>

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Brand & Charter */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('salary-worth');
                scrollToTop();
              }}
              className="text-left group cursor-pointer"
              title={dict.accessibility.footerHomeTitle}
              aria-label={dict.accessibility.footerHomeTitle}
            >
              <LivWorthLogo size="sm" showTagline={true} />
            </button>
            <p className="text-xs leading-relaxed text-[#60706D]">
              {dict.footer.aboutDesc}
            </p>
            <div className="space-y-1.5 text-xs pt-1">
              <button
                type="button"
                onClick={onOpenEvidence}
                className="flex items-center text-[#167D75] hover:text-[#0D524D] font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>{dict.footer.tier1DataPriority}</span>
              </button>
              <button
                type="button"
                onClick={onOpenMethodology}
                className="flex items-center text-[#60706D] hover:text-[#102A2E] transition-colors"
              >
                <Database className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>IRS · HMRC · CRA · ATO · EStG · FTA</span>
              </button>
            </div>
          </div>

          {/* Column 2: Products & Calculators */}
          <div>
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('salary-worth');
                scrollToTop();
              }}
              className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3 hover:text-[#167D75] transition-colors flex items-center group cursor-pointer"
            >
              <span>{dict.footer.calculatorsTitle}</span>
              <ChevronRight className="w-3 h-3 ml-1 text-[#167D75] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('salary-worth');
                    scrollToTop();
                  }}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  {dict.nav.tabSalaryWorth}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('salary-needed');
                    scrollToTop();
                  }}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  {dict.nav.tabSalaryNeeded}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('salary-after-tax');
                    scrollToTop();
                  }}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  {dict.nav.tabSalaryAfterTax}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('cost-of-living');
                    scrollToTop();
                  }}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  {dict.nav.tabCostOfLiving}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('compare');
                    scrollToTop();
                  }}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  {dict.nav.tabCompare}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('job-offers');
                    scrollToTop();
                  }}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  {dict.nav.tabJobOffers}
                </button>
              </li>
              <li>
                <a
                  href="/guides"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTab?.('nyc-100k-guide');
                    scrollToTop();
                  }}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left text-[#167D75] font-semibold transition-colors"
                >
                  {dict.nav.tabGuides}
                </a>
              </li>
              <li>
                <a
                  href="/countries"
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors"
                >
                  {dict.footer.countriesDirectory}
                </a>
              </li>
              <li>
                <a
                  href="/cities"
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors"
                >
                  {dict.footer.citiesDirectory}
                </a>
              </li>
              <li>
                <a
                  href="/compare"
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left transition-colors"
                >
                  {dict.footer.cityComparisons}
                </a>
              </li>
              <li>
                <a
                  href="/reports"
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] text-left text-[#167D75] font-semibold transition-colors"
                >
                  {dict.footer.empiricalReports}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Global Salary Guides */}
          <div>
            <a
              href="/guides"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab?.('nyc-100k-guide');
                scrollToTop();
              }}
              className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3 hover:text-[#167D75] transition-colors flex items-center group"
            >
              <span>{dict.footer.intelligenceTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#167D75] transition-transform group-hover:translate-x-0.5" />
            </a>
            <ul className="space-y-1 text-xs">
              {POPULAR_GUIDE_LINKS.map((guide) => (
                <li key={guide.slug}>
                  <a
                    href={`/guides/${guide.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectGuide) {
                        onSelectGuide(guide.slug);
                      } else {
                        onSelectTab?.('nyc-100k-guide');
                      }
                      scrollToTop();
                    }}
                    className="w-full min-h-[24px] py-1 flex items-center hover:text-[#167D75] text-left transition-colors"
                    title={guide.title}
                  >
                    <span className="line-clamp-1">{guide.title}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/guides"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    onSelectTab?.('nyc-100k-guide');
                    scrollToTop();
                  }}
                  className="text-xs font-bold text-[#167D75] hover:underline min-h-[24px] py-1 flex items-center"
                >
                  <span>{dict.footer.exploreAllGuides.replace('{count}', String(TOTAL_GUIDES_COUNT))}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Integrity, Standards & E-E-A-T */}
          <div>
            <button
              type="button"
              onClick={onOpenMethodology}
              className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3 hover:text-[#167D75] transition-colors flex items-center group cursor-pointer"
            >
              <span>{dict.footer.institutionalTitle}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#167D75] transition-transform group-hover:translate-x-0.5" />
            </button>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  type="button"
                  id="footer-methodology-btn"
                  onClick={onOpenMethodology}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] hover:underline text-left transition-colors cursor-pointer"
                >
                  {dict.nav.howItWorks}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-evidence-btn"
                  onClick={onOpenEvidence}
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] hover:underline text-left transition-colors cursor-pointer"
                >
                  {dict.nav.sources}
                </button>
              </li>
              {onOpenCorrections && (
                <li>
                  <button
                    type="button"
                    id="footer-corrections-btn"
                    onClick={onOpenCorrections}
                    className="w-full min-h-[24px] py-1 flex items-center text-[#167D75] font-semibold hover:underline text-left transition-colors cursor-pointer"
                  >
                    {dict.footer.corrections}
                  </button>
                </li>
              )}
              {onOpenDiagnostics && (
                <li>
                  <button
                    type="button"
                    id="footer-diagnostics-btn"
                    onClick={onOpenDiagnostics}
                    className="w-full min-h-[24px] py-1 flex items-center text-slate-700 hover:text-[#102A2E] hover:underline text-left transition-colors cursor-pointer"
                  >
                    {dict.footer.systemArchitectureDiagnostics}
                  </button>
                </li>
              )}
              <li>
                <a
                  href="/about"
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] hover:underline text-left transition-colors"
                >
                  {dict.footer.aboutLivworthy}
                </a>
              </li>
              <li>
                <a
                  href="/editorial-policy"
                  className="w-full min-h-[24px] py-1 flex items-center hover:text-[#102A2E] hover:underline text-left transition-colors"
                >
                  {dict.footer.editorialPolicy}
                </a>
              </li>
              <li>
                <a
                  href="/data-policy"
                  className="w-full min-h-[44px] sm:min-h-[24px] py-2 sm:py-1 flex items-center hover:text-[#102A2E] hover:underline text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded"
                >
                  {dict.footer.dataPolicy}
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="w-full min-h-[44px] sm:min-h-[24px] py-2 sm:py-1 flex items-center hover:text-[#102A2E] hover:underline text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded"
                >
                  {dict.footer.privacy}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="w-full min-h-[44px] sm:min-h-[24px] py-2 sm:py-1 flex items-center hover:text-[#102A2E] hover:underline text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Popular City Hubs Section - All Clickable Interlinked */}
        <div className="border-t border-[#F7F8F5] pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2.5">
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('salary-worth');
                scrollToTop();
              }}
              className="font-bold text-xs tracking-wider text-[#102A2E] hover:text-[#167D75] transition-colors cursor-pointer flex items-center group shrink-0"
            >
              <span>{dict.footer.popularCityIncomeHubs}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#167D75] transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="text-xs text-[#60706D] font-medium sm:border-l sm:border-[#DCE3E0] sm:pl-3">
              {dict.footer.cityHubDescription}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {FEATURED_CITIES.map((c) => {
              const cityName = getLocalizedCityDisplayName(c.id, locale);
              const countryName = getLocalizedCountryDisplayName(c.countryId, locale);
              return (
                <a
                  key={c.id}
                  href={`/cities/${c.id}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    if (onSelectCity) {
                      onSelectCity(c.id);
                    } else {
                      onSelectTab?.('salary-worth');
                    }
                    scrollToTop();
                  }}
                  className="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 transition-colors flex items-center"
                  title={`${cityName}, ${countryName}`}
                >
                  <span>{cityName}</span>
                  <span className="text-[11px] text-[#60706D] ml-1">({countryName})</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F7F8F5] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#60706D] gap-3">
          <p>© {new Date().getFullYear()} {dict.footer.copyright}</p>
          <nav aria-label={dict.footer.legalNavigationLabel} className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2 sm:gap-x-3 gap-y-2 text-xs">
            <a href="/about" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.footer.aboutLivworthy}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/methodology" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.nav.howItWorks}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/sources" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.nav.sources}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/editorial-policy" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.footer.editorialPolicy}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/data-policy" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.footer.dataPolicy}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/corrections" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.footer.corrections}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/terms" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.footer.terms}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/privacy" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">{dict.footer.privacy}</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a href="/contact" className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded">Contact</a>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <button
              id="footer-cookie-preferences"
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('livworthy:open-cookie-preferences'))}
              className="inline-flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0 px-1.5 sm:px-0 hover:underline hover:text-[#167D75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] rounded text-xs text-[#60706D] cursor-pointer"
            >
              Cookie Preferences
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
};
