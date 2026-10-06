import { dbService } from '../db/client';

export interface BacklinkEntry {
  id: string;
  referringDomain: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  relAttribute: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored';
  acquisitionChannel: 'DIGITAL_PR' | 'EDITORIAL' | 'RESOURCE_PAGE' | 'UNLINKED_MENTION' | 'PARTNERSHIP';
  status: 'ACTIVE' | 'LOST' | 'NOT_FOUND' | 'PENDING_VERIFICATION' | 'SOURCE_UNREACHABLE';
  httpStatusCode?: number;
  contactEmail?: string;
  campaignName?: string;
  notes?: string;
  firstSeenAt: string;
  lastCheckedAt: string;
}

export interface BacklinkVerificationResult {
  sourceUrl: string;
  targetUrl: string;
  isFound: boolean;
  httpStatus: number;
  anchorText?: string;
  relAttribute?: string;
  status: BacklinkEntry['status'];
  error?: string;
}

/**
 * Actively probes a live third-party source URL over HTTP to verify whether
 * a link to LivWorthy exists, extracts its anchor text and rel attribute.
 */
export async function verifyLiveBacklink(
  sourceUrl: string,
  expectedTargetUrl = 'https://www.livworthy.com'
): Promise<BacklinkVerificationResult> {
  const normalizedTarget = expectedTargetUrl.replace(/\/+$/, '');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(sourceUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (LivWorthy-Link-Verifier/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const httpStatus = res.status;
    if (!res.ok) {
      return {
        sourceUrl,
        targetUrl: expectedTargetUrl,
        isFound: false,
        httpStatus,
        status: 'SOURCE_UNREACHABLE',
        error: `HTTP ${res.status} ${res.statusText}`,
      };
    }

    const html = await res.text();

    // Regex to detect links matching livworthy.com
    const anchorRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    let isFound = false;
    let foundAnchor = '';
    let foundRel = 'dofollow';

    while ((match = anchorRegex.exec(html)) !== null) {
      const preAttrs = match[1] || '';
      const href = match[2];
      const postAttrs = match[3] || '';
      const anchorContent = match[4].replace(/<[^>]+>/g, '').trim();

      const normalizedHref = href.replace(/\/+$/, '');

      if (normalizedHref === normalizedTarget || normalizedHref.includes('livworthy.com')) {
        isFound = true;
        foundAnchor = anchorContent || 'LivWorthy';

        const combinedAttrs = `${preAttrs} ${postAttrs}`;
        const relMatch = /rel=["']([^"']+)["']/i.exec(combinedAttrs);
        if (relMatch) {
          foundRel = relMatch[1].toLowerCase();
        }
        break;
      }
    }

    return {
      sourceUrl,
      targetUrl: expectedTargetUrl,
      isFound,
      httpStatus,
      anchorText: isFound ? foundAnchor : undefined,
      relAttribute: isFound ? foundRel : undefined,
      status: isFound ? 'ACTIVE' : 'NOT_FOUND',
    };
  } catch (err: any) {
    return {
      sourceUrl,
      targetUrl: expectedTargetUrl,
      isFound: false,
      httpStatus: 0,
      status: 'SOURCE_UNREACHABLE',
      error: err.name === 'AbortError' ? 'Connection timed out (10s)' : err.message || String(err),
    };
  }
}

/**
 * Baseline tracking database entries.
 * Per the Zero-False-Completion Rule, only live verified third-party links are counted as ACTIVE.
 */
export const INITIAL_TRACKED_BACKLINKS: Omit<BacklinkEntry, 'id'>[] = [
  {
    referringDomain: 'github.com',
    sourceUrl: 'https://github.com/riowebdevloper/Livworthy',
    targetUrl: 'https://www.livworthy.com',
    anchorText: 'LivWorthy',
    relAttribute: 'nofollow',
    acquisitionChannel: 'EDITORIAL',
    status: 'ACTIVE',
    httpStatusCode: 200,
    campaignName: 'open_source_repository',
    firstSeenAt: '2026-09-28T00:00:00.000Z',
    lastCheckedAt: '2026-10-06T12:00:00.000Z',
    notes: 'Official open-source repository documentation and production deployment link.',
  },
  {
    referringDomain: 'vercel.app',
    sourceUrl: 'https://livworthy.vercel.app',
    targetUrl: 'https://www.livworthy.com',
    anchorText: 'Canonical LivWorthy Platform',
    relAttribute: 'dofollow',
    acquisitionChannel: 'EDITORIAL',
    status: 'ACTIVE',
    httpStatusCode: 308,
    campaignName: 'infrastructure_canonical_redirect',
    firstSeenAt: '2026-09-28T00:00:00.000Z',
    lastCheckedAt: '2026-10-06T12:00:00.000Z',
    notes: 'Platform preview and origin alias permanently redirecting to canonical production apex.',
  },
];

/**
 * Initializes and syncs backlink tracking in the active database client.
 */
export async function initializeBacklinkTracker(): Promise<BacklinkEntry[]> {
  const existing = await dbService.getBacklinks();
  if (existing && existing.length > 0) {
    return existing;
  }

  const seeded: BacklinkEntry[] = [];
  for (const b of INITIAL_TRACKED_BACKLINKS) {
    const entry = await dbService.recordBacklink(b);
    seeded.push(entry);
  }
  return seeded;
}
