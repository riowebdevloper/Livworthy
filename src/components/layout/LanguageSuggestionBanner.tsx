import React from 'react';
import { Globe, X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { SUPPORTED_LOCALES } from '../../lib/i18n';

export const LanguageSuggestionBanner: React.FC = () => {
  const { suggestedLocale, acceptSuggestion, dismissSuggestion, isRtl } = useI18n();

  if (!suggestedLocale) return null;

  const targetCfg = SUPPORTED_LOCALES[suggestedLocale];
  if (!targetCfg) return null;

  return (
    <aside
      aria-label="Language Suggestion"
      className="bg-[#102A2E] text-white px-4 py-2.5 text-xs border-b border-[#2B4744] shadow-sm transition-all animate-in slide-in-from-top-2 duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Globe className="w-4 h-4 text-[#44BBA4] shrink-0" aria-hidden="true" />
          <span>
            Would you like to view LivWorthy in <strong>{targetCfg.nativeName}</strong> ({targetCfg.name})?
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={acceptSuggestion}
            className="px-3 py-1 rounded-md bg-[#167D75] hover:bg-[#136862] text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#44BBA4]"
          >
            Switch to {targetCfg.nativeName}
          </button>
          <button
            type="button"
            onClick={dismissSuggestion}
            className="p-1 rounded text-[#A3B8B5] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#44BBA4]"
            aria-label="Dismiss language suggestion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
