import React, { useState, useEffect } from 'react';

export interface CookieConsentState {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'livworthy_cookie_consent';

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    let timer: any;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay to prevent layout jump on immediate load
        timer = setTimeout(() => setIsOpen(true), 600);
      }
    } catch {
      // Ignore localStorage access issues in restrictive sandboxes
    }

    // Listen for custom event to reopen preferences from footer or policy links
    const handleReopen = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CookieConsentState;
          setAnalyticsEnabled(parsed.analytics ?? true);
          setMarketingEnabled(parsed.marketing ?? false);
        }
      } catch {}
      setShowPreferences(true);
      setIsOpen(true);
    };

    window.addEventListener('livworthy:open-cookie-preferences', handleReopen);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('livworthy:open-cookie-preferences', handleReopen);
    };
  }, []);

  const updateConsent = (analytics: boolean, marketing: boolean) => {
    const consent: CookieConsentState = {
      analytics,
      marketing,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {}

    // Dispatch Google Consent Mode v2 update if gtag is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: marketing ? 'granted' : 'denied',
        ad_user_data: marketing ? 'granted' : 'denied',
        ad_personalization: marketing ? 'granted' : 'denied',
      });
    }

    // Dispatch custom event for tag runners
    window.dispatchEvent(
      new CustomEvent('livworthy:consent-updated', { detail: consent })
    );

    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => updateConsent(true, true);
  const handleRejectAll = () => updateConsent(false, false);
  const handleSavePreferences = () => updateConsent(analyticsEnabled, marketingEnabled);

  if (!isOpen) return null;

  return (
    <div
      id="cookie-consent-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md border-t border-emerald-500/20 shadow-2xl text-slate-200 transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Privacy, Cookie Transparency & Consent
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
              LivWorthy uses strictly essential session storage for currency calculation states and
              optional analytics to evaluate financial guide utility. In accordance with GDPR and
              Google Consent Mode v2, third-party analytics and advertising cookies remain blocked
              until you grant explicit permission. We never sell personal financial inputs.
            </p>
          </div>

          {!showPreferences && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <button
                id="btn-cookie-reject-all"
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              >
                Reject Non-Essential
              </button>
              <button
                id="btn-cookie-preferences"
                type="button"
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-transparent border border-slate-700 hover:border-slate-500 rounded-lg transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              >
                Preferences
              </button>
              <button
                id="btn-cookie-accept-all"
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
              >
                Accept All
              </button>
            </div>
          )}
        </div>

        {showPreferences && (
          <div className="mt-2 pt-4 border-t border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Essential */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-white">Strictly Necessary</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Required for statutory tax calculation math, persistent currency selectors, and
                    secure localized routing.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-white">Measurement & Analytics</span>
                    <input
                      type="checkbox"
                      id="consent-analytics"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Google Analytics (gtag.js) to measure aggregate page visits, guide readership,
                    and calculation load times.
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-white">Advertising Personalization</span>
                    <input
                      type="checkbox"
                      id="consent-marketing"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Google AdSense personalization tags used exclusively for compliant, non-intrusive
                    site monetization.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <a href="/privacy" className="hover:text-emerald-400 underline underline-offset-2">
                  Privacy Policy
                </a>
                <a href="/data-policy" className="hover:text-emerald-400 underline underline-offset-2">
                  Data Policy
                </a>
                <a href="/editorial" className="hover:text-emerald-400 underline underline-offset-2">
                  Editorial Methodology
                </a>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors focus:ring-2 focus:ring-emerald-300"
                >
                  Save Choices
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
