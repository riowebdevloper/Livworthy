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
    US: {
      name: 'United States',
      status: 'VERIFIED',
      notes: 'IRS 2024 Rev. Proc. 2023-34, SSA FICA, and state/local schedules verified with golden vectors.',
    },
    GB: {
      name: 'United Kingdom',
      status: 'VERIFIED',
      notes: 'HMRC 2024/25 PAYE, personal allowance taper, Scottish rates, and NI Class 1 verified with golden vectors.',
    },
    AE: {
      name: 'United Arab Emirates',
      status: 'VERIFIED',
      notes: 'Federal Tax Authority (FTA) 0% statutory employment income tax verified.',
    },
    CA: {
      name: 'Canada',
      status: 'VERIFIED',
      notes: 'CRA 2024 Federal Brackets, BPA phase-out, CPP1/CPP2, EI, and provincial tax verified with golden vectors.',
    },
    AU: {
      name: 'Australia',
      status: 'VERIFIED',
      notes: 'ATO 2024-25 Revised Stage 3 personal tax cuts and Medicare levy verified with golden vectors.',
    },
    DE: {
      name: 'Germany',
      status: 'VERIFIED',
      notes: 'EStG § 32a statutory polynomial formula and social insurance contributions (KV/RV/AV/PV) verified with golden vectors.',
    },
    SG: {
      name: 'Singapore',
      status: 'VERIFIED',
      notes: 'IRAS YA 2024 progressive resident tax schedule verified with golden vectors.',
    },
    QA: {
      name: 'Qatar',
      status: 'VERIFIED',
      notes: 'General Tax Authority (GTA) 0% statutory personal income tax verified.',
    },
    SA: {
      name: 'Saudi Arabia',
      status: 'VERIFIED',
      notes: 'ZATCA 0% statutory employment income tax for employees verified.',
    },
    NZ: {
      name: 'New Zealand',
      status: 'VERIFIED',
      notes: 'Inland Revenue (IRD) 2024/25 brackets and ACC earner levy verified with golden vectors.',
    },
    FR: {
      name: 'France',
      status: 'LIMITED',
      notes: 'DGFiP 5-bracket scale and URSSAF CSG/CRDS/Retraite for single employee; quotient familial not fully modeled.',
    },
    ES: {
      name: 'Spain',
      status: 'LIMITED',
      notes: 'IRPF national and regional scales with standard personal allowance; regional variations limited.',
    },
    NL: {
      name: 'Netherlands',
      status: 'LIMITED',
      notes: 'Box 1 progressive scale and basic tax credits; 30% ruling and complex asset boxes not modeled.',
    },
    IE: {
      name: 'Ireland',
      status: 'LIMITED',
      notes: 'Revenue standard rate band, personal tax credits, USC, and PRSI Class A for single filer.',
    },
    CH: {
      name: 'Switzerland',
      status: 'LIMITED',
      notes: 'Federal direct tax and standard Zurich/Geneva cantonal/communal simplified tax multipliers.',
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

  private static fallbackAdapter = new FallbackUnsupportedTaxAdapter();

  public static getSupportedCountryIds(): string[] {
    return ['US', 'GB', 'AE', 'CA', 'AU', 'DE', 'FR', 'ES', 'NL', 'IE', 'CH', 'SA', 'SG', 'QA', 'NZ'];
  }

  public static getCountryStatus(countryId: string): TaxVerificationStatus {
    return this.COUNTRY_METADATA[countryId]?.status || 'UNSUPPORTED';
  }

  public static isStatutorilyVerified(countryId: string): boolean {
    return this.getCountryStatus(countryId) === 'VERIFIED';
  }

  public static isSupported(countryId: string): boolean {
    return this.adapters.some((a) => a.supports({ countryId, taxYear: 2024 }));
  }

  public static getCountrySupport(countryId: string): TaxCountrySupport {
    const meta = this.COUNTRY_METADATA[countryId];
    const status = meta?.status || 'UNSUPPORTED';
    return {
      countryId,
      name: meta?.name || countryId,
      verificationStatus: status,
      isStatutorilyVerified: status === 'VERIFIED',
      isSupported: this.isSupported(countryId),
      notes: meta?.notes || 'No statutory adapter registered.',
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
    const adapter = this.getAdapter(context);
    return adapter.calculate(grossCompensation, profile, context);
  }
}

