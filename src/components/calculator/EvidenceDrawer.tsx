import React from 'react';
import { X, ShieldCheck, ExternalLink, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { EVIDENCE_SOURCES } from '../../data/evidence-registry';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sourceIds: string[];
  ruleVersions?: {
    taxRuleVersion?: string;
    colDate?: string;
  };
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  sourceIds,
  ruleVersions,
}) => {
  if (!isOpen) return null;

  const sources = sourceIds
    .map((id) => EVIDENCE_SOURCES[id])
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102A2E]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-[#FFFFFF] h-full shadow-2xl overflow-y-auto flex flex-col z-10 border-l border-[#DCE3E0]">
        {/* Header */}
        <div className="p-5 border-b border-[#DCE3E0] flex items-center justify-between sticky top-0 bg-[#FFFFFF] z-20">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#DDF2EC] flex items-center justify-center text-[#0D625B]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A2E]">Data Provenance & Evidence</h2>
              <p className="text-xs text-[#60706D]">Audit trail of statutory sources and datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close data provenance drawer"
            className="p-1.5 rounded-lg text-[#60706D] hover:text-[#102A2E] hover:bg-[#F7F8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1 text-xs">
          {/* Version banner */}
          <div className="p-3.5 bg-[#F7F8F5] rounded-xl border border-[#DCE3E0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102A2E]">Active Rule System:</span>
              <span className="font-mono text-[11px] font-semibold text-[#167D75] bg-white px-2 py-0.5 rounded border border-[#DCE3E0]">
                {ruleVersions?.taxRuleVersion || 'US-FED-NY-NYC-2024.1'}
              </span>
            </div>
            <p className="text-[11px] text-[#60706D]">
              All calculations run deterministically against validated statutory schedules. We never estimate or interpolate tax brackets with LLMs or crowdsourced guessing.
            </p>
          </div>

          {/* Sources List */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#102A2E] mb-3">
              Authoritative Reference Sources ({sources.length})
            </h3>

            <div className="space-y-3">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-xl border border-[#DCE3E0] bg-[#FFFFFF] space-y-2 hover:border-[#167D75] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#102A2E]">{src.organization}</span>
                      <span className="text-[11px] text-[#60706D] block">{src.sourceType} · {src.jurisdiction}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#DDF2EC] text-[#0D625B]">
                      {src.reliabilityTier}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#102A2E] leading-snug">
                    {src.canonicalReference}
                  </p>

                  <p className="text-[11px] text-[#60706D] leading-relaxed">
                    {src.notes}
                  </p>

                  <div className="pt-2 border-t border-[#F7F8F5] flex flex-wrap items-center justify-between text-[10px] text-[#60706D] gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> Effective: {src.effectiveDate}
                      </span>
                      <span>·</span>
                      <span className="flex items-center text-[#167D75]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified: {src.verifiedAt}
                      </span>
                    </div>

                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#167D75] hover:underline flex items-center"
                      >
                        <span>Official Bulletin</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zero Data Fabrication Guarantee */}
          <div className="p-4 rounded-xl bg-[#DDF2EC]/40 border border-[#167D75]/30 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-[#0D625B] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>LivWorthy Provenance Guarantee</span>
            </div>
            <p className="text-[11px] text-[#102A2E] leading-relaxed">
              Every tax bracket, standard deduction, FICA cap, and median rent benchmark is linked to a government publication record. No financial formula is generated dynamically by an AI model.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE3E0] bg-[#FFFFFF] sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-[#102A2E] text-white text-xs font-bold hover:bg-[#167D75] transition-colors"
          >
            Close Provenance View
          </button>
        </div>
      </div>
    </div>
  );
};
