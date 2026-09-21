import { CurrencyCode } from './money';

export type VerificationStatus = 'VERIFIED' | 'LIMITED' | 'PROVISIONAL' | 'UNSUPPORTED';

export interface Country {
  id: string; // e.g. 'US', 'GB', 'AE', 'CA'
  name: string;
  defaultCurrency: CurrencyCode;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface Region {
  id: string; // e.g. 'US-NY', 'US-TX', 'GB-ENG'
  countryId: string;
  name: string;
  code: string;
}

export interface City {
  id: string; // e.g. 'nyc', 'austin', 'london', 'dubai', 'toronto'
  name: string;
  regionId: string;
  countryId: string;
  currency: CurrencyCode;
  taxJurisdictionId: string;
  colIndexBase100NYC: number; // For relative reference
  metroAreaName: string;
  verificationStatus: VerificationStatus;
  statusExplanation?: string;
}

export interface TaxJurisdiction {
  id: string;
  countryId: string;
  regionId?: string;
  cityId?: string;
  name: string;
  adapterKey: string;
}
