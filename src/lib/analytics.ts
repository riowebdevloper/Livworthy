/**
 * LivWorthy Client-Side Analytics & Engagement Measurement Module
 *
 * Implements Google Analytics 4 (GA4) event measurement:
 * - Route change / Virtual Page View tracking for React Single-Page Application (SPA)
 * - Calculator engagement tracking (tab switches, salary changes, scenario runs)
 * - Error and 404 path reporting
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

/**
 * Dispatches a virtual page_view event on client-side route transitions
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    const loc = window.location.origin + pagePath;
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: loc,
    });
  } catch {
    // Fail silently in restricted sandbox
  }
}

/**
 * Tracks calculator interaction events (e.g. tab switches, city changes, adjustments)
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
      engagement_time_msec: 1000,
      ...params,
    });
  } catch {
    // Fail silently
  }
}

/**
 * Tracks when a full salary calculation or comparison outcome is evaluated
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
      salary_amount: salaryMajor,
      currency: currency,
      engagement_time_msec: 2500,
    });
  } catch {
    // Fail silently
  }
}
