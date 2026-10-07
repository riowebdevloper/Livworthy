/**
 * LivWorthy Google Search Console ingestion connector.
 *
 * Uses the Google service-account OAuth2 JWT flow directly and calls the real
 * Search Console APIs when credentials are present. Unknown external data is
 * represented as null — never as a fabricated zero.
 */

export type DashboardMetricStatus =
  | 'VERIFIED'
  | 'MEASURED'
  | 'CALCULATED'
  | 'AWAITING_DATA'
  | 'BLOCKED_BY_ACCOUNT_ACCESS'
  | 'NOT_IMPLEMENTED';

export interface GscQueryPerformanceRecord {
  query: string;
  page: string;
  locale: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  averagePosition: number | null;
  country: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'all';
  date: string;
  status: DashboardMetricStatus;
  dataSource: 'GOOGLE_SEARCH_CONSOLE_API' | 'AWAITING_SYNC';
}

export interface GscIndexCoverageSummary {
  status: DashboardMetricStatus;
  coverageCapability: 'SEARCH_ANALYTICS_AVAILABLE' | 'INDEX_COVERAGE_NOT_AVAILABLE';
  indexedPages: number | null;
  notIndexedPages: number | null;
  crawledNotIndexed: number | null;
  discoveredNotIndexed: number | null;
  redirectErrors: number | null;
  sitemapSubmittedPages: number | null;
  lastSyncTimestamp: string | null;
  diagnosticNotice: string;
}

export interface GscAnalyticsResult {
  success: boolean;
  status: DashboardMetricStatus;
  capabilityStatus: 'SEARCH_ANALYTICS_AVAILABLE' | 'INDEX_COVERAGE_NOT_AVAILABLE';
  siteUrl: string;
  totalImpressions: number | null;
  totalClicks: number | null;
  averageCtr: number | null;
  averagePosition: number | null;
  records: GscQueryPerformanceRecord[];
  coverage: GscIndexCoverageSummary;
  errorMessage?: string;
}

export interface GscUrlInspectionResult {
  success: boolean;
  status: DashboardMetricStatus;
  inspectedUrl: string;
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  robotsTxtState: string | null;
  pageFetchState: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  lastCrawlTime: string | null;
  errorMessage?: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface SearchAnalyticsRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
}

interface SitemapContent {
  submitted?: string | number;
}

interface SitemapEntry {
  isSitemapsIndex?: boolean;
  contents?: SitemapContent[];
}

interface SitemapsResponse {
  sitemap?: SitemapEntry[];
}

function base64Url(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(bytes).toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const normalized = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');

  const raw =
    typeof atob === 'function'
      ? atob(normalized)
      : Buffer.from(normalized, 'base64').toString('binary');

  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function inferLocaleFromPage(page: string): string {
  try {
    const first = new URL(page).pathname.split('/').filter(Boolean)[0] || 'en';
    return /^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(first) ? first : 'en';
  } catch {
    return 'en';
  }
}

export class SearchConsoleConnector {
  private static readonly DEFAULT_SITE_URL = 'https://www.livworthy.com/';
  private static readonly TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
  private static readonly WEBMASTERS_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

  public static hasValidCredentials(): boolean {
    const clientEmail =
      process.env.GSC_CLIENT_EMAIL || process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
    const privateKey =
      process.env.GSC_PRIVATE_KEY || process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
    return Boolean(clientEmail && privateKey);
  }

  public static isAvailable(): {
    isConfigured: boolean;
    status: DashboardMetricStatus;
    message: string;
  } {
    const isConfigured = this.hasValidCredentials();
    return {
      isConfigured,
      status: isConfigured ? 'AWAITING_DATA' : 'BLOCKED_BY_ACCOUNT_ACCESS',
      message: isConfigured
        ? 'Google Search Console credentials are configured; live data will be fetched on sync.'
        : 'Google Search Console credentials are not configured. Set GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY.',
    };
  }

  private static async getAccessToken(): Promise<string> {
    const clientEmail =
      process.env.GSC_CLIENT_EMAIL || process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
    const privateKeyPem =
      process.env.GSC_PRIVATE_KEY || process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;

    if (!clientEmail || !privateKeyPem) {
      throw new Error('Google Search Console service-account credentials are missing.');
    }
    if (!globalThis.crypto?.subtle) {
      throw new Error('Web Crypto API is unavailable in this runtime.');
    }

    const now = Math.floor(Date.now() / 1000);
    const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = base64Url(
      JSON.stringify({
        iss: clientEmail,
        scope: this.WEBMASTERS_SCOPE,
        aud: this.TOKEN_ENDPOINT,
        iat: now,
        exp: now + 3600,
      })
    );

    const key = await globalThis.crypto.subtle.importKey(
      'pkcs8',
      pemToArrayBuffer(privateKeyPem),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const unsigned = `${header}.${payload}`;
    const signature = await globalThis.crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      new TextEncoder().encode(unsigned)
    );

    const assertion = `${unsigned}.${base64Url(new Uint8Array(signature))}`;
    const tokenResponse = await fetch(this.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });

    const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokenJson.access_token) {
      throw new Error(
        tokenJson.error_description ||
          tokenJson.error ||
          `Google OAuth token exchange failed with HTTP ${tokenResponse.status}`
      );
    }
    return tokenJson.access_token;
  }

  private static async fetchSitemapSubmittedPages(
    accessToken: string,
    siteUrl: string
  ): Promise<number | null> {
    const endpoint =
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
    const response = await fetch(endpoint, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as SitemapsResponse;
    const concrete = (payload.sitemap || []).filter((entry) => !entry.isSitemapsIndex);
    let submitted = 0;
    let observed = false;

    for (const entry of concrete) {
      for (const content of entry.contents || []) {
        const value =
          typeof content.submitted === 'string'
            ? Number.parseInt(content.submitted, 10)
            : content.submitted;
        if (typeof value === 'number' && Number.isFinite(value)) {
          submitted += value;
          observed = true;
        }
      }
    }
    return observed ? submitted : null;
  }

  public static async fetchSearchAnalytics(
    startDate: string = isoDateDaysAgo(28),
    endDate: string = isoDateDaysAgo(1)
  ): Promise<GscAnalyticsResult> {
    const siteUrl = process.env.GSC_SITE_URL || this.DEFAULT_SITE_URL;

    if (!this.hasValidCredentials()) {
      return {
        success: false,
        status: 'BLOCKED_BY_ACCOUNT_ACCESS',
        capabilityStatus: 'INDEX_COVERAGE_NOT_AVAILABLE',
        siteUrl,
        totalImpressions: null,
        totalClicks: null,
        averageCtr: null,
        averagePosition: null,
        records: [],
        coverage: {
          status: 'BLOCKED_BY_ACCOUNT_ACCESS',
          coverageCapability: 'INDEX_COVERAGE_NOT_AVAILABLE',
          indexedPages: null,
          notIndexedPages: null,
          crawledNotIndexed: null,
          discoveredNotIndexed: null,
          redirectErrors: null,
          sitemapSubmittedPages: null,
          lastSyncTimestamp: null,
          diagnosticNotice:
            'Search Console credentials are missing. External search metrics remain null.',
        },
        errorMessage: 'Search Console API authentication is not configured.',
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      const endpoint =
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
      const records: GscQueryPerformanceRecord[] = [];
      const rowLimit = 25_000;
      let startRow = 0;

      while (startRow < 100_000) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions: ['query', 'page', 'country', 'device', 'date'],
            type: 'web',
            rowLimit,
            startRow,
            dataState: 'final',
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            `Search Console Search Analytics request failed (HTTP ${response.status}): ${body.slice(0, 500)}`
          );
        }

        const payload = (await response.json()) as SearchAnalyticsResponse;
        const rows = payload.rows || [];
        for (const row of rows) {
          const [query = '', page = '', country = '', device = 'all', date = ''] = row.keys || [];
          const normalizedDevice = String(device).toLowerCase();
          records.push({
            query,
            page,
            locale: inferLocaleFromPage(page),
            clicks: typeof row.clicks === 'number' ? row.clicks : null,
            impressions: typeof row.impressions === 'number' ? row.impressions : null,
            ctr: typeof row.ctr === 'number' ? row.ctr : null,
            averagePosition: typeof row.position === 'number' ? row.position : null,
            country,
            device:
              normalizedDevice === 'desktop' ||
              normalizedDevice === 'mobile' ||
              normalizedDevice === 'tablet'
                ? normalizedDevice
                : 'all',
            date,
            status: 'MEASURED',
            dataSource: 'GOOGLE_SEARCH_CONSOLE_API',
          });
        }

        if (rows.length < rowLimit) break;
        startRow += rowLimit;
      }

      let totalClicks = 0;
      let totalImpressions = 0;
      let weightedPosition = 0;
      let positionWeight = 0;
      for (const row of records) {
        if (row.clicks !== null) totalClicks += row.clicks;
        if (row.impressions !== null) {
          totalImpressions += row.impressions;
          if (row.averagePosition !== null) {
            weightedPosition += row.averagePosition * row.impressions;
            positionWeight += row.impressions;
          }
        }
      }

      const sitemapSubmittedPages = await this.fetchSitemapSubmittedPages(accessToken, siteUrl);
      return {
        success: true,
        status: 'MEASURED',
        capabilityStatus: 'SEARCH_ANALYTICS_AVAILABLE',
        siteUrl,
        totalImpressions,
        totalClicks,
        averageCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
        averagePosition: positionWeight > 0 ? weightedPosition / positionWeight : null,
        records,
        coverage: {
          status: 'MEASURED',
          coverageCapability: 'INDEX_COVERAGE_NOT_AVAILABLE',
          indexedPages: null,
          notIndexedPages: null,
          crawledNotIndexed: null,
          discoveredNotIndexed: null,
          redirectErrors: null,
          sitemapSubmittedPages,
          lastSyncTimestamp: new Date().toISOString(),
          diagnosticNotice:
            'Live Search Analytics and sitemap data fetched from Google Search Console. Aggregate index-coverage totals are not exposed by the current API and remain null.',
        },
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'BLOCKED_BY_ACCOUNT_ACCESS',
        capabilityStatus: 'INDEX_COVERAGE_NOT_AVAILABLE',
        siteUrl,
        totalImpressions: null,
        totalClicks: null,
        averageCtr: null,
        averagePosition: null,
        records: [],
        coverage: {
          status: 'BLOCKED_BY_ACCOUNT_ACCESS',
          coverageCapability: 'INDEX_COVERAGE_NOT_AVAILABLE',
          indexedPages: null,
          notIndexedPages: null,
          crawledNotIndexed: null,
          discoveredNotIndexed: null,
          redirectErrors: null,
          sitemapSubmittedPages: null,
          lastSyncTimestamp: null,
          diagnosticNotice: `Search Console sync failed: ${err?.message || String(err)}`,
        },
        errorMessage: err?.message || String(err),
      };
    }
  }

  public static async inspectUrl(url: string): Promise<GscUrlInspectionResult> {
    if (!this.hasValidCredentials()) {
      return {
        success: false,
        status: 'BLOCKED_BY_ACCOUNT_ACCESS',
        inspectedUrl: url,
        verdict: null,
        coverageState: null,
        indexingState: null,
        robotsTxtState: null,
        pageFetchState: null,
        googleCanonical: null,
        userCanonical: null,
        lastCrawlTime: null,
        errorMessage: 'Search Console API authentication is not configured.',
      };
    }

    try {
      const siteUrl = process.env.GSC_SITE_URL || this.DEFAULT_SITE_URL;
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ inspectionUrl: url, siteUrl, languageCode: 'en-US' }),
        }
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `URL Inspection request failed (HTTP ${response.status}): ${body.slice(0, 500)}`
        );
      }

      const payload: any = await response.json();
      const result = payload?.inspectionResult?.indexStatusResult || {};
      return {
        success: true,
        status: 'VERIFIED',
        inspectedUrl: url,
        verdict: result.verdict || null,
        coverageState: result.coverageState || null,
        indexingState: result.indexingState || null,
        robotsTxtState: result.robotsTxtState || null,
        pageFetchState: result.pageFetchState || null,
        googleCanonical: result.googleCanonical || null,
        userCanonical: result.userCanonical || null,
        lastCrawlTime: result.lastCrawlTime || null,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'BLOCKED_BY_ACCOUNT_ACCESS',
        inspectedUrl: url,
        verdict: null,
        coverageState: null,
        indexingState: null,
        robotsTxtState: null,
        pageFetchState: null,
        googleCanonical: null,
        userCanonical: null,
        lastCrawlTime: null,
        errorMessage: err?.message || String(err),
      };
    }
  }

  public static getIndexCoverageCapability(): {
    capability: 'SEARCH_ANALYTICS_AVAILABLE' | 'INDEX_COVERAGE_NOT_AVAILABLE';
    status: DashboardMetricStatus;
    notes: string;
  } {
    if (!this.hasValidCredentials()) {
      return {
        capability: 'INDEX_COVERAGE_NOT_AVAILABLE',
        status: 'BLOCKED_BY_ACCOUNT_ACCESS',
        notes: 'API authorization is required to inspect individual URLs.',
      };
    }
    return {
      capability: 'SEARCH_ANALYTICS_AVAILABLE',
      status: 'VERIFIED',
      notes:
        'Search Analytics and per-URL URL Inspection are available. Aggregate Index Coverage totals are not exposed by the current Search Console API.',
    };
  }
}
