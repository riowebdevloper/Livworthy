import { COUNTRIES } from '../../data/locations';
import { TaxRegistry, TaxVerificationStatus } from '../tax/tax-registry';

export interface CountryCapability {
  countryId: string;
  countryName: string;
  commercialPriority: 'A' | 'B' | 'C';
  verificationStatus: TaxVerificationStatus;

  // Real executable capabilities
  hasDedicatedTaxAdapter: boolean;
  supportsTaxCalculation: boolean;
  supportsCOL: boolean;
  supportsSalaryWorth: boolean;
  supportsSalaryNeeded: boolean;
  supportsComparison: boolean;
  supportsJobOffers: boolean;
  supportsRelocation: boolean;

  taxYear?: number;
  taxRuleVersion?: string;
  evidenceAvailable: boolean;

  limitations: string[];
}

export class CapabilityResolver {
  // 15 dedicated executable adapters registered in TaxRegistry
  private static readonly EXECUTABLE_TAX_ADAPTER_COUNTRIES = new Set<string>([
    'US', 'GB', 'AE', 'CA', 'AU', 'DE', 'SG', 'QA', 'SA', 'NZ', // 10 VERIFIED
    'FR', 'ES', 'NL', 'IE', 'CH',                                 // 5 LIMITED
  ]);

  private static readonly PRIORITY_A_COUNTRIES = new Set<string>([
    'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NL', 'CH', 'IE', 'AE', 'SG', 'NZ',
  ]);

  private static readonly PRIORITY_B_COUNTRIES = new Set<string>([
    'JP', 'KR', 'SA', 'QA', 'NO', 'SE', 'DK', 'FI', 'AT', 'BE', 'ES', 'IT', 'IL', 'HK', 'LU',
  ]);

  public static getPriority(countryId: string): 'A' | 'B' | 'C' {
    if (this.PRIORITY_A_COUNTRIES.has(countryId)) return 'A';
    if (this.PRIORITY_B_COUNTRIES.has(countryId)) return 'B';
    return 'C';
  }

  public static hasDedicatedTaxAdapter(countryId: string): boolean {
    return this.EXECUTABLE_TAX_ADAPTER_COUNTRIES.has(countryId);
  }

  public static supportsTaxCalculation(countryId: string): boolean {
    return this.hasDedicatedTaxAdapter(countryId);
  }

  public static resolve(countryId: string, requestedTaxYear: number = 2025): CountryCapability {
    const country = COUNTRIES[countryId];
    const countryName = country?.name || countryId;
    const priority = this.getPriority(countryId);
    const hasTaxAdapter = this.hasDedicatedTaxAdapter(countryId);
    const support = TaxRegistry.getCountrySupport(countryId);

    const limitations: string[] = [];

    let taxYear: number | undefined;
    let taxRuleVersion: string | undefined;

    if (hasTaxAdapter) {
      taxYear = requestedTaxYear;
      const isHistorical2024 = requestedTaxYear <= 2024;

      switch (countryId) {
        case 'US':
          taxRuleVersion = isHistorical2024 ? 'US-FED-NY-NYC-2024.1' : 'US-FED-NY-NYC-2025.1';
          limitations.push('Single filer standard deduction; localized state/local schedules for major commercial metros.');
          break;
        case 'GB':
          taxRuleVersion = isHistorical2024 ? 'UK-HMRC-2024.2' : 'GB-HMRC-2025.1';
          limitations.push('England/Wales standard & Scottish progressive bands; personal allowance reduction over £100k.');
          break;
        case 'AE':
          taxRuleVersion = isHistorical2024 ? 'UAE-FTA-2024.1' : 'AE-FTA-2025.1';
          limitations.push('Statutory 0% employment income tax; corporate and excise taxes excluded from payroll.');
          break;
        case 'CA':
          taxRuleVersion = isHistorical2024 ? 'CRA-2024.1' : 'CA-CRA-ON-2025.1';
          limitations.push('Federal + Ontario provincial schedules, CPP1/CPP2, and Employment Insurance.');
          break;
        case 'AU':
          taxRuleVersion = isHistorical2024 ? 'ATO-2024.2' : 'AU-ATO-2025.1';
          limitations.push('Revised Stage 3 tax cuts (effective July 2024) and Medicare levy.');
          break;
        case 'DE':
          taxRuleVersion = isHistorical2024 ? 'BZSt-2024.1' : 'DE-BMF-2025.1';
          limitations.push('EStG polynomial formula and standard statutory social contributions (KV, RV, AV, PV).');
          break;
        case 'SG':
          taxRuleVersion = isHistorical2024 ? 'IRAS-YA2024' : 'SG-IRAS-YA2025.1';
          limitations.push('Resident progressive tax schedule; CPF statutory contributions for citizens/PR.');
          break;
        case 'QA':
          taxRuleVersion = isHistorical2024 ? 'GTA-2024.1' : 'QA-GTA-2025.1';
          limitations.push('Statutory 0% employment income tax for resident and foreign employees.');
          break;
        case 'SA':
          taxRuleVersion = isHistorical2024 ? 'GULF-2024.1' : 'SA-ZATCA-2025.1';
          limitations.push('0% personal income tax on employee compensation; GOSI contributions for Saudi nationals.');
          break;
        case 'NZ':
          taxRuleVersion = isHistorical2024 ? 'IRD-2024.2' : 'NZ-IRD-2025.1';
          limitations.push('Post-July 2024 tax thresholds and ACC earner levy.');
          break;
        case 'FR':
          taxRuleVersion = isHistorical2024 ? 'DGFiP-2024.1' : 'FR-DGFIP-2025.1';
          limitations.push('Single employee scale & URSSAF social charges; quotient familial not modeled.');
          break;
        case 'ES':
          taxRuleVersion = isHistorical2024 ? 'AEAT-2024.1' : 'ES-AEAT-2025.1';
          limitations.push('National and standard Madrid/Catalonia scales; specific autonomous regional deductions limited.');
          break;
        case 'NL':
          taxRuleVersion = isHistorical2024 ? 'Belastingdienst-2024.1' : 'NL-BELASTING-2025.1';
          limitations.push('Box 1 income tax & national insurance; 30% ruling not applied.');
          break;
        case 'IE':
          taxRuleVersion = isHistorical2024 ? 'Revenue-2024.1' : 'IE-REVENUE-2025.1';
          limitations.push('Single filer standard rate band, personal tax credit, USC, and PRSI Class A.');
          break;
        case 'CH':
          taxRuleVersion = isHistorical2024 ? 'ESTV-2024.1' : 'CH-ESTV-ZH-2025.1';
          limitations.push('Federal direct tax and standard Zurich cantonal/communal multiplier.');
          break;
      }
    } else {
      taxRuleVersion = 'UNSUPPORTED-JURISDICTION';
      limitations.push(
        `Statutory tax schedules for ${countryName} are in verification. Dedicated executable tax adapter is not yet available; tax calculations return TAX_CALCULATION_UNAVAILABLE.`
      );
    }

    return {
      countryId,
      countryName,
      commercialPriority: priority,
      verificationStatus: hasTaxAdapter ? support.verificationStatus : 'UNSUPPORTED',
      hasDedicatedTaxAdapter: hasTaxAdapter,
      supportsTaxCalculation: hasTaxAdapter,
      supportsCOL: true, // Cost of living benchmarks available for all 39 markets
      supportsSalaryWorth: true, // Evaluates living costs and disposable income (identifying pre-tax status if tax unavailable)
      supportsSalaryNeeded: hasTaxAdapter, // Accurate reverse-solving requires executable tax adapter
      supportsComparison: true, // Cross-city comparison with FX conversion
      supportsJobOffers: true,
      supportsRelocation: true,
      taxYear,
      taxRuleVersion,
      evidenceAvailable: hasTaxAdapter,
      limitations,
    };
  }

  public static getAllCapabilities(): CountryCapability[] {
    return Object.keys(COUNTRIES).map((id) => this.resolve(id));
  }
}
