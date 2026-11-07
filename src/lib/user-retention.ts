/**
 * User Retention & Privacy-Safe Recent Scenarios Engine
 *
 * Persists non-sensitive navigation and calculator bookmarks in browser localStorage
 * so returning users can easily resume their recent calculations and city comparisons.
 *
 * PRIVACY & SECURITY GUARANTEES:
 * - Never stores raw salary numbers, personal budget inputs, or query parameters.
 * - Rejects protocol-relative URLs, external domains, and javascript: URI injections.
 * - Never transmits stored history to external servers or GA4.
 * - Stored exclusively in local browser storage, user can clear at any time.
 */

export interface StoredScenario {
  id: string;
  title: string;
  url: string;
  tab: string;
  cityName?: string;
  timestamp: number;
}

const STORAGE_KEY = 'livworthy_recent_scenarios';
const MAX_ITEMS = 6;

/**
 * Sanitizes and validates internal application URLs stored in browser history.
 * - Rejects any URL that is not a strict relative internal route starting with '/'
 * - Rejects protocol-relative URLs ('//...') and scheme injection ('javascript:...', 'http:...', etc.)
 * - Strips all sensitive query parameters (e.g. 'salary', 'rent', 'income', 'bonus', 'tokens')
 * - Returns null if the URL is invalid or unsafe.
 */
export function sanitizeStoredUrl(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();

  // Must start with single slash and NOT double slash (protocol-relative)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;

  // Must not contain any protocol scheme or control characters
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || trimmed.includes('://')) return null;
  if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) return null;

  try {
    // Parse using dummy origin to safely isolate pathname and searchParams
    const parsed = new URL(trimmed, 'https://www.livworthy.com');
    if (!parsed.pathname.startsWith('/') || parsed.pathname.startsWith('//')) return null;

    // Allowed search params: only non-sensitive routing parameters (e.g. lang, tab)
    const SAFE_PARAMS = new Set(['tab', 'city', 'country', 'lang', 'hl', 'from', 'to']);
    const cleanSearch = new URLSearchParams();
    for (const [key, value] of parsed.searchParams.entries()) {
      if (SAFE_PARAMS.has(key.toLowerCase()) && value.length < 50) {
        cleanSearch.set(key, value);
      }
    }

    const qs = cleanSearch.toString();
    return parsed.pathname + (qs ? `?${qs}` : '');
  } catch {
    return null;
  }
}

export function getRecentScenarios(): StoredScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const valid: StoredScenario[] = [];
    for (const item of parsed) {
      if (!item || typeof item.id !== 'string' || typeof item.url !== 'string') continue;
      const cleanUrl = sanitizeStoredUrl(item.url);
      if (!cleanUrl) continue;

      valid.push({
        id: String(item.id).substring(0, 50),
        title: String(item.title || 'Calculator').substring(0, 60),
        url: cleanUrl,
        tab: String(item.tab || 'salary-worth').substring(0, 30),
        cityName: item.cityName ? String(item.cityName).substring(0, 50) : undefined,
        timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
      });
      if (valid.length >= MAX_ITEMS) break;
    }

    return valid;
  } catch {
    return [];
  }
}

export function saveRecentScenario(item: Omit<StoredScenario, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  const cleanUrl = sanitizeStoredUrl(item.url);
  if (!cleanUrl) return;

  try {
    const existing = getRecentScenarios();
    const filtered = existing.filter((s) => s.id !== item.id);
    const updated: StoredScenario[] = [
      {
        ...item,
        url: cleanUrl,
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or restrictive sandbox errors
  }
}

export function clearRecentScenarios(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}
