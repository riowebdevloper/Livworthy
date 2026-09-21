import { createMoney } from '../lib/money';
import { LivWorthScenario } from '../types/scenario';
import { CITIES } from './locations';

const getCalculationDate = () => new Date().toISOString();

export const DEFAULT_NYC_100K_SCENARIO: LivWorthScenario = {
  location: CITIES.nyc,
  compensation: {
    baseSalary: createMoney(100_000, 'USD'),
    cashBonusAnnual: createMoney(0, 'USD'),
    commissionAnnual: createMoney(0, 'USD'),
    cashAllowancesAnnual: createMoney(0, 'USD'),
  },
  taxProfile: {
    filingStatus: 'single',
    dependentsCount: 0,
    taxYear: 2024,
  },
  household: {
    adults: 1,
    children: 0,
    housingType: '1-bedroom',
    areaType: 'typical',
    transportMode: 'public_transit',
    carsCount: 0,
    lifestyleLevel: 'moderate',
    preset: 'single',
  },
  displayCurrency: 'USD',
  calculationDate: getCalculationDate(),
};

export const DEFAULT_AUSTIN_SCENARIO: LivWorthScenario = {
  location: CITIES.austin,
  compensation: {
    baseSalary: createMoney(100_000, 'USD'),
    cashBonusAnnual: createMoney(0, 'USD'),
    commissionAnnual: createMoney(0, 'USD'),
    cashAllowancesAnnual: createMoney(0, 'USD'),
  },
  taxProfile: {
    filingStatus: 'single',
    dependentsCount: 0,
    taxYear: 2024,
  },
  household: {
    adults: 1,
    children: 0,
    housingType: '1-bedroom',
    areaType: 'typical',
    transportMode: 'car',
    carsCount: 1,
    lifestyleLevel: 'moderate',
    preset: 'single',
  },
  displayCurrency: 'USD',
  calculationDate: getCalculationDate(),
};

export const DEFAULT_LONDON_SCENARIO: LivWorthScenario = {
  location: CITIES.london,
  compensation: {
    baseSalary: createMoney(75_000, 'GBP'),
  },
  taxProfile: {
    filingStatus: 'single',
    dependentsCount: 0,
    taxYear: 2024,
  },
  household: {
    adults: 1,
    children: 0,
    housingType: '1-bedroom',
    areaType: 'typical',
    transportMode: 'public_transit',
    carsCount: 0,
    lifestyleLevel: 'moderate',
    preset: 'single',
  },
  displayCurrency: 'GBP',
  calculationDate: getCalculationDate(),
};

export const DEFAULT_SF_SCENARIO: LivWorthScenario = {
  location: CITIES.sf,
  compensation: {
    baseSalary: createMoney(150_000, 'USD'),
  },
  taxProfile: {
    filingStatus: 'single',
    dependentsCount: 0,
    taxYear: 2024,
  },
  household: {
    adults: 1,
    children: 0,
    housingType: '1-bedroom',
    areaType: 'typical',
    transportMode: 'transit_and_rideshare',
    carsCount: 0,
    lifestyleLevel: 'moderate',
    preset: 'single',
  },
  displayCurrency: 'USD',
  calculationDate: getCalculationDate(),
};

export const DEFAULT_DUBAI_SCENARIO: LivWorthScenario = {
  location: CITIES.dubai,
  compensation: {
    baseSalary: createMoney(350_000, 'AED'),
  },
  taxProfile: {
    filingStatus: 'single',
    dependentsCount: 0,
    taxYear: 2024,
  },
  household: {
    adults: 1,
    children: 0,
    housingType: '1-bedroom',
    areaType: 'typical',
    transportMode: 'car',
    carsCount: 1,
    lifestyleLevel: 'moderate',
    preset: 'single',
  },
  displayCurrency: 'AED',
  calculationDate: getCalculationDate(),
};

export const DEFAULT_NYC_FAMILY_SCENARIO: LivWorthScenario = {
  location: CITIES.nyc,
  compensation: {
    baseSalary: createMoney(220_000, 'USD'),
  },
  taxProfile: {
    filingStatus: 'married_filing_jointly',
    dependentsCount: 2,
    taxYear: 2024,
  },
  household: {
    adults: 2,
    children: 2,
    housingType: '2-bedroom',
    areaType: 'typical',
    transportMode: 'public_transit',
    carsCount: 0,
    lifestyleLevel: 'moderate',
    preset: 'family',
  },
  displayCurrency: 'USD',
  calculationDate: getCalculationDate(),
};

export const PRESET_LIST = [
  { id: 'nyc-100k', label: 'NYC $100K (Single)', scenario: DEFAULT_NYC_100K_SCENARIO },
  { id: 'nyc-family', label: 'NYC $220K (Family of 4)', scenario: DEFAULT_NYC_FAMILY_SCENARIO },
  { id: 'austin-100k', label: 'Austin $100K (No State Tax)', scenario: DEFAULT_AUSTIN_SCENARIO },
  { id: 'sf-150k', label: 'San Francisco $150K', scenario: DEFAULT_SF_SCENARIO },
  { id: 'london-75k', label: 'London £75K (UK HMRC)', scenario: DEFAULT_LONDON_SCENARIO },
  { id: 'dubai-350k', label: 'Dubai 350K AED (0% Tax)', scenario: DEFAULT_DUBAI_SCENARIO },
];
