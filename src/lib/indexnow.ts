import fs from 'fs';
import path from 'path';

export const DEFAULT_INDEXNOW_KEY = 'e47c19a28b0f472eb8b5c91f0436d194';
export const DEFAULT_HOST = 'www.livworthy.com';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const SUBMISSION_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes to avoid spamming

export interface IndexNowOptions {
  key?: string;
  host?: string;
  keyLocation?: string;
  dryRun?: boolean;
  force?: boolean;
  batchSize?: number;
  maxRetries?: number;
}

export interface IndexNowBatchResult {
  batchIndex: number;
  urlCount: number;
  statusCode: number;
  statusText: string;
  success: boolean;
  error?: string;
}

export interface IndexNowSubmissionResult {
  success: boolean;
  host: string;
  key: string;
  keyLocation: string;
  totalUrlsRequested: number;
  validUrlsCount: number;
  submittedUrls: string[];
  skippedUrls: string[];
  batchResults: IndexNowBatchResult[];
  timestamp: string;
  message: string;
}

// In-memory cache of submitted URLs to prevent spamming
const submissionHistory: Map<string, number> = new Map();

/**
 * Validates whether a URL is a canonical production URL suitable for IndexNow.
 */
export function isValidCanonicalProductionUrl(urlStr: string, host = DEFAULT_HOST): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.hostname !== host) return false;
    if (parsed.search || parsed.hash) return false; // No query parameters or fragments
    if (parsed.pathname.includes('//')) return false; // No double slashes
    if (parsed.pathname.startsWith('/admin') || parsed.pathname.startsWith('/api/') || parsed.pathname.startsWith('/test/')) {
      return false; // No private or test routes
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures the IndexNow verification key file exists in target directories.
 */
export function ensureIndexNowKeyFile(key = DEFAULT_INDEXNOW_KEY, dirs: string[] = ['public', 'dist']): void {
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const targetPath = path.join(dir, `${key}.txt`);
      if (!fs.existsSync(targetPath) || fs.readFileSync(targetPath, 'utf-8').trim() !== key) {
        fs.writeFileSync(targetPath, key, 'utf-8');
      }
    }
  }
}

/**
 * Submits a list of canonical URLs to IndexNow search engine protocol with batching,
 * retry handling, and anti-spam rate limiting.
 */
export async function submitUrlsToIndexNow(
  urls: string[],
  options: IndexNowOptions = {}
): Promise<IndexNowSubmissionResult> {
  const host = options.host || process.env.INDEXNOW_HOST || DEFAULT_HOST;
  const key = options.key || process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
  const keyLocation = options.keyLocation || `https://${host}/${key}.txt`;
  const dryRun = options.dryRun ?? false;
  const force = options.force ?? false;
  const batchSize = Math.min(options.batchSize || 100, 10000);
  const maxRetries = options.maxRetries ?? 3;
  const now = Date.now();

  const validUrls: string[] = [];
  const skippedUrls: string[] = [];

  // Filter and deduplicate
  const uniqueUrls = Array.from(new Set(urls.map((u) => u.trim())));

  for (const url of uniqueUrls) {
    if (!isValidCanonicalProductionUrl(url, host)) {
      skippedUrls.push(url);
      continue;
    }

    if (!force) {
      const lastSubmitted = submissionHistory.get(url);
      if (lastSubmitted && now - lastSubmitted < SUBMISSION_COOLDOWN_MS) {
        skippedUrls.push(url);
        continue;
      }
    }

    validUrls.push(url);
  }

  const result: IndexNowSubmissionResult = {
    success: true,
    host,
    key,
    keyLocation,
    totalUrlsRequested: uniqueUrls.length,
    validUrlsCount: validUrls.length,
    submittedUrls: validUrls,
    skippedUrls,
    batchResults: [],
    timestamp: new Date().toISOString(),
    message: '',
  };

  if (validUrls.length === 0) {
    result.message = `No new canonical URLs to submit (all ${uniqueUrls.length} were either invalid or in cooldown).`;
    return result;
  }

  if (dryRun) {
    result.message = `[Dry Run] Prepared ${validUrls.length} canonical URLs for IndexNow submission to host ${host}.`;
    result.batchResults.push({
      batchIndex: 0,
      urlCount: validUrls.length,
      statusCode: 200,
      statusText: 'DRY_RUN_OK',
      success: true,
    });
    return result;
  }

  // Batch URLs into chunks
  const batches: string[][] = [];
  for (let i = 0; i < validUrls.length; i += batchSize) {
    batches.push(validUrls.slice(i, i + batchSize));
  }

  for (let bIndex = 0; bIndex < batches.length; bIndex++) {
    const batch = batches[bIndex];
    const payload = {
      host,
      key,
      keyLocation,
      urlList: batch,
    };

    let attempt = 0;
    let batchSuccess = false;
    let lastStatus = 0;
    let lastStatusText = '';
    let lastError = '';

    while (attempt < maxRetries && !batchSuccess) {
      attempt++;
      try {
        const response = await fetch(INDEXNOW_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'LivWorthy-IndexNow-Client/1.2.0',
          },
          body: JSON.stringify(payload),
        });

        lastStatus = response.status;
        lastStatusText = response.statusText;

        // IndexNow returns 200 (OK) or 202 (Accepted) on success
        if (response.status === 200 || response.status === 202) {
          batchSuccess = true;
          // Mark URLs in submission history cache
          for (const u of batch) {
            submissionHistory.set(u, now);
          }
        } else if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
          // Rate-limited or server error; retry with exponential backoff
          const delay = Math.pow(2, attempt) * 500 + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Client error (400 bad request, 403 invalid key, 422 unprocessable); break out
          const text = await response.text();
          lastError = `IndexNow HTTP ${response.status}: ${text}`;
          break;
        }
      } catch (err: any) {
        lastError = err.message || String(err);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 500));
        }
      }
    }

    result.batchResults.push({
      batchIndex: bIndex,
      urlCount: batch.length,
      statusCode: lastStatus,
      statusText: lastStatusText,
      success: batchSuccess,
      error: batchSuccess ? undefined : lastError,
    });

    if (!batchSuccess) {
      result.success = false;
    }
  }

  result.message = result.success
    ? `Successfully submitted ${validUrls.length} canonical URLs across ${batches.length} batch(es) to IndexNow.`
    : `IndexNow submission encountered errors across ${result.batchResults.filter((b) => !b.success).length} batch(es).`;

  return result;
}
