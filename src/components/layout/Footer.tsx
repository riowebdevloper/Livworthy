import React from 'react';
import { ShieldCheck, Database, RefreshCw, Scale } from 'lucide-react';
import { LivWorthLogo } from '../ui/LivWorthBrand';

import { ActiveTab } from './Header';

interface FooterProps {
  onOpenEvidence: () => void;
  onOpenMethodology: () => void;
  onOpenDiagnostics?: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenEvidence,
  onOpenMethodology,
  onOpenDiagnostics,
  onSelectTab,
}) => {
  return (
    <footer id="livworthy-footer" data-testid="livworth-footer" className="bg-[#FFFFFF] border-t border-[#DCE3E0] mt-16 py-12 text-sm text-[#60706D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <LivWorthLogo size="sm" showTagline={true} />
            </div>
            <p className="text-xs leading-relaxed max-w-md text-[#60706D] mb-4">
              LivWorthy provides deterministic income and living intelligence. All calculations use statutory tax schedules, verified consumer price indexes, and official government statistics. We never substitute deterministic mathematics with artificial approximations.
            </p>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center text-[#167D75]">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Tier 1 Data Priority
              </span>
              <span className="flex items-center text-[#60706D]">
                <Database className="w-3.5 h-3.5 mr-1" /> IRS · SSA · NYS DTF · BLS · HUD
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#102A2E] mb-3">
              Products
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('salary-worth')}
                  className="hover:text-[#102A2E] text-left"
                >
                  Salary Worth Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('salary-needed')}
                  className="hover:text-[#102A2E] text-left"
                >
                  Salary Needed (Reverse Solver)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('salary-after-tax')}
                  className="hover:text-[#102A2E] text-left"
                >
                  Salary After Tax
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('cost-of-living')}
                  className="hover:text-[#102A2E] text-left"
                >
                  Household Cost of Living
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('compare')}
                  className="hover:text-[#102A2E] text-left"
                >
                  Location Compare
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('job-offers')}
                  className="hover:text-[#102A2E] text-left"
                >
                  Job Offer Normalizer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab?.('nyc-100k-guide')}
                  className="hover:text-[#102A2E] text-left text-[#167D75] font-medium"
                >
                  NYC $100K Salary Guide
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#102A2E] mb-3">
              Integrity & Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenMethodology} className="hover:text-[#102A2E] underline">
                  Calculation Methodology
                </button>
              </li>
              <li>
                <button onClick={onOpenEvidence} className="hover:text-[#102A2E] underline">
                  Sources & Evidence Registry
                </button>
              </li>
              {onOpenDiagnostics && (
                <li>
                  <button onClick={onOpenDiagnostics} className="hover:text-[#102A2E] underline text-[#167D75] font-medium">
                    System Architecture & Diagnostics
                  </button>
                </li>
              )}
              <li>Deterministic Rule Versioning</li>
              <li>Zero Data Fabrication Policy</li>
              <li>Anonymous & Privacy First</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#F7F8F5] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#60706D]">
          <p>© {new Date().getFullYear()} LivWorthy. Built for financial clarity.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>Deterministic Tax Engine v2024.1</span>
            <span>·</span>
            <span>No AI-estimated financials</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
