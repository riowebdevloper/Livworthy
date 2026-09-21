import React from 'react';
import { BookOpen, ShieldCheck, Scale, ArrowLeftRight, Calculator, DollarSign, Home, Server } from 'lucide-react';
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
  onOpenEvidence,
  onOpenMethodology,
  onOpenDiagnostics,
}) => {
  return (
    <header id="livworthy-header" data-testid="livworth-header" className="bg-[#FFFFFF] border-b border-[#DCE3E0] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer group py-1"
            onClick={() => onSelectTab('salary-worth')}
            title="LivWorthy - Home"
          >
            <LivWorthLogo size="sm" showTagline={true} />
            <span className="hidden md:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DDF2EC] text-[#0D625B] border border-[#167D75]/20">
              Deterministic v1.2
            </span>
          </div>

          {/* Secondary Actions: Evidence, Methodology & Architecture */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {onOpenDiagnostics && (
              <button
                id="btn-open-diagnostics"
                onClick={onOpenDiagnostics}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0D625B] bg-[#EBF6F3] hover:bg-[#DDF2EC] px-2.5 py-1.5 rounded border border-[#0D625B]/30 transition-colors"
                title="System Architecture, PostgreSQL, and 15 Statutory Tax Adapters"
              >
                <Server className="w-3.5 h-3.5 text-[#0D625B]" />
                <span className="hidden sm:inline">Architecture</span>
              </button>
            )}
            <button
              id="btn-open-evidence"
              onClick={onOpenEvidence}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0D625B] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#167D75]" />
              <span className="hidden sm:inline">Data &</span> Evidence
            </button>
            <button
              id="btn-open-methodology"
              onClick={onOpenMethodology}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#60706D] hover:text-[#102A2E] px-2.5 py-1.5 rounded border border-[#DCE3E0] hover:bg-[#F7F8F5] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Methodology</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-[#F7F8F5]">
          <button
            id="tab-salary-worth"
            onClick={() => onSelectTab('salary-worth')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'salary-worth'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Salary Worth</span>
          </button>

          <button
            id="tab-salary-needed"
            onClick={() => onSelectTab('salary-needed')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'salary-needed'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Salary Needed</span>
          </button>

          <button
            id="tab-salary-after-tax"
            onClick={() => onSelectTab('salary-after-tax')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'salary-after-tax'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
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
                : 'text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Cost of Living</span>
          </button>

          <button
            id="tab-compare"
            onClick={() => onSelectTab('compare')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'compare'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Compare Cities</span>
          </button>

          <button
            id="tab-job-offers"
            onClick={() => onSelectTab('job-offers')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'job-offers'
                ? 'bg-[#102A2E] text-white shadow-sm'
                : 'text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Job Offers</span>
          </button>

          <button
            id="tab-nyc-100k-guide"
            onClick={() => onSelectTab('nyc-100k-guide')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors border ${
              activeTab === 'nyc-100k-guide'
                ? 'border-[#167D75] bg-[#DDF2EC] text-[#102A2E] font-semibold'
                : 'border-dashed border-[#DCE3E0] text-[#167D75] hover:bg-[#F7F8F5]'
            }`}
          >
            <span>$100K in NYC Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
