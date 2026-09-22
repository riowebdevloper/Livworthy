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

  public static resolve(countryId: string): CountryCapability {
    const country = COUNTRIES[countryId];
    const countryName = country?.name || countryId;
    const priority = this.getPriority(countryId);
    const hasTaxAdapter = this.hasDedicatedTaxAdapter(countryId);
    const support = TaxRegistry.getCountrySupport(countryId);

    const limitations: string[] = [];

    let taxYear: number | undefined;
    let taxRuleVersion: string | undefined;

    if (hasTaxAdapter) {
      taxYear = 2024;
      switch (countryId) {
        case 'US':
          taxRuleVersion = 'US-FED-NY-NYC-2024.1';
          limitations.push('Single filer standard deduction; localized state/local schedules for major commercial metros.');
          break;
        case 'GB':
          taxRuleVersion = 'GB-HMRC-PAYE-2024.1';
          limitations.push('England/Wales standard & Scottish progressive bands; personal allowance reduction over £100k.');
          break;
        case 'AE':
          taxRuleVersion = 'AE-FTA-2024.1';
          limitations.push('Statutory 0% employment income tax; corporate and excise taxes excluded from payroll.');
          break;
        case 'CA':
          taxRuleVersion = 'CA-CRA-ON-2024.1';
          limitations.push('Federal + Ontario provincial schedules, CPP1/CPP2, and Employment Insurance.');
          break;
        case 'AU':
          taxRuleVersion = 'AU-ATO-2024-25.1';
          limitations.push('Revised Stage 3 tax cuts (effective July 2024) and Medicare levy.');
          break;
        case 'DE':
          taxRuleVersion = 'DE-BMF-2024.1';
          limitations.push('EStG polynomial formula and standard statutory social contributions (KV, RV, AV, PV).');
          break;
        case 'SG':
          taxRuleVersion = 'SG-IRAS-YA2024.1';
          limitations.push('Resident progressive tax schedule; CPF statutory contributions for citizens/PR.');
          break;
        case 'QA':
          taxRuleVersion = 'QA-GTA-2024.1';
          limitations.push('Statutory 0% employment income tax for resident and foreign employees.');
          break;
        case 'SA':
          taxRuleVersion = 'SA-ZATCA-2024.1';
          limitations.push('0% personal income tax on employee compensation; GOSI contributions for Saudi nationals.');
          break;
        case 'NZ':
          taxRuleVersion = 'NZ-IRD-2024.1';
          limitations.push('Post-July 2024 tax thresholds and ACC earner levy.');
          break;
        case 'FR':
          taxRuleVersion = 'FR-DGFIP-2024.1';
          limitations.push('Single employee scale & URSSAF social charges; quotient familial not modeled.');
          break;
        case 'ES':
          taxRuleVersion = 'ES-AEAT-2024.1';
          limitations.push('National and standard Madrid/Catalonia scales; specific autonomous regional deductions limited.');
          break;
        case 'NL':
          taxRuleVersion = 'NL-BELASTING-2024.1';
          limitations.push('Box 1 income tax & national insurance; 30% ruling not applied.');
          break;
        case 'IE':
          taxRuleVersion = 'IE-REVENUE-2024.1';
          limitations.push('Single filer standard rate band, personal tax credit, USC, and PRSI Class A.');
          break;
        case 'CH':
          taxRuleVersion = 'CH-ESTV-ZH-2024.1';
          limitations.push('Federal direct tax and standard Zurich cantonal/communal multiplier.');
          break;
      }
    } else {
      limitations.push(
        `Statutory tax schedules for ${countryName} are in verification. Calculations for ${countryName} project living costs against pre-tax gross compensation without artificial tax approximations.`
      );
    }

    return {
      countryId,
      countryName,
      commercialPriority: priority,
      verificationStatus: hasTaxAdapter ? support.verificationStatus : 'LIMITED',
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
