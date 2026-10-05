import { createMoney } from '../../lib/money';
import { LATEST_VERIFIED_TAX_YEAR } from '../../lib/tax-year-policy';
import { Money } from '../../types/money';
import { TaxProfile, TaxResult } from '../../types/tax';
import { AustraliaTaxAdapter } from './au/au-adapter';
import { CanadaTaxAdapter } from './ca/ca-adapter';
import { SwitzerlandTaxAdapter } from './ch/ch-adapter';
import { GermanyTaxAdapter } from './de/de-adapter';
import { SpainTaxAdapter } from './es/es-adapter';
import { FranceTaxAdapter } from './fr/fr-adapter';
import { IrelandTaxAdapter } from './ie/ie-adapter';
import { NetherlandsTaxAdapter } from './nl/nl-adapter';
import { NewZealandTaxAdapter } from './nz/nz-adapter';
import { QatarTaxAdapter } from './qa/qa-adapter';
import { SaudiTaxAdapter } from './sa/sa-adapter';
import { SingaporeTaxAdapter } from './sg/sg-adapter';
import { TaxAdapter, TaxContext } from './tax-adapter';
import { UaeTaxAdapter } from './uae/uae-adapter';
import { UkTaxAdapter } from './uk/uk-adapter';
import { FallbackUnsupportedTaxAdapter } from './unsupported/unsupported-adapter';
import { UsTaxAdapter } from './us/us-adapter';

/**
 * The most recent tax year for which verified statutory rules exist across all adapters.
 * Any request for a year beyond this MUST return TAX_CALCULATION_UNAVAILABLE — never silently
 * calculate using the latest known rules without disclosure.
 */
export const LATEST_STATUTORY_TAX_YEAR = LATEST_VERIFIED_TAX_YEAR;

export type TaxVerificationStatus = 'VERIFIED' | 'LIMITED' | 'PROVISIONAL' | 'UNSUPPORTED';

export interface TaxCountrySupport {
  countryId: string;
  name: string;
  verificationStatus: TaxVerificationStatus;
  isStatutorilyVerified: boolean;
  isSupported: boolean;
  notes: string;
}

export class TaxRegistry {
  private static readonly COUNTRY_METADATA: Record<
    string,
    { name: string; status: TaxVerificationStatus; notes: string }
  > = {
    // 10 VERIFIED ADAPTERS (Supported by executable golden-vector test suites)
    US: {
      name: 'United States',
      status: 'VERIFIED',
      notes: 'IRS Rev. Proc. 2025-32 (2026) & Rev. Proc. 2023-34 (2024), SSA FICA ($184,500 base), and state/local schedules verified with golden vectors.',
    },
    GB: {
      name: 'United Kingdom',
      status: 'VERIFIED',
      notes: 'HMRC 2024/25 & 2026/27 PAYE, personal allowance taper, Scottish rates, and NI Class 1 verified with golden vectors.',
    },
    AE: {
      name: 'United Arab Emirates',
      status: 'VERIFIED',
      notes: 'Federal Tax Authority (FTA) 0% statutory employment income tax verified under Federal Decree-Law No. 47/2022.',
    },
    CA: {
      name: 'Canada',
      status: 'VERIFIED',
      notes: 'CRA 2024 & 2026 Federal Brackets, BPA, CPP1/CPP2, EI, and provincial tax verified with golden vectors.',
    },
    AU: {
      name: 'Australia',
      status: 'VERIFIED',
      notes: 'ATO Revised Stage 3 personal tax cuts and Medicare levy verified with golden vectors.',
    },
    DE: {
      name: 'Germany',
      status: 'VERIFIED',
      notes: 'EStG § 32a statutory polynomial formula (2024 & 2026) and social insurance contributions (KV/RV/AV/PV) verified with golden vectors.',
    },
    SG: {
      name: 'Singapore',
      status: 'VERIFIED',
      notes: 'IRAS YA 2024 & YA 2026 progressive resident tax schedules verified with golden vectors.',
    },
    QA: {
      name: 'Qatar',
      status: 'VERIFIED',
      notes: 'General Tax Authority (GTA) 0% statutory personal employment income tax verified under Law No. 24/2018.',
    },
    SA: {
      name: 'Saudi Arabia',
      status: 'VERIFIED',
      notes: 'ZATCA 0% statutory employment income tax for employees verified under Royal Decree No. M/1.',
    },
    NZ: {
      name: 'New Zealand',
      status: 'VERIFIED',
      notes: 'Inland Revenue (IRD) post-July 2024/2026 thresholds and ACC earner levy verified with golden vectors.',
    },

    // 5 LIMITED ADAPTERS (Executable dedicated adapters with documented scope limitations)
    FR: {
      name: 'France',
      status: 'LIMITED',
      notes: 'DGFiP progressive scale and URSSAF CSG/CRDS/Retraite for single employee; quotient familial not fully modeled.',
    },
    NL: {
      name: 'Netherlands',
      status: 'LIMITED',
      notes: 'Box 1 progressive scale and basic tax credits; 30% ruling and complex asset boxes not modeled.',
    },
    CH: {
      name: 'Switzerland',
      status: 'LIMITED',
      notes: 'Federal direct tax and standard Zurich/Geneva cantonal/communal simplified tax multipliers.',
    },
    IE: {
      name: 'Ireland',
      status: 'LIMITED',
      notes: 'Revenue standard rate band (2024 €42k / 2026 €44k), personal tax credits, USC, and PRSI Class A for single filer.',
    },
    ES: {
      name: 'Spain',
      status: 'LIMITED',
      notes: 'IRPF national and regional scales with standard personal allowance; autonomous regional deductions limited.',
    },

    // 24 COMMERCIAL MARKETS WITHOUT EXECUTABLE ADAPTER (Return TAX_CALCULATION_UNAVAILABLE)
    JP: {
      name: 'Japan',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    KR: {
      name: 'South Korea',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    NO: {
      name: 'Norway',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    SE: {
      name: 'Sweden',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    DK: {
      name: 'Denmark',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    FI: {
      name: 'Finland',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    AT: {
      name: 'Austria',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    BE: {
      name: 'Belgium',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    IT: {
      name: 'Italy',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    IL: {
      name: 'Israel',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    HK: {
      name: 'Hong Kong',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    LU: {
      name: 'Luxembourg',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    IN: {
      name: 'India',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    BR: {
      name: 'Brazil',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    MX: {
      name: 'Mexico',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    ID: {
      name: 'Indonesia',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    MY: {
      name: 'Malaysia',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    PH: {
      name: 'Philippines',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    ZA: {
      name: 'South Africa',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    PL: {
      name: 'Poland',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    PT: {
      name: 'Portugal',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    CZ: {
      name: 'Czechia',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    TH: {
      name: 'Thailand',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
    VN: {
      name: 'Vietnam',
      status: 'UNSUPPORTED',
      notes: 'Commercial market supported for cost-of-living and income benchmarking; dedicated statutory tax engine under verification.',
    },
  };

  private static adapters: TaxAdapter[] = [
    new UsTaxAdapter(),
    new UkTaxAdapter(),
    new UaeTaxAdapter(),
    new CanadaTaxAdapter(),
    new AustraliaTaxAdapter(),
    new GermanyTaxAdapter(),
    new FranceTaxAdapter(),
    new SpainTaxAdapter(),
    new NetherlandsTaxAdapter(),
    new IrelandTaxAdapter(),
    new SwitzerlandTaxAdapter(),
    new SaudiTaxAdapter(),
    new SingaporeTaxAdapter(),
    new QatarTaxAdapter(),
    new NewZealandTaxAdapter(),
  ];

  /**
   * Explicit executable schedule coverage. Adapter implementations intentionally support
   * only these tax-year inputs; arbitrary older years must never collapse to 2024 rules.
   */
  private static readonly TAX_YEAR_COVERAGE: Record<string, readonly number[]> = {
    US: [2024, 2025, 2026],
    GB: [2024, 2026],
    AE: [2024, 2026],
    CA: [2024, 2026],
    AU: [2024, 2026],
    DE: [2024, 2026],
    SG: [2024, 2026],
    QA: [2024, 2026],
    SA: [2024, 2026],
    NZ: [2024, 2026],
    FR: [2024, 2026],
    NL: [2024, 2026],
    CH: [2024, 2026],
    IE: [2024, 2026],
    ES: [2024, 2026],
  };

  private static fallbackAdapter = new FallbackUnsupportedTaxAdapter();

  public static getSupportedCountryIds(): string[] {
    return Object.keys(this.COUNTRY_METADATA).filter((id) => this.supportsTaxCalculation(id));
  }

  public static getCommercialMarketIds(): string[] {
    return Object.keys(this.COUNTRY_METADATA);
  }

  public static getLoadedAdapterCount(): number {
    return this.adapters.length;
  }

  public static getCountryStatus(countryId: string): TaxVerificationStatus {
    const hasAdapter = this.supportsTaxCalculation(countryId);
    if (!hasAdapter) return 'UNSUPPORTED';
    return this.COUNTRY_METADATA[countryId]?.status || 'UNSUPPORTED';
  }

  public static supportsTaxCalculation(countryId: string): boolean {
    return this.adapters.some((a) => a.supports({ countryId }));
  }

  public static getSupportedTaxYears(countryId: string): number[] {
    if (!this.supportsTaxCalculation(countryId)) return [];
    return [...(this.TAX_YEAR_COVERAGE[countryId] || [])];
  }

  public static supportsTaxYear(countryId: string, taxYear: number): boolean {
    return this.getSupportedTaxYears(countryId).includes(taxYear);
  }

  public static isStatutorilyVerified(countryId: string): boolean {
    return this.getCountryStatus(countryId) === 'VERIFIED';
  }

  public static isSupported(countryId: string): boolean {
    return this.supportsTaxCalculation(countryId);
  }

  public static getCountrySupport(countryId: string): TaxCountrySupport {
    const meta = this.COUNTRY_METADATA[countryId];
    const hasAdapter = this.supportsTaxCalculation(countryId);
    const status: TaxVerificationStatus = hasAdapter
      ? meta?.status || 'UNSUPPORTED'
      : 'UNSUPPORTED';

    return {
      countryId,
      name: meta?.name || countryId,
      verificationStatus: status,
      isStatutorilyVerified: status === 'VERIFIED',
      isSupported: hasAdapter,
      notes: hasAdapter
        ? meta?.notes || 'Statutory adapter registered.'
        : `Statutory tax calculations for ${meta?.name || countryId} are under active research and verification. LivWorthy does not fabricate synthetic tax rates without verified official schedules.`,
    };
  }

  public static getAdapter(context: TaxContext): TaxAdapter {
    const adapter = this.adapters.find((a) => a.supports(context));
    if (!adapter) {
      return this.fallbackAdapter;
    }
    return adapter;
  }

  public static calculate(
    grossCompensation: Money,
    profile: TaxProfile,
    context: TaxContext
  ): TaxResult {
    // Year-gate: execute only explicitly implemented country/year schedules.
    // Future years and arbitrary historical years are unavailable rather than coerced.
    const requestedYear = profile.taxYear || context.taxYear || LATEST_STATUTORY_TAX_YEAR;
    const countryId = context.countryId || 'UNKNOWN';
    const isFutureYear = requestedYear > LATEST_STATUTORY_TAX_YEAR;
    const hasExplicitCoverage = this.supportsTaxYear(countryId, requestedYear);

    if (isFutureYear || !hasExplicitCoverage) {
      const currency = grossCompensation.currency;
      const zero = createMoney(0, currency);
      const supportedYears = this.getSupportedTaxYears(countryId);
      const reason = isFutureYear
        ? `Tax Year ${requestedYear} statutory schedules have not yet been officially published or verified.`
        : `Tax Year ${requestedYear} is not an explicitly implemented statutory schedule for ${countryId}.`;

      return {
        status: 'TAX_CALCULATION_UNAVAILABLE',
        grossIncome: grossCompensation,
        taxableIncome: zero,
        deductions: zero,
        federalTax: zero,
        stateTax: zero,
        localTax: zero,
        socialContributions: zero,
        totalTax: zero,
        totalDeductionsAndTaxes: zero,
        netIncome: grossCompensation,
        monthlyNetIncome: createMoney(Math.round(grossCompensation.amountMinor / 12), currency),
        biweeklyNetIncome: createMoney(Math.round(grossCompensation.amountMinor / 26), currency),
        effectiveTaxRate: 0,
        marginalTaxRate: 0,
        components: [],
        taxRuleVersion: isFutureYear
          ? `FUTURE-YEAR-UNVERIFIED-${requestedYear}`
          : `TAX-YEAR-UNAVAILABLE-${countryId}-${requestedYear}`,
        evidenceSourceIds: [],
        warnings: [
          reason +
          ` The latest verified statutory year is ${LATEST_STATUTORY_TAX_YEAR}. LivWorthy only executes explicitly implemented and versioned schedules; it never substitutes another year's rates.`,
        ],
        unsupportedExplanation:
          reason +
          (supportedYears.length
            ? ` Available implemented years for ${countryId}: ${supportedYears.join(', ')}.`
            : ` No executable statutory tax schedule is currently available for ${countryId}.`),
      };
    }
    const adapter = this.getAdapter(context);
    return adapter.calculate(grossCompensation, profile, context);
  }
}
