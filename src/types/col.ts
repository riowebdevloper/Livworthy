import { CurrencyCode, Money } from './money';

export type HousingType = 'studio' | '1-bedroom' | '2-bedroom' | '3-bedroom';
export type AreaType = 'budget' | 'typical' | 'premium';
export type TransportMode = 'public_transit' | 'car' | 'transit_and_rideshare' | 'walking_biking';
export type LifestyleLevel = 'essential' | 'moderate' | 'comfortable';

export interface HouseholdProfile {
  adults: number;
  children: number;
  housingType: HousingType;
  areaType: AreaType;
  transportMode: TransportMode;
  carsCount: number;
  lifestyleLevel: LifestyleLevel;
  preset: 'single' | 'couple' | 'family' | 'custom';
}

export interface CostEstimateItem {
  id: string;
  category: 'housing' | 'food' | 'utilities' | 'transport' | 'healthcare' | 'family' | 'lifestyle' | 'other';
  label: string;
  monthlyEstimate: Money;
  monthlyLow: Money;
  monthlyHigh: Money;
  annualEstimate: Money;
  isOverridden?: boolean;
  confidence: 'High' | 'Moderate' | 'Low';
  sourceDate: string;
  evidenceSourceId: string;
  notes?: string;
}

export interface CostCategorySummary {
  category: 'housing' | 'food' | 'utilities' | 'transport' | 'healthcare' | 'family' | 'lifestyle' | 'other';
  label: string;
  monthlyTotal: Money;
  annualTotal: Money;
  items: CostEstimateItem[];
}

export interface ColOverrides {
  actualRentMonthlyMinor?: number;
  actualHealthcareMonthlyMinor?: number;
  actualTransportMonthlyMinor?: number;
}

export interface CostOfLivingResult {
  monthlyTotal: Money;
  annualTotal: Money;
  monthlyWithRent: Money;
  monthlyWithoutRent: Money;
  categories: CostCategorySummary[];
  housingMonthly: Money;
  essentialMonthly: Money;
  discretionaryMonthly: Money;
  confidenceScore: 'High-confidence estimate' | 'Moderate data coverage' | 'Limited local data';
  evidenceSourceIds: string[];
  datasetVersion: string;
  assumptionsSummary: string;
}
