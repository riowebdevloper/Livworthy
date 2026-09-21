import React from 'react';
import { X, BookOpen, ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEvidence: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  onOpenEvidence,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Calculation Methodology" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102A2E]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#DCE3E0] overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-6 border-b border-[#DCE3E0] flex items-center justify-between bg-[#FFFFFF] sticky top-0 z-20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DDF2EC] flex items-center justify-center text-[#0D625B]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A2E]">LivWorthy Calculation Methodology</h2>
              <p className="text-xs text-[#60706D]">Deterministic living intelligence architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close methodology modal"
            className="p-1.5 rounded-lg text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Methodology details"
          className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs leading-relaxed text-[#60706D] focus:outline-hidden"
        >
          {/* Section 1: Non-Negotiable Financial Rule */}
          <div className="p-4 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-[#102A2E] font-bold text-xs">
              <Cpu className="w-4 h-4 text-[#167D75]" />
              <span>Zero-AI Financial Calculation Rule</span>
            </div>
            <p className="text-[#102A2E]">
              LivWorthy strictly prohibits using Large Language Models (LLMs) to estimate taxes, cost-of-living totals, currency conversions, or comparison outcomes. Every financial calculation is produced by versioned deterministic code, statutory tax tables, and validated government datasets.
            </p>
          </div>

          {/* Section 2: Unified Calculation Pipeline */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-2">
              The Central Pipeline
            </h3>
            <div className="p-4 bg-[#FFFFFF] border border-[#DCE3E0] rounded-xl font-mono text-[11px] text-[#102A2E] space-y-1">
              <div>Gross Compensation</div>
              <div className="text-[#167D75]">  ↓ Tax Engine (Federal + State + City Local + FICA/NI)</div>
              <div>Estimated Take-Home (Net Income)</div>
              <div className="text-[#167D75]">  ↓ Household & Cost Engine (Housing + BLS CEX Weights)</div>
              <div>Estimated Living Costs</div>
              <div className="text-[#167D75]">  ↓ Net Balance</div>
              <div className="font-bold text-[#167D75]">Money Remaining (Disposable Income) & Savings Capacity</div>
            </div>
          </div>

          {/* Section 3: Authoritative Minor-Unit Money */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-2">
              Precision Money Representation
            </h3>
            <p>
              JavaScript floating-point arithmetic is never used for authoritative monetary storage. All currency values are held in integer minor units (e.g., cents, pence, fils) and rounded according to statutory jurisdictional standards before display.
            </p>
          </div>

          {/* Section 4: Data Provenance & Tier Priority */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-2">
              Data Priority & Ingestion Standard
            </h3>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-[#102A2E]">Tier 1 (Official Authorities):</strong> Internal Revenue Service (IRS), NYS Dept of Taxation, Social Security Administration, US Bureau of Labor Statistics (BLS), HUD Fair Market Rents, and UK HMRC.
              </li>
              <li>
                <strong className="text-[#102A2E]">Tier 2 (Official Statistical Registries):</strong> Census Bureau, regional transit fare tariffs (MTA OMNY, TfL).
              </li>
              <li>
                <strong className="text-[#102A2E]">Strict Anomaly Checking:</strong> Imports undergo unit validation, currency validation, and human verification before activation.
              </li>
            </ul>
          </div>

          {/* Section 5: Reverse Solver (Salary Needed) */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-2">
              Salary Needed Invariant
            </h3>
            <p>
              Salary Needed runs the identical scenario engine in reverse using numerical binary search over gross income to satisfy:
            </p>
            <div className="p-2.5 bg-[#F7F8F5] rounded-lg font-mono text-[11px] text-[#102A2E] my-1">
              Net Income(Gross) − Living Expenses ≥ Desired Savings Target
            </div>
            <p>
              This ensures that any salary calculated by Salary Needed, when re-fed into Salary Worth under identical assumptions, exactly reproduces the target savings outcome.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE3E0] bg-[#FFFFFF] flex items-center justify-between sticky bottom-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEvidence();
            }}
            className="text-xs font-semibold text-[#167D75] hover:underline flex items-center"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Open Evidence & Source Records
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#102A2E] text-white text-xs font-bold hover:bg-[#167D75] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
