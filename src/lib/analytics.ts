/**
 * LivWorthy Client-Side Analytics & Engagement Measurement Module
 *
 * Implements Google Analytics 4 (GA4) event measurement:
 * - Single authoritative SPA Virtual Page View tracking with strict query sanitization
 * - Zero transmission of sensitive financial inputs (salary, rent, tokens, secrets)
 * - Genuine engagement measurement: relies on GA4 native engagement time rather than synthetic hardcoded values
 * - Currency-accurate event reporting (currency, city, tool; zero distorted nominal tiers)
 * - Full compatibility with Advanced Google Consent Mode v2 (fails safely when consent is denied)
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

export const SENSITIVE_PARAM_NAMES = new Set([
  'salary',
  'rent',
  'bonus',
  'equity',
  'income',
  'token',
  'auth',
  'email',
  'key',
  'password',
  'secret',
]);

/**
 * Sanitizes URLs and query paths before transmitting to Google Analytics.
 * Strips sensitive financial inputs (salary, rent) and personal identifiers/tokens,
 * while preserving standard marketing attribution parameters (utm_*, gclid, etc.).
 */
export function sanitizeUrlForAnalytics(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '/';
  try {
    const origin =
      typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : 'https://www.livworthy.com';
    const parsed = new URL(rawUrl, origin);
    const searchParams = new URLSearchParams(parsed.search);

    const keysToDelete: string[] = [];
    searchParams.forEach((_, key) => {
      const lower = key.toLowerCase();
      if (
        SENSITIVE_PARAM_NAMES.has(lower) ||
        lower.includes('salary') ||
        lower.includes('rent') ||
        lower.includes('token') ||
        lower.includes('secret')
      ) {
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      searchParams.delete(key);
    }

    const cleanSearch = searchParams.toString();
    parsed.search = cleanSearch ? `?${cleanSearch}` : '';
    parsed.hash = '';

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return parsed.toString();
    }
    return parsed.pathname + (cleanSearch ? `?${cleanSearch}` : '');
  } catch {
    return rawUrl.split('?')[0].split('#')[0] || '/';
  }
}

/**
 * Gets sanitized absolute URL of current page for analytics location parameter.
 */
export function getSanitizedLocation(): string {
  if (typeof window === 'undefined' || !window.location) {
    return 'https://www.livworthy.com/';
  }
  return sanitizeUrlForAnalytics(window.location.href);
}

/**
 * Dispatches a virtual page_view event on client-side route transitions.
 * Enforces single authoritative SPA pageview tracking:
 * - Sanitizes URL location and path (stripping sensitive financial query parameters).
 * - Ensures one pageview per genuine route navigation.
 */
export function trackPageView(pagePath: string, pageTitle?: string): boolean {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false;

  const sanitizedRelative = sanitizeUrlForAnalytics(pagePath);
  const normalizedPath = sanitizedRelative.split('?')[0] || '/';
  const now = Date.now();

  // Deduplication guard: ignore if the exact route was already tracked within 400ms
  if (lastTrackedPath === normalizedPath && now - lastTrackedTimestamp < 400) {
    return false;
  }

  lastTrackedPath = normalizedPath;
  lastTrackedTimestamp = now;

  try {
    const origin = window.location.origin || 'https://www.livworthy.com';
    const cleanLocation = sanitizeUrlForAnalytics(origin + sanitizedRelative);
    window.gtag('event', 'page_view', {
      page_path: sanitizedRelative,
      page_title: pageTitle || document.title,
      page_location: cleanLocation,
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
      page_location: getSanitizedLocation(),
      ...params,
    });
  } catch {
    // Fail silently in restricted sandbox
  }
}

/**
 * Tracks when a deliberate, user-initiated salary calculation or scenario is evaluated.
 * - Does NOT send exact financial amounts (GDPR/privacy compliant).
 * - Does NOT send un-normalized cross-currency salary tiers (avoids international distortion).
 * - Transmits tool, city, and ISO currency for cross-country aggregation.
 * - Injects sanitized page_location to ensure zero query parameter leakage.
 */
export function trackCalculationOutcome(
  toolName: string,
  cityId: string,
  currency: string
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', 'calculate_salary', {
      calculator_name: toolName,
      city_id: cityId,
      currency: currency,
      page_location: getSanitizedLocation(),
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
