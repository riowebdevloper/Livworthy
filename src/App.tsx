import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SalaryWorthView } from './components/calculator/SalaryWorthView';
import { HomeEditorialShowcase } from './components/home/HomeEditorialShowcase';
import { Header, ActiveTab } from './components/layout/Header';
// Defer below-the-fold Footer to reduce initial JS payload
const Footer = React.lazy(() =>
  import('./components/layout/Footer').then((m) => ({ default: m.Footer }))
);

// Defer secondary calculator views so initial bundle only loads SalaryWorthView
const SalaryNeededView = React.lazy(() =>
  import('./components/calculator/SalaryNeededView').then((m) => ({ default: m.SalaryNeededView }))
);
const SalaryAfterTaxView = React.lazy(() =>
  import('./components/calculator/SalaryAfterTaxView').then((m) => ({ default: m.SalaryAfterTaxView }))
);
const CostOfLivingView = React.lazy(() =>
  import('./components/calculator/CostOfLivingView').then((m) => ({ default: m.CostOfLivingView }))
);
const CompareView = React.lazy(() =>
  import('./components/calculator/CompareView').then((m) => ({ default: m.CompareView }))
);
const JobOfferCompareView = React.lazy(() =>
  import('./components/calculator/JobOfferCompareView').then((m) => ({ default: m.JobOfferCompareView }))
);

// Defer non-critical modals, drawers, and guide articles to reduce initial JS payload
const CustomizationDrawer = React.lazy(() =>
  import('./components/calculator/CustomizationDrawer').then((m) => ({ default: m.CustomizationDrawer }))
);
const EvidenceDrawer = React.lazy(() =>
  import('./components/calculator/EvidenceDrawer').then((m) => ({ default: m.EvidenceDrawer }))
);
const MethodologyModal = React.lazy(() =>
  import('./components/seo/MethodologyModal').then((m) => ({ default: m.MethodologyModal }))
);
const SystemDiagnosticsModal = React.lazy(() =>
  import('./components/system/SystemDiagnosticsModal').then((m) => ({ default: m.SystemDiagnosticsModal }))
);
const DataCorrectionModal = React.lazy(() =>
  import('./components/system/DataCorrectionModal').then((m) => ({ default: m.DataCorrectionModal }))
);
const SeoArticlePage = React.lazy(() =>
  import('./components/seo/SeoArticlePage').then((m) => ({ default: m.SeoArticlePage }))
);
import { CITIES } from './data/locations';
import { DEFAULT_NYC_100K_SCENARIO } from './data/presets';
import { SalaryWorthCalculator } from './engines/calculator-core/salary-worth';
import { VALID_GUIDE_SLUGS } from './data/salary-guides-links';
import { createMoney, getDefaultSalaryForCurrency, toMajor } from './lib/money';
import { HouseholdProfile, CostOfLivingResult } from './types/col';
import { LivWorthCalculationOutcome, LivWorthScenario } from './types/scenario';
import { TaxProfile, TaxResult } from './types/tax';
import { ComparisonResult } from './engines/calculator-core/compare';
import { SalaryNeededResult } from './engines/calculator-core/salary-needed';
import { SupportedLocale, getInitialLocale, setStoredLocale, TRANSLATIONS } from './lib/i18n';
import { I18nProvider, useI18n } from './context/I18nContext';
import { LanguageSuggestionBanner } from './components/layout/LanguageSuggestionBanner';
import { CookieConsentBanner } from './components/ui/CookieConsentBanner';
import { trackPageView, trackCalculatorEngagement, trackCalculationOutcome } from './lib/analytics';

const TAB_TITLES: Record<ActiveTab, string> = {
  'salary-worth': 'Salary Worth Calculator — LivWorthy',
  'salary-needed': 'Salary Needed Calculator — LivWorthy',
  'salary-after-tax': 'Salary After Tax Calculator — LivWorthy',
  'cost-of-living': 'Cost of Living Calculator — LivWorthy',
  'compare': 'Cost of Living & Salary Comparison — LivWorthy',
  'job-offers': 'Job Offer Comparison & Net Income — LivWorthy',
  'nyc-100k-guide': 'Salary & Living Cost Guide — LivWorthy',
};

function AppContent() {
  const { locale, setLocale, dict } = useI18n();
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const handleSelectLocale = (newLoc: SupportedLocale) => {
    setLocale(newLoc);
    trackPageView(window.location.pathname, document.title);
    trackCalculatorEngagement(activeTab, 'locale_selected', { locale: newLoc });
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/salary-after-tax')) return 'salary-after-tax';
      if (pathname.includes('/salary-needed')) return 'salary-needed';
      if (pathname.includes('/cost-of-living')) return 'cost-of-living';
      if (pathname.includes('/compare')) return 'compare';
      if (pathname.includes('/job-offers')) return 'job-offers';
      if (pathname.includes('/salary-worth')) return 'salary-worth';
      if (pathname.includes('/guides/')) return 'nyc-100k-guide';

      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      if (
        tabParam &&
        [
          'salary-worth',
          'salary-needed',
          'salary-after-tax',
          'cost-of-living',
          'compare',
          'job-offers',
          'nyc-100k-guide',
        ].includes(tabParam)
      ) {
        return tabParam;
      }
    }
    return 'salary-worth';
  });
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string>('nyc-100k');

  // Core Scenario state
  const [scenario, setScenario] = useState<LivWorthScenario>(DEFAULT_NYC_100K_SCENARIO);
  const [actualRentMajor, setActualRentMajor] = useState<number | undefined>(undefined);

  // Dynamic calculation metadata returned by authoritative backend services
  const [calculationMetadata, setCalculationMetadata] = useState<{
    evidenceSourceIds: string[];
    ruleVersions: { taxRuleVersion?: string; colDate?: string };
  }>(() => {
    try {
      const initialOutcome = SalaryWorthCalculator.calculate(DEFAULT_NYC_100K_SCENARIO);
      return {
        evidenceSourceIds: initialOutcome.evidenceSourceIds,
        ruleVersions: {
          taxRuleVersion: initialOutcome.taxRuleVersion,
          colDate: initialOutcome.colDate,
        },
      };
    } catch {
      return { evidenceSourceIds: [], ruleVersions: {} };
    }
  });

  // Keep calculation metadata aligned when scenario location changes
  const lastLocationIdRef = useRef<string>(scenario.location.id);
  useEffect(() => {
    if (lastLocationIdRef.current !== scenario.location.id) {
      lastLocationIdRef.current = scenario.location.id;
      try {
        const outcome = SalaryWorthCalculator.calculate(scenario);
        const isTaxUnavailable = outcome.tax?.status === 'TAX_CALCULATION_UNAVAILABLE';
        setCalculationMetadata({
          evidenceSourceIds: isTaxUnavailable
            ? (outcome.costOfLiving?.evidenceSourceIds || [])
            : outcome.evidenceSourceIds,
          ruleVersions: {
            taxRuleVersion: isTaxUnavailable ? undefined : (outcome.taxRuleVersion || outcome.tax?.taxRuleVersion),
            colDate: outcome.colDate || outcome.costOfLiving?.datasetVersion,
          },
        });
      } catch {
        setCalculationMetadata({
          evidenceSourceIds: [],
          ruleVersions: {},
        });
      }
    }
  }, [scenario]);

  // Modals & Drawers state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState<boolean>(false);
  const [correctionJurisdiction, setCorrectionJurisdiction] = useState<string>('');

  const isInitialMount = useRef<boolean>(true);
  const hasUserInteractedRef = useRef<boolean>(false);

  // Sync state from current URL query parameters (supports deep links and Back/Forward)
  const syncStateFromUrl = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const cityParam = params.get('city');
      const salaryParam = params.get('salary');
      const tabParam = params.get('tab') as ActiveTab;
      const rentParam = params.get('rent');
      const langParam = params.get('lang') as SupportedLocale | null;

      if (langParam && TRANSLATIONS[langParam]) {
        setLocale(langParam);
        setStoredLocale(langParam);
      } else {
        const pathname = window.location.pathname;
        const pathSegments = pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0 && TRANSLATIONS[pathSegments[0] as SupportedLocale]) {
          setLocale(pathSegments[0] as SupportedLocale);
          setStoredLocale(pathSegments[0] as SupportedLocale);
        }
      }

      const pathname = window.location.pathname;
      if (pathname.includes('/salary-after-tax')) {
        setActiveTab('salary-after-tax');
      } else if (pathname.includes('/salary-needed')) {
        setActiveTab('salary-needed');
      } else if (pathname.includes('/cost-of-living')) {
        setActiveTab('cost-of-living');
      } else if (pathname.includes('/compare')) {
        setActiveTab('compare');
      } else if (pathname.includes('/job-offers')) {
        setActiveTab('job-offers');
      } else if (pathname.includes('/salary-worth')) {
        setActiveTab('salary-worth');
      } else if (
        tabParam &&
        [
          'salary-worth',
          'salary-needed',
          'salary-after-tax',
          'cost-of-living',
          'compare',
          'job-offers',
          'nyc-100k-guide',
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }

      const targetCity = cityParam && CITIES[cityParam] ? CITIES[cityParam] : undefined;
      const salaryNum = salaryParam !== null && salaryParam !== '' ? parseFloat(salaryParam) : undefined;
      const rentNum = rentParam !== null && rentParam !== '' ? parseFloat(rentParam) : undefined;
      const guideParam = params.get('guide');

      if (guideParam && VALID_GUIDE_SLUGS.has(guideParam)) {
        setSelectedGuideSlug(guideParam);
      }

      if (targetCity || (salaryNum !== undefined && !isNaN(salaryNum)) || (rentNum !== undefined && !isNaN(rentNum))) {
        setScenario((prev) => {
          const loc = targetCity || prev.location;
          let sal = prev.compensation.baseSalary;
          if (salaryNum !== undefined && !isNaN(salaryNum)) {
            sal = createMoney(salaryNum, loc.currency);
          } else if (targetCity && targetCity.currency !== prev.location.currency) {
            sal = createMoney(getDefaultSalaryForCurrency(loc.currency), loc.currency);
          }

          const overrides =
            rentNum !== undefined && !isNaN(rentNum)
              ? { ...prev.overrides, actualRentMonthlyMinor: createMoney(rentNum, loc.currency).amountMinor }
              : (targetCity && targetCity.id !== prev.location.id ? undefined : prev.overrides);

          return {
            ...prev,
            location: loc,
            compensation: {
              ...prev.compensation,
              baseSalary: sal,
            },
            overrides,
          };
        });
        if (rentNum !== undefined && !isNaN(rentNum)) {
          setActualRentMajor(rentNum);
        } else if (targetCity && targetCity.id !== scenario.location.id) {
          setActualRentMajor(undefined);
        }
      }
    } catch {
      // Graceful fallback if URL manipulation is restricted
    }
  }, []);

  // Initial mount: read URL and register popstate listener for browser Back/Forward
  useEffect(() => {
    syncStateFromUrl();

    const handlePopState = () => {
      syncStateFromUrl();
      if (typeof document !== 'undefined') {
        const title = TAB_TITLES[activeTab] || 'LivWorthy — Know what your income is really worth';
        document.title = title;
        trackPageView(window.location.pathname, title);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncStateFromUrl, activeTab]);

  // Sync state to URL query parameters (debounced to avoid history flooding & spurious GA4 history events)
  const replaceStateTimerRef = useRef<any>(null);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (replaceStateTimerRef.current) clearTimeout(replaceStateTimerRef.current);
    replaceStateTimerRef.current = setTimeout(() => {
      try {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        params.set('city', scenario.location.id);
        params.set('salary', toMajor(scenario.compensation.baseSalary).toString());
        if (activeTab === 'nyc-100k-guide' && selectedGuideSlug) {
          params.set('guide', selectedGuideSlug);
        }
        if (actualRentMajor !== undefined && isFinite(actualRentMajor)) {
          params.set('rent', actualRentMajor.toString());
        }
        const cleanTabs = ['salary-worth', 'salary-needed', 'salary-after-tax', 'cost-of-living', 'compare', 'job-offers'];
        const isCleanRoute = cleanTabs.some((t) => window.location.pathname.endsWith(`/${t}`));
        if (!isCleanRoute) {
          params.set('tab', activeTab);
        } else {
          params.delete('tab');
        }
        const q = params.toString();
        const expectedSearch = q ? `?${q}` : '';
        if (window.location.search !== expectedSearch) {
          const newUrl = expectedSearch ? `${window.location.pathname}${expectedSearch}` : window.location.pathname;
          window.history.replaceState(null, '', newUrl);
        }
      } catch {
        // Ignore in strict iframes
      }
    }, 600);

    return () => {
      if (replaceStateTimerRef.current) clearTimeout(replaceStateTimerRef.current);
    };
  }, [scenario.location.id, scenario.compensation.baseSalary, activeTab, selectedGuideSlug, actualRentMajor]);

  // Tab switching pushes new browser history state
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    try {
      if (typeof window === 'undefined') return;
      const title = TAB_TITLES[tab] || document.title;
      document.title = title;

      let targetPath: string;
      if (tab === 'salary-worth') {
        targetPath = locale === 'en' ? '/' : `/${locale}`;
      } else if (tab === 'nyc-100k-guide') {
        targetPath = locale === 'en' ? `/guides/${selectedGuideSlug}` : `/${locale}/guides/${selectedGuideSlug}`;
      } else {
        targetPath = locale === 'en' ? `/${tab}` : `/${locale}/${tab}`;
      }

      const params = new URLSearchParams(window.location.search);
      params.delete('tab');
      const q = params.toString();
      const newUrl = q ? `${targetPath}?${q}` : targetPath;
      window.history.pushState(null, '', newUrl);

      trackPageView(targetPath, title);
      trackCalculatorEngagement(tab, 'tab_selected', { locale });
    } catch {}
  };

  // Dispatch single authoritative initial pageview on client load
  useEffect(() => {
    const title = TAB_TITLES[activeTab] || document.title;
    trackPageView(window.location.pathname, title);
  }, []);

  // Track calculation interactions (debounced, and ONLY after meaningful user-initiated calculation changes)
  const calculationTimerRef = useRef<any>(null);
  const triggerUserInitiatedCalculation = useCallback(
    (toolName: string, cityId: string, currency: string) => {
      if (calculationTimerRef.current) clearTimeout(calculationTimerRef.current);
      calculationTimerRef.current = setTimeout(() => {
        trackCalculationOutcome(toolName, cityId, currency);
      }, 1000);
    },
    []
  );

  // Updates from customizer
  const handleUpdateHousehold = (updatedHousehold: HouseholdProfile) => {
    hasUserInteractedRef.current = true;
    setScenario((prev) => {
      triggerUserInitiatedCalculation(activeTab, prev.location.id, prev.compensation.baseSalary.currency);
      return {
        ...prev,
        household: updatedHousehold,
      };
    });
  };

  const handleUpdateTaxProfile = (updatedTaxProfile: TaxProfile) => {
    hasUserInteractedRef.current = true;
    setScenario((prev) => {
      triggerUserInitiatedCalculation(activeTab, prev.location.id, prev.compensation.baseSalary.currency);
      return {
        ...prev,
        taxProfile: updatedTaxProfile,
      };
    });
  };

  const handleUpdateRentOverride = (rentMajor: number | undefined) => {
    hasUserInteractedRef.current = true;
    setActualRentMajor(rentMajor);
    setScenario((prev) => {
      triggerUserInitiatedCalculation(activeTab, prev.location.id, prev.compensation.baseSalary.currency);
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          actualRentMonthlyMinor:
            rentMajor !== undefined && isFinite(rentMajor)
              ? createMoney(rentMajor, prev.location.currency).amountMinor
              : undefined,
        },
      };
    });
  };

  const handleSwitchToSalaryWorthWithSalary = (salaryMajor: number, cityId?: string) => {
    hasUserInteractedRef.current = true;
    const targetCity = cityId ? (CITIES[cityId] || scenario.location) : scenario.location;
    triggerUserInitiatedCalculation('salary-worth', targetCity.id, targetCity.currency);
    setScenario((prev) => ({
      ...prev,
      location: targetCity,
      compensation: {
        ...prev.compensation,
        baseSalary: createMoney(salaryMajor, targetCity.currency),
      },
    }));
    setActiveTab('salary-worth');

    try {
      if (typeof window === 'undefined') return;
      const title = TAB_TITLES['salary-worth'];
      document.title = title;
      const params = new URLSearchParams();
      params.set('city', targetCity.id);
      params.set('salary', salaryMajor.toString());
      params.set('tab', 'salary-worth');
      if (actualRentMajor !== undefined && isFinite(actualRentMajor)) {
        params.set('rent', actualRentMajor.toString());
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState(null, '', newUrl);
      trackPageView(window.location.pathname, title);
    } catch {}
  };

  // Dynamic evidence update callbacks from calculator views
  const handleSalaryWorthOutcome = useCallback((outcome: LivWorthCalculationOutcome) => {
    const isTaxUnavailable = outcome.tax?.status === 'TAX_CALCULATION_UNAVAILABLE';
    setCalculationMetadata({
      evidenceSourceIds: isTaxUnavailable
        ? (outcome.costOfLiving?.evidenceSourceIds || [])
        : outcome.evidenceSourceIds,
      ruleVersions: {
        taxRuleVersion: isTaxUnavailable ? undefined : (outcome.taxRuleVersion || outcome.tax?.taxRuleVersion),
        colDate: outcome.colDate || outcome.costOfLiving?.datasetVersion,
      },
    });
  }, []);

  const handleSalaryNeededResult = useCallback((result: SalaryNeededResult) => {
    if (result.outcomeWithRequiredSalary) {
      const isTaxUnavailable = result.outcomeWithRequiredSalary.tax?.status === 'TAX_CALCULATION_UNAVAILABLE';
      setCalculationMetadata({
        evidenceSourceIds: isTaxUnavailable
          ? (result.outcomeWithRequiredSalary.costOfLiving?.evidenceSourceIds || [])
          : result.outcomeWithRequiredSalary.evidenceSourceIds,
        ruleVersions: {
          taxRuleVersion: isTaxUnavailable ? undefined : (result.outcomeWithRequiredSalary.taxRuleVersion || result.outcomeWithRequiredSalary.tax?.taxRuleVersion),
          colDate: result.outcomeWithRequiredSalary.colDate || result.outcomeWithRequiredSalary.costOfLiving?.datasetVersion,
        },
      });
    }
  }, []);

  const handleTaxResult = useCallback((tax: TaxResult) => {
    const isUnavailable = tax.status === 'TAX_CALCULATION_UNAVAILABLE';
    setCalculationMetadata({
      evidenceSourceIds: isUnavailable ? [] : (tax.evidenceSourceIds || []),
      ruleVersions: {
        taxRuleVersion: isUnavailable ? undefined : tax.taxRuleVersion,
      },
    });
  }, []);

  const handleColResult = useCallback((col: CostOfLivingResult) => {
    setCalculationMetadata({
      evidenceSourceIds: col.evidenceSourceIds || [],
      ruleVersions: {
        colDate: col.datasetVersion,
      },
    });
  }, []);

  const handleComparisonResult = useCallback((comp: ComparisonResult) => {
    const isTaxAUnavailable = comp.outcomeA.tax?.status === 'TAX_CALCULATION_UNAVAILABLE';
    const isTaxBUnavailable = comp.outcomeB.tax?.status === 'TAX_CALCULATION_UNAVAILABLE';
    const evidenceA = isTaxAUnavailable ? (comp.outcomeA.costOfLiving?.evidenceSourceIds || []) : comp.outcomeA.evidenceSourceIds;
    const evidenceB = isTaxBUnavailable ? (comp.outcomeB.costOfLiving?.evidenceSourceIds || []) : comp.outcomeB.evidenceSourceIds;
    const combinedEvidence = Array.from(
      new Set([...evidenceA, ...evidenceB])
    );

    let taxRuleVersion: string | undefined = undefined;
    if (!isTaxAUnavailable && !isTaxBUnavailable) {
      taxRuleVersion = `${comp.outcomeA.taxRuleVersion || comp.outcomeA.tax.taxRuleVersion} / ${comp.outcomeB.taxRuleVersion || comp.outcomeB.tax.taxRuleVersion}`;
    } else if (!isTaxAUnavailable) {
      taxRuleVersion = comp.outcomeA.taxRuleVersion || comp.outcomeA.tax.taxRuleVersion;
    } else if (!isTaxBUnavailable) {
      taxRuleVersion = comp.outcomeB.taxRuleVersion || comp.outcomeB.tax.taxRuleVersion;
    }

    setCalculationMetadata({
      evidenceSourceIds: combinedEvidence,
      ruleVersions: {
        taxRuleVersion,
        colDate: comp.outcomeA.colDate || comp.outcomeA.costOfLiving.datasetVersion,
      },
    });
  }, []);

  const handleSelectGuide = (slug: string) => {
    hasUserInteractedRef.current = true;
    setSelectedGuideSlug(slug);
    setActiveTab('nyc-100k-guide');
    try {
      if (typeof window === 'undefined') return;
      const title = 'Salary & Living Cost Guide — LivWorthy';
      document.title = title;
      const params = new URLSearchParams(window.location.search);
      params.set('tab', 'nyc-100k-guide');
      params.set('guide', slug);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState(null, '', newUrl);
      trackPageView(`/guides/${slug}`, title);
      trackCalculatorEngagement('nyc-100k-guide', 'guide_selected', { guide: slug });
    } catch {}
  };

  const handleSelectCityFromLink = (cityId: string) => {
    hasUserInteractedRef.current = true;
    const targetCity = CITIES[cityId];
    if (targetCity) {
      setScenario((prev) => {
        const isCurrencyChange = targetCity.currency !== prev.location.currency;
        const targetSalaryMajor = isCurrencyChange
          ? getDefaultSalaryForCurrency(targetCity.currency)
          : toMajor(prev.compensation.baseSalary);
        return {
          ...prev,
          location: targetCity,
          compensation: {
            ...prev.compensation,
            baseSalary: createMoney(targetSalaryMajor, targetCity.currency),
          },
          overrides: undefined, // Reset rent override on city change
        };
      });
      setActualRentMajor(undefined);
      setActiveTab('salary-worth');
      try {
        if (typeof window === 'undefined') return;
        const title = TAB_TITLES['salary-worth'];
        document.title = title;
        const targetSalaryMajor = targetCity.currency !== scenario.location.currency
          ? getDefaultSalaryForCurrency(targetCity.currency)
          : toMajor(scenario.compensation.baseSalary);
        const params = new URLSearchParams();
        params.set('city', targetCity.id);
        params.set('salary', targetSalaryMajor.toString());
        params.set('tab', 'salary-worth');
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState(null, '', newUrl);
        trackPageView(window.location.pathname, title);
        trackCalculatorEngagement('salary-worth', 'city_selected', { cityId: targetCity.id });
      } catch {}
    }
  };

  const handleSelectCountryFromLink = (countryId: string) => {
    const premierCity = Object.values(CITIES).find((c) => c.countryId === countryId);
    if (premierCity) {
      handleSelectCityFromLink(premierCity.id);
    }
  };

  const handleSelectRegionFromLink = (regionId: string) => {
    const premierCity = Object.values(CITIES).find((c) => c.regionId === regionId);
    if (premierCity) {
      handleSelectCityFromLink(premierCity.id);
    }
  };

  const handleUpdateScenario = useCallback((nextScenario: LivWorthScenario) => {
    hasUserInteractedRef.current = true;
    setScenario(nextScenario);
    triggerUserInitiatedCalculation(
      activeTab,
      nextScenario.location.id,
      nextScenario.compensation.baseSalary.currency
    );
    try {
      const outcome = SalaryWorthCalculator.calculate(nextScenario);
      const isTaxUnavailable = outcome.tax?.status === 'TAX_CALCULATION_UNAVAILABLE';
      setCalculationMetadata({
        evidenceSourceIds: isTaxUnavailable
          ? (outcome.costOfLiving?.evidenceSourceIds || [])
          : outcome.evidenceSourceIds,
        ruleVersions: {
          taxRuleVersion: isTaxUnavailable ? undefined : (outcome.taxRuleVersion || outcome.tax?.taxRuleVersion),
          colDate: outcome.colDate || outcome.costOfLiving?.datasetVersion,
        },
      });
    } catch {}
  }, [activeTab, triggerUserInitiatedCalculation]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5]">
      {/* Persistent Global Header with brand and live navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        locale={locale}
        onSelectLocale={handleSelectLocale}
      />

      {/* Main Dynamic Calculator Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'salary-worth' && (
          <>
            <SalaryWorthView
              scenario={scenario}
              onUpdateScenario={handleUpdateScenario}
              actualRentMajor={actualRentMajor}
              onUpdateRentOverride={handleUpdateRentOverride}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onNavigateToCompare={() => handleSelectTab('compare')}
              onCalculationOutcome={handleSalaryWorthOutcome}
            />
            <HomeEditorialShowcase />
          </>
        )}

        {activeTab === 'salary-needed' && (
          <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div></div>}>
            <SalaryNeededView
              initialScenario={scenario}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onSwitchToSalaryWorthWithSalary={handleSwitchToSalaryWorthWithSalary}
              onCalculationResult={handleSalaryNeededResult}
            />
          </React.Suspense>
        )}

        {activeTab === 'salary-after-tax' && (
          <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div></div>}>
            <SalaryAfterTaxView
              onSwitchToSalaryWorthWithSalary={handleSwitchToSalaryWorthWithSalary}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onCalculationResult={handleTaxResult}
            />
          </React.Suspense>
        )}

        {activeTab === 'cost-of-living' && (
          <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div></div>}>
            <CostOfLivingView
              household={scenario.household}
              actualRentMajor={actualRentMajor}
              onUpdateRentOverride={handleUpdateRentOverride}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onCalculationResult={handleColResult}
            />
          </React.Suspense>
        )}

        {activeTab === 'compare' && (
          <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div></div>}>
            <CompareView
              initialScenarioA={scenario}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onComparisonResult={handleComparisonResult}
            />
          </React.Suspense>
        )}

        {activeTab === 'job-offers' && (
          <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div></div>}>
            <JobOfferCompareView
              initialScenario={scenario}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onComparisonResult={handleComparisonResult}
            />
          </React.Suspense>
        )}

        {activeTab === 'nyc-100k-guide' && (
          <React.Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div></div>}>
            <SeoArticlePage
              initialGuideSlug={selectedGuideSlug}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenEvidence={() => setIsEvidenceOpen(true)}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
              onReportCorrection={(jurisdiction) => {
                setCorrectionJurisdiction(jurisdiction || scenario.location.name);
                setIsCorrectionOpen(true);
              }}
              onNavigateToCompare={() => handleSelectTab('compare')}
              onNavigateHome={() => handleSelectTab('salary-worth')}
              onNavigateCity={handleSelectCityFromLink}
              onNavigateCountry={handleSelectCountryFromLink}
              onNavigateRegion={handleSelectRegionFromLink}
              onSelectGuide={handleSelectGuide}
            />
          </React.Suspense>
        )}
      </main>

      {/* Persistent Global Footer: Suspended so it does not block initial above-the-fold render */}
      <React.Suspense fallback={null}>
        <Footer
          onOpenMethodology={() => setIsMethodologyOpen(true)}
          onOpenEvidence={() => setIsEvidenceOpen(true)}
          onOpenCorrections={() => {
            setCorrectionJurisdiction(scenario.location.name);
            setIsCorrectionOpen(true);
          }}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          onSelectTab={handleSelectTab}
          onSelectGuide={handleSelectGuide}
          onSelectCity={handleSelectCityFromLink}
        />
      </React.Suspense>

      {/* Drawers and Modals: Suspended to avoid unused JS on initial load */}
      <React.Suspense fallback={null}>
        {isCustomizerOpen && (
          <CustomizationDrawer
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            household={scenario.household}
            taxProfile={scenario.taxProfile}
            actualRentMajor={actualRentMajor}
            onUpdateHousehold={handleUpdateHousehold}
            onUpdateTaxProfile={handleUpdateTaxProfile}
            onUpdateRentOverride={handleUpdateRentOverride}
          />
        )}

        {isEvidenceOpen && (
          <EvidenceDrawer
            isOpen={isEvidenceOpen}
            onClose={() => setIsEvidenceOpen(false)}
            sourceIds={calculationMetadata.evidenceSourceIds}
            ruleVersions={calculationMetadata.ruleVersions}
          />
        )}

        {isMethodologyOpen && (
          <MethodologyModal
            isOpen={isMethodologyOpen}
            onClose={() => setIsMethodologyOpen(false)}
            onOpenEvidence={() => {
              setIsMethodologyOpen(false);
              setIsEvidenceOpen(true);
            }}
          />
        )}

        {isDiagnosticsOpen && (
          <SystemDiagnosticsModal
            isOpen={isDiagnosticsOpen}
            onClose={() => setIsDiagnosticsOpen(false)}
          />
        )}

        {isCorrectionOpen && (
          <DataCorrectionModal
            isOpen={isCorrectionOpen}
            onClose={() => setIsCorrectionOpen(false)}
            defaultJurisdiction={correctionJurisdiction}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <LanguageSuggestionBanner />
      <AppContent />
      <CookieConsentBanner />
    </I18nProvider>
  );
}
