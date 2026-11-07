import React, { useState, useEffect } from 'react';
import { History, X, ArrowRight } from 'lucide-react';
import { getRecentScenarios, clearRecentScenarios, StoredScenario } from '../../lib/user-retention';

interface RecentScenariosBarProps {
  onSelectScenario?: (url: string) => void;
}

export const RecentScenariosBar: React.FC<RecentScenariosBarProps> = ({ onSelectScenario }) => {
  const [scenarios, setScenarios] = useState<StoredScenario[]>([]);

  useEffect(() => {
    setScenarios(getRecentScenarios());
  }, []);

  if (scenarios.length === 0) return null;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    clearRecentScenarios();
    setScenarios([]);
  };

  const handleClick = (e: React.MouseEvent, url: string) => {
    if (onSelectScenario) {
      e.preventDefault();
      onSelectScenario(url);
    }
  };

  return (
    <aside
      aria-label="Recently viewed calculators"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-[#DCE3E0] rounded-xl px-3.5 py-2 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#60706D] shrink-0">
            <History className="w-3.5 h-3.5 text-[#167D75]" />
            <span>Recently viewed:</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {scenarios.map((sc) => (
              <a
                key={sc.id}
                href={sc.url}
                onClick={(e) => handleClick(e, sc.url)}
                className="text-xs font-medium text-[#102A2E] bg-[#F7F8F5] hover:bg-teal-50 hover:text-[#167D75] border border-[#DCE3E0] hover:border-teal-300 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <span>{sc.title}</span>
                <ArrowRight className="w-2.5 h-2.5 text-[#60706D]" />
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          title="Clear recent scenarios"
          className="text-xs text-[#60706D] hover:text-rose-600 p-1 rounded transition-colors inline-flex items-center gap-1 shrink-0 ml-auto"
        >
          <X className="w-3 h-3" />
          <span className="sr-only sm:not-sr-only text-[11px]">Clear</span>
        </button>
      </div>
    </aside>
  );
};
