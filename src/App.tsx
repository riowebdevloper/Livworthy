import React, { useState, useEffect } from 'react';
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
import { HouseholdProfile } from './types/col';
import { LivWorthScenario } from './types/scenario';
import { TaxProfile } from './types/tax';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('salary-worth');

  // Core Scenario state
  const [scenario, setScenario] = useState<LivWorthScenario>(DEFAULT_NYC_100K_SCENARIO);
  const [actualRentMajor, setActualRentMajor] = useState<number | undefined>(undefined);

  // Modals & Drawers state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  // Sync state with URL parameters on mount
  useEffect(() => {
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
        }
      }
    } catch {
      // Ignore if iframe restriction prevents url reading
    }
  }, []);

  // Update URL state when parameters change
  useEffect(() => {
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
  };

  // Compile list of evidence source IDs for the active location
  const evidenceSourceIds = [
    'irs-rev-proc-2023-34',
    'ssa-wage-base-2024',
    'nys-it-201-i-2024',
    'nyc-admin-code-11-1701',
    'hud-fmr-2024',
    'bls-cex-metro-2023',
    'census-acs-5yr-2022',
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#102A2E] flex flex-col font-sans antialiased selection:bg-[#DDF2EC] selection:text-[#102A2E]">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
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
            onNavigateToCompare={() => setActiveTab('compare')}
          />
        )}

        {activeTab === 'salary-needed' && (
          <SalaryNeededView
            initialScenario={scenario}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onSwitchToSalaryWorthWithSalary={handleSwitchToSalaryWorthWithSalary}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
          />
        )}

        {activeTab === 'salary-after-tax' && (
          <SalaryAfterTaxView
            onSwitchToSalaryWorthWithSalary={handleSwitchToSalaryWorthWithSalary}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
          />
        )}

        {activeTab === 'cost-of-living' && (
          <CostOfLivingView
            household={scenario.household}
            actualRentMajor={actualRentMajor}
            onUpdateRentOverride={handleUpdateRentOverride}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            initialScenarioA={scenario}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
          />
        )}

        {activeTab === 'job-offers' && (
          <JobOfferCompareView
            initialScenario={scenario}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
          />
        )}

        {activeTab === 'nyc-100k-guide' && (
          <SeoArticlePage
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenEvidence={() => setIsEvidenceOpen(true)}
            onOpenMethodology={() => setIsMethodologyOpen(true)}
            onNavigateToCompare={() => setActiveTab('compare')}
          />
        )}
      </main>

      {/* Persistent Global Footer */}
      <Footer
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onSelectTab={setActiveTab}
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
        sourceIds={evidenceSourceIds}
        ruleVersions={{
          taxRuleVersion: 'US-FED-NY-NYC-2024.1',
          colDate: '2024-Q3',
        }}
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
