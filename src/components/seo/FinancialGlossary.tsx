import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { CORE_GLOSSARY, GlossaryTerm } from '../../data/transparency';

interface FinancialGlossaryProps {
  termsToShow?: string[];
  title?: string;
  defaultExpanded?: boolean;
}

export const FinancialGlossary: React.FC<FinancialGlossaryProps> = ({
  termsToShow,
  title = 'Canonical Financial & Living Definitions',
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const displayedTerms = termsToShow
    ? CORE_GLOSSARY.filter((t) => termsToShow.includes(t.term))
    : CORE_GLOSSARY;

  return (
    <section
      aria-label="Financial Glossary"
      className="bg-white border border-[#DCE3E0] rounded-2xl p-6 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#DDF2EC] flex items-center justify-center text-[#0D625B]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#102A2E]">{title}</h3>
            <p className="text-xs text-[#60706D]">Standardized definitions for global compensation and living metrics</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={isExpanded ? 'Collapse glossary' : 'Expand glossary'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {displayedTerms.map((item: GlossaryTerm) => (
            <article
              key={item.term}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
            >
              <h4 className="font-bold text-sm text-[#102A2E]">{item.term}</h4>
              <p className="font-medium text-slate-800">{item.shortDefinition}</p>
              <p className="text-slate-600 leading-relaxed">{item.detailedExplanation}</p>
              {item.mathematicalExpression && (
                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-teal-800">
                  {item.mathematicalExpression}
                </div>
              )}
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                Governing Standard: <span className="font-semibold text-slate-700">{item.governingStandard}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
