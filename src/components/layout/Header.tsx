import React from 'react';
import { BookOpen, ShieldCheck, Scale, ArrowLeftRight, Calculator, DollarSign, Home } from 'lucide-react';
import { LivWorthLogo } from '../ui/LivWorthBrand';

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
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  // onOpenEvidence and onOpenMethodology are kept in props for compatibility
  // with EvidenceDrawer/MethodologyModal triggering from other components;
  // the header now uses real anchor navigation for these pages.
  // onOpenDiagnostics is kept accessible via the footer control.
}) => {
  return (
    <header id="livworthy-header" data-testid="livworth-header" className="bg-[#FFFFFF] border-b border-[#DCE3E0] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo — keyboard-accessible anchor to homepage */}
          <a
            href="/"
            id="header-logo-link"
            className="flex items-center space-x-3 group py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75] focus-visible:ring-offset-2 rounded"
            aria-label="LivWorthy — Home"
            title="LivWorthy - Home"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('salary-worth');
              window.history.pushState(null, '', '/');
            }}
          >
            <LivWorthLogo size="sm" showTagline={true} />
          </a>

          {/* Public navigation: How It Works and Sources */}
          <nav aria-label="Site navigation" className="flex items-center space-x-2 sm:space-x-3">
            <a
              id="nav-how-it-works"
              href="/methodology"
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-3 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75]"
              aria-label="How It Works — Methodology"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>How It Works</span>
            </a>
            <a
              id="nav-sources"
              href="/sources"
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-[#334D4A] hover:text-[#102A2E] px-3 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167D75]"
              aria-label="Sources — Data & Evidence Registry"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#167D75]" aria-hidden="true" />
              <span>Sources</span>
            </a>
          </nav>
        </div>

        {/* Calculator Navigation Tabs Bar — unchanged */}
        <nav aria-label="Calculator tabs" className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-[#F7F8F5] bg-white">
          <button
            id="tab-salary-worth"
            onClick={() => onSelectTab('salary-worth')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'salary-worth'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Is My Salary Enough?</span>
          </button>

          <button
            id="tab-salary-needed"
            onClick={() => onSelectTab('salary-needed')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'salary-needed'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
            <span>How Much Should I Earn?</span>
          </button>

          <button
            id="tab-salary-after-tax"
            onClick={() => onSelectTab('salary-after-tax')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'salary-after-tax'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <span>Salary After Tax</span>
          </button>

          <button
            id="tab-cost-of-living"
            onClick={() => onSelectTab('cost-of-living')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'cost-of-living'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Living Costs</span>
          </button>

          <button
            id="tab-compare"
            onClick={() => onSelectTab('compare')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'compare'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Compare Cities</span>
          </button>

          <button
            id="tab-job-offers"
            onClick={() => onSelectTab('job-offers')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'job-offers'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'bg-white text-[#334D4A] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Compare Job Offers</span>
          </button>

          <button
            id="tab-nyc-100k-guide"
            onClick={() => onSelectTab('nyc-100k-guide')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors border ${
              activeTab === 'nyc-100k-guide'
                ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E] font-semibold'
                : 'border-dashed border-[#DCE3E0] bg-white text-[#167D75] hover:bg-[#F7F8F5]'
            }`}
          >
            <span>$100K in NYC Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
