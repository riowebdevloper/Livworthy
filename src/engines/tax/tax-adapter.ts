import { Money } from '../../types/money';
import { TaxProfile, TaxResult } from '../../types/tax';

export interface TaxContext {
  countryId: string;
  regionId?: string;
  cityId?: string;
  taxJurisdictionId?: string;
  taxYear?: number;
}

export interface TaxAdapter {
  id: string;
  name: string;
  supports(context: TaxContext): boolean;
  calculate(grossCompensation: Money, profile: TaxProfile, context: TaxContext): TaxResult;
}
