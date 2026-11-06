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
// Initialized from the HTML head initial pageview dispatch (if present) to avoid React mount duplicates
let lastTrackedPath: string | null =
  typeof window !== 'undefined' && (window as any).__livworthy_initial_pv_path
    ? ((window as any).__livworthy_initial_pv_path.split('?')[0] || '/')
    : null;

let lastTrackedTimestamp: number =
  typeof window !== 'undefined' && (window as any).__livworthy_initial_pv_time
    ? (window as any).__livworthy_initial_pv_time
    : 0;

/**
 * Conservative allowlist of permitted URL query parameters for analytics attribution and navigation.
 * All other query parameters (including financial inputs like salary, rent, bonuses, personal tokens,
 * passwords, and state payloads) are strictly excluded from GA4 transmissions.
 */
export const ALLOWED_ANALYTICS_QUERY_PARAMS = new Set([
  // Google Analytics & standard UTM campaign attribution
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic',
  // Verified ad platform click identifiers
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
  'ttclid',
  'twclid',
  'li_fat_id',
  'mc_eid',
  'dclid',
  // Organic referral & non-sensitive navigation
  'ref',
  'tab',
  'page',
  'lang',
  'hl',
]);

/**
 * Legacy reference preserved for unit test backwards compatibility
 */
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
 * Enforces a conservative allowlist: only permitted marketing attribution and safe navigation parameters
 * are retained. All user-input financial parameters (salary, rent) and personal tokens are stripped.
 */
export function sanitizeUrlForAnalytics(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '/';
  try {
    const origin =
      typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : 'https://www.livworthy.com';
    const parsed = new URL(rawUrl, origin);
    const searchParams = parsed.searchParams;

    const cleanParams = new URLSearchParams();
    searchParams.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (ALLOWED_ANALYTICS_QUERY_PARAMS.has(lower)) {
        cleanParams.set(key, val);
      }
    });

    const cleanSearch = cleanParams.toString();
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
 * Sanitizes relative path for GA4 page_path parameter.
 */
export function sanitizePathForAnalytics(rawPath: string): string {
  const sanitized = sanitizeUrlForAnalytics(rawPath);
  try {
    if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
      const u = new URL(sanitized);
      return u.pathname + (u.search ? u.search : '');
    }
    return sanitized;
  } catch {
    return rawPath.split('?')[0].split('#')[0] || '/';
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
 * - Sanitizes URL location and path using the conservative allowlist.
 * - Deduplicates against recent initial HTML head dispatch or previous route navigation.
 * - Ensures exactly one pageview per genuine route navigation.
 */
export function trackPageView(pagePath: string, pageTitle?: string): boolean {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return false;

  const sanitizedRelative = sanitizePathForAnalytics(pagePath);
  const normalizedPath = sanitizedRelative.split('?')[0] || '/';
  const now = Date.now();

  // Pick up initial HTML head dispatch if not yet captured
  if (!lastTrackedPath && typeof window !== 'undefined' && (window as any).__livworthy_initial_pv_path) {
    lastTrackedPath = ((window as any).__livworthy_initial_pv_path.split('?')[0] || '/');
    lastTrackedTimestamp = (window as any).__livworthy_initial_pv_time || now;
  }

  // Deduplication guard: ignore if the exact route was already tracked within 2000ms
  // (Prevents duplicate pageview between initial HTML head dispatch and React SPA mount)
  if (lastTrackedPath === normalizedPath && now - lastTrackedTimestamp < 2000) {
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
  if (typeof window !== 'undefined') {
    delete (window as any).__livworthy_initial_pv_path;
    delete (window as any).__livworthy_initial_pv_time;
  }
}
