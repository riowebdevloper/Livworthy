/**
 * LivWorthy Client-Side Analytics & Engagement Measurement Module
 *
 * Implements Google Analytics 4 (GA4) event measurement:
 * - Route change / Virtual Page View tracking for React Single-Page Application (SPA) with deduplication
 * - Calculator engagement tracking (tab switches, city changes, adjustments)
 * - Financial privacy protection: salary brackets/tiers instead of exact raw compensation numbers
 * - Genuine engagement measurement: relies on GA4 native engagement time rather than synthetic hardcoded values
 * - Full compatibility with Google Consent Mode v2 (fails safely when consent is denied)
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface AnalyticsEventParams {
  [key: string]: string | number | boolean | undefined | null;
}

// Track last dispatched path to prevent duplicate pageviews during client-side navigation
let lastTrackedPath: string | null = null;
let lastTrackedTimestamp = 0;

/**
 * Returns coarse salary tier for analytics aggregation without sending exact financial inputs.
 * Protects user privacy while providing statistical utility.
 */
export function getSalaryTier(salaryMajor: number): string {
  if (!isFinite(salaryMajor) || salaryMajor <= 0) return 'unspecified';
  if (salaryMajor < 50000) return 'under_50k';
  if (salaryMajor < 75000) return '50k_75k';
  if (salaryMajor < 100000) return '75k_100k';
  if (salaryMajor < 150000) return '100k_150k';
  if (salaryMajor < 200000) return '150k_200k';
  if (salaryMajor < 300000) return '200k_300k';
  return 'over_300k';
}

/**
 * Dispatches a virtual page_view event on client-side route transitions.
 * Enforces deduplication to prevent double-counting alongside GA4 Enhanced Measurement browser history tracking.
 */
export function trackPageView(pagePath: string, pageTitle?: string): boolean {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false;

  // Normalize path (strip query parameters and hashes for canonical route identity)
  const normalizedPath = pagePath.split('?')[0].split('#')[0] || '/';
  const now = Date.now();

  // Deduplication: prevent duplicate virtual pageviews for the same path within 1200ms
  if (lastTrackedPath === normalizedPath && now - lastTrackedTimestamp < 1200) {
    return false;
  }

  lastTrackedPath = normalizedPath;
  lastTrackedTimestamp = now;

  try {
    const loc = window.location.origin + normalizedPath;
    window.gtag('event', 'page_view', {
      page_path: normalizedPath,
      page_title: pageTitle || document.title,
      page_location: loc,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Tracks calculator interaction events (e.g. tab switches, city changes, adjustments).
 * Engagement duration is measured naturally by GA4 session heartbeats rather than hardcoded durations.
 */
export function trackCalculatorEngagement(
  toolName: string,
  action: string,
  params?: AnalyticsEventParams
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', 'calculator_engagement', {
      calculator_name: toolName,
      interaction_type: action,
      ...params,
    });
  } catch {
    // Fail silently in restricted sandbox
  }
}

/**
 * Tracks when a deliberate, user-initiated salary calculation or scenario is evaluated.
 * - Does NOT send exact salary amounts (uses privacy-preserving salary tiers).
 * - Does NOT inject synthetic engagement duration (relies on GA4 automatic measurement).
 */
export function trackCalculationOutcome(
  toolName: string,
  cityId: string,
  salaryMajor: number,
  currency: string
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', 'calculate_salary', {
      calculator_name: toolName,
      city_id: cityId,
      salary_tier: getSalaryTier(salaryMajor),
      currency: currency,
    });
  } catch {
    // Fail silently
  }
}

/**
 * Inspection helper for unit tests and diagnostics
 */
export function getLastTrackedPath(): string | null {
  return lastTrackedPath;
}

/**
 * Reset helper for unit tests
 */
export function resetAnalyticsState(): void {
  lastTrackedPath = null;
  lastTrackedTimestamp = 0;
}
