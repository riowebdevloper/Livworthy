import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CustomizationDrawer } from './components/calculator/CustomizationDrawer';
import { EvidenceDrawer } from './components/calculator/EvidenceDrawer';
import { SalaryWorthView } from './components/calculator/SalaryWorthView';
import { SalaryNeededView } from './components/calculator/SalaryNeededView';
import { SalaryAfterTaxView } from './components/calculator/SalaryAfterTaxView';
import { CostOfLivingView } from './components/calculator/CostOfLivingView';
import { CompareView } from './components/calculator/CompareView';
import { JobOfferCompareView } from './components/calculator/JobOfferCompareView';
import { Header, ActiveTab } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MethodologyModal } from './components/seo/MethodologyModal';
import { SeoArticlePage } from './components/seo/SeoArticlePage';
import { SystemDiagnosticsModal } from './components/system/SystemDiagnosticsModal';
import { CITIES } from './data/locations';
import { DEFAULT_NYC_100K_SCENARIO } from './data/presets';
import { createMoney, toMajor } from './lib/money';
import { HouseholdProfile, CostOfLivingResult } from './types/col';
import { LivWorthCalculationOutcome, LivWorthScenario } from './types/scenario';
import { TaxProfile, TaxResult } from './types/tax';
import { ComparisonResult } from './engines/calculator-core/compare';
import { SalaryNeededResult } from './engines/calculator-core/salary-needed';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('salary-worth');

  // Core Scenario state
  const [scenario, setScenario] = useState<LivWorthScenario>(DEFAULT_NYC_100K_SCENARIO);
  const [actualRentMajor, setActualRentMajor] = useState<number | undefined>(undefined);

  // Dynamic calculation metadata returned by authoritative backend services
  const [calculationMetadata, setCalculationMetadata] = useState<{
    evidenceSourceIds: string[];
    ruleVersions: { taxRuleVersion?: string; colDate?: string };
  }>({
    evidenceSourceIds: [
      'us-irs-tax-2024',
      'us-ssa-fica-2024',
      'us-nys-tax-2024',
      'us-nyc-tax-2024',
      'us-hud-nyc-fmr-2024',
      'us-bls-cpi-nyc-2024',
      'us-mta-nyc-transit-2024',
    ],
    ruleVersions: {
      taxRuleVersion: 'US-FED-NY-NYC-2024.1',
      colDate: '2024-12',
    },
  });

  // Modals & Drawers state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  const isInitialMount = useRef<boolean>(true);

  // Sync state from current URL query parameters (supports deep links and Back/Forward)
  const syncStateFromUrl = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const cityParam = params.get('city');
      const salaryParam = params.get('salary');
      const tabParam = params.get('tab') as ActiveTab;
      const rentParam = params.get('rent');

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
        setActiveTab(tabParam);
      }

      const targetCity = cityParam && CITIES[cityParam] ? CITIES[cityParam] : undefined;
      const salaryNum = salaryParam ? parseFloat(salaryParam) : undefined;
      const rentNum = rentParam ? parseFloat(rentParam) : undefined;

      if (targetCity || (salaryNum && !isNaN(salaryNum)) || (rentNum && !isNaN(rentNum))) {
        setScenario((prev) => {
          const loc = targetCity || prev.location;
          const sal =
            salaryNum && !isNaN(salaryNum)
              ? createMoney(salaryNum, loc.currency)
              : prev.compensation.baseSalary;
          return {
            ...prev,
            location: loc,
            compensation: {
              ...prev.compensation,
              baseSalary: sal,
            },
            overrides:
              rentNum && !isNaN(rentNum)
                ? { ...prev.overrides, actualRentMonthlyMinor: Math.round(rentNum * 100) }
                : prev.overrides,
          };
        });
        if (rentNum && !isNaN(rentNum)) {
          setActualRentMajor(rentNum);
        } else {
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
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncStateFromUrl]);

  // Sync state to URL query parameters
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams();
      params.set('city', scenario.location.id);
      params.set('salary', toMajor(scenario.compensation.baseSalary).toString());
      params.set('tab', activeTab);
      if (actualRentMajor) {
        params.set('rent', actualRentMajor.toString());
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    } catch {
      // Ignore in strict iframes
    }
  }, [scenario.location.id, scenario.compensation.baseSalary, activeTab, actualRentMajor]);

  // Tab switching pushes new browser history state
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      params.set('tab', tab);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState(null, '', newUrl);
    } catch {}
  };

  // Updates from customizer
  const handleUpdateHousehold = (updatedHousehold: HouseholdProfile) => {
    setScenario((prev) => ({
      ...prev,
      household: updatedHousehold,
    }));
  };

  const handleUpdateTaxProfile = (updatedTaxProfile: TaxProfile) => {
    setScenario((prev) => ({
      ...prev,
      taxProfile: updatedTaxProfile,
    }));
  };

  const handleUpdateRentOverride = (rentMajor: number | undefined) => {
    setActualRentMajor(rentMajor);
    setScenario((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        actualRentMonthlyMinor: rentMajor ? rentMajor * 100 : undefined,
      },
    }));
  };

  const handleSwitchToSalaryWorthWithSalary = (salaryMajor: number, cityId?: string) => {
    const targetCity = cityId ? (CITIES[cityId] || scenario.location) : scenario.location;
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
      const params = new URLSearchParams();
      params.set('city', targetCity.id);
      params.set('salary', salaryMajor.toString());
      params.set('tab', 'salary-worth');
      if (actualRentMajor) {
        params.set('rent', actualRentMajor.toString());
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState(null, '', newUrl);
    } catch {}
  };

  // Dynamic evidence update callbacks from calculator views
  const handleSalaryWorthOutcome = useCallback((outcome: LivWorthCalculationOutcome) => {
    setCalculationMetadata({
      evidenceSourceIds: outcome.evidenceSourceIds,
      ruleVersions: {
        taxRuleVersion: outcome.taxRuleVersion || outcome.tax?.taxRuleVersion,
        colDate: outcome.colDate || outcome.costOfLiving?.datasetVersion,
      },
    });
  }, []);

  const handleSalaryNeededResult = useCallback((result: SalaryNeededResult) => {
    if (result.outcomeWithRequiredSalary) {
      setCalculationMetadata({
        evidenceSourceIds: result.outcomeWithRequiredSalary.evidenceSourceIds,
        ruleVersions: {
          taxRuleVersion: result.outcomeWithRequiredSalary.taxRuleVersion || result.outcomeWithRequiredSalary.tax?.taxRuleVersion,
          colDate: result.outcomeWithRequiredSalary.colDate || result.outcomeWithRequiredSalary.costOfLiving?.datasetVersion,
        },
      });
    }
  }, []);

  const handleTaxResult = useCallback((tax: TaxResult) => {
    setCalculationMetadata((prev) => ({
      evidenceSourceIds: tax.evidenceSourceIds,
      ruleVersions: {
        ...prev.ruleVersions,
        taxRuleVersion: tax.taxRuleVersion,
      },
    }));
  }, []);

  const handleColResult = useCallback((col: CostOfLivingResult) => {
    setCalculationMetadata((prev) => ({
      evidenceSourceIds: col.evidenceSourceIds,
      ruleVersions: {
        ...prev.ruleVersions,
        colDate: col.datasetVersion,
      },
    }));
  }, []);

  const handleComparisonResult = useCallback((comp: ComparisonResult) => {
    const combinedEvidence = Array.from(
      new Set([...comp.outcomeA.evidenceSourceIds, ...comp.outcomeB.evidenceSourceIds])
    );
    setCalculationMetadata({
      evidenceSourceIds: combinedEvidence,
      ruleVersions: {
        taxRuleVersion: `${comp.outcomeA.taxRuleVersion || comp.outcomeA.tax.taxRuleVersion} / ${comp.outcomeB.taxRuleVersion || comp.outcomeB.tax.taxRuleVersion}`,
        colDate: comp.outcomeA.colDate || comp.outcomeA.costOfLiving.datasetVersion,
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#102A2E] flex flex-col font-sans antialiased selection:bg-[#DDF2EC] selection:text-[#102A2E]">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'salary-worth' && (
          <SalaryWorthView
            scenario={scenario}
            onUpdateScenario={setScenario}
            actualRentMajor={actualRentMajor}
            onUpdateRentOverride={handleUpdateRentOverride}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onNavigateToCompare={() => handleSelectTab('compare')}
            onCalculationOutcome={handleSalaryWorthOutcome}
          />
        )}

        {activeTab === 'salary-needed' && (
          <SalaryNeededView
            initialScenario={scenario}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onSwitchToSalaryWorthWithSalary={handleSwitchToSalaryWorthWithSalary}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onCalculationResult={handleSalaryNeededResult}
          />
        )}

        {activeTab === 'salary-after-tax' && (
          <SalaryAfterTaxView
            onSwitchToSalaryWorthWithSalary={handleSwitchToSalaryWorthWithSalary}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onCalculationResult={handleTaxResult}
          />
        )}

        {activeTab === 'cost-of-living' && (
          <CostOfLivingView
            household={scenario.household}
            actualRentMajor={actualRentMajor}
            onUpdateRentOverride={handleUpdateRentOverride}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onCalculationResult={handleColResult}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            initialScenarioA={scenario}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onComparisonResult={handleComparisonResult}
          />
        )}

        {activeTab === 'job-offers' && (
          <JobOfferCompareView
            initialScenario={scenario}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onComparisonResult={handleComparisonResult}
          />
        )}

        {activeTab === 'nyc-100k-guide' && (
          <SeoArticlePage
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onOpenMethodology={() => setIsMethodologyOpen(true)}
            onNavigateToCompare={() => handleSelectTab('compare')}
          />
        )}
      </main>

      {/* Persistent Global Footer */}
      <Footer
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onSelectTab={handleSelectTab}
      />

      {/* Drawers and Modals */}
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

      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        sourceIds={calculationMetadata.evidenceSourceIds}
        ruleVersions={calculationMetadata.ruleVersions}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        onOpenEvidence={() => {
          setIsMethodologyOpen(false);
          setIsEvidenceOpen(true);
        }}
      />

      <SystemDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
}
