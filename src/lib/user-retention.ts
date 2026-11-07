/**
 * User Retention & Privacy-Safe Recent Scenarios Engine
 *
 * Persists non-sensitive navigation and scenario bookmarks in browser localStorage
 * so returning users can easily resume their recent calculations and city comparisons.
 *
 * PRIVACY GUARANTEE:
 * - Never stores raw salary numbers, personal identifiers, or query parameters.
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

export function getRecentScenarios(): StoredScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && typeof item.id === 'string' && typeof item.url === 'string').slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function saveRecentScenario(item: Omit<StoredScenario, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentScenarios();
    const filtered = existing.filter((s) => s.id !== item.id);
    const updated: StoredScenario[] = [
      { ...item, timestamp: Date.now() },
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

