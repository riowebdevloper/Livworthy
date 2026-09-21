import React from 'react';
import { ShieldCheck, Database, FileText, MapPin, Calculator, ChevronRight } from 'lucide-react';
import { LivWorthLogo } from '../ui/LivWorthBrand';
import { ActiveTab } from './Header';
import { POPULAR_GUIDES_LIST } from '../../data/salary-guides';

interface FooterProps {
  onOpenEvidence: () => void;
  onOpenMethodology: () => void;
  onOpenDiagnostics?: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  onSelectGuide?: (slug: string) => void;
  onSelectCity?: (cityId: string) => void;
}

const FEATURED_CITIES = [
  { id: 'nyc', name: 'New York City', country: 'US' },
  { id: 'sf', name: 'San Francisco', country: 'US' },
  { id: 'london', name: 'London', country: 'UK' },
  { id: 'dubai', name: 'Dubai', country: 'UAE' },
  { id: 'toronto', name: 'Toronto', country: 'Canada' },
  { id: 'sydney', name: 'Sydney', country: 'Australia' },
  { id: 'berlin', name: 'Berlin', country: 'Germany' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland' },
  { id: 'dublin', name: 'Dublin', country: 'Ireland' },
  { id: 'mumbai', name: 'Mumbai', country: 'India' },
];

export const Footer: React.FC<FooterProps> = ({
  onOpenEvidence,
  onOpenMethodology,
  onOpenDiagnostics,
  onSelectTab,
  onSelectGuide,
  onSelectCity,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="livworthy-footer" data-testid="livworth-footer" className="bg-[#FFFFFF] border-t border-[#DCE3E0] mt-16 py-12 text-sm text-[#60706D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
              title="LivWorthy Home"
            >
              <LivWorthLogo size="sm" showTagline={true} />
            </button>
            <p className="text-xs leading-relaxed text-[#60706D]">
              LivWorthy provides deterministic income and living intelligence across 39 international commercial markets. All calculations use statutory tax schedules, verified consumer price indexes, and official government statistics.
            </p>
            <div className="space-y-1.5 text-xs pt-1">
              <button
                type="button"
                onClick={onOpenEvidence}
                className="flex items-center text-[#167D75] hover:text-[#0D524D] font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>Tier 1 Statutory Data Priority</span>
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
              title="Click to view all calculators"
            >
              <span>Calculators & Tools</span>
              <ChevronRight className="w-3 h-3 ml-1 text-[#167D75] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('salary-worth');
                    scrollToTop();
                  }}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Salary Worth Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('salary-needed');
                    scrollToTop();
                  }}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Salary Needed (Reverse Solver)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('salary-after-tax');
                    scrollToTop();
                  }}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Salary After Tax (Statutory Net)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('cost-of-living');
                    scrollToTop();
                  }}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Household Cost of Living Index
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('compare');
                    scrollToTop();
                  }}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Location Comparison Engine
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('job-offers');
                    scrollToTop();
                  }}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Job Offer & Relocation Value
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('nyc-100k-guide');
                    scrollToTop();
                  }}
                  className="hover:text-[#102A2E] text-left text-[#167D75] font-semibold transition-colors cursor-pointer"
                >
                  City Salary Intelligence Guides →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Global Salary Guides */}
          <div>
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('nyc-100k-guide');
                scrollToTop();
              }}
              className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3 hover:text-[#167D75] transition-colors flex items-center group cursor-pointer"
              title="Click to view all country & city salary guides"
            >
              <span>City Salary Guides</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#167D75] transition-transform group-hover:translate-x-0.5" />
            </button>
            <ul className="space-y-1 text-xs">
              {POPULAR_GUIDES_LIST.slice(0, 8).map((guide) => (
                <li key={guide.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectGuide) {
                        onSelectGuide(guide.slug);
                      } else {
                        onSelectTab?.('nyc-100k-guide');
                      }
                      scrollToTop();
                    }}
                    className="w-full min-h-[24px] py-1 flex items-center hover:text-[#167D75] text-left transition-colors cursor-pointer"
                    title={guide.title}
                  >
                    <span className="line-clamp-1">{guide.title}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab?.('nyc-100k-guide');
                    scrollToTop();
                  }}
                  className="text-xs font-bold text-[#167D75] hover:underline cursor-pointer min-h-[24px] py-1 flex items-center"
                >
                  <span>Explore All {POPULAR_GUIDES_LIST.length}+ Country & City Guides →</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Integrity, Standards & Architecture */}
          <div>
            <button
              type="button"
              onClick={onOpenMethodology}
              className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3 hover:text-[#167D75] transition-colors flex items-center group cursor-pointer"
              title="Click to view Calculation Methodology and Standards"
            >
              <span>Integrity & Standards</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#167D75] transition-transform group-hover:translate-x-0.5" />
            </button>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  id="footer-methodology-btn"
                  onClick={onOpenMethodology}
                  className="hover:text-[#102A2E] underline text-left transition-colors cursor-pointer"
                >
                  Calculation Methodology
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-evidence-btn"
                  onClick={onOpenEvidence}
                  className="hover:text-[#102A2E] underline text-left transition-colors cursor-pointer"
                >
                  Sources & Evidence Registry
                </button>
              </li>
              {onOpenDiagnostics && (
                <li>
                  <button
                    type="button"
                    id="footer-diagnostics-btn"
                    onClick={onOpenDiagnostics}
                    className="hover:text-[#102A2E] underline text-[#167D75] font-semibold text-left transition-colors cursor-pointer"
                  >
                    System Architecture & Diagnostics
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={onOpenMethodology}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Deterministic Rule Versioning
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenMethodology}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Zero Data Fabrication Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenMethodology}
                  className="hover:text-[#102A2E] text-left transition-colors cursor-pointer"
                >
                  Anonymous & Privacy First (No PII)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Popular City Hubs Section - All Clickable Interlinked */}
        <div className="border-t border-[#F7F8F5] pt-6 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('salary-worth');
                scrollToTop();
              }}
              className="font-bold text-xs uppercase tracking-wider text-[#102A2E] hover:text-[#167D75] transition-colors cursor-pointer flex items-center group"
              title="Click to view city salary calculators"
            >
              <span>Popular City Income Hubs</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#167D75] transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="text-[11px] text-slate-600 font-medium">Click any city to switch calculator benchmarks</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {FEATURED_CITIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  if (onSelectCity) {
                    onSelectCity(c.id);
                  } else {
                    onSelectTab?.('salary-worth');
                  }
                  scrollToTop();
                }}
                className="px-2.5 py-1 bg-slate-50 hover:bg-[#DDF2EC] hover:text-[#0D524D] rounded border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                title={`Switch to ${c.name}, ${c.country}`}
              >
                {c.name} ({c.country})
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F7F8F5] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#60706D] gap-2">
          <p>© {new Date().getFullYear()} LivWorthy. Know what your income is really worth.</p>
          <div className="flex items-center space-x-3 text-xs">
            <button
              type="button"
              onClick={onOpenMethodology}
              className="hover:underline hover:text-[#167D75] cursor-pointer"
            >
              Deterministic Statutory Engine
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenEvidence}
              className="hover:underline hover:text-[#167D75] cursor-pointer"
            >
              Zero Synthetic Fallbacks
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenMethodology}
              className="hover:underline hover:text-[#167D75] cursor-pointer font-medium"
              title="View all 39 supported commercial markets"
            >
              All 39 Commercial Markets
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
