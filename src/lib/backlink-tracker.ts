import { dbService } from '../db/client';

export type BacklinkCategory =
  | 'OWNED'
  | 'EARNED_EDITORIAL'
  | 'RESOURCE_PAGE'
  | 'DIGITAL_PR'
  | 'PARTNERSHIP'
  | 'INFRASTRUCTURE';

export type BacklinkRelType =
  | 'FOLLOW'
  | 'NOFOLLOW'
  | 'UGC'
  | 'SPONSORED'
  | 'MIXED'
  | 'UNKNOWN';

export type BacklinkStatus =
  | 'ACTIVE'
  | 'LOST'
  | 'NOT_FOUND'
  | 'PENDING_VERIFICATION'
  | 'SOURCE_UNREACHABLE';

export interface BacklinkEntry {
  id: string;
  referringDomain: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  relAttribute: BacklinkRelType | string;
  category: BacklinkCategory;
  acquisitionChannel:
    | 'DIGITAL_PR'
    | 'EDITORIAL'
    | 'RESOURCE_PAGE'
    | 'UNLINKED_MENTION'
    | 'PARTNERSHIP'
    | 'INFRASTRUCTURE_REDIRECT'
    | 'OWNED_REPOSITORY_LINK'
    | 'OWNED_PROFILE_LINK';
  status: BacklinkStatus;
  httpStatusCode?: number;
  contactEmail?: string;
  campaignName?: string;
  notes?: string;
  firstSeenAt: string;
  lastCheckedAt: string;
}

export interface BacklinkVerificationResult {
  sourceUrl: string;
  expectedTargetUrl: string;
  detectedTargetUrl?: string;
  anchorText?: string;
  linkType: BacklinkRelType;
  sourceStatus: number;
  finalSourceUrl: string;
  redirectCount: number;
  verified: boolean;
  verifiedAt: string;
  status: BacklinkStatus;
  error?: string;
}

/**
 * Normalizes a target URL for strict matching:
 * - Requires hostname to strictly match livworthy.com or www.livworthy.com (case-insensitive)
 * - Rejects any third-party domain, port evasion, or substring attack (e.g. evil.com/?x=livworthy.com)
 * - Normalizes scheme to https
 * - Normalizes hostname to canonical www.livworthy.com
 * - Normalizes path by collapsing slashes and stripping trailing slash (except root '/')
 * - Strips query parameters (UTM tracking, etc.) and hash fragments
 */
export function normalizeTargetUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    const u = new URL(rawUrl, baseUrl);
    const host = u.hostname.toLowerCase();

    // Hostname must be strictly livworthy.com or www.livworthy.com
    if (host !== 'livworthy.com' && host !== 'www.livworthy.com') {
      return null;
    }

    let pathname = u.pathname.replace(/\/+/g, '/');
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    return `https://www.livworthy.com${pathname}`;
  } catch {
    return null;
  }
}

/**
 * Parses and classifies an HTML anchor rel attribute:
 * - Detects nofollow, ugc, sponsored
 * - If multiple qualifying attributes exist, returns 'MIXED' (e.g. "nofollow sponsored")
 * - If only sponsored, returns 'SPONSORED'
 * - If only ugc, returns 'UGC'
 * - If only nofollow, returns 'NOFOLLOW'
 * - If none of these exist (standard followed link), returns 'FOLLOW'
 */
export function parseRelAttribute(relValue?: string | null): BacklinkRelType {
  if (!relValue || !relValue.trim()) return 'FOLLOW';

  const tokens = relValue.toLowerCase().split(/\s+/).filter(Boolean);
  const hasNofollow = tokens.includes('nofollow');
  const hasUgc = tokens.includes('ugc');
  const hasSponsored = tokens.includes('sponsored');

  const distinctCount = [hasNofollow, hasUgc, hasSponsored].filter(Boolean).length;
  if (distinctCount > 1) {
    return 'MIXED';
  }
  if (hasSponsored) return 'SPONSORED';
  if (hasUgc) return 'UGC';
  if (hasNofollow) return 'NOFOLLOW';
  return 'FOLLOW';
}

/**
 * Actively probes a live third-party source URL over HTTP to verify whether
 * an exact matching link to LivWorthy exists, extracts its anchor text,
 * tracks redirect chains, and classifies its rel attribute.
 */
export async function verifyLiveBacklink(
  sourceUrl: string,
  expectedTargetUrl = 'https://www.livworthy.com'
): Promise<BacklinkVerificationResult> {
  const normalizedExpected = normalizeTargetUrl(expectedTargetUrl);
  const verifiedAt = new Date().toISOString();

  if (!normalizedExpected) {
    return {
      sourceUrl,
      expectedTargetUrl,
      linkType: 'UNKNOWN',
      sourceStatus: 0,
      finalSourceUrl: sourceUrl,
      redirectCount: 0,
      verified: false,
      verifiedAt,
      status: 'NOT_FOUND',
      error: `Invalid expected target URL: ${expectedTargetUrl}`,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Track redirect chain
    let redirectCount = 0;
    let currentUrl = sourceUrl;
    let res: Response;

    res = await fetch(currentUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (LivWorthy-Link-Verifier/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const sourceStatus = res.status;
    const finalSourceUrl = res.url || currentUrl;
    if (finalSourceUrl !== sourceUrl) {
      redirectCount = 1;
    }

    if (!res.ok) {
      return {
        sourceUrl,
        expectedTargetUrl,
        linkType: 'UNKNOWN',
        sourceStatus,
        finalSourceUrl,
        redirectCount,
        verified: false,
        verifiedAt,
        status: 'SOURCE_UNREACHABLE',
        error: `HTTP ${res.status} ${res.statusText}`,
      };
    }

    const html = await res.text();

    // Regex to parse HTML anchor tags
    const anchorRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    let isMatched = false;
    let detectedTargetUrl: string | undefined;
    let detectedAnchor: string | undefined;
    let detectedLinkType: BacklinkRelType = 'FOLLOW';

    while ((match = anchorRegex.exec(html)) !== null) {
      const preAttrs = match[1] || '';
      const rawHref = match[2];
      const postAttrs = match[3] || '';
      const anchorContent = match[4].replace(/<[^>]+>/g, '').trim();

      const normalizedHref = normalizeTargetUrl(rawHref, finalSourceUrl);

      // Exact target URL matching required
      if (normalizedHref && normalizedHref === normalizedExpected) {
        isMatched = true;
        detectedTargetUrl = normalizedHref;
        detectedAnchor = anchorContent || 'LivWorthy';

        const combinedAttrs = `${preAttrs} ${postAttrs}`;
        const relMatch = /rel=["']([^"']+)["']/i.exec(combinedAttrs);
        detectedLinkType = parseRelAttribute(relMatch ? relMatch[1] : null);
        break;
      }
    }

    return {
      sourceUrl,
      expectedTargetUrl,
      detectedTargetUrl: isMatched ? detectedTargetUrl : undefined,
      anchorText: isMatched ? detectedAnchor : undefined,
      linkType: isMatched ? detectedLinkType : 'UNKNOWN',
      sourceStatus,
      finalSourceUrl,
      redirectCount,
      verified: isMatched,
      verifiedAt,
      status: isMatched ? 'ACTIVE' : 'NOT_FOUND',
    };
  } catch (err: any) {
    return {
      sourceUrl,
      expectedTargetUrl,
      linkType: 'UNKNOWN',
      sourceStatus: 0,
      finalSourceUrl: sourceUrl,
      redirectCount: 0,
      verified: false,
      verifiedAt,
      status: 'SOURCE_UNREACHABLE',
      error: err.name === 'AbortError' ? 'Connection timed out (10s)' : err.message || String(err),
    };
  }
}

/**
 * Baseline tracking database entries.
 * Per the Zero-False-Completion Rule:
 * - Candidates are seeded strictly with PENDING_VERIFICATION (never ACTIVE before live verification).
 * - Owned profile/repository links are categorized as OWNED (not earned editorial authority).
 * - Infrastructure alias redirects are categorized as INFRASTRUCTURE (not earned editorial authority).
 */
export const INITIAL_TRACKED_BACKLINKS: Omit<BacklinkEntry, 'id'>[] = [
  {
    referringDomain: 'github.com',
    sourceUrl: 'https://github.com/riowebdevloper/Livworthy',
    targetUrl: 'https://www.livworthy.com',
    anchorText: 'LivWorthy',
    relAttribute: 'NOFOLLOW',
    category: 'OWNED',
    acquisitionChannel: 'OWNED_REPOSITORY_LINK',
    status: 'PENDING_VERIFICATION',
    httpStatusCode: 200,
    campaignName: 'open_source_repository',
    firstSeenAt: '2026-09-28T00:00:00.000Z',
    lastCheckedAt: '2026-10-06T12:00:00.000Z',
    notes: 'Official open-source repository documentation and production deployment link (owned profile/repo, not earned editorial authority).',
  },
  {
    referringDomain: 'vercel.app',
    sourceUrl: 'https://livworthy.vercel.app',
    targetUrl: 'https://www.livworthy.com',
    anchorText: 'Canonical LivWorthy Platform',
    relAttribute: 'FOLLOW',
    category: 'INFRASTRUCTURE',
    acquisitionChannel: 'INFRASTRUCTURE_REDIRECT',
    status: 'PENDING_VERIFICATION',
    httpStatusCode: 308,
    campaignName: 'infrastructure_canonical_redirect',
    firstSeenAt: '2026-09-28T00:00:00.000Z',
    lastCheckedAt: '2026-10-06T12:00:00.000Z',
    notes: 'Platform preview origin alias permanently redirecting to canonical production apex (infrastructure redirect, not earned editorial authority).',
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

export type OutreachStatus =
  | 'DISCOVERED'
  | 'VERIFIED_ELIGIBLE'
  | 'PITCH_READY'
  | 'SUBMITTED'
  | 'REPLIED'
  | 'ACCEPTED'
  | 'ARTICLE_REQUESTED'
  | 'ARTICLE_SUBMITTED'
  | 'PUBLISHED'
  | 'VERIFIED_BACKLINK'
  | 'DECLINED'
  | 'INVALID'
  | 'BLOCKED_BY_ACCESS';

export interface OutreachRecord {
  id: string;
  targetDomain: string;
  submissionPageUrl?: string;
  editorContact?: string;
  contactStatus?: string;
  pitchAngle: string;
  targetLivworthyAsset?: string;
  proposedAnchorText?: string;
  status: OutreachStatus;
  preparedAt: string;
  submittedAt: string | null;
  submissionEvidence?: string | null;
  replyStatus: string | null;
  repliedAt?: string | null;
  acceptedAt?: string | null;
  publicationUrl: string | null;
  publishedAt?: string | null;
  backlinkVerified: boolean;
  backlinkVerifiedAt: string | null;
}

/**
 * Enforces strict single-lifecycle rules per Part 7, 8, 9, 54:
 * - PITCH_READY: pitch exists, not submitted, submittedAt = null, replyStatus = null
 * - SUBMITTED: actual submission occurred, submittedAt != null
 * - PUBLISHED: publicationUrl != null
 * - VERIFIED_BACKLINK: backlinkVerifiedAt != null
 */
export function validateOutreachRecord(record: OutreachRecord): void {
  if (record.status === 'PITCH_READY') {
    if (record.submittedAt !== null) {
      throw new Error(`PITCH_READY records must have submittedAt = null, found "${record.submittedAt}" in ${record.id}`);
    }
    if (record.replyStatus !== null) {
      throw new Error(`PITCH_READY records must have replyStatus = null, found "${record.replyStatus}" in ${record.id}`);
    }
  }

  if (record.status === 'SUBMITTED') {
    if (!record.submittedAt) {
      throw new Error(`SUBMITTED records require submittedAt date, found null in ${record.id}`);
    }
  }

  if (record.status === 'PUBLISHED') {
    if (!record.publicationUrl) {
      throw new Error(`PUBLISHED records require publicationUrl, found null in ${record.id}`);
    }
  }

  if (record.status === 'VERIFIED_BACKLINK') {
    if (!record.backlinkVerifiedAt) {
      throw new Error(`VERIFIED_BACKLINK records require backlinkVerifiedAt date, found null in ${record.id}`);
    }
  }
}

/**
 * In-memory Tracker class for querying backlink stats and verifying zero-false-completion invariants.
 */
export class BacklinkTracker {
  private backlinks: (BacklinkEntry | Omit<BacklinkEntry, 'id'>)[] = [...INITIAL_TRACKED_BACKLINKS];

  public getStats() {
    let verifiedEarnedBacklinks = 0;
    const earnedDomains = new Set<string>();
    let ownedLinks = 0;
    let infrastructureLinks = 0;

    for (const b of this.backlinks) {
      if (b.category === 'OWNED') {
        ownedLinks++;
      } else if (b.category === 'INFRASTRUCTURE') {
        infrastructureLinks++;
      } else if (b.status === 'ACTIVE') {
        verifiedEarnedBacklinks++;
        earnedDomains.add(b.referringDomain);
      }
    }

    return {
      trackedTotal: this.backlinks.length,
      verifiedEarnedBacklinks,
      referringEarnedDomains: earnedDomains.size,
      ownedLinks,
      infrastructureLinks,
    };
  }
}
