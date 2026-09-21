import { CurrencyCode, Money } from '../../types/money';
import { cacheService } from '../../lib/redis';
import { dbService } from '../../db/client';
import { createMoney, toMajor } from '../../lib/money';

export interface FxRateRecord {
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  rate: number;
  invertedRate: number;
}

export type FxSnapshotStatus = 'CURRENT' | 'ACTIVE' | 'AGING' | 'STALE' | 'UNAVAILABLE';

export interface FxSnapshot {
  id: string;
  baseCurrency: CurrencyCode;
  provider: string;
  providerTimestamp: string;
  retrievedAt: string;
  status: FxSnapshotStatus;
  rates: Record<string, number>;
  source: string;
}

// Currency reasonableness validation corridors against USD
export const CURRENCY_BOUNDS: Record<CurrencyCode, { min: number; max: number }> = {
  USD: { min: 1.0, max: 1.0 },
  EUR: { min: 0.5, max: 2.0 },
  GBP: { min: 0.4, max: 1.5 },
  CAD: { min: 0.8, max: 2.5 },
  AED: { min: 3.60, max: 3.75 }, // Pegged at ~3.6725
  SAR: { min: 3.65, max: 3.85 }, // Pegged at ~3.75
  AUD: { min: 0.8, max: 2.5 },
  CHF: { min: 0.5, max: 1.8 },
  SGD: { min: 0.8, max: 2.2 },
  QAR: { min: 3.55, max: 3.75 }, // Pegged at ~3.64
  NZD: { min: 0.9, max: 2.6 },
  INR: { min: 50.0, max: 150.0 },
};

export class FxEngine {
  private static CACHE_KEY = 'fx:snapshot:USD';
  private static CACHE_TTL_SECONDS = 3600; // 1 hour in cache

  private static currentSnapshot: FxSnapshot | null = null;

  /**
   * Evaluates freshness status based on timestamp age.
   * < 24h: CURRENT (or ACTIVE)
   * 24h - 72h: AGING
   * >= 72h: STALE
   */
  public static evaluateFreshness(timestampStr: string): FxSnapshotStatus {
    const time = new Date(timestampStr).getTime();
    if (isNaN(time)) return 'STALE';
    const ageHours = (Date.now() - time) / (1000 * 3600);
    if (ageHours < 24) return 'CURRENT';
    if (ageHours < 72) return 'AGING';
    return 'STALE';
  }

  public static async getLatestSnapshot(): Promise<FxSnapshot> {
    // 1. Check Redis cache
    try {
      const cached = await cacheService.get(this.CACHE_KEY);
      if (cached) {
        const parsed: FxSnapshot = JSON.parse(cached);
        if (parsed && parsed.rates && Object.keys(parsed.rates).length > 1) {
          const evaluated = this.evaluateFreshness(parsed.retrievedAt || parsed.providerTimestamp);
          parsed.status = evaluated;
          this.currentSnapshot = parsed;
          return parsed;
        }
      }
    } catch {
      // Continue to DB check
    }

    // 2. Check DB
    try {
      const dbSnapshot = await dbService.getLatestFxSnapshot('USD');
      if (dbSnapshot && dbSnapshot.rates && Object.keys(dbSnapshot.rates).length > 1) {
        const evaluated = this.evaluateFreshness(dbSnapshot.retrievedAt || dbSnapshot.providerTimestamp);
        dbSnapshot.status = evaluated;
        this.currentSnapshot = dbSnapshot;
        await cacheService.set(this.CACHE_KEY, JSON.stringify(dbSnapshot), this.CACHE_TTL_SECONDS);
        return dbSnapshot;
      }
    } catch (err: any) {
      console.warn('[FxEngine] Database lookup error:', err.message);
    }

    // 3. If no DB or cache snapshot exists, trigger live provider ingestion
    try {
      const liveSnapshot = await this.refreshFromProvider();
      if (liveSnapshot && liveSnapshot.status !== 'UNAVAILABLE') {
        return liveSnapshot;
      }
    } catch (err: any) {
      console.warn('[FxEngine] Initial live fetch failed:', err.message);
    }

    // 4. If current memory snapshot exists, evaluate and return
    if (this.currentSnapshot && Object.keys(this.currentSnapshot.rates).length > 1) {
      this.currentSnapshot.status = this.evaluateFreshness(this.currentSnapshot.retrievedAt);
      return this.currentSnapshot;
    }

    // 5. Explicit UNAVAILABLE state — Never silently inject static hardcoded rates in production!
    const unavailableSnapshot: FxSnapshot = {
      id: 'fx_unavailable',
      baseCurrency: 'USD',
      provider: 'ExchangeRate-API Reference Service',
      providerTimestamp: new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
      status: 'UNAVAILABLE',
      rates: { USD: 1.0 },
      source: 'No validated live or persisted snapshot available within freshness threshold.',
    };
    this.currentSnapshot = unavailableSnapshot;
    return unavailableSnapshot;
  }

  public static async refreshFromProvider(force = false): Promise<FxSnapshot> {
    const providerUrl = 'https://open.er-api.com/v6/latest/USD';
    let fetchedRates: Record<string, number> | null = null;
    const providerName = 'ExchangeRate-API Open Tier';
    let providerTimestamp = new Date().toISOString();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(providerUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && typeof data.rates === 'object') {
          fetchedRates = data.rates;
          if (data.time_last_update_utc) {
            providerTimestamp = new Date(data.time_last_update_utc).toISOString();
          }
        }
      }
    } catch (err: any) {
      console.warn('[FxEngine] Live fetch encountered issue:', err.message);
    }

    if (fetchedRates) {
      const validatedRates: Record<string, number> = { USD: 1.0 };
      let allValid = true;

      for (const curr of Object.keys(CURRENCY_BOUNDS) as CurrencyCode[]) {
        const val = fetchedRates[curr];
        if (typeof val === 'number' && !isNaN(val) && isFinite(val) && val > 0) {
          const bounds = CURRENCY_BOUNDS[curr];
          if (val >= bounds.min && val <= bounds.max) {
            validatedRates[curr] = val;
          } else {
            console.warn(`[FxEngine] Rate for ${curr} (${val}) outside sanity bounds [${bounds.min}, ${bounds.max}]`);
            allValid = false;
          }
        } else {
          allValid = false;
        }
      }

      if (allValid) {
        const snapshot: FxSnapshot = {
          id: `fx_${Date.now()}`,
          baseCurrency: 'USD',
          provider: providerName,
          providerTimestamp,
          retrievedAt: new Date().toISOString(),
          status: 'CURRENT',
          rates: validatedRates,
          source: 'ExchangeRate-API Open Tier (Sanity-Bounded & Normalized)',
        };

        this.currentSnapshot = snapshot;
        try {
          await dbService.saveFxSnapshot(snapshot);
        } catch (dbErr: any) {
          console.warn('[FxEngine] Failed to persist snapshot to DB:', dbErr.message);
        }

        try {
          await cacheService.set(this.CACHE_KEY, JSON.stringify(snapshot), this.CACHE_TTL_SECONDS);
        } catch {}

        return snapshot;
      }
    }

    // Fallback: Check if database has an earlier snapshot inside freshness threshold
    try {
      const dbSnapshot = await dbService.getLatestFxSnapshot('USD');
      if (dbSnapshot && dbSnapshot.rates && Object.keys(dbSnapshot.rates).length > 1) {
        const status = this.evaluateFreshness(dbSnapshot.retrievedAt || dbSnapshot.providerTimestamp);
        dbSnapshot.status = status;
        this.currentSnapshot = dbSnapshot;
        return dbSnapshot;
      }
    } catch {}

    const unavailable: FxSnapshot = {
      id: 'fx_unavailable',
      baseCurrency: 'USD',
      provider: providerName,
      providerTimestamp: new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
      status: 'UNAVAILABLE',
      rates: { USD: 1.0 },
      source: 'Live provider unreachable and no historical snapshot in database.',
    };
    this.currentSnapshot = unavailable;
    return unavailable;
  }

  public static convert(money: Money, targetCurrency: CurrencyCode): Money {
    if (money.currency === targetCurrency) {
      return money;
    }

    if (!this.currentSnapshot || this.currentSnapshot.status === 'UNAVAILABLE') {
      throw new Error(`Currency conversion unavailable: live FX rates are currently unavailable.`);
    }

    const rates = this.currentSnapshot.rates;
    const fromRate = rates[money.currency];
    const toRate = rates[targetCurrency];

    if (!fromRate || !toRate) {
      throw new Error(
        `Currency conversion error: rate for ${money.currency} or ${targetCurrency} is missing from active FX snapshot.`
      );
    }

    const amountMajor = toMajor(money);
    const inUsdMajor = amountMajor / fromRate;
    const targetMajor = inUsdMajor * toRate;

    return createMoney(targetMajor, targetCurrency);
  }
}
