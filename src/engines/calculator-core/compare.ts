import { convertMoney } from '../../lib/fx';
import { createMoney, fromMinor, subtractMoney, toMajor } from '../../lib/money';
import { CurrencyCode, Money } from '../../types/money';
import { LivWorthCalculationOutcome, LivWorthScenario } from '../../types/scenario';
import { SalaryWorthCalculator } from './salary-worth';

export type ComparisonStatus = 'SUCCESS' | 'FX_UNAVAILABLE' | 'FX_STALE';

export interface RelocationProfile {
  flightsMinor: number;
  tempHousingMinor: number;
  securityDepositMinor: number;
  shippingFurnitureMinor: number;
  visaAdminMinor: number;
  otherSetupMinor: number;
}

export interface ComparisonDelta {
  grossAnnualDiff: Money; // B - A (in comparison display currency)
  takeHomeAnnualDiff: Money;
  livingCostsAnnualDiff: Money;
  disposableIncomeAnnualDiff: Money;
  monthlyDisposableDiff: Money;
  year1RelocationTotal: Money;
  year1NetDisposableDiff: Money; // factoring in one-time relocation
  summaryNarrative: string;
}

export interface ComparisonResult {
  status: ComparisonStatus;
  scenarioA: LivWorthScenario;
  outcomeA: LivWorthCalculationOutcome;
  scenarioB: LivWorthScenario;
  outcomeB: LivWorthCalculationOutcome;
  displayCurrency: CurrencyCode;
  // Normalized outcomes in displayCurrency for fair side-by-side comparison
  convertedA: {
    grossAnnual: Money;
    takeHomeAnnual: Money;
    livingCostsAnnual: Money;
    disposableAnnual: Money;
    disposableMonthly: Money;
  };
  convertedB: {
    grossAnnual: Money;
    takeHomeAnnual: Money;
    livingCostsAnnual: Money;
    disposableAnnual: Money;
    disposableMonthly: Money;
  };
  delta: ComparisonDelta;
  fxSnapshotDate: string;
  fxStatus?: string;
  errorMessage?: string;
}

export class ComparisonEngine {
  public static compare(
    scenarioA: LivWorthScenario,
    scenarioB: LivWorthScenario,
    displayCurrency: CurrencyCode = 'USD',
    relocationB?: RelocationProfile,
    fxSnapshot?: { rates: Record<string, number>; timestamp?: string; providerTimestamp?: string; status?: string }
  ): ComparisonResult {
    // Both scenarios execute through the identical shared financial engine
    const outcomeA = SalaryWorthCalculator.calculate(scenarioA);
    const outcomeB = SalaryWorthCalculator.calculate(scenarioB);

    const currencyA = scenarioA.location.currency;
    const currencyB = scenarioB.location.currency;
    const needsFx = currencyA !== displayCurrency || currencyB !== displayCurrency;

    // Strict validation: Cross-currency comparison requires a valid FX snapshot
    if (needsFx) {
      if (!fxSnapshot || !fxSnapshot.rates || fxSnapshot.status === 'UNAVAILABLE') {
        const zeroMoney = createMoney(0, displayCurrency);
        return {
          status: 'FX_UNAVAILABLE',
          scenarioA,
          outcomeA,
          scenarioB,
          outcomeB,
          displayCurrency,
          convertedA: {
            grossAnnual: zeroMoney,
            takeHomeAnnual: zeroMoney,
            livingCostsAnnual: zeroMoney,
            disposableAnnual: zeroMoney,
            disposableMonthly: zeroMoney,
          },
          convertedB: {
            grossAnnual: zeroMoney,
            takeHomeAnnual: zeroMoney,
            livingCostsAnnual: zeroMoney,
            disposableAnnual: zeroMoney,
            disposableMonthly: zeroMoney,
          },
          delta: {
            grossAnnualDiff: zeroMoney,
            takeHomeAnnualDiff: zeroMoney,
            livingCostsAnnualDiff: zeroMoney,
            disposableIncomeAnnualDiff: zeroMoney,
            monthlyDisposableDiff: zeroMoney,
            year1RelocationTotal: zeroMoney,
            year1NetDisposableDiff: zeroMoney,
            summaryNarrative: 'FX exchange rates are currently unavailable. Cross-currency comparison cannot be calculated.',
          },
          fxSnapshotDate: new Date().toISOString(),
          fxStatus: 'UNAVAILABLE',
          errorMessage: 'Cross-currency comparison requires an active validated FX snapshot.',
        };
      }
    }

    const fxStatus = fxSnapshot?.status === 'STALE' ? 'FX_STALE' : 'SUCCESS';
    const effectiveSnapshot = fxSnapshot || { rates: { [displayCurrency]: 1.0 } };

    const convA = {
      grossAnnual: convertMoney(outcomeA.grossAnnual, displayCurrency, effectiveSnapshot),
      takeHomeAnnual: convertMoney(outcomeA.takeHomeAnnual, displayCurrency, effectiveSnapshot),
      livingCostsAnnual: convertMoney(outcomeA.livingCostsAnnual, displayCurrency, effectiveSnapshot),
      disposableAnnual: convertMoney(outcomeA.moneyRemainingAnnual, displayCurrency, effectiveSnapshot),
      disposableMonthly: convertMoney(outcomeA.moneyRemainingMonthly, displayCurrency, effectiveSnapshot),
    };

    const convB = {
      grossAnnual: convertMoney(outcomeB.grossAnnual, displayCurrency, effectiveSnapshot),
      takeHomeAnnual: convertMoney(outcomeB.takeHomeAnnual, displayCurrency, effectiveSnapshot),
      livingCostsAnnual: convertMoney(outcomeB.livingCostsAnnual, displayCurrency, effectiveSnapshot),
      disposableAnnual: convertMoney(outcomeB.moneyRemainingAnnual, displayCurrency, effectiveSnapshot),
      disposableMonthly: convertMoney(outcomeB.moneyRemainingMonthly, displayCurrency, effectiveSnapshot),
    };

    // Deltas: B minus A
    const grossDiff = subtractMoney(convB.grossAnnual, convA.grossAnnual);
    const takeHomeDiff = subtractMoney(convB.takeHomeAnnual, convA.takeHomeAnnual);
    const livingCostsDiff = subtractMoney(convB.livingCostsAnnual, convA.livingCostsAnnual);
    const disposableDiff = subtractMoney(convB.disposableAnnual, convA.disposableAnnual);
    const monthlyDispDiff = subtractMoney(convB.disposableMonthly, convA.disposableMonthly);

    // Relocation costs for Scenario B
    let year1RelocationMinor = 0;
    if (relocationB) {
      year1RelocationMinor =
        relocationB.flightsMinor +
        relocationB.tempHousingMinor +
        relocationB.securityDepositMinor +
        relocationB.shippingFurnitureMinor +
        relocationB.visaAdminMinor +
        relocationB.otherSetupMinor;
    }

    const year1RelocationTotal = fromMinor(year1RelocationMinor, displayCurrency);
    const year1NetDisposableDiff = fromMinor(
      disposableDiff.amountMinor - year1RelocationMinor,
      displayCurrency
    );

    // Objective neutral narrative (No "winner" or color judgment)
    const absDispDiffMajor = Math.abs(toMajor(disposableDiff));
    const formattedDiff = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: displayCurrency,
      maximumFractionDigits: 0,
    }).format(absDispDiffMajor);

    let summaryNarrative = '';
    if (disposableDiff.amountMinor > 0) {
      summaryNarrative = `Under these assumptions, ${scenarioB.location.name} leaves approximately ${formattedDiff} more disposable income annually before one-time relocation adjustments.`;
    } else if (disposableDiff.amountMinor < 0) {
      summaryNarrative = `Under these assumptions, ${scenarioA.location.name} leaves approximately ${formattedDiff} more disposable income annually before one-time relocation adjustments.`;
    } else {
      summaryNarrative = `Under these assumptions, both options yield approximately identical disposable income after local taxes and living costs.`;
    }

    return {
      status: fxStatus,
      scenarioA,
      outcomeA,
      scenarioB,
      outcomeB,
      displayCurrency,
      convertedA: convA,
      convertedB: convB,
      delta: {
        grossAnnualDiff: grossDiff,
        takeHomeAnnualDiff: takeHomeDiff,
        livingCostsAnnualDiff: livingCostsDiff,
        disposableIncomeAnnualDiff: disposableDiff,
        monthlyDisposableDiff: monthlyDispDiff,
        year1RelocationTotal,
        year1NetDisposableDiff,
        summaryNarrative,
      },
      fxSnapshotDate: fxSnapshot?.timestamp || (fxSnapshot as any)?.providerTimestamp || new Date().toISOString(),
      fxStatus: fxSnapshot?.status,
    };
  }
}
