import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Globe } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import {
  SUPPORTED_LOCALES,
  SupportedLocale,
  TIER_1_LOCALES,
  TIER_2_LOCALE_METADATA,
} from '../../lib/i18n';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { locale, setLocale, t, isRtl } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredTier1 = TIER_1_LOCALES.filter((loc) => {
    const cfg = SUPPORTED_LOCALES[loc];
    if (!normalizedQuery) return true;
    return (
      cfg.name.toLowerCase().includes(normalizedQuery) ||
      cfg.nativeName.toLowerCase().includes(normalizedQuery) ||
      cfg.code.toLowerCase().includes(normalizedQuery)
    );
  });

  const filteredTier2 = Object.entries(TIER_2_LOCALE_METADATA).filter(
    ([code, meta]) => {
      if (!normalizedQuery) return true;
      return (
        meta.name.toLowerCase().includes(normalizedQuery) ||
        meta.nativeName.toLowerCase().includes(normalizedQuery) ||
        code.toLowerCase().includes(normalizedQuery)
      );
    }
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      ref={modalRef}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#DCE3E0] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DCE3E0] flex items-center justify-between bg-[#F7F8F5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DDF2EC] text-[#167D75] flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 id="language-modal-title" className="text-base sm:text-lg font-bold text-[#102A2E]">
                {t('languageSelector.title')}
              </h2>
              <p className="text-xs text-[#60706D]">{t('languageSelector.allLanguages')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#60706D] hover:text-[#102A2E] hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#167D75]"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#DCE3E0] bg-white">
          <div className="relative">
            <Search className={`w-4 h-4 text-[#60706D] absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('languageSelector.searchPlaceholder')}
              className={`w-full py-2.5 text-sm rounded-xl border border-[#DCE3E0] bg-[#F7F8F5] text-[#102A2E] placeholder-[#8A9B97] focus:border-[#167D75] focus:bg-white focus:outline-none ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Languages List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active Production Tier-1 Languages */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#60706D] block mb-2 px-1">
              {t('languageSelector.allLanguages')} ({filteredTier1.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredTier1.map((loc) => {
                const cfg = SUPPORTED_LOCALES[loc];
                const isCurrent = loc === locale;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocale(loc);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isCurrent
                        ? 'border-[#167D75] bg-[#DDF2EC]/70 text-[#102A2E] font-bold shadow-xs'
                        : 'border-[#E5ECE9] hover:border-[#167D75] hover:bg-[#F7F8F5] text-[#334D4A]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl" role="img" aria-hidden="true">
                        {cfg.flag}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{cfg.nativeName}</div>
                        <div className="text-[11px] text-[#60706D]">
                          {cfg.name} • {cfg.code.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="w-5 h-5 rounded-full bg-[#167D75] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier-2 Registered Worldwide Languages (Architecture Ready) */}
          {filteredTier2.length > 0 && (
            <div className="pt-2 border-t border-[#E5ECE9]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A9B97] block mb-2 px-1">
                Upcoming Worldwide Languages ({filteredTier2.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-60">
                {filteredTier2.map(([code, meta]) => (
                  <div
                    key={code}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-[#DCE3E0] bg-[#F7F8F5]/50 text-[#60706D] text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{meta.flag}</span>
                      <div>
                        <span className="font-medium text-[#334D4A]">{meta.nativeName}</span>
                        <span className="text-[10px] ml-1 text-[#8A9B97]">({meta.name})</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#DCE3E0] font-semibold text-[#60706D]">
                      Tier 2
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F7F8F5] border-t border-[#DCE3E0] flex items-center justify-between text-xs text-[#60706D]">
          <span>{t('languageSelector.currentLanguage')}: <strong>{SUPPORTED_LOCALES[locale].nativeName}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#167D75] hover:underline"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
